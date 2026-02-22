/**
 * Wheel — draws and animates a spinning wheel on a <canvas>.
 */
class Wheel {
    static COLORS = [
        '#6C5CE7', '#A78BFA', '#EC4899', '#F472B6',
        '#F97316', '#FB923C', '#FACC15', '#FDE68A',
        '#34D399', '#4ADE80', '#22D3EE', '#38BDF8',
        '#818CF8', '#C084FC', '#F43F5E', '#FB7185',
    ];

    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.segments = ['Option 1', 'Option 2', 'Option 3'];
        this.angle = 0;            // current rotation in radians
        this.spinning = false;
        this.onSpinEnd = null;     // callback(winnerIndex)
        this._animId = null;
        this._draw();
    }

    setSegments(segs) {
        this.segments = segs.length ? segs : ['—'];
        if (!this.spinning) this._draw();
    }

    /**
     * Start a spin.
     * @param {number} targetAngleDeg — total degrees to rotate
     * @param {number} duration — ms
     */
    spin(targetAngleDeg, duration) {
        if (this.spinning) return;
        this.spinning = true;
        const startAngle = this.angle;
        const totalRad = (targetAngleDeg * Math.PI) / 180;
        const startTime = performance.now();

        const animate = (now) => {
            const elapsed = now - startTime;
            const t = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const ease = 1 - Math.pow(1 - t, 3);
            this.angle = startAngle + totalRad * ease;
            this._draw();

            if (t < 1) {
                this._animId = requestAnimationFrame(animate);
            } else {
                this.spinning = false;
                const winner = this._getWinnerIndex();
                if (this.onSpinEnd) this.onSpinEnd(winner);
            }
        };

        this._animId = requestAnimationFrame(animate);
    }

    _getWinnerIndex() {
        const n = this.segments.length;
        if (n === 0) return -1;
        const sliceAngle = (2 * Math.PI) / n;
        // The pointer is at the top (–π/2). Normalize angle.
        let pointerAngle = (-this.angle - Math.PI / 2) % (2 * Math.PI);
        if (pointerAngle < 0) pointerAngle += 2 * Math.PI;
        return Math.floor(pointerAngle / sliceAngle) % n;
    }

    _draw() {
        const { ctx, canvas } = this;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const r = Math.min(cx, cy) - 4;
        const n = this.segments.length;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (n === 0) return;

        const sliceAngle = (2 * Math.PI) / n;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.angle);

        for (let i = 0; i < n; i++) {
            const startA = i * sliceAngle;
            const endA = startA + sliceAngle;
            const color = Wheel.COLORS[i % Wheel.COLORS.length];

            // Slice fill
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, r, startA, endA);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();

            // Slice border
            ctx.strokeStyle = 'rgba(0,0,0,0.15)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Text
            ctx.save();
            ctx.rotate(startA + sliceAngle / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${Math.max(11, Math.min(16, 220 / n))}px Inter, sans-serif`;
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 4;
            const label = this.segments[i].length > 18
                ? this.segments[i].slice(0, 16) + '…'
                : this.segments[i];
            ctx.fillText(label, r - 18, 5);
            ctx.shadowBlur = 0;
            ctx.restore();
        }

        // Centre circle
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, 2 * Math.PI);
        ctx.fillStyle = '#1a1a2e';
        ctx.fill();
        ctx.strokeStyle = 'rgba(167,139,250,0.6)';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.restore();
    }
}
