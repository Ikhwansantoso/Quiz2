const ROWS = 15;
const COLS = 25;

let startNode = { r: 10, c: 5 };
let exitNode = { r: 10, c: 20 };
let activeTool = 'wall';
let isVisualizing = false;
let mouseIsPressed = false;

// 2D Array murni di Javascript: 0 (Aman), 1 (Bahaya/Halangan)
let gridData = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

const gridElement = document.getElementById('grid');

function initGrid() {
    gridElement.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'grid-row';
        for (let c = 0; c < COLS; c++) {
            const node = document.createElement('div');
            node.id = `node-${r}-${c}`;
            node.className = 'node';

            if (r === startNode.r && c === startNode.c) node.classList.add('node-start');
            if (r === exitNode.r && c === exitNode.c) node.classList.add('node-exit');

            node.onmousedown = () => handleMouseDown(r, c);
            node.onmouseenter = () => handleMouseEnter(r, c);
            node.onmouseup = () => handleMouseUp();

            rowDiv.appendChild(node);
        }
        gridElement.appendChild(rowDiv);
    }
}

function handleMouseDown(r, c) {
    if (isVisualizing) return;
    mouseIsPressed = true;
    applyTool(r, c);
}

function handleMouseEnter(r, c) {
    if (!mouseIsPressed || isVisualizing) return;
    applyTool(r, c);
}

function handleMouseUp() { mouseIsPressed = false; }
function handleMouseLeave() { mouseIsPressed = false; }

function applyTool(r, c) {
    if (r === startNode.r && c === startNode.c) return;
    if (r === exitNode.r && c === exitNode.c) return;

    const nodeEl = document.getElementById(`node-${r}-${c}`);

    if (activeTool === 'wall') {
        gridData[r][c] = 1;
        nodeEl.className = 'node node-wall';
    } else if (activeTool === 'fire') {
        gridData[r][c] = 1;
        nodeEl.className = 'node node-fire';
    } else if (activeTool === 'eraser') {
        gridData[r][c] = 0;
        nodeEl.className = 'node';
    } else if (activeTool === 'start') {
        document.getElementById(`node-${startNode.r}-${startNode.c}`).classList.remove('node-start');
        startNode = { r, c };
        gridData[r][c] = 0;
        nodeEl.className = 'node node-start';
    } else if (activeTool === 'exit') {
        document.getElementById(`node-${exitNode.r}-${exitNode.c}`).classList.remove('node-exit');
        exitNode = { r, c };
        gridData[r][c] = 0;
        nodeEl.className = 'node node-exit';
    }
}

// Interaksi Sidebar
document.querySelectorAll('.tool-button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tool-button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeTool = btn.dataset.tool;
    });
});

document.getElementById('btn-clear').addEventListener('click', () => {
    if (isVisualizing) return;
    gridData = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    initGrid();
    document.getElementById('stat-distance').innerText = '-';
    document.getElementById('stat-status').innerText = 'Ready';
});

// Memanggil Python API (Flask)
document.getElementById('btn-solve').addEventListener('click', async () => {
    if (isVisualizing) return;
    isVisualizing = true;
    document.getElementById('btn-solve').innerText = 'Finding Route...';
    document.getElementById('stat-distance').innerText = '-';
    document.getElementById('stat-status').innerText = 'Ready';

    // Bersihkan jalur lama
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const el = document.getElementById(`node-${r}-${c}`);
            el.classList.remove('node-visited', 'node-path');
        }
    }

    try {
        const response = await fetch('/solve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                grid: gridData,
                start: [startNode.r, startNode.c],
                exit: [exitNode.r, exitNode.c]
            })
        });

        const data = await response.json();
        animateDijkstra(data.visited_order, data.path);
    } catch (e) {
        console.error("Error from Python backend:", e);
        isVisualizing = false;
        document.getElementById('btn-solve').innerText = 'Cari Rute Evakuasi';
    }
});

function animateDijkstra(visited, path) {
    for (let i = 0; i <= visited.length; i++) {
        if (i === visited.length) {
            setTimeout(() => {
                animatePath(path);
            }, 10 * i);
            return;
        }
        setTimeout(() => {
            const [r, c] = visited[i];
            if ((r !== startNode.r || c !== startNode.c) && (r !== exitNode.r || c !== exitNode.c)) {
                document.getElementById(`node-${r}-${c}`).classList.add('node-visited');
            }
        }, 10 * i);
    }
}

function animatePath(path) {
    if (path.length === 0) {
        showResultModal(false);
        isVisualizing = false;
        document.getElementById('btn-solve').innerText = 'Cari Rute Evakuasi';
        document.getElementById('stat-distance').innerText = '-';
        document.getElementById('stat-status').innerText = 'No Route';
        return;
    }

    for (let i = 0; i < path.length; i++) {
        setTimeout(() => {
            const [r, c] = path[i];
            if ((r !== startNode.r || c !== startNode.c) && (r !== exitNode.r || c !== exitNode.c)) {
                document.getElementById(`node-${r}-${c}`).classList.add('node-path');
            }

            if (i === path.length - 1) {
                isVisualizing = false;
                document.getElementById('btn-solve').innerText = 'Cari Rute Evakuasi';
                const steps = path.length - 1;
                document.getElementById('stat-distance').innerText = steps;
                document.getElementById('stat-status').innerText = 'Safe';
                showResultModal(true, steps);
            }
        }, 50 * i);
    }
}

function showResultModal(success, steps) {
    const modal = document.getElementById('result-modal');
    const icon = document.getElementById('modal-icon');
    const title = document.getElementById('modal-title');
    const message = document.getElementById('modal-message');

    if (success) {
        title.innerText = "Route Found!";
        message.innerText = `Shortest path found with ${steps} steps.`;
        icon.innerHTML = "✔"; // Centang hijau
        icon.className = "modal-icon success";
    } else {
        title.innerText = "No Safe Route Found!";
        message.innerText = "The exit is unreachable. Please modify the map and try again.";
        icon.innerHTML = "!"; // Tanda seru merah
        icon.className = "modal-icon failed";
    }

    modal.classList.remove('hidden');
}

document.getElementById('modal-close').addEventListener('click', () => {
    document.getElementById('result-modal').classList.add('hidden');
});

// Inisialisasi awal UI
initGrid();
