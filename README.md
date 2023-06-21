# Experimental Branch for Project 3

# <b style="color: red"> Don't Merge with main branch</b>

For testing maps and charts with HTML, CSS, JS


### Ideas
- Map (leaflet)
    - Heatmap
    - Heatmap for each level (1, 2, 3)
    - Marker clusters plugin?
    - Different markers for major charging companies
    - Different markers for levels / future locations
    - By Status
- Charts (Plotly)
    - Filter By State?
    - By State per capita (need population data)
    - By top 20 metro areas
    - By Number of Points
    - Top Operators
    - Number of Level 1, 2, 3
    - Pie Chart (Public vs Private)


## Libraries
### JavaScript
- D3
- Plotly
- Leaflet.js
    - [leaflet-heat](https://github.com/Leaflet/Leaflet.heat)
        - if this is slow try [this one](https://github.com/ursudio/leaflet-webgl-heatmap)
    - [leaflet-gliphy](https://github.com/robertleeplummerjr/Leaflet.glify) for possibly faster thousands of points
        - [https://stackoverflow.com/questions/43015854/large-dataset-of-markers-or-dots-in-leaflet](https://stackoverflow.com/questions/43015854/large-dataset-of-markers-or-dots-in-leaflet)
    - [leaflet-fullscreen] (https://github.com/brunob/leaflet.fullscreen)
        - adds a full screen button next to zoom buttons

### Python
- geopy
- pandas
- requests
- sqlalchemy
