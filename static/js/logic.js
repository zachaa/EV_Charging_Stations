let stationdata;
async function start() {
 stationdata = await d3.json("/data/reduced_data.json")
 let referencedata= await d3.json("/data/reduced_reference_data.json")
 let statustypes= referencedata.StatusTypes;
console.log(statustypes);
let plottingdata= createfilterdata('TX');
let tracestatus ={
    x:[...Array(statustypes.length).keys()],
    y:Object.values(plottingdata),
    type:'bar'
       
    
};
let layoutstatus={
    title:'Status of Stations',
    xaxis:{title:'Status',
     ticktext: statustypes.map(status=>status.Title),
    tickfont: { size: 10 },
     tickvals: [...Array(statustypes.length).keys()]},

    
    yaxis:{title:'Number of Stations', type:'log'}

}
Plotly.newPlot('statusplot', [tracestatus],layoutstatus);
}
function createfilterdata(state) {
    let filterdata;
    if (state == 'USA') {
        filterdata = stationdata;
    } else {
        filterdata = stationdata.filter(station => station.StateOrProvince == state);

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
        statuscounts[station.StatusTypeID]++;
    })
    console.log(statuscounts);
    return statuscounts;
}
start();

