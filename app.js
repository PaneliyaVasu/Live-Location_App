const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");

const app = express();
const port = 3000;

// Create HTTP server
const server = http.createServer(app);

// Attach Socket.IO
const io = socketio(server);

// View engine
app.set("view engine", "ejs");

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Socket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Receive location from client
  socket.on("send-location", (data) => {
    io.emit("receive-location", {
      id: socket.id,
      latitude: data.latitude,
      longitude: data.longitude,
      name: data.name,
    });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    io.emit("user-disconnected", socket.id);
    console.log("User disconnected:", socket.id);
  });
});

// Home route
app.get("/", (req, res) => {
  res.render("index");
});

// Start server
server.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
