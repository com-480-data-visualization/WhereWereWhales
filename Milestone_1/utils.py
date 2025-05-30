import ast
import pandas as pd
import numpy as np
from tqdm import tqdm
    
COLUMNS_TO_KEEP_1 = [
            'dataset_id', 'row_id', 'latitude', 'longitude', 'species_name',
            'scientific_name', 'common_name', 'itis_tsn', 'oceano', 'individual_count', 'sex', 'organism_id',
            'event_date', 'higher_geography', 'water_body', 'locality',
            'verbatim_locality'
        ]

COLUMNS_TO_KEEP_2 = ['oid', 'dataset_id', 'row_id','tsn', 'scientific', 'common', 
                   'sp_code', 'latitude', 'longitude','obs_date', 'date_time',
                   'oceano', 'count']

MAPPING = {
            'scientific': 'scientific_name',
            'common': 'common_name',
            "sp_code" : 'species_name',
            'tsn': 'itis_tsn',
            'count': 'individual_count',
            'obs_date': 'event_date',
            'oid' : 'organism_id'
            }

def load_happywhales_data(path_1 = "..\data\HappyWhales\location_cetacea_full_info.csv", path_2 = "..\data\HappyWhales\obis_seamap_custom_part1_points_csv.csv", columns_to_keep_df1 = COLUMNS_TO_KEEP_1, columns_to_keep_df2 = COLUMNS_TO_KEEP_2, column_mapping = MAPPING):
    """
    Load and combine two datasets containing cetacea location information, apply necessary transformations, 
    and clean the data by parsing certain columns and filling missing values.

    Args:
        path_1 (str): Path to the first CSV file containing cetacea data.
        path_2 (str): Path to the second CSV file containing cetacea data.
        columns_to_keep_df1 (list): List of columns to keep from the first CSV file.
        columns_to_keep_df2 (list): List of columns to keep from the second CSV file.
        column_mapping (dict): A dictionary mapping column names from the second dataset to match the first dataset's schema.

    Returns:
        pd.DataFrame: A combined DataFrame containing cleaned and transformed cetacea data.
    """
        
    df_location_1 = pd.read_csv(path_1, usecols=columns_to_keep_df1, encoding="utf-8")
    df_location_1['organism_id'] = df_location_1['organism_id'].str.extract(r'(\d+)$')
    dataset_id = df_location_1["dataset_id"].unique()
    
    df_location_2 = pd.read_csv(path_2, low_memory=False)
    df_location_2 = df_location_2[~df_location_2["dataset_id"].isin(dataset_id)][columns_to_keep_df2]
    
    df_location_2 = df_location_2.rename(columns=column_mapping)
    
    df_location = pd.concat([df_location_1, df_location_2], ignore_index=True)
    
    df_location['species_name'] = df_location['species_name'].str.title()
    df_location['scientific_name'] = df_location['scientific_name'].str.title()
    df_location['common_name'] = df_location['common_name'].str.title()

    df_location.loc[df_location['locality'].isna(), 'locality'] = df_location['oceano'].apply(extract_country)
    df_location.loc[df_location['higher_geography'].isna(), 'higher_geography'] = df_location['oceano'].apply(extract_region)
    df_location['individual_count'] = df_location['individual_count'].apply(parse_individual_count)
    
    return df_location   

def extract_region(x):
    """
    Extract the region (PROVINCE) from the 'ZONE' key in a dictionary-like string in the 'oceano' column.

    Args:
        x (str): A string representing a dictionary containing region information.

    Returns:
        str or np.nan: The region (PROVINCE) if found, otherwise np.nan.
    """
    try:
        parsed = ast.literal_eval(x)
        if 'ZONE' in parsed and 'MEOW' in parsed['ZONE'] and len(parsed['ZONE']['MEOW']) > 0:
            return parsed['ZONE']['MEOW'][0].get('PROVINCE', np.nan)
        return np.nan
    except (ValueError, KeyError, TypeError):
        return np.nan

def extract_country(x):
    """
    Extract the country (COUNTRY) from the 'ZONE' key in a dictionary-like string in the 'oceano' column.

    Args:
        x (str): A string representing a dictionary containing country information.

    Returns:
        str or np.nan: The country (COUNTRY) if found, otherwise np.nan.
    """
    try:
        parsed = ast.literal_eval(x)
        if 'ZONE' in parsed and 'EEZ' in parsed['ZONE'] and len(parsed['ZONE']['EEZ']) > 0:
            return parsed['ZONE']['EEZ'][0].get('COUNTRY', np.nan)
        return np.nan
    except (ValueError, KeyError, TypeError):
        return np.nan

def parse_individual_count(count_str):
    """
    Parse the 'individual_count' column, handling both ranges and individual values.

    Args:
        count_str (str or float): The individual count as a string (possibly a range) or a float.

    Returns:
        float: The parsed individual count.
    """
    if isinstance(count_str, str) and '-' in count_str:
        # Split the range and calculate the average
        range_values = count_str.split('-')
        try:
            return (int(range_values[0]) + int(range_values[1])) / 2
        except ValueError:
            return 1  # Default to 1 if there's an issue parsing the range
    else:
        try:
            return float(count_str)
        except ValueError:
            return 1

def extract_unique(df):
    """
    Extract unique rows based on 'organism_id'.

    Args:
        df (pd.DataFrame): The input DataFrame.

    Returns:
        pd.DataFrame: DataFrame with duplicate 'organism_id' entries removed.
    """
    unique_df = df.drop_duplicates(subset=['organism_id'], keep='first')
    return unique_df

def extract_multiple_occurrences(df):
    """
    Extract rows where 'organism_id' appears multiple times in the DataFrame.

    Args:
        df (pd.DataFrame): The input DataFrame.

    Returns:
        pd.DataFrame: DataFrame containing only rows with multiple occurrences of the same 'organism_id'.
    """
    animal_counts = df['organism_id'].value_counts()

    animals_multiple_occurrences = animal_counts[animal_counts > 1].index

    multiple_occurrences_df = df[df['organism_id'].isin(animals_multiple_occurrences)]

    return multiple_occurrences_df

def group_species(df, threshold=0.5):
    """
    Group species by their proximity (latitude and longitude) and aggregate the data.

    Args:
        df (pd.DataFrame): The input DataFrame containing cetacea data.
        threshold (float): The proximity threshold for grouping species, in degrees (default is 0.5 degrees).

    Returns:
        pd.DataFrame: A DataFrame containing the grouped species with aggregated data.
    """
    grouped_rows = []

    for _, group in tqdm(df.groupby(['scientific_name', 'dataset_id'])):
        group = group.reset_index(drop=True)
        for i in group.index:
            if i in group.index: 
                
                sub_group = group[(group['latitude'] >= ( group.loc[i]['latitude'] - threshold)) & 
                                (group['latitude'] <= ( group.loc[i]['latitude'] + threshold)) & 
                                (group['longitude'] >= ( group.loc[i]['longitude'] - threshold)) & 
                                (group['longitude'] <= ( group.loc[i]['longitude'] + threshold))]

                grouped_rows.append({
                    'scientific_name':  group.loc[i]['scientific_name'],
                    'species_name':  group.loc[i]['species_name'],
                    'common_name':  group.loc[i]['common_name'],
                    'dataset_id':  group.loc[i]['dataset_id'],
                    'dataset_id':  group.loc[i]['dataset_id'],
                    'higher_geography':  group.loc[i]['higher_geography'],
                    'water_body':  group.loc[i]['water_body'],
                    'locality':  group.loc[i]['locality'],
                    'verbatim_locality':  group.loc[i]['verbatim_locality'],
                    'latitude': sub_group['latitude'].mean(),
                    'longitude': sub_group['longitude'].mean(),
                    'individual_count': sub_group['individual_count'].sum(),
                })
                group = group.drop(sub_group.index)
                
    grouped_df = pd.DataFrame(grouped_rows)
    return grouped_df

