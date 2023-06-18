let fullData;

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

    // set initial data
    let bulkData = createLocationDataSubset("TX");

    console.log(Object.values(bulkData["PowerLevelData"]));
    console.log("-----")
    // make charts with data
    let trace1 = [{
        x: Object.keys(bulkData["PowerLevelData"]),
        y: Object.values(bulkData["PowerLevelData"]),
        name: "Power Level",
        type: "bar",
    }];
    let layout1 = {title: "Chargers with Power Level",
                   xaxis: {title: "Levels"},
                   yaxis: {title: "Count"}};
    Plotly.newPlot("plot1", trace1, layout1);

    // Pie Chart
    let trace2 = [{
        values: Object.values(bulkData.PublicPrivateData),
        labels: Object.keys(bulkData.PublicPrivateData),
        marker: {colors:[
            "#aaaaaa",  // Unknown
            "#02e815",  // Public
            "#c100d6",  // Private - Restricted Access
            "#c9063d",  // Privately Owned
            "#00d6c1",  // Public - Membership
            "#00d692",  // Public - Pay
            "#f26d00",  // Private - Customers
            "#00a32c",  // Public - Notice
        ]},
        type: "pie"
    }];
    let layout2 = {
        title: "Public vs Private"
    };
    Plotly.newPlot("plot2", trace2, layout2);

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
        })
    }

    // console.log(Object.values(powerLevelData));
    // console.log(publicPrivateData);
    let bulkData = {
        "PowerLevelData": powerLevelData,
        "PublicPrivateData": publicPrivateData
    }

    return bulkData
}

function optionChanged(value) {
    console.log("Value changed to:", value);
    // updateCharts(value);
}


init()