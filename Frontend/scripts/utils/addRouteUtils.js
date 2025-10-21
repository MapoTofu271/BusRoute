//load the add route html page
import {map} from "map";

import {visibleMarker, initMarkerBasedOnLayer} from "mapUtils";
import { initMarker } from "mapUtils";

var addRoutedLayer;

function startCreateRoute() {
    fetch("http://127.0.0.1:5500/components/addRoute.html")
    .then((response) => response.text())
    .then((html) => {
        document.getElementById("content").innerHTML = html;
        addRoutedLayer = L.layerGroup().addTo(map);
        addRoutedLayer.id = 2;
    })
    .catch((error) => {
        console.warn(error);
    })
}

// function endCreateRoute() {
//     fetch("http://127.0.0.1:5500/index.html")
//     .then((response) => response.text())
//     .then(console.log("return index.html"));
// }
var stopRouteName = [];
var stopRouteId = [];

//display route element



// function for marker click behaivor in add route

//1. The problem: all the layer after deleted in visibleMarker
//2. Not in any map;
//3. Only add the display marker into 
function markerBehavior() {
    visibleMarker.eachLayer(function(layer){
        let name = layer.myName;
        let id = layer.myId;
        let lat = layer._latlng.lat;
        let lon = layer._latlng.lng;
        const marker = initMarkerBasedOnLayer(id, name, lat, lon, map, layer);
        marker.on('click', createRouteSequence);
        marker.addTo(addRoutedLayer);
    });
}



//lets divide to 3 part: remove stop, add stop, display data;
function createRouteSequence() {
    var display_route = document.getElementById("displayRouteAdded");
    let route = document.createElement("div");
    display_route.appendChild(route);
    let id = this.myId;
    let name =this.myName;
    //if the id is not in then push
    if(!stopRouteId.includes(id)) {
        stopRouteId.push(id);
        stopRouteName.push(name);
        let i = stopRouteId.indexOf(id) + 1;
        //need the wraper of this display is clickable
        //rightnow the current display is just plain text -> which mean cant remove or else
        route.innerHTML = `Sequence ${i} ${id}: ${name}`;
        // added_route_display.appendChild(display_route);
        //console.log(`Sequence ${i} ${id}: ${name}`);
    
    } else {
    // if the id is in then want to remove the stop
    // the removed stop and any array behind it will also be removed
    // could use another DSA instead of array js -> linked list
    //but the rerturn params need to be an array?


    }

    // if the id is in then want to remove the stop
    
}


function getSampleParams() {
    let params =  { 
        routeId: "1",
        direction: 1,
        stopIds: stopRouteId
    };
    return params;
}

//button send post request

/*
USING FETCH TO POST
*/
function post1(params) {
    const url = 'http://localhost:8080/api/busRoute/addRoute';
    var data =JSON.stringify(params);
    fetch(url, {
        method: "POST",
        body: data,
        headers: {
            "Content-type": "application/json"
        }
    })
  .then((response) => response.json())
}


//USING XMLHttpRequest --- outdated but works
function post(params) {
    var xhr = new XMLHttpRequest();
    var url = 'http://localhost:8080/api/busRoute/addRoute'
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    var data = JSON.stringify(params);
    if (xhr.readyState === 4 && xhr.status === 200) {
        console.log(xhr.responseText);
    }
    xhr.send(data);
}


// sendButton.addEventListener('click', () => {
//     map.removeLayer(addRoutedLayer);
//     let params = getSampleParams();
//     post(params);
// })

document.addEventListener('click', sendPostRequest);


function sendPostRequest(event) {
    var element = event.target;
    if(element.getAttribute("id") == "sendPostRequest") {
        let params = getSampleParams();
        post(params);
        endCreateRoute();
    }

}




export {createRouteSequence, startCreateRoute, markerBehavior}

 