let stationdata;

function createfilterdata(state) {
    let filterdata;

    if (state == 'USA') {
        filterdata = stationdata;
    } else {
        filterdata = stationdata.filter(station => station.StateOrProvince == state);
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

    filterdata.forEach(station => {
        if (station.L1Count > 0) { powerleveldata.L1++ }
        if (station.L2Count > 0) { powerleveldata.L2++ }
        if (station.L3Count > 0) { powerleveldata.L3++ }
        if (station.LUnknownCount > 0) { powerleveldata.Unknown++ }

        statuscounts[station.StatusTypeID]++;
    })
    
    console.log(statuscounts);

    let calculatedData = {
        Status: statuscounts,
        PowerLevel: powerleveldata
    }
    return calculatedData;
}


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

    stationdata = await d3.json("/data/reduced_data.json")
    let referencedata = await d3.json("/data/reduced_reference_data.json")

    let statustypes = referencedata.StatusTypes;

    console.log(statustypes);

    let plottingdata = createfilterdata('USA');

    // Status Bar Graph
    let tracestatus = {
        x: [...Array(statustypes.length).keys()],
        y: Object.values(plottingdata.Status),
        type: 'bar',
        marker: {color: '#00F7FF'}
    };

    let layoutstatus = {
        title: 'Status of Stations',
        xaxis: {
            title: 'Status',
            ticktext: statustypes.map(status => status.Title),
            tickfont: { size: 10 },
            tickvals: [...Array(statustypes.length).keys()]
        },
        yaxis: { title: 'Number of Stations', type: 'log' },
        plot_bgcolor:"black",
        paper_bgcolor:"#111",
        font: {color: "white"},
    }
    Plotly.newPlot('statusplot', [tracestatus], layoutstatus);

    // Power Level Graph
    let trace1 = {
        x: [1, 2, 3, 4],
        y: Object.values(plottingdata.PowerLevel),
        name: "State",
        type: "bar",
        marker: {color: '#02B43A'}
    };
     //Create data array
     let data = [trace1]
     //Apply a title to the layout
     let layout = {
        title: "Count of Stations powerlevels",
        barmode: "group",
        xaxis: { 
           title: "Power Level",
           tickvals: [1,2,3,4]
        },
        yaxis: { 
            title: "Total Count"
        },
        plot_bgcolor:"black",
        paper_bgcolor:"#111",
        font: {color: "white"},
    
         //Include margins in the layout so the x-tick labels display correctly
        margin: {
            l: 50,
            r: 50,
            b: 200,
            t: 50,
            pad: 4
        }
     };
     // Render the plot to the div tag with id "plot"
     Plotly.newPlot("powerLevelsPlot", data, layout);


    // Creating the map object, google center of US lat/long
    let myMap = L.map("map", {
        center: [37, -95.7],
        zoom: 4,
        fullscreenControl: {pseudoFullscreen: true} // true = fullscreen to page width and height
    });

    // Adding the tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(myMap);

    // Filtering to lat/long
    let heatArray = [];

    for (let i = 0; i < stationdata.length; i++) {
        let location = stationdata[i]
        heatArray.push([location.Latitude, location.Longitude]);
    }

    let heat = L.heatLayer(heatArray, {
        radius: 15,
        blur: 20,
        minOpacity: 0.5
    }).addTo(myMap);
}

function updateCharts(stateValue) {
    let updatedData = createfilterdata(stateValue);

    let powerLevelUpdateData = {
        y: [Object.values(updatedData.PowerLevel)],
    };
    Plotly.restyle("powerLevelsPlot", powerLevelUpdateData)

    let statusUpdate = {
        y: [Object.values(updatedData.Status)]
    };
    Plotly.restyle("statusplot", statusUpdate)
}

function optionChanged(value) {
    console.log(value);
    updateCharts(value);
}

start();
