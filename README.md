# ⚡🔋 Experimental Branch for Project 3

# <b style="color: red"> Don't Merge with main branch</b>

For testing maps and charts with HTML, CSS, JS.

- [`index.html`](index.html) has a map with different layers and 4 different charts that can be filtered by state.
- [`logic.js`](static/js/logic.js) contains all the javascript code.
- [`states.js`](static/js/states.js) contains a list of all US states/territories with their full name and abbreviation.
- [`style.css`](static/css/style.css) contains the css for the web page, includes a dark mode work around for the map.


### Ideas
- Map (leaflet)
    - Heatmap ✅
    - Heatmap for each level (1, 2, 3) ❌
    - Marker clusters plugin? ❌
    - Different markers for major charging companies ✅
    - Different markers for levels / future locations
    - By Status ✅
- Charts (Plotly)
    - Filter By State ✅
    - By State per capita (need population data) ❌
    - By top 20 metro areas ❌
    - By Number of Points
    - Top Operators ✅
    - Number of Level 1, 2, 3 ✅
    - Pie Chart (Public vs Private) ✅
    - Usage Type
    - Status ✅


## Libraries
### JavaScript
- D3
- Plotly
- Leaflet.js
    - ### Plugins
        - ✅ [leaflet-heat](https://github.com/Leaflet/Leaflet.heat)
            - ❌ if this is slow try [this one](https://github.com/ursudio/leaflet-webgl-heatmap)
        - ❌ [leaflet-gliphy](https://github.com/robertleeplummerjr/Leaflet.glify) for possibly faster thousands of points
            - [https://stackoverflow.com/questions/43015854/large-dataset-of-markers-or-dots-in-leaflet](https://stackoverflow.com/questions/43015854/large-dataset-of-markers-or-dots-in-leaflet)
        - ✅ [leaflet-fullscreen](https://github.com/brunob/leaflet.fullscreen)
            - adds a full screen button next to zoom buttons
- ❌ Cursor trail or change cursor


### Python
- geopy
- pandas
- requests
- sqlalchemy
- flask

### PostgreSQL
