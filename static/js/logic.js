let fullData;

function init(){
    d3.json("/data/reduced_data.json").then(function(data) {
        fullData = data;

        // set initial data
        // createLocationDataSubset("USA");
        createLocationDataSubset("Texas");
        console.log("--------")
        createLocationDataSubset("TX"); // Oh No, this and Texas are both valid

        // make charts with data
        // let trace1 = {};
        // let layout1 = {};
        // Plotly.plot("plot1", trace1, layout1);
    });
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
        console.log(singleStateData.length)
        console.log(singleStateData)
        // use state
    }


}


init()