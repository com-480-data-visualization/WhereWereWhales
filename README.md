# Project of Data Visualization (COM-480)

| Student's name | SCIPER |
| -------------- | ------ |
| Camille Challier | 311020 |
| Cyrill Strassburg |  |
| Eglantine Vialaneix | 324293 |

[Milestone 1](#milestone-1) • [Milestone 2](#milestone-2) • [Milestone 3](#milestone-3)

## Milestone 1 (21st March, 5pm)

**10% of the final grade**

This is a preliminary milestone to let you set up goals for your final project and assess the feasibility of your ideas.
Please, fill the following sections about your project.

*(max. 2000 characters per section)*

### Dataset

> Find a dataset (or multiple) that you will explore. Assess the quality of the data it contains and how much preprocessing / data-cleaning it will require before tackling visualization. We recommend using a standard dataset as this course is not about scraping nor data processing.
>
> Hint: some good pointers for finding quality publicly available datasets ([Google dataset search](https://datasetsearch.research.google.com/), [Kaggle](https://www.kaggle.com/datasets), [OpenSwissData](https://opendata.swiss/en/), [SNAP](https://snap.stanford.edu/data/) and [FiveThirtyEight](https://data.fivethirtyeight.com/)), you could use also the DataSets proposed by the ENAC (see the Announcements section on Zulip).

For this project, we are working with multiple datasets related to cetacean.

- **Global info about Cetacean** .... together with Images of cetaceas manually scrapped from Wikipedia #TODO
- One of the primary sources is <strong><a href="https://happywhale.com/home">HappyWhale</a></strong>, a platform for marine mammal sightings contributed by citizen scientists and researchers. The HappyWhale dataset was extracted from <strong><a href="https://seamap.env.duke.edu/">OBIS Seamap</a></strong>, which serves as the World Data Center for Marine Mammal, Seabird, Sea Turtle, Shark & Ray Distributions and aggregates various datasets, including HappyWhale. From this website, we extracted the **sighting of Cetacean** only. This extracted dataset encompasses records of over 275191 sightings spanning from 1972 to the present day. It comprises 18 attributes, including: Geographical coordinates (latitude & longitude),Species name, Unique animal identification (tracking repeated sightings of the same individual), Group size, Sex (though missing for many sightings, but not needed), Date of sighting, Locality and environmental details. Some location information, such as country and water zone, is missing, but since we have the coordinates, we might not need it or could extract it if necessary. As a large number of events are present in the dataset, and it might be too big to work on, we plan to process and group sightings of similar species and locations. This has already been done for figures, and we will determine whether this approach is necessary for the final website as well. In summary, the primary data processing steps have already been completed.
- To assess the potential threats to cetacean survival, we explored multiple simple datasets covering climate disruption, ship strikes, and whaling activities:
    - **Climate Disruption**: We analyzed data from <strong><a href="https://marine.copernicus.eu/ocean-climate-portal/sea-surface-temperatures">Copernicus</a></strong> Global Monthly Average Sea Surface Temperature (SST) Anomalies, which provides monthly anomaly levels of sea surface temperature from 1993 to 2021. Anomalies represent deviations from long-term averages. For example, the January 2022 anomaly is calculated as the difference between the sea surface temperature in January 2022 and the climatological average for all January months within the dataset's time span.
    - **Ship Strikes**: We examined data from the <strong><a href="https://iwc.int/management-and-conservation/ship-strikes">IWC Ship Strike Database</a></strong>, which records incidents of ship collisions with marine mammals since 1954. This dataset provides insights into the frequency and distribution of such events.
    - **Whaling Activities**: We analyzed data from the <strong><a href="https://iwc.int/management-and-conservation/whaling/total-catches">International Whaling Commission</a></strong> (IWC) on direct whale catches since 1986. The dataset includes records by year, whale species, geographic area, and nation, as well as the type of operation:  Commercial, Aboriginal, Illegal, Special permit, Commercial under objection, Commercial under reservation.
    - **Marine Protected Areas**: We incorporated data from the <strong><a href="https://www.protectedplanet.net/en/thematic-areas/wdpa?tab=WDPA">World Database on Protected Areas </a></strong> (WDPA), a comprehensive global database of marine and terrestrial protected areas. Managed by UNEP-WCMC in collaboration with governments, NGOs, academia, and industry, the WDPA is updated monthly and provides crucial insights into the distribution and extent of protected areas, which play a key role in cetacean conservation.
- … many others !!! …

### Problematic

> Frame the general topic of your visualization and the main axis that you want to develop.
> - What am I trying to show with my visualization?
> - Think of an overview for the project, your motivation, and the target audience.

More than a century after the peak of commercial whaling, which decimated the world's oceans, most cetacean populations are still struggling to recover. They continue to face the cumulative impacts of various human activities. As of **[ADD DATE]**, approximately **[ADD VALUE]%** of whale, dolphin, and porpoise species are classified as threatened.  

Why are cetacean populations still declining? Why are current conservation efforts insufficient?  
This project aims to raise awareness about cetaceans, their philogeny, their current global condition and the various threats they face. Knows to be endangered species and very famous for their magnificency, this projects propose a playfull, engaging and interesting way of navigating the history of modern cetaceans, from their biological classification to their reported locations around the world. By fostering heightened awareness, we aim to inspire action for stronger conservation measures, emphasizing the urgency of protecting these marine species.

With our visualizations we are trying to provide:
1. **Global Overview**: Provide an overview of cetaceans around the world, highlighting the species that are extinct or endangered, using the Red-List status for reference.  
2. **Phylogenetic Tree**: Present a phylogenetic tree to showcase the evolutionary relationships of cetaceans, highlighting extinct species and their connections to modern counterparts.  
3. **Cetacean Sightings**: Display sightings of cetaceans around the globe to help users understand where they live and their migration patterns.  
4. **Timeline of Threats**: Illustrate the cumulative and ongoing threats to cetaceans, such as: Climate change impact on ocean, Maritime traffic, Pollution and Plastic contamination, Hunting  
This visualization will integrate these aspects to present a comprehensive picture of cetacean populations, their history, and the dangers they face.

### Exploratory Data Analysis

> Pre-processing of the data set you chose
> - Show some basic statistics and get insights about the data

### Related work

- site de camille qui montre déjà une heatma des détections de cétacées
- tree of life interactive website
- Several websites/plateforms/organization already offer some visualizations of either the ddetected locations of cetaceans or their philogenetic tree but to our knowledge no website rpopose an aggregation of these informaiton into one interactive website. 
- Other inspirations: github/website of the endangered wildlife?

> - What others have already done with the data?
> - Why is your approach original?
> - What source of inspiration do you take? Visualizations that you found on other websites or magazines (might be unrelated to your data).
> - In case you are using a dataset that you have already explored in another context (ML or ADA course, semester project...), you are required to share the report of that work to outline the differences with the submission for this class.

## Milestone 2 (18th April, 5pm)

**10% of the final grade**


## Milestone 3 (30th May, 5pm)

**80% of the final grade**


## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone

