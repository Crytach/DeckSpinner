const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' },
    transports: ['websocket', 'polling'],
});

app.use(express.static(path.join(__dirname, 'public')));

// ── Curated cursor color palette ──────────────────────────────────────
const CURSOR_COLORS = [
    '#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA',
    '#F97316', '#06B6D4', '#EC4899', '#84CC16',
    '#F43F5E', '#22D3EE', '#E879F9', '#FACC15',
    '#34D399', '#FB923C', '#818CF8', '#38BDF8',
];

// ── State ─────────────────────────────────────────────────────────────
let nextColorIdx = 0;
let sharedSegments = ['Option 1', 'Option 2', 'Option 3'];
let spinState = null;
const clients = new Map();   // socket.id → { id, username, color, x, y }
let nextId = 1;

io.on('connection', (socket) => {
    const id = nextId++;
    const color = CURSOR_COLORS[nextColorIdx % CURSOR_COLORS.length];
    nextColorIdx++;

    const client = { id, username: `User ${id}`, color, x: 0, y: 0 };
    clients.set(socket.id, client);

    // Send welcome with assigned color + current state
    socket.emit('welcome', {
        id,
        color,
        segments: sharedSegments,
        cursors: Array.from(clients.values()).filter(c => c.id !== id),
        spinState,
    });

    // Tell everyone else about the new user
    socket.broadcast.emit('join', { ...client });

    socket.on('cursor', (data) => {
        client.x = data.x;
        client.y = data.y;
        socket.broadcast.emit('cursor', {
            id: client.id,
            x: data.x,
            y: data.y,
            username: client.username,
            color: client.color,
        });
    });

    socket.on('username', (data) => {
        client.username = (data.username || '').slice(0, 20) || `User ${id}`;
        socket.broadcast.emit('username', { id: client.id, username: client.username });
    });

    socket.on('segments', (data) => {
        if (Array.isArray(data.segments)) {
            sharedSegments = data.segments.slice(0, 100).map(s => String(s).slice(0, 60));
            socket.broadcast.emit('segments', { segments: sharedSegments, from: client.id });
        }
    });

    socket.on('spin', () => {
        const totalRotation = 360 * (5 + Math.random() * 5) + Math.random() * 360;
        const duration = 4000 + Math.random() * 2000;
        spinState = { targetAngle: totalRotation, duration, timestamp: Date.now() };
        // Broadcast to ALL including sender
        io.emit('spin', spinState);
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit('leave', { id: client.id });
        clients.delete(socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🎡 DeckSpinner running at http://localhost:${PORT}`);
});
