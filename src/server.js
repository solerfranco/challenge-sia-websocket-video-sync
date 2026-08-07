const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '../public')));

io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);

    socket.on('play', () => {
        socket.broadcast.emit('play');
    });

    socket.on('pause', () => {
        socket.broadcast.emit('pause');
    });

    socket.on('seek', (time) => {
        socket.broadcast.emit('seek', time);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});