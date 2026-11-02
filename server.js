const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Explicit route to serve index.html directly
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Basic test route
app.get('/test', (req, res) => {
    res.send('Server is working perfectly!');
});

// Store active users
const users = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join-office', (userData) => {
        users[socket.id] = { id: socket.id, ...userData };
        socket.emit('current-users', users);
        socket.broadcast.emit('user-joined', users[socket.id]);
    });

    socket.on('player-movement', (data) => {
        if (users[socket.id]) {
            users[socket.id].x = data.x;
            users[socket.id].y = data.y;
            socket.broadcast.emit('player-moved', { id: socket.id, x: data.x, y: data.y });
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        delete users[socket.id];
        io.emit('user-disconnected', socket.id);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

