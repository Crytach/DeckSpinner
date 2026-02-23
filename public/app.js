/**
 * App — wires Socket.IO, Wheel, CursorManager, and UI together.
 */
(function () {
    // ── DOM refs ──────────────────────────────────────────────
    const modal = document.getElementById('username-modal');
    const nameInput = document.getElementById('username-input');
    const nameSubmit = document.getElementById('username-submit');
    const appEl = document.getElementById('app');
    const userBadge = document.getElementById('user-badge');
    const segInput = document.getElementById('segments-input');
    const spinBtn = document.getElementById('spin-btn');
    const winnerBox = document.getElementById('winner-display');
    const winnerText = document.getElementById('winner-text');
    const onlineCount = document.getElementById('online-count');
    const cursorLayer = document.getElementById('cursor-layer');
    const wheelCanvas = document.getElementById('wheel-canvas');

    // ── Instances ─────────────────────────────────────────────
    const wheel = new Wheel(wheelCanvas);
    const cursors = new CursorManager(cursorLayer);

    let socket = null;
    let myId = null;
    let myColor = '#a78bfa';
    let myUsername = '';
    let onlineUsers = 1;
    let updatingSegments = false;

    // ── Username modal ────────────────────────────────────────
    function submitName() {
        const name = nameInput.value.trim();
        if (!name) return;
        myUsername = name;
        modal.style.display = 'none';
        appEl.classList.remove('hidden');
        connectSocket();
    }

    nameSubmit.addEventListener('click', submitName);
    nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') submitName(); });

    // ── Socket.IO ─────────────────────────────────────────────
    function connectSocket() {
        socket = io();

        socket.on('welcome', (msg) => {
            myId = msg.id;
            myColor = msg.color;
            userBadge.innerHTML = `<span class="color-dot" style="background:${myColor}"></span>${myUsername}`;

            if (msg.segments && msg.segments.length) {
                segInput.value = msg.segments.join('\n');
                wheel.setSegments(msg.segments);
            }

            if (msg.cursors) {
                msg.cursors.forEach(c => cursors.update(c.id, c.x, c.y, c.username, c.color));
            }

            updateOnlineCount(msg.cursors ? msg.cursors.length + 1 : 1);
        });

        socket.on('join', (msg) => {
            cursors.update(msg.id, msg.x, msg.y, msg.username, msg.color);
            onlineUsers++;
            updateOnlineCount(onlineUsers);
        });

        socket.on('leave', (msg) => {
            cursors.remove(msg.id);
            onlineUsers = Math.max(1, onlineUsers - 1);
            updateOnlineCount(onlineUsers);
        });

        socket.on('cursor', (msg) => {
            cursors.update(msg.id, msg.x, msg.y, msg.username, msg.color);
        });

        socket.on('username', (msg) => {
            cursors.setUsername(msg.id, msg.username);
        });

        socket.on('segments', (msg) => {
            if (msg.from !== myId) {
                updatingSegments = true;
                segInput.value = msg.segments.join('\n');
                wheel.setSegments(msg.segments);
                updatingSegments = false;
            }
        });

        socket.on('spin', (msg) => {
            winnerBox.classList.add('hidden');
            spinBtn.disabled = true;
            wheel.spin(msg.winnerIndex, msg.duration);
        });

        socket.on('connect', () => {
            socket.emit('username', { username: myUsername });
        });

        socket.on('disconnect', () => {
            cursors.clear();
        });
    }

    function updateOnlineCount(n) {
        onlineUsers = n;
        onlineCount.textContent = `${n} online`;
    }

    // ── Mouse tracking ────────────────────────────────────────
    let lastSend = 0;
    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastSend < 40) return;
        lastSend = now;
        if (socket && socket.connected) {
            socket.emit('cursor', { x: e.clientX, y: e.clientY });
        }
    });

    // ── Segment input ─────────────────────────────────────────
    segInput.addEventListener('input', () => {
        if (updatingSegments) return;
        const segs = segInput.value.split('\n').map(s => s.trim()).filter(Boolean);
        wheel.setSegments(segs);
        if (socket && socket.connected) {
            socket.emit('segments', { segments: segs });
        }
    });

    // ── Spin ──────────────────────────────────────────────────
    spinBtn.addEventListener('click', () => {
        if (wheel.spinning) return;
        winnerBox.classList.add('hidden');
        if (socket && socket.connected) {
            socket.emit('spin');
        }
    });

    wheel.onSpinEnd = (winnerIdx) => {
        spinBtn.disabled = false;
        if (winnerIdx >= 0 && winnerIdx < wheel.segments.length) {
            winnerText.textContent = wheel.segments[winnerIdx];
            winnerBox.classList.remove('hidden');
        }
    };
})();
