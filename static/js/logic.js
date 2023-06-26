const urlStations = "https://raw.githubusercontent.com/zachaa/Project3/main/data/reduced_data.json";
const urlReference = "https://raw.githubusercontent.com/zachaa/Project3/main/data/reduced_reference_data.json";

let stationData;
let referenceData;

// Filters the full data to a given state
function createFilterData(state) {
    let filterData;

    if (state == 'USA') {
        filterData = stationData;
    } else {
        filterData = stationData.filter(station => station.StateOrProvince == state);
    }

    let powerleveldata = {
        L1: 0,
        L2: 0,
        L3: 0,
        Unknown: 0
    }

    let statuscounts = {
        0: 0,
        10: 0,
        20: 0,
        30: 0,
        50: 0,
        75: 0,
        100: 0,
        150: 0,
        200: 0,
        210: 0,
    }

    let stationOperatorData = {}

    // loop through all the data calculate values our plots need
    filterData.forEach(station => {
        if (station.L1Count > 0) { powerleveldata.L1++ }
        if (station.L2Count > 0) { powerleveldata.L2++ }
        if (station.L3Count > 0) { powerleveldata.L3++ }
        if (station.LUnknownCount > 0) { powerleveldata.Unknown++ }

        statuscounts[station.StatusTypeID]++;

        // set operator data value
        // if key does not exist yet, create it then increase count
        stationOperatorData[station.OperatorID] = stationOperatorData[station.OperatorID] || 0;
        stationOperatorData[station.OperatorID]++;
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


    let calculatedData = {
        Status: statuscounts,
        PowerLevel: powerleveldata,
        OperatorArray: operatorDataArray
    }
    return calculatedData;
}

/** Adds all the states/territories to the drop down selection as options.
 */
function setSelectOptions() {
    let dropDown = d3.select("#selectState");
    states.forEach(state => {
        dropDown.append("option")
            .text(state.name)
            .attr("value", state.abbreviation)
    });
}


// Get the data with d3.
// Use async function and await (command) to pull data without a promise, prioritize data pull
async function start() {
    setSelectOptions();

    // load the two JSON files
    stationData = await d3.json(urlStations);  // "/data/reduced_data.json"
    referenceData = await d3.json(urlReference);  // "/data/reduced_reference_data.json"

    let statustypes = referenceData.StatusTypes;

    // Get the data needed for the plots
    let plottingData = createFilterData('USA');

    // plot style options
    const colorBackground = "#222";
    const colorPlotBackground = "black";
    const colorFont = "#eee";
    const titleFontSize = 26;
    const axisTitleFontSize = 20;
    const config = {responsive: true};

    // Status Bar Graph
    let tracestatus = {
        x: [...Array(statustypes.length).keys()],
        y: Object.values(plottingData.Status),
        type: 'bar',
        marker: { color: '#00B3FF' }
    };
    let layoutstatus = {
        title: 'Status of Stations',
        xaxis: {
            title: 'Status',
            titlefont: { size: axisTitleFontSize },
            ticktext: statustypes.map(status => status.Title.replace(" (Automated Status)", "")),
            tickvals: [...Array(statustypes.length).keys()],
            fixedrange: true
        },
        yaxis: {
            title: 'log( Number of Stations )',
            titlefont: { size: axisTitleFontSize },
            type: 'log',
            fixedrange: true
        },
        margin: {t: 50, b: 130, l: 60, r: 20},
        plot_bgcolor: colorPlotBackground,
        paper_bgcolor: colorBackground,
        font: { color: colorFont },
        titlefont: { size: titleFontSize }
    }
    Plotly.newPlot('statusplot', [tracestatus], layoutstatus, config);

    // Power Level Graph
    let trace1 = {
        x: [1, 2, 3, 4],
        y: Object.values(plottingData.PowerLevel),
        name: "State",
        type: "bar",
        marker: { color: '#02B43A' }
    };
    //Create data array
    let data = [trace1]
    //Apply a title to the layout
    let layout = {
        title: "Count of Stations Power Levels",
        barmode: "group",
        xaxis: {
            title: "Power Level",
            titlefont: { size: axisTitleFontSize },
            tickvals: [1, 2, 3, 4],
            ticktext: ["Level 1", "Level 2", "Level 3", "Unknown"],
            fixedrange: true
        },
        yaxis: {
            title: "Total Count",
            titlefont: { size: axisTitleFontSize },
            fixedrange: true
        },
        margin: {t: 50, b: 50, l: 60, r: 20},
        plot_bgcolor: colorPlotBackground,
        paper_bgcolor: colorBackground,
        font: { color: colorFont },
        titlefont: { size: titleFontSize }
    };
    // Render the plot to the div tag with id "plot"
    Plotly.newPlot("powerLevelsPlot", data, layout, config);

    // Top 15 Operators
    let traceOperators = [{
        x: plottingData.OperatorArray.slice(0, 15).reverse().map(operator => operator[1]),
        y: plottingData.OperatorArray.slice(0, 15).reverse().map(operator => operator[0]),
        name: "Operator",
        type: "bar",
        orientation: "h",
        marker: { color: '#8429CF' }
    }]
    let layoutOperators = {
        title: "Top 15 Operators",
        margin: {t: 50, b: 50, l: 210, r: 20},
        xaxis: {
            title: "Number of Stations",
            titlefont: { size: axisTitleFontSize },
            fixedrange: true
        },
        yaxis: {
            title: "Operators",
            titlefont: { size: axisTitleFontSize },
            fixedrange: true
        },
        plot_bgcolor: colorPlotBackground,
        paper_bgcolor: colorBackground,
        font: { color: colorFont },
        titlefont: { size: titleFontSize }
    }
    Plotly.newPlot("plotOperators", traceOperators, layoutOperators, config)

    // Creating the map object, google center of US lat/long
    let chargeMap = L.map("map", {
        center: [37, -95.7],
        zoom: 4,
        fullscreenControl: { pseudoFullscreen: true } // true = fullscreen to page width and height
    });

    // Adding the tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(chargeMap);

    let heatArray = [];
    let circleMarkersOperator = [];

    // for faster rendering of many points
    let canvasRenderer = L.canvas({ padding: 0.1 });

    // create data for the different overlay maps
    for (let i = 0; i < stationData.length; i++) {
        let location = stationData[i]
        heatArray.push([location.Latitude, location.Longitude]);
        circleMarkersOperator.push(createCircleMarker(canvasRenderer, location));
    }

    // Create heatmap layer
    let heat = L.heatLayer(heatArray, {
        radius: 15,
        blur: 20,
        minOpacity: 0.4,
        maxZoom: 15
    }).addTo(chargeMap);

    // Create layer group for Operators
    let markerLayerOperator = L.layerGroup(circleMarkersOperator);

    let overlayMaps = {
        Heatmap: heat,
        Operator: markerLayerOperator,
    }

    L.control.layers(overlayMaps, null, {collapsed: false})
        .addTo(chargeMap);

    // Create legend for the Operator Data
    let legendDataOperator = [[5, "ChargePoint"], [23, "Tesla"], [9, "Blink"], [59, "Shell Recharge"],
                              [3372, "EV Connect"], [15, "eVgo"], [3460, "PEA Volta"], [3318, "Electrify America"],
                              [-1, "Other Operators"], [1, "Unknown"]];
    let operatorLegend = createLegend(legendDataOperator, "Station Operator", "OperatorID");

    // Turn the legend on or off depending on layer
    chargeMap.on("baselayerchange", event => {
        let layerName = event.name;
        console.log("Switching to overlay:", layerName);
        if (layerName === "Operator") {
            chargeMap.addControl(operatorLegend);
        } else {
            chargeMap.removeControl(operatorLegend);
        }
    });

    console.log("Start complete");
}

/**
 * Creates a leaflet legend
 * @param {Array} legendData Array of Arrays containing ID int and Text description for each item to be added
 * @param {string} legendTitle Title of the legend
 * @returns leaflet Legend control
 */
function createLegend(legendData, legendTitle) {
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = () => {
        let div = L.DomUtil.create("div", "legend");

        // Create each row div in a loop to get the color from colorMarker() function
        let htmlRowDivs = [];
        legendData.forEach(row => {
            let itemColor = colorMarker(row[0]);
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

function createCircleMarker(renderer, elementData) {

    let circleMarker = L.circleMarker(
        L.latLng(elementData.Latitude, elementData.Longitude), {
        color: colorMarker(elementData["OperatorID"]),
        fillOpacity: 0.8,
        radius: 5,
        stroke: false,
        renderer: renderer
    }).bindPopup(`<strong>${elementData.Title}</strong>
                  <hr>
                  Operator: ${referenceData.OperatorTypes.filter(op => op.ID==elementData.OperatorID)[0].Title}<br>
                  Usage: ${referenceData.UsageTypes.filter(op => op.ID==elementData.UsageTypeID)[0].Title}<br>
                  Status: ${referenceData.StatusTypes.filter(op => op.ID==elementData.StatusTypeID)[0].Title}<br>
                  Points: ${elementData.NumberOfPoints}`)
    return circleMarker;
}

/**
 * Gives the hex color for different operators
 * @param {number} value OperatorID number
 * @returns hex color
 */
function colorMarker(value) {
    switch (value) {  // By approximate order of popularity in US
        case 1:     // Unknown
            return "#aaaaaa";
        case 5:     // ChargePoint
            return "#FB8117";
        case 23:    // Tesla (tesla only)
        case 3534:  // Tesla (+ non-tesla)
            return "#dd0000";
        case 39:    // SemaConnect (acquired by Blink in 2022)
        case 9:     // Blink Network/ECOtality (bankrupt)
        case 3426:  // Blink Charging Europe
        case 3391:  // EB Charging (acquired in 2022)
            return "#1B66A3";
        case 59:    // Shell Recharge Solutions (US)
        case 47:    // NL
        case 156:   // DE
        case 157:   // BE
        case 3392:  // UK
        case 3591:  // Malaysia
        case 3666:  // Indonesia
            return "#FFEA00";
        case 3372:  // EV Connect
            return "#00FFFF";
        case 15:    // eVgo
        case 3252:  // NRG EVgo
            return "#0077ff";
        case 3460:  // PEA Volta
            return "#AD00BD";
        case 3318:  // Electrify America
        case 3400:  // Electrify Canada (subsidiary)
            return "#8EFF5A";
        default:
            return "#188E36";
    }
}

function updateCharts(stateValue) {
    // get the new updated filtered data
    let updatedData = createFilterData(stateValue);

    let powerLevelUpdateData = {
        y: [Object.values(updatedData.PowerLevel)],
    };
    Plotly.restyle("powerLevelsPlot", powerLevelUpdateData);

    let statusUpdate = {
        y: [Object.values(updatedData.Status)]
    };
    Plotly.restyle("statusplot", statusUpdate);

    let operatorUpdate = {
        x: [updatedData.OperatorArray.slice(0, 15).reverse().map(operator => operator[1])],
        y: [updatedData.OperatorArray.slice(0, 15).reverse().map(operator => operator[0])]
    }
    Plotly.restyle("plotOperators", operatorUpdate);
}

function optionChanged(value) {
    console.log("Changing graphs to:", value);
    updateCharts(value);
}

start();
