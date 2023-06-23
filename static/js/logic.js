
// Initialized arrays
let Titles = []
let Addressline1 = []
let Town = []
let StateOrProvince = []
let Postcode = []
let latitude = []
let longitude = []
let ConnectionTypesIDs = []

d3.json("/data/reduced_data.json").then(searchResults => {
// for loop to populate arrays
for (let i = 0; i < searchResults.length; i++) {
    row = searchResults[i];
    Titles.push(row.pair);
    Addressline1.push(row.Addressline1);
    Town.push(row.Town);
    StateOrProvince.push(row.StateOrProvince);
    Postcode.push(row.Postcode);
    latitude.push(row.latitude);
    longitude.push(row.longitude);
    ConnectionTypesIDs.push(row.ConnectionTypesIDs);
}

let powerleveldata = {
    L1: 0,
    L2: 0,
    L3: 0,
    Unknown: 0
}

searchResults.forEach(element => {
    if (element.L1Count>0) {powerleveldata.L1++}
    if (element.L2Count>0) {powerleveldata.L2++}
    if (element.L3Count>0) {powerleveldata.L3++}
    if (element.LUnknownCount>0) {powerleveldata.Unknown++}
});

// Trace1 for the StateOrProvince
let trace1 = {
    x: [1,2,3,4], 
    y: Object.values(powerleveldata),
    text: Addressline1,
    name: "State",
    type: "bar"
};

// // Trace2 for the ConnectionTypes
// let trace2 = {
//     x: StateOrProvince,
//     y: Title,
//     text: Town,
//     name: "Connection",
//     types: "bar"
// };

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
})

// Get the data with d3.
// Use async function and await (command) to pull data without a promise, prioritize data pull
async function start() {
  let station_data = await d3.json("/data/reduced_data.json");

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

  for (let i = 0; i < station_data.length; i++) {
    let location = station_data[i]
    heatArray.push([location.Latitude,location.Longitude]);

  }
  let heat = L.heatLayer(heatArray, {
    radius: 15,
    blur: 20,
    minOpacity: 0.5
  }).addTo(myMap);
}

start()

