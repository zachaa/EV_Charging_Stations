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

    // set initial data to use full country data
    let bulkData = createLocationDataSubset("USA");

    // make charts with data
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
    Plotly.newPlot("plot1", trace1, layout1);

    // Pie Chart
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
    Plotly.newPlot("plot2", trace2, layout2);

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
    Plotly.newPlot("plot3", trace3, layout3)

    console.log("Init complete");
}

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

    if (locationFilter === "USA") {
        // use full data
        fullData.forEach(element => {
            // set power Level data (there can be multiple different values for each station)
            if (element.LUnknownCount > 0) {powerLevelData["Unknown"]++}
            if (element.L1Count > 0) {powerLevelData["1"]++}
            if (element.L2Count > 0) {powerLevelData["2"]++}
            if (element.L3Count > 0) {powerLevelData["3"]++}

            // set public/private data value
            publicPrivateData[element.UsageTypeID]++;

            // set operator data value
            stationOperatorData[element.OperatorID] = stationOperatorData[element.OperatorID] || 0;
            stationOperatorData[element.OperatorID]++;
        });
    } else {
        let singleStateData = fullData.filter(station => (station.StateOrProvince == locationFilter));
        console.log("Items in state data:", locationFilter, singleStateData.length)
        singleStateData.forEach(element => {
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
        });
    }

    // create Array of objects for operator data
    let operatorDataArray = [];
    // sort Operator Data from highest to lowest (descending)
    for (const [key, value] of Object.entries(stationOperatorData)) {
        // select the correct operator from reference data
        let operatorObject = referenceData.OperatorTypes.filter(operator => operator.ID == key)[0];
        operatorDataArray.push([operatorObject.Title, value]);
    }
    // sort in place from most to least stations being operated
    operatorDataArray.sort((a, b) => b[1] - a[1]);

    // console.log(Object.values(powerLevelData));
    // console.log(publicPrivateData);
    // console.log(operatorDataArray);
    let bulkData = {
        "PowerLevelData": powerLevelData,
        "PublicPrivateData": publicPrivateData,
        "OperatorDataArray": operatorDataArray
    };

    return bulkData;
}

function updateCharts(stateOption) {
    let bulkData = createLocationDataSubset(stateOption);

    let barUpdate = {
        y: [Object.values(bulkData["PowerLevelData"])]
    };
    Plotly.restyle("plot1", barUpdate);

    let pieUpdate = {
        values: [Object.values(bulkData.PublicPrivateData)]
    };
    Plotly.restyle("plot2", pieUpdate);

    let barHUpdate = {
        x: [bulkData.OperatorDataArray.slice(0, 15).reverse().map(operator => operator[1])],
        y: [bulkData.OperatorDataArray.slice(0, 15).reverse().map(operator => operator[0])]
    };
    Plotly.restyle("plot3", barHUpdate);
}

function optionChanged(value) {
    console.log("Value changed to:", value);
    updateCharts(value);
}


init()