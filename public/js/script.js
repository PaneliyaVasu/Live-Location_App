// Ask user name
const userName = prompt("Enter your name") || "Anonymous";

// Connect socket
const socket = io();

// Leaflet map
const map = L.map("map").setView([0, 0], 16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// Store markers by socket id
const markers = {};

// Watch user location
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      socket.emit("send-location", {
        latitude,
        longitude,
        name: userName,
      });
    },
    (error) => {
      console.error("Geolocation error:", error);
    },
    {
      enableHighAccuracy: true,
      timeout: 1000,
      maximumAge: 0,
    }
  );
} else {
  alert("Geolocation not supported by your browser");
}

// Receive location from server
socket.on("receive-location", (data) => {
  const { id, latitude, longitude, name } = data;

  const label = id === socket.id ? "🟢 You" : `👤 ${name}`;

  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]).setPopupContent(label);
  } else {
    markers[id] = L.marker([latitude, longitude]).addTo(map).bindPopup(label);
  }

  // Center map on current user
  if (id === socket.id) {
    map.setView([latitude, longitude], 16);
  }
});

// Remove marker on disconnect
socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
