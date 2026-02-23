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
     * Start a spin that lands on a specific segment.
     * @param {number} winnerIndex — the segment index to land on (from server)
     * @param {number} duration — ms
     */
    spin(winnerIndex, duration) {
        if (this.spinning) return;
        this.spinning = true;

        const n = this.segments.length;
        const sliceAngle = (2 * Math.PI) / n;

        // Target: pointer at top (-π/2) should point to middle of winning slice
        // The wheel rotates by this.angle, so we need:
        //   -(finalAngle) - π/2 ≡ winnerIndex * sliceAngle + sliceAngle/2  (mod 2π)
        //   finalAngle = -(winnerIndex * sliceAngle + sliceAngle/2) - π/2
        const targetRad = -(winnerIndex * sliceAngle + sliceAngle / 2) - Math.PI / 2;

        // Normalize current angle to [0, 2π)
        let currentNorm = this.angle % (2 * Math.PI);
        if (currentNorm < 0) currentNorm += 2 * Math.PI;

        // Normalize target to [0, 2π)
        let targetNorm = targetRad % (2 * Math.PI);
        if (targetNorm < 0) targetNorm += 2 * Math.PI;

        // Calculate how much further we need to rotate (always forward)
        let delta = targetNorm - currentNorm;
        if (delta <= 0) delta += 2 * Math.PI;

        // Add 5-8 full rotations for dramatic spin
        const fullSpins = (5 + Math.floor(Math.random() * 4)) * 2 * Math.PI;
        const totalRad = fullSpins + delta;

        const startAngle = this.angle;
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
                // Snap to exact target to avoid float drift
                this.angle = startAngle + totalRad;
                this._draw();
                this.spinning = false;
                if (this.onSpinEnd) this.onSpinEnd(winnerIndex);
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
