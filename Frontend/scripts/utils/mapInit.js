import {markerBehavior, startCreateRoute} from "addRoute"
import {getAllBusRoute, getGoBusRoute, onMapStateChange } from "mapUtils";

// MAP OBJECT
var map = L.map('map', {
    preferCanvas: true
}).setView([21.025546, 105.845032], 19);

var mapBoxUrl = 'https://api.mapbox.com/styles/v1/shavitamit/cintinlry003wzvnl4e8mv498/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2hhdml0YW1pdCIsImEiOiJjaW5zNmJxM2cxMHFudHFram4wMWR5cWc2In0.8iSMtmKveklyOiEI1WjA5A';

// maptitler: https://api.maptiler.com/maps/base-v4/{z}/{x}/{y}@2x.png?key=eKnL1iE2H8UQpjcc8ctB'
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '<a href="https://www.leaflet.com/copyright/" target="_blank">&copy; OpenStreetMap</a>',
    minZoom: 13,
    maxZoom: 21,
}).addTo(map);




var visibleMarker = L.layerGroup([]);
var addRoutedLayer = L.layerGroup([]);
// var layerControl = L.control.layers().addTo(map);
// layerControl.enable();

// MAP INIT

const busStopData = await getAllBusRoute();
// const waypoints = initWaypoints(bus38)
// showBusRoute(waypoints);

document.getElementById("addRouteButton").addEventListener("click", function() {
    console.log("callled");
    startCreateRoute()
    map.on('moveend', function(){
        markerBehavior();
    })
});

onMapStateChange(busStopData);
// map.on('zoomstart', function() {
//     var zoomLevel = map.getZoom();
//     console.log(zoomLevel);
//     switch (zoomLevel) {
//         case 13:
//             tooltip.css('font-size', 10);
//             break;
//         case 19:
//             tooltip.css('font-size', 15);
//     } 
// })


export {map, visibleMarker, addRoutedLayer};