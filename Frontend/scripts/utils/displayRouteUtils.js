import {map} from "map";

//L.Routing.Control:    combine other classes into full routing user interface
//L.Routing.Itinerary:  widget to display journey in control
//L.Routing.Plan:       edit the plan for a route
//L.Routing.ItineraryBuilder:   create DOM structure for itinerary

//build waypoint (bus stop)
function initWaypoints(data) {
    const waypoints = [];
    data.forEach(point => {
        let lat = point.lat;
        let lon = point.lon;
        waypoints.push(L.latLng(lat, lon));
    });
    return waypoints;
}


//show route
function showBusRoute(waypoints) {
    L.Routing.control({
        waypoints: waypoints
    }).addTo(map);
    L.Routing.plan({
        draggableWaypoints: false
    })
}

export {showBusRoute, initWaypoints};