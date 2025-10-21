import {map} from "map";


//GET the go route of bus
async function getGoBusRoute(routeId) {
    try {
        let url = `http://localhost:8080/api/busRoute?routeId=${routeId}_1`
        let response = await fetch(url, {
            method: "GET"
        });
        let data = await response.json();
        return data;
    }
    catch(error) {
    console.log(error);
    }
}

//GET the return route of bus
async function getReturnBusRoute(routeId) {
    try {
        let url = `http://localhost:8080/api/busRoute?routeId=${routeId}_2`
        let response = await fetch(url, {
            method: "GET"
        });
        let data = await response.json();
        return data;
    }

    catch(error) {
    console.log(error);
    }
}


//GET all the bus stop data
async function getAllBusRoute() {
    try {
        let url = 'http://localhost:8080/api/busStop/all'
        let respone = await fetch(url, {
            method: "GET"
        });
        let data = await respone.json();
        return data;
    }
    catch(error) {
    console.log(error);
    }
}

var markerId = []
var visibleMarker = L.layerGroup();



//Get the latLng of current view and filter data stop
//init marker
function initMarker(data) {
    visibleMarker.addTo(map);
    let mapBound = map.getBounds();
    visibleMarker.id = 1;
    visibleMarker.clearLayers();
    data.forEach(stop => {
        if(mapBound.contains([stop.lat, stop.lon])) {
            const id = `${stop.id}`;
            const name = `${stop.name}`;
            const marker = L.marker([stop.lat, stop.lon])
                .bindPopup(name)
                .addTo(visibleMarker);
            marker.myId = id;
            marker.myName = name;
            markerId.push(marker.id);
        }
        });
}

function initMarkerBasedOnLayer(id, name, lat, lon, layer, map) {
    visibleMarker.removeLayer(layer);
    const marker = L.marker([lat, lon]);
    marker.myId = id;
    marker.myName = name;
    marker.bindPopup(name);
    return marker;
}

//map move
function onMapStateChange(data) {
    map.on('move', function() {
        initMarker(data);
});

}

export {getGoBusRoute, getReturnBusRoute, initMarker, getAllBusRoute, onMapStateChange, visibleMarker, initMarkerBasedOnLayer};


