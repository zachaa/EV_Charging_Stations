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