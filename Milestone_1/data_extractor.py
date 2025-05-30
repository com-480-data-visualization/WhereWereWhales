     
import pandas as pd
import glob
import os

def load_data(data_folder):
    csv_files = glob.glob(os.path.join(data_folder, "**", "*points_csv.csv"), recursive=True)

    df_list = [pd.read_csv(file, low_memory=False) for file in csv_files]  

    df_location = pd.concat(df_list, ignore_index=True)
    return df_location

def main():
    """Main function to load and save the dataset."""
    data_folder = "..\data\HappyWhales"
    output_file = os.path.join(data_folder, "location_cetacea_full_info.csv")
    
    df_location = load_data(data_folder)
    df_location.to_csv(output_file, index=False, encoding="utf-8")
    print(f"Data saved to {output_file}")

if __name__ == "__main__":
    main()