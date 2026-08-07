const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '../public')));

// Central playback state stored in server memory
let playerState = {
    isPlaying: false,
    currentTime: 0,
    lastUpdated: Date.now()
};

io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);

    let currentCalculatedTime = playerState.currentTime;
    if (playerState.isPlaying) {
        const elapsedSeconds = (Date.now() - playerState.lastUpdated) / 1000;
        currentCalculatedTime += elapsedSeconds;
    }

    socket.emit('initSync', {
        isPlaying: playerState.isPlaying,
        currentTime: currentCalculatedTime
    });

    socket.on('play', (time) => {
        playerState.isPlaying = true;
        playerState.currentTime = time;
        playerState.lastUpdated = Date.now();
        socket.broadcast.emit('play', time);
    });

    socket.on('pause', (time) => {
        playerState.isPlaying = false;
        playerState.currentTime = time;
        playerState.lastUpdated = Date.now();
        socket.broadcast.emit('pause', time);
    });

    socket.on('seek', (time) => {
        playerState.currentTime = time;
        playerState.lastUpdated = Date.now();
        socket.broadcast.emit('seek', time);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;

// Only start the server if this file is run directly (not imported by Jest)
if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

// Export the server and io instances for testing
module.exports = { server, io };