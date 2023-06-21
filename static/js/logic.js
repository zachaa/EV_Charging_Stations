let fullData;
let referenceData;

function setSelectOptions() {
    let dropDown = d3.select("#selectState");
    states.forEach(state => {
        dropDown.append("option")
                .text(state.name)
                .attr("value", state.abbreviation)
    });
}

async function init() {
    setSelectOptions();

    // Promises are messing me up, just use async await for full data
    fullData = await d3.json("/data/reduced_data.json");
    referenceData = await d3.json("/data/reduced_reference_data.json");

    createMap();

    // set initial data to use full country data
    let bulkData = createLocationDataSubset("USA");

    // Initial Chart creation
    // Bar Chart (Count of Power Levels)
    let trace1 = [{
        x: [1, 2, 3, 4],
        y: Object.values(bulkData["PowerLevelData"]),
        name: "Power Level",
        type: "bar",
    }];
    let layout1 = {title: "Chargers with Power Level",
                   xaxis: {title: "Levels",
                           fixedrange: true,
                           range: [0.5, 4.5],
                           tickvals: [1, 2, 3, 4],
                           ticktext: ["Level 1", "Level 2", "Level 3", "Unknown"]},
                   yaxis: {title: "Count",
                           fixedrange: true}};
    Plotly.newPlot("plotPowerLevels", trace1, layout1);

    // Pie Chart (Public vs Private)
    let trace2 = [{
        values: Object.values(bulkData.PublicPrivateData),
        labels: referenceData.UsageTypes.map(usageTypes => usageTypes.Title),
        marker: {colors:[
            "#aaaaaa",  // Unknown
            "#02e815",  // Public
            "#D20000",  // Private - Restricted Access
            "#D300C9",  // Privately Owned
            "#0096E1",  // Public - Membership
            "#001EE2",  // Public - Pay
            "#FF7300",  // Private - Customers
            "#00F8D2",  // Public - Notice
        ]},
        type: "pie"
    }];
    let layout2 = {
        title: "Public vs Private"
    };
    Plotly.newPlot("plotPie", trace2, layout2);

    // Horizontal Bar Chart (Operators)
    let trace3 = [{
        x: bulkData.OperatorDataArray.slice(0, 15).reverse().map(operator => operator[1]),
        y: bulkData.OperatorDataArray.slice(0, 15).reverse().map(operator => operator[0]),
        name: "Operator",
        type: "bar",
        orientation: "h"
    }]
    let layout3 = {
        title: "Top 15 Operators",
        margin: {t: 30, b: 40, l: 200, r: 10},
        xaxis: {title: "Number of Stations",
                fixedrange: true},
        yaxis: {title: "Operators",
                fixedrange: true}
    }
    Plotly.newPlot("plotOperators", trace3, layout3)

    // Status Bar Chart
    let traceStatus = [{
        x: bulkData.StatusDataArray.map(operator => operator[0]),
        y: bulkData.StatusDataArray.map(operator => operator[1]),
        name: "Status",
        type: "bar"
    }]
    let layoutStatus = {
        title: "Status of Chargers",
        xaxis: {title: "Status",
                fixedrange: true},
        yaxis: {title: "log(Count)",
                type: 'log',        // Helps visualize other numbers
                fixedrange: true}
    }
    Plotly.newPlot("plotStatus", traceStatus, layoutStatus)

    console.log("Init complete");
}

/**
 * Gives filtered data for a specific state to be used when creating a chart.
 * @param {string} locationFilter USA or two character state abbreviation
 * @returns object with filtered data for creating charts
 */
function createLocationDataSubset(locationFilter) {
    let powerLevelData = {
        "1": 0,
        "2": 0,
        "3": 0,
        "Unknown": 0
    }

    let publicPrivateData = {
        0: 0,
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0
    }

    let stationOperatorData = {}

    let stationStatusData = {
        0: 0,
        10: 0,
        20: 0,
        30: 0,
        50: 0,
        75: 0,
        100: 0,
        150: 0,
        200: 0,
        210: 0
    }

    // either use full country data or filter to a specific state
    let locationData;
    if (locationFilter === "USA") {
        locationData = fullData;
    } else {
        locationData = fullData.filter(station => (station.StateOrProvince == locationFilter));
        console.log("Items in state data:", locationFilter, locationData.length)
    }

    // loop through main data to fill objects with needed data
    locationData.forEach(element => {
        // set power Level data (there can be multiple different values for each station)
        if (element.LUnknownCount > 0) {powerLevelData["Unknown"]++}
        if (element.L1Count > 0) {powerLevelData["1"]++}
        if (element.L2Count > 0) {powerLevelData["2"]++}
        if (element.L3Count > 0) {powerLevelData["3"]++}

        // set public/private data value
        publicPrivateData[element.UsageTypeID]++;

        // set operator data value
        // if key does not exist yet, create it then increase count
        stationOperatorData[element.OperatorID] = stationOperatorData[element.OperatorID] || 0;
        stationOperatorData[element.OperatorID]++;

        // set status data value
        stationStatusData[element.StatusTypeID]++;
    });

    // create Array of objects for operator data
    let operatorDataArray = [];
    // fill array by looping through operator data
    for (const [key, value] of Object.entries(stationOperatorData)) {
        // select the correct operator from reference data
        let operatorObject = referenceData.OperatorTypes.filter(operator => operator.ID == key)[0];
        operatorDataArray.push([operatorObject.Title, value]);
    }
    // sort Operator Data from highest to lowest (descending)
    operatorDataArray.sort((a, b) => b[1] - a[1]);

    // create Array of objects for status data
    let statusDataArray = [];
    for (const [key, value] of Object.entries(stationStatusData)) {
        let statusObject = referenceData.StatusTypes.filter(status => status.ID == key)[0];
        statusDataArray.push([statusObject.Title, value]);
    }

    // console.log(Object.values(powerLevelData));
    // console.log(publicPrivateData);
    // console.log(operatorDataArray);
    // console.log(statusDataArray);
    let bulkData = {
        "PowerLevelData": powerLevelData,
        "PublicPrivateData": publicPrivateData,
        "OperatorDataArray": operatorDataArray,
        "StatusDataArray": statusDataArray
    };

    return bulkData;
}

function updateCharts(stateOption) {
    let bulkData = createLocationDataSubset(stateOption);

    let barUpdate = {
        y: [Object.values(bulkData["PowerLevelData"])]
    };
    Plotly.restyle("plotPowerLevels", barUpdate);

    let pieUpdate = {
        values: [Object.values(bulkData.PublicPrivateData)]
    };
    Plotly.restyle("plotPie", pieUpdate);

    let barHUpdate = {
        x: [bulkData.OperatorDataArray.slice(0, 15).reverse().map(operator => operator[1])],
        y: [bulkData.OperatorDataArray.slice(0, 15).reverse().map(operator => operator[0])]
    };
    Plotly.restyle("plotOperators", barHUpdate);

    let barStatusUpdate = {
        x: [bulkData.StatusDataArray.map(operator => operator[0])],
        y: [bulkData.StatusDataArray.map(operator => operator[1])],
    }
    Plotly.restyle("plotStatus", barStatusUpdate);
}

/**Give a color string for a given method and ID value.
 * 
 * @param {string} method what is the marker showing (OperatorID, StatusTypeID, UsageTypeID)
 * @param {integer} value ID number
 * @returns hex color string
 */
function colorMarker(method, value) {
    if (method === "OperatorID") {
        switch (value) {  // By approximate order of popularity in US
            case 1:  // Unknown
                return "#aaaaaa";
            case 5:  // ChargePoint
                return "#FB8117";
            case 23:  // Tesla (tesla only)
            case 3534:  // Tesla (+ non-tesla)
                return "#dd0000";
            case 39:  // SemaConnect (acquired by Blink in 2022)
            case 9:  // Blink Network/ECOtality (bankrupt)
            case 3426:  // Blink Charging Europe
            case 3391:  // EB Charging (acquired in 2022)
                return "#1B66A3";
            case 59:  // Shell Recharge Solutions (US)
            case 47:  // NL
            case 156:  // DE
            case 157:  // BE
            case 3392:  // UK
            case 3591:  // Malaysia
            case 3666:  // Indonesia
                return "#FFEA00";
            case 3372:  // EV Connect
                return "#00FFFF";
            case 15:  // eVgo
            case 3252:  // NEG EVgo
                return "#0077ff";
            default:
                return "#22AA44";
        }
    } else if (method === "StatusTypeID") {
        switch (value) {
            case 0:  // Unknown
                return "#aaaaaa";
            case 10:  // Avaliable
            case 20:
                return "#22FF22";
            case 30:  // Temporarily Unavailable
                return "#FF9900";
            case 50:  // Operational
            case 75:
                return "#11AA11";
            case 100:  // Not Operational
                return "#BB0000";
            case 150:  // Future
                return "#FF34FC";
            case 200:  // Removed
                return "#222222";
            case 210:  // Removed Duplicate
                return "#4A2B00";
            default:
                return "#FF006A";
        }
    } else if (method === "UsageTypeID") {
        switch (value) {
            case 0:  // Unknown
                return "#aaaaaa";
            case 1:  // Public
            case 5:  // Public - Pay
                return "#22AA44";
            case 2:  // Private - Restricted
                return "#BB0000";
            case 3:  // Privately Owned
                return "#FF7B00";
            case 4:  // Public - Membership
                return "#1E78FF";
            case 6:  // Private - Staff/Customers
                return "#FFF200";
            case 7:  // Public - Notice Required
                return "#00FFA6";
            default:
                return "#984A6A";
        }
    } else {
        return "#22DD44";
    }
}

function createCircleMarker(typeName, renderer, elementData) {
    let circleMarker = L.circleMarker(
        L.latLng(elementData.Latitude, elementData.Longitude), {
            color: colorMarker(typeName, elementData[typeName]),  // StatusTypeID, OperatorID, UsageTypeID?)
            fillOpacity: 0.8,
            radius: 5,
            stroke: false,
            renderer: renderer
        }).bindPopup(`${elementData.Title}
                      <hr>
                      Operator: ${elementData.OperatorID}<br>
                      Usage: ${elementData.UsageTypeID}<br>
                      Status: ${elementData.StatusTypeID}<br>
                      Points: ${elementData.NumberOfPoints}`)
    return circleMarker;
}

function createLegend(legendData, legendTitle, colorMethod) {
    let legend = L.control({position: "bottomright"});
    legend.onAdd = () => {
        let div = L.DomUtil.create("div", "legend");

        // Create each row div in a loop to get the color from colorMarker() function
        let htmlRowDivs = [];
        legendData.forEach(row => {
            let itemColor = colorMarker(colorMethod, row[0]);
            htmlRowDivs.push(`<div class="legend_row">
                                <div class="legend_color" style="background: ${itemColor}"></div>
                                <div class="legend_text">${row[1]}</div>
                            </div>`);
        });

        // create the HTML for the legend
        // join the array of row divs
        div.innerHTML = `<h3 class="legend_title">${legendTitle}</h3>
                        <div class="data_container">
                            ${htmlRowDivs.join('')}
                        </div>`;
        return div;
    }
    return legend;
}

function createMap() {
    let esriGray = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
        maxZoom: 16
    });

    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })

    let USGS_USImagery = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 16,
        attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
    });

    let baseMaps = {
        Base: esriGray,
        Streets: street,
        Satellite: USGS_USImagery
    };

    // Feature Maps =========================================================
    let heatArray = [];
    let circleMarkersStatus = [];
    let circleMarkersOperator = [];
    let circleMarkersUsage = [];

    // for faster rendering of many points: check this out => Seems to work well
    let canvasRenderer = L.canvas({ padding: 0.1 });

    // create data for the different maps all in 1 loop
    fullData.forEach(element => {
        heatArray.push([element.Latitude, element.Longitude]);
        circleMarkersStatus.push(createCircleMarker("StatusTypeID", canvasRenderer, element));
        circleMarkersOperator.push(createCircleMarker("OperatorID", canvasRenderer, element));
        circleMarkersUsage.push(createCircleMarker("UsageTypeID", canvasRenderer, element));
    });

    let heatmap = L.heatLayer(heatArray, {
        radius: 15,
        blur: 20,
        minOpacity: 0.4,
        maxZoom: 15
    });

    // marker maps with all locations as circles with popups
    let markerLayerStatus = L.layerGroup(circleMarkersStatus);
    let markerLayerOperator = L.layerGroup(circleMarkersOperator);
    let markerLayerUsage = L.layerGroup(circleMarkersUsage);

    let overlayMaps = {
        Heatmap: heatmap,
        Status: markerLayerStatus,
        Operator: markerLayerOperator,
        Usage: markerLayerUsage
    };

    // MAP ===================================================================
    let chargeMap = L.map("map", {
        center: [37.0902, -95.7129],
        zoom: 4,
        layers: [street, heatmap]
    });

    // separate L.control.layers so overlays can't be shown at the same time
    // https://gis.stackexchange.com/questions/267605/leaflet-api-select-one-overlay-at-a-time-like-base-layers
    L.control.layers(baseMaps)
        .addTo(chargeMap);
    L.control.layers(overlayMaps)
        .addTo(chargeMap);

    // LEGENDS ==============================================================
    // contains an ID for the color and descriptive text
    let legendDataStatus = [[0, "Unknown"], [10, "Avaliable"], [30, "Temporarily Unavailable"],
        [50, "Operational"], [100, "Not Avaliable"], [150, "Future Site"],
        [200, "Removed"], [210, "Duplicate"]];
    let legendDataOperator = [[5, "ChargePoint"], [23, "Tesla"], [9, "Blink"], [59, "Shell Recharge"],
        [3372, "EV Connect"], [15, "eVgo"], [-1, "Other Operators"], [1, "Unknown"]];
    let legendDataUsage = [[1, "Public"], [7, "Public - Notice Required"], [4, "Public - Membership"],
        [6, "Private - Staff/Customers"], [3, "Privately Owned"], [2, "Private - Restricted"], [0, "Unknown"]];
    
    // hold the different legends in one object
    // keys NEED to have the same name as the layer
    let legendMap = {
        Status: createLegend(legendDataStatus, "Station Status", "StatusTypeID"),
        Operator: createLegend(legendDataOperator, "Station Operator", "OperatorID"),
        Usage: createLegend(legendDataUsage, "Station Usage", "UsageTypeID"),
    }

    chargeMap.on("baselayerchange", event => {
        let layerName = event.name;
        console.log("Switching to overlay:", layerName);
        if (layerName in baseMaps) {return;}  // ignore standard base maps
        else {
            // Remove ALL legends if they are shown
            //  This is a dirty way of doing it but there is no built in way
            //   with leaflet to check if a control already exists.
            for (const legend of Object.entries(legendMap)) {
                chargeMap.removeControl(legend[1]);
            }
            
            // add new legend (but not for Heatmap)
            if (layerName in legendMap) {
                chargeMap.addControl(legendMap[layerName]);
            }
        }
    });
}

function optionChanged(value) {
    console.log("Value changed to:", value);
    updateCharts(value);
}


init()