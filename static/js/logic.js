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


// Get the data with d3.
// Use async function and await (command) to pull data without a promise, prioritize data pull
async function start() {
    stationdata = await d3.json("/data/reduced_data.json")
    let referencedata = await d3.json("/data/reduced_reference_data.json")

    let statustypes = referencedata.StatusTypes;

    console.log(statustypes);

    let plottingdata = createfilterdata('TX');

    // Status Bar Graph
    let tracestatus = {
        x: [...Array(statustypes.length).keys()],
        y: Object.values(plottingdata.Status),
        type: 'bar'
    };

    let layoutstatus = {
        title: 'Status of Stations',
        xaxis: {
            title: 'Status',
            ticktext: statustypes.map(status => status.Title),
            tickfont: { size: 10 },
            tickvals: [...Array(statustypes.length).keys()]
        },
        yaxis: { title: 'Number of Stations', type: 'log' }
    }
    Plotly.newPlot('statusplot', [tracestatus], layoutstatus);

    // Power Level Graph
    let trace1 = {
        x: [1, 2, 3, 4],
        y: Object.values(plottingdata.PowerLevel),
        name: "State",
        type: "bar"
    };
     //Create data array
     let data = [trace1]
     //Apply a title to the layout
     let layout = {
         title: "Count of Stations powerlevels",
         barmode: "group",
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
     Plotly.newPlot("plot", data, layout);


    // Creating the map object, google center of US lat/long
    let myMap = L.map("map", {
        center: [37, -95],
        zoom: 4
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

start();
