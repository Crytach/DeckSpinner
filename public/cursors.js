/**
 * CursorManager — renders remote cursors with color + username label.
 */
class CursorManager {
    constructor(layerEl) {
        this.layer = layerEl;
        this.cursors = new Map(); // id → { el, x, y }
    }

    /** Create or update a remote cursor. */
    update(id, x, y, username, color) {
        let entry = this.cursors.get(id);

        if (!entry) {
            const el = document.createElement('div');
            el.className = 'remote-cursor';

            const dot = document.createElement('div');
            dot.className = 'cursor-dot';
            dot.style.background = color;

            const label = document.createElement('div');
            label.className = 'cursor-label';
            label.style.background = color;
            label.textContent = username;

            el.appendChild(dot);
            el.appendChild(label);
            this.layer.appendChild(el);

            entry = { el, labelEl: label, x: 0, y: 0 };
            this.cursors.set(id, entry);
        }

        entry.x = x;
        entry.y = y;
        entry.el.style.left = x + 'px';
        entry.el.style.top = y + 'px';
        entry.labelEl.textContent = username;
    }

    /** Update just the username for a cursor. */
    setUsername(id, username) {
        const entry = this.cursors.get(id);
        if (entry) entry.labelEl.textContent = username;
    }

    /** Remove a cursor on disconnect. */
    remove(id) {
        const entry = this.cursors.get(id);
        if (entry) {
            entry.el.remove();
            this.cursors.delete(id);
        }
    }

    /** Remove all cursors. */
    clear() {
        this.cursors.forEach(e => e.el.remove());
        this.cursors.clear();
    }
}
