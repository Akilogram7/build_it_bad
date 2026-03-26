/* ══════════════════════════════════
   TERMS PAGE
══════════════════════════════════ */

let bgMusic;

document.addEventListener('DOMContentLoaded', () => {

    const label      = document.getElementById('checkbox-label');
    const checkbox   = document.getElementById('sneaky-checkbox');
    const attemptsEl = document.getElementById('attempts');
    const submitBtn  = document.getElementById('submit-btn');
    const declineBtn = document.getElementById('decline-btn');
    const toast      = document.getElementById('toast');

    // ✅ grab audio AFTER DOM loads
    bgMusic = document.getElementById('bg-music');

    let attempts = 0;
    let toastTimeout;

    const taunts = [
        "Nice try! 😈", "Almost! 😂", "Nope! 🏃", "Too slow! ⚡",
        "Haha! 😜", "Not a chance! 🚀", "Keep trying! 😅",
        "You'll never catch me! 🐱", "Zooooom! 💨", "Skill issue 🎮",
    ];

    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => toast.classList.remove('show'), 1500);
    }

    checkbox.addEventListener('change', () => {
        if (checkbox.checked) submitBtn.disabled = false;
    });

    // ✅ Accept → launch + play music safely
    submitBtn.addEventListener('click', () => {
        document.getElementById('terms-section').classList.add('hidden');
        document.getElementById('game-section').classList.add('active');

        if (bgMusic) {
            bgMusic.loop = true;
            bgMusic.currentTime = 0;
            bgMusic.volume = 0.4;
            bgMusic.play().catch(err => {
                console.log("Audio blocked:", err);
            });
        }

        g1Start();
        showGScreen('screen-g1');
    });

    // Decline
    declineBtn.addEventListener('click', () => {
        alert('Wrong choice. 🦆');
    });

    // ✅ make this accessible globally
    window.goBackToTerms = function () {
        clearAllTimers();
        stopMaze();

        if (bgMusic) {
            bgMusic.pause();
            bgMusic.currentTime = 0;
        }

        document.getElementById('game-section').classList.remove('active');
        document.getElementById('terms-section').classList.remove('hidden');
        checkbox.checked = false;
        submitBtn.disabled = true;
    };

});
/* ══════════════════════════════════
   SHARED GAME UTILITIES
══════════════════════════════════ */
function showGScreen(id) {
    document.querySelectorAll('.g-screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(id);
    el.classList.add('active');
    const card = el.querySelector('.g-card');
    if (card) { card.classList.remove('fade-in'); void card.offsetWidth; card.classList.add('fade-in'); }
}

function showLose(icon, title, msg) {
    clearAllTimers();
    stopMaze();
    document.getElementById('lose-icon').textContent  = icon;
    document.getElementById('lose-title').textContent = title;
    document.getElementById('lose-msg').textContent   = msg;
    showGScreen('screen-lose');
}

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

let allTimers = [];
function mkInterval(fn, ms) { const t = setInterval(fn, ms); allTimers.push(t); return t; }
function clearAllTimers() { allTimers.forEach(clearInterval); allTimers = []; }

/* ══════════════════════════════════
   GAME 1: REVERSE WORD
══════════════════════════════════ */
const G1_WORDS = [
    'planet','bridge','castle','dragon','forest','island','jungle',
    'mirror','nebula','oyster','pillow','quartz','rabbit','silver',
    'temple','velvet','walrus','anchor','butter','cactus','dagger',
    'engine','goblin','hammer','jaguar','kitten','ladder','magnet',
    'noodle','orange','parrot','puzzle','riddle','socket','tunnel'
];
const G1_CIRC = 2 * Math.PI * 28;

let g1Word = '', g1Rev = '', g1Time = 15, g1Started = false, g1Timer = null;

function g1Start() {
    g1Word    = G1_WORDS[Math.floor(Math.random() * G1_WORDS.length)];
    g1Rev     = g1Word.split('').reverse().join('');
    g1Time    = 15;
    g1Started = false;
    document.getElementById('g1-word').textContent = g1Word.toUpperCase();
    document.getElementById('g1-input').value = '';
    document.getElementById('g1-timer-num').textContent = '15';
    document.getElementById('g1-timer-num').style.color = '#f0ede6';
    const ring = document.getElementById('g1-ring');
    ring.style.transition = 'none';
    ring.style.strokeDashoffset = '0';
    ring.style.stroke = '#ef9f27';
    g1BuildHints();
    setTimeout(() => document.getElementById('g1-input').focus(), 350);
}

function g1BuildHints() {
    const row = document.getElementById('g1-hints');
    row.innerHTML = '';
    for (let i = 0; i < g1Rev.length; i++) {
        const b = document.createElement('div');
        b.className = 'hint-char';
        b.id = 'gh' + i;
        b.textContent = '·';
        row.appendChild(b);
    }
}

function g1UpdateHints(typed) {
    for (let i = 0; i < g1Rev.length; i++) {
        const b = document.getElementById('gh' + i);
        if (!b) continue;
        if (i < typed.length) {
            b.textContent = typed[i];
            b.className = 'hint-char ' + (typed[i] === g1Rev[i] ? 'correct' : 'wrong');
        } else {
            b.textContent = '·';
            b.className = 'hint-char';
        }
    }
}

function g1StartTimer() {
    if (g1Started) return;
    g1Started = true;
    const ring = document.getElementById('g1-ring');
    ring.style.transition = 'stroke-dashoffset 1s linear, stroke 0.3s';
    g1Timer = mkInterval(() => {
        g1Time--;
        document.getElementById('g1-timer-num').textContent = g1Time;
        ring.style.strokeDashoffset = G1_CIRC * (1 - g1Time / 15);
        if (g1Time <= 5)      { ring.style.stroke = '#e24b4a'; document.getElementById('g1-timer-num').style.color = '#e24b4a'; }
        else if (g1Time <= 9) { ring.style.stroke = '#ef9f27'; }
        if (g1Time <= 0) {
            clearInterval(g1Timer);
            showLose('⏱️', "Time's up!", `The answer was "${g1Rev.toUpperCase()}". The gauntlet resets.`);
        }
    }, 1000);
}

function g1OnInput() {
    g1StartTimer();
    const typed = document.getElementById('g1-input').value.toLowerCase();
    g1UpdateHints(typed);
    if (typed === g1Rev) {
        clearInterval(g1Timer);
        setTimeout(() => { g2Start(); showGScreen('screen-g2'); }, 600);
    }
}

/* ══════════════════════════════════
   GAME 2: ODD DUCK
══════════════════════════════════ */
const G2_POOL = [
    { label: 'Find the odd duck',    normal: '🦆', odd: '🐥' },
    { label: 'Find the odd fruit',   normal: '🍎', odd: '🍊' },
    { label: 'Find the odd star',    normal: '⭐', odd: '🌟' },
    { label: 'Find the odd animal',  normal: '🐱', odd: '🐶' },
    { label: 'Find the odd food',    normal: '🍕', odd: '🌮' },
    { label: 'Find the odd ball',    normal: '⚽', odd: '🏀' },
    { label: 'Find the odd flower',  normal: '🌸', odd: '🌺' },
    { label: 'Find the odd face',    normal: '😊', odd: '😎' },
    { label: 'Find the odd moon',    normal: '🌙', odd: '🌛' },
    { label: 'Find the odd gem',     normal: '💎', odd: '💍' },
    { label: 'Find the odd note',    normal: '🎵', odd: '🎶' },
    { label: 'Find the odd weather', normal: '☀️', odd: '⛅' },
    { label: 'Find the odd vehicle', normal: '🚗', odd: '🚕' },
    { label: 'Find the odd fish',    normal: '🐟', odd: '🐠' },
    { label: 'Find the odd plant',   normal: '🌿', odd: '🍃' },
];

const G2_TOTAL = 3, G2_TILES = 20, G2_TIME = 30, G2_MAX_WRONG = 3;
let g2Round = 0, g2Rounds = [], g2OddIdx = -1, g2Time = G2_TIME;
let g2Timer = null, g2Wrong = 0, g2Locked = false;

function g2Start() {
    g2Rounds = shuffle(G2_POOL).slice(0, G2_TOTAL);
    g2Round  = 0;
    g2Wrong  = 0;
    g2Locked = false;
    g2LoadRound();
}

function g2LoadRound() {
    const r = g2Rounds[g2Round];
    g2Locked = false;
    g2Time   = G2_TIME;
    document.getElementById('g2-label').textContent = r.label;
    document.getElementById('g2-timer-num').textContent = G2_TIME;
    document.getElementById('g2-bar').style.width = '100%';
    document.getElementById('g2-bar').style.background = '#ef9f27';

    for (let i = 0; i < G2_MAX_WRONG; i++) {
        const d = document.getElementById('wd' + i);
        d.className = 'wrong-dot' + (i < g2Wrong ? ' used' : '');
    }

    g2OddIdx = Math.floor(Math.random() * G2_TILES);
    const grid = document.getElementById('g2-grid');
    grid.innerHTML = '';
    for (let i = 0; i < G2_TILES; i++) {
        const btn = document.createElement('button');
        btn.className = 'duck-btn';
        btn.textContent = (i === g2OddIdx) ? r.odd : r.normal;
        btn.dataset.i = i;
        btn.addEventListener('click', () => g2Click(btn, i));
        grid.appendChild(btn);
    }

    clearInterval(g2Timer);
    g2Timer = mkInterval(() => {
        g2Time--;
        document.getElementById('g2-timer-num').textContent = g2Time;
        const pct = (g2Time / G2_TIME) * 100;
        const bar = document.getElementById('g2-bar');
        bar.style.width = pct + '%';
        if (g2Time <= 10) bar.style.background = '#e24b4a';
        else if (g2Time <= 25) bar.style.background = '#ef9f27';
        if (g2Time <= 0) {
            clearInterval(g2Timer);
            const btns = document.querySelectorAll('.duck-btn');
            if (btns[g2OddIdx]) btns[g2OddIdx].classList.add('reveal');
            setTimeout(() => showLose('⏱️', "Time's up!", "You ran out of time. The gauntlet resets."), 900);
        }
    }, 1000);
}

function g2Click(btn, idx) {
    if (g2Locked) return;
    if (idx === g2OddIdx) {
        g2Locked = true;
        clearInterval(g2Timer);
        btn.classList.add('correct');
        setTimeout(() => {
            g2Round++;
            if (g2Round >= G2_TOTAL) {
                initMaze();
                showGScreen('screen-g3');
            } else {
                g2LoadRound();
            }
        }, 650);
    } else {
        btn.classList.add('wrong');
        g2Wrong++;
        const d = document.getElementById('wd' + (g2Wrong - 1));
        if (d) d.classList.add('used');
        setTimeout(() => btn.classList.remove('wrong'), 350);
        if (g2Wrong >= G2_MAX_WRONG) {
            clearInterval(g2Timer);
            g2Locked = true;
            const btns = document.querySelectorAll('.duck-btn');
            if (btns[g2OddIdx]) btns[g2OddIdx].classList.add('reveal');
            setTimeout(() => showLose('❌', 'Too many wrong picks!', 'You used all 3 chances. The gauntlet resets.'), 900);
        }
    }
}

/* ══════════════════════════════════
   GAME 3: CURSOR MAZE
══════════════════════════════════ */
const CELL = 40, COLS = 9, ROWS = 9;
const W = COLS * CELL, H = ROWS * CELL;
const WALL_T = 5, CURSOR_RADIUS = 3;
const G3_CIRC = 2 * Math.PI * 28;

let mazeActive = false, mazeWon = false, mazeCX = 0, mazeCY = 0;
let mazeStarted = false, mazeInStart = false, mazeGrid = [], mazeSolved = false, mazeCtx;

function initMaze() {
    mazeGrid    = buildMaze();
    mazeSolved  = false;
    mazeActive  = false;
    mazeStarted = false;
    mazeWon     = false;
    mazeInStart = false;
    const canvas = document.getElementById('maze-canvas');
    canvas.width = W; canvas.height = H;
    mazeCtx = canvas.getContext('2d');
    drawMaze();
    document.getElementById('maze-overlay').classList.add('visible');
    canvas.removeEventListener('mousemove', onMazeMove);
    canvas.removeEventListener('touchmove', onMazeTouch);
    canvas.addEventListener('mousemove', onMazeMove);
    canvas.addEventListener('touchmove', onMazeTouch, { passive: false });
}

function buildMaze() {
    const grid = [];
    for (let r = 0; r < ROWS; r++) {
        grid[r] = [];
        for (let c = 0; c < COLS; c++) {
            grid[r][c] = { n: false, e: false, s: false, w: false, visited: false };
        }
    }
    function carve(r, c) {
        grid[r][c].visited = true;
        const dirs = shuffle([0,1,2,3]);
        for (const d of dirs) {
            const nr = r + [-1,0,1,0][d];
            const nc = c + [0,1,0,-1][d];
            if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || grid[nr][nc].visited) continue;
            if (d===0){ grid[r][c].n=true; grid[nr][nc].s=true; }
            if (d===1){ grid[r][c].e=true; grid[nr][nc].w=true; }
            if (d===2){ grid[r][c].s=true; grid[nr][nc].n=true; }
            if (d===3){ grid[r][c].w=true; grid[nr][nc].e=true; }
            carve(nr, nc);
        }
    }
    carve(0, 0);
    return grid;
}

function drawMaze(cursorX, cursorY) {
    const ctx = mazeCtx;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#ff00ea';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#1f1f1f';
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = mazeGrid[r][c];
            const x = c * CELL, y = r * CELL, pad = WALL_T;
            ctx.fillRect(x + pad, y + pad, CELL - pad*2, CELL - pad*2);
            if (cell.e && c < COLS-1) ctx.fillRect(x + CELL - pad, y + pad, pad*2, CELL - pad*2);
            if (cell.s && r < ROWS-1) ctx.fillRect(x + pad, y + CELL - pad, CELL - pad*2, pad*2);
        }
    }
    ctx.strokeStyle = '#ef9f27';
    ctx.lineWidth = WALL_T;
    ctx.lineCap = 'square';
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = mazeGrid[r][c];
            const x = c * CELL, y = r * CELL;
            ctx.beginPath();
            if (!cell.n) { ctx.moveTo(x, y);        ctx.lineTo(x+CELL, y); }
            if (!cell.e) { ctx.moveTo(x+CELL, y);   ctx.lineTo(x+CELL, y+CELL); }
            if (!cell.s) { ctx.moveTo(x, y+CELL);   ctx.lineTo(x+CELL, y+CELL); }
            if (!cell.w) { ctx.moveTo(x, y);         ctx.lineTo(x, y+CELL); }
            ctx.stroke();
        }
    }
    ctx.strokeStyle = '#ef9f27';
    ctx.lineWidth = WALL_T;
    ctx.strokeRect(WALL_T/2, WALL_T/2, W-WALL_T, H-WALL_T);
    if (!mazeInStart && mazeActive) {
        ctx.fillStyle = 'rgba(29,158,117,0.18)';
        ctx.fillRect(WALL_T, WALL_T, CELL - WALL_T*2, CELL - WALL_T*2);
    }
    ctx.fillStyle = mazeInStart ? '#0a4032' : '#1d9e75';
    ctx.beginPath(); ctx.arc(CELL*0.5, CELL*0.5, 7, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#f0ede6';
    ctx.font = 'bold 8px DM Sans, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('S', CELL*0.5, CELL*0.5);
    ctx.fillStyle = '#e24b4a';
    ctx.beginPath(); ctx.arc(W - CELL*0.5, H - CELL*0.5, 7, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#f0ede6';
    ctx.fillText('E', W - CELL*0.5, H - CELL*0.5);
    if (cursorX !== undefined) {
        ctx.fillStyle = mazeInStart ? 'rgba(239,159,39,0.95)' : 'rgba(239,159,39,0.4)';
        ctx.beginPath(); ctx.arc(cursorX, cursorY, CURSOR_RADIUS+1, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = mazeInStart ? 'rgba(239,159,39,0.35)' : 'rgba(239,159,39,0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cursorX, cursorY, CURSOR_RADIUS+6, 0, Math.PI*2); ctx.stroke();
    }
}

function isInStartZone(x, y) {
    return x >= WALL_T && x <= CELL-WALL_T && y >= WALL_T && y <= CELL-WALL_T;
}

function isInWall(x, y) {
    const offsets = [
        [0,0],[CURSOR_RADIUS,0],[-CURSOR_RADIUS,0],[0,CURSOR_RADIUS],[0,-CURSOR_RADIUS],
        [CURSOR_RADIUS*0.7,CURSOR_RADIUS*0.7],[-CURSOR_RADIUS*0.7,CURSOR_RADIUS*0.7],
        [CURSOR_RADIUS*0.7,-CURSOR_RADIUS*0.7],[-CURSOR_RADIUS*0.7,-CURSOR_RADIUS*0.7],
    ];
    for (const [ox, oy] of offsets) {
        const px = x+ox, py = y+oy;
        if (px < 0 || py < 0 || px >= W || py >= H) return true;
        const col = Math.floor(px/CELL), row = Math.floor(py/CELL);
        if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return true;
        const lx = px - col*CELL, ly = py - row*CELL;
        const cell = mazeGrid[row][col];
        const T = WALL_T;
        if (ly < T && !cell.n && row > 0) return true;
        if (ly < T && row === 0) return true;
        if (ly > CELL-T && !cell.s && row < ROWS-1) return true;
        if (ly > CELL-T && row === ROWS-1) return true;
        if (lx < T && !cell.w && col > 0) return true;
        if (lx < T && col === 0) return true;
        if (lx > CELL-T && !cell.e && col < COLS-1) return true;
        if (lx > CELL-T && col === COLS-1) return true;
    }
    return false;
}

function isAtGoal(x, y) {
    return x >= W-CELL+WALL_T && x <= W-WALL_T && y >= H-CELL+WALL_T && y <= H-WALL_T;
}

function getCanvasPos(e) {
    const canvas = document.getElementById('maze-canvas');
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width, scaleY = H / rect.height;
    const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return { x: (cx - rect.left)*scaleX, y: (cy - rect.top)*scaleY };
}

function onMazeMove(e) { handleMazeInput(e); }
function onMazeTouch(e) { e.preventDefault(); handleMazeInput(e); }

function handleMazeInput(e) {
    if (!mazeActive || mazeSolved) return;
    const { x, y } = getCanvasPos(e);
    mazeCX = x; mazeCY = y;
    if (!mazeInStart) {
        drawMaze(x, y);
        if (isInStartZone(x, y)) {
            mazeInStart = true;
            mazeCtx.fillStyle = 'rgba(0, 255, 174, 0.3)';
            mazeCtx.fillRect(WALL_T, WALL_T, CELL-WALL_T*2, CELL-WALL_T*2);
        }
        return;
    }
    drawMaze(x, y);
    if (isInWall(x, y)) { mazeHit(); return; }
    if (isAtGoal(x, y)) {
    mazeSolved = true;
    mazeActive = false;
    stopMaze();
    mazeCtx.fillStyle = 'rgba(255, 0, 230, 0.4)';
    mazeCtx.fillRect(0, 0, W, H);

    setTimeout(() => {
        goBackToTerms();
        showToast("You escaped the maze! 🏁");
    }, 700);
}
}

function mazeHit() {
    mazeActive = false;
    stopMaze();
    mazeCtx.fillStyle = 'rgba(255, 0, 0, 0.45)';
    mazeCtx.fillRect(0, 0, W, H);
    setTimeout(() => showLose('💥', 'You hit a wall!', 'The gauntlet resets. All the way back to the terms.'), 450);
}

function startMaze() {
    document.getElementById('maze-overlay').classList.remove('visible');
    mazeActive  = true;
    mazeSolved  = false;
    mazeStarted = true;
    mazeInStart = false;
    drawMaze();
}

function stopMaze() {
    mazeActive = false;
    const canvas = document.getElementById('maze-canvas');
    if (canvas) {
        canvas.removeEventListener('mousemove', onMazeMove);
        canvas.removeEventListener('touchmove', onMazeTouch);
    }
}