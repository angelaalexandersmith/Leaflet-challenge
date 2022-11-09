
// API query URL

let url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson';

let link = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json'

// Get data by using d3

d3.json(url).then(CreateLayers);

// Create layers

function CreateLayers(response){

    d3.json(link).then(function(plateSpots){
        
        let plates = L.geoJSON(plateSpots,{color: "navy", weight:1})

        let streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });

        let topoLayer =  L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        });
        // Append all the pair locations of earthquakes to an array

        earthquakeMarker = [];
    
        for ( let i = 0; i<response.features.length; i++){   // for loop all the earthquake locations

            spot=response.features[i]

            earthquakeMarker.push(

                L.circle([spot.geometry.coordinates[1],spot.geometry.coordinates[0]],{

                    stroke:false,

                    fillOpacity: 1,

                    fillColor: getColor(spot.geometry.coordinates[2]),

                    radius: parseInt(spot.properties.mag=spot.properties.mag||0)*20000
                
                })

                .bindPopup(`<h2>Location:${spot.properties.place}</h2> <hr> 

                            <h3>Mag: ${spot.properties.mag}</h3>

                            <h3>Depth: ${spot.geometry.coordinates[2]} km </h3>

                            <h3>Imapct Scale: ${spot.properties.alert} level</h3>

                            <h3>Time: ${Date(spot.properties.time).toLocaleString('en-AU', { timeZone: 'AWST' })}</h3>`

                            )
            );
        };
    
        // Group earthquakeMarker array into a Leaflet layer

        let marker = L.layerGroup(earthquakeMarker);

        // Create a baseMap object

        let baseMap = {

            'Base':streetLayer,

            'Topo':topoLayer
        };

        // create an another overlay layer

        let overlayMap = {

            'Earthquake':marker,

            'TectonicPlates':plates

        };

        // Define a map object

        let myMap = L.map('map',{

            center:[0.097811, 42.797735],

            zoom: 2,

            layers:[streetLayer,marker]
        });

        // Pass all layers to layer control and add that to myMap

        L.control.layers(baseMap, overlayMap, {collapsed: false}).addTo(myMap);

    ////////////////////////////////////////////////////////////////////////////////////////////////////////

        // Set up the legend.

        let legend = L.control({position: 'bottomright'});

        legend.onAdd = function (_myMap) {

            let div = L.DomUtil.create('div', 'info legend'), grades = [0, 20, 30, 40, 50, 60, 80, 100, 300, 500]

            div.innerHTML = "<h2>Earthquake Depth</h2><hr>" ; // Insert a head line for the legend section
            
            // Loop through our density intervals and generate a label with a colored square for each interval

            for (var i = 0; i < grades.length; i++) { 

                div.innerHTML +=

                    '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +

                    grades[i]+'km' + (grades[i + 1] ? '&ndash;' + grades[i + 1]+'km' + '<br>' : '+');

            }
        
            return div;

        };
        
        legend.addTo(myMap); 

    });  

};


// Create color function for the conditions of Mag level

function getColor(d) {

    return d > 500  ? '#331a00' :
           d > 300  ? '#4d2600' :
           d > 100  ? '#663300' :
           d >  80  ? '#804000' :
           d >  60  ? '#994d00' :
           d >  50  ? '#b35900' :
           d >  40  ? '#cc6600' :
           d >  30  ? '#e67300' :
           d >  20  ? '#ff8000' :
                      '#ffb366' ;

}

 


