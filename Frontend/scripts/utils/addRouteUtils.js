//load the add route html page
import {map, visibleMarker, addRoutedLayer} from "map";

import {initMarkerBasedOnLayer} from "mapUtils";
import { initMarker } from "mapUtils";


//try to use linked list for the added route
class StopSequence{
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

class AddedRouteSeqence {
    constructor() {
        this.head = null;
    }
    append(value) {
        let newStopSequence = new stopSequence(value);
        if(!this.head) {
            this.head = newStopSequence;
            return;
        }
        let current = this.head;
        while(current.next) {
            current = current.next;
        }
        current.next = newStopSequence;
    }
    delete(value) {
        let current = this.head;
        if(current.value == value) {
            head = null;
        }
        while(current.next.value != value) {
            current = current.next;
        }
        current.next = null;
    }
}
// How to tracking the sequence? 
// What the value should be here?



// let addedRouteSeqence = new AddedRouteSeqence();


function startCreateRoute() {
    fetch("http://127.0.0.1:5500/components/addRoute.html")
    .then((response) => response.text())
    .then((html) => {
        document.getElementById("content").innerHTML = html;
        addRoutedLayer.id = 2;
        markerBehavior();
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
    route.className = 'addedRoute';
    
    route.addEventListener('click', removeAddedStop)
    display_route.appendChild(route);
    let id = this.myId;
    let name =this.myName;
    // let stopSequence = new StopSequence(route);
    // addedRouteSeqence.append(stopSequence);
    //if the id is not in then push
    if(!stopRouteId.includes(id)) {
        stopRouteId.push(id);
        stopRouteName.push(name);
        let i = stopRouteId.indexOf(id) + 1;
        route.id = stopRouteId.indexOf(id);
        //need the wraper of this display is clickable
        //rightnow the current display is just plain text -> which mean cant remove or else
        route.innerHTML = `Sequence ${i} ${id}: ${name}`;
        // added_route_display.adChild(display_route);
        //console.log(`Sequence ${i} ${id}: ${name}`);
    } else {
    // if the id is in then want to remove the stop
    // the removed stop and any array behind it will also be removed
    // could use another DSA instead of array js -> linked list
    //but the rerturn params need to be an array?
        

    }

    //When the data-container is clicked, want to remove it both from the display and the array
    function removeAddedStop() {
        //get the id assgined?
        let id = this.id; 
        console.log(id);
        let newArray = [];
        //  addedRouteSeqence.delete(id);
        for(let i = 0; i < id; i++) {
            newArray[i] = stopRouteId[i];
        }
        for(id; id < stopRouteId.length; id++) {
            document.getElementById(id).remove();
        }
        stopRouteId = newArray;
        console.log(stopRouteId);

    }

    // if the id is in then want to remove the stop
    
}


function getParams() {
    let busNumber = document.querySelector('input[name="busNumber"]').value;
    let direction = document.querySelector('input[name="direction"]:checked').value;
    console.log(busNumber);
    let params =  { 
        busNumber: busNumber,
        direction: direction,
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
        let params = getParams();
        console.log(params);
        post1(params);
    }

}




export {createRouteSequence, startCreateRoute, markerBehavior}

 