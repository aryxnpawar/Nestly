let reveredCoordinates = coordinates.reverse()
let map = L.map("map").setView(reveredCoordinates, 13);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);


L.marker(reveredCoordinates).addTo(map);
let popup = L.popup({offset:L.point(0,-30)})
    .setLatLng(reveredCoordinates)
    .setContent('<p>You will stay here!</p>')
    .openOn(map);