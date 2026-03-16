// Game Constants
const ROWS = 6;
const COLS = 7;
const PLAYER_1 = 'Earth'; // Player 1 is always Earth
const PLAYER_2 = 'Noon';  // Player 2 is always Noon
const GAME_ID = "4-in-a-row-room-1"; // Hardcoded room

let currentPlayerLocal = localStorage.getItem('currentPlayer');
let gameState = null;

// DOM Elements
const boardEl = document.getElementById('game-board');
const statusEl = document.getElementById('status-display');
const btnReset = document.getElementById('btn-reset');

// Redirect if not logged in
if (!currentPlayerLocal) {
    window.location.href = 'index.html';
}

// Ensure local player is either Earth or Noon
if (currentPlayerLocal !== PLAYER_1 && currentPlayerLocal !== PLAYER_2) {
    currentPlayerLocal = PLAYER_1; 
}

// Render the empty board initially
function renderBoard() {
    boardEl.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            
            // Allow clicking only on the highest row of that column
            cell.addEventListener('click', () => handleColumnClick(c));
            boardEl.appendChild(cell);
        }
    }
}

function getLowestEmptyRow(col, board) {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (!board[r][col]) return r;
    }
    return -1;
}

function handleColumnClick(col) {
    if (!gameState || gameState.winner || gameState.currentTurn !== currentPlayerLocal) return;
    
    const r = getLowestEmptyRow(col, gameState.board);
    if (r === -1) return; // Column is full

    // Make move locally and send to Firebase
    gameState.board[r][col] = currentPlayerLocal;
    
    if (checkWin(r, col, currentPlayerLocal)) {
        gameState.winner = currentPlayerLocal;
        recordStat(currentPlayerLocal); // Record stat in db
    } else if (checkDraw()) {
        gameState.winner = 'Draw';
        recordStat('Draw');
    } else {
        gameState.currentTurn = (currentPlayerLocal === PLAYER_1) ? PLAYER_2 : PLAYER_1;
    }

    updateFirebaseState();
}

function updateFirebaseState() {
    db.ref(`games/${GAME_ID}`).set(gameState).catch(err => {
        console.error("Firebase update failed.", err);
        Swal.fire('Error', 'Could not sync with Firebase.', 'error');
    });
}

function updateUI() {
    if (!gameState) return;

    // Update board cells
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
            cell.className = 'cell'; // reset
            if (gameState.board[r][c] === PLAYER_1) {
                cell.classList.add('player1'); // Earth
            } else if (gameState.board[r][c] === PLAYER_2) {
                cell.classList.add('player2'); // Noon
            }
        }
    }

    // Update status
    if (gameState.winner) {
        if (gameState.winner === 'Draw') {
            statusEl.textContent = "It's a Draw!";
            statusEl.style.color = "var(--text-main)";
        } else {
            statusEl.innerHTML = `Winner: <span class="${gameState.winner.toLowerCase()}-text">${gameState.winner}</span>!`;
            if (gameState.winner === currentPlayerLocal) {
                Swal.fire('You Won!', `Great job, ${currentPlayerLocal}!`, 'success');
            } else {
                Swal.fire('You Lost!', `${gameState.winner} beat you. Better luck next time!`, 'error');
            }
        }
        btnReset.classList.remove('hidden');
    } else {
        btnReset.classList.add('hidden');
        if (gameState.currentTurn === currentPlayerLocal) {
            statusEl.innerHTML = `Your Turn <span class="${currentPlayerLocal.toLowerCase()}-text">(${currentPlayerLocal})</span>`;
        } else {
            statusEl.innerHTML = `Waiting for <span class="${gameState.currentTurn.toLowerCase()}-text">${gameState.currentTurn}...</span>`;
        }
    }
}

// Win checking logic
function checkWin(r, c, player) {
    const board = gameState.board;
    const dirs = [
        [[0, 1], [0, -1]], // horizontal
        [[1, 0], [-1, 0]], // vertical
        [[1, 1], [-1, -1]], // diagonal /
        [[1, -1], [-1, 1]]  // diagonal \
    ];

    for (let d of dirs) {
        let count = 1;
        for (let dir of d) {
            let nr = r + dir[0];
            let nc = c + dir[1];
            while (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] === player) {
                count++;
                nr += dir[0];
                nc += dir[1];
            }
        }
        if (count >= 4) return true;
    }
    return false;
}

function checkDraw() {
    for (let c = 0; c < COLS; c++) {
        if (!gameState.board[0][c]) return false;
    }
    return true;
}

async function recordStat(result) {
    const defaultStats = { wins: 0, losses: 0, draws: 0 };
    
    // Player 1 stats
    const p1Ref = db.ref(`stats/4-in-a-row/${PLAYER_1}`);
    const p1Snap = await p1Ref.get();
    let p1Stats = p1Snap.exists() ? p1Snap.val() : { ...defaultStats };

    // Player 2 stats
    const p2Ref = db.ref(`stats/4-in-a-row/${PLAYER_2}`);
    const p2Snap = await p2Ref.get();
    let p2Stats = p2Snap.exists() ? p2Snap.val() : { ...defaultStats };

    if (result === 'Draw') {
        p1Stats.draws++;
        p2Stats.draws++;
    } else if (result === PLAYER_1) {
        p1Stats.wins++;
        p2Stats.losses++;
    } else if (result === PLAYER_2) {
        p2Stats.wins++;
        p1Stats.losses++;
    }

    await p1Ref.set(p1Stats);
    await p2Ref.set(p2Stats);
}

function initGameInDB() {
    const emptyBoard = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
    gameState = {
        board: emptyBoard,
        currentTurn: PLAYER_1, // Earth goes first always on reset
        winner: null,
        timestamp: Date.now()
    };
    updateFirebaseState();
}

// Initialize
renderBoard();

btnReset.addEventListener('click', initGameInDB);

// Listen for Firebase changes
db.ref(`games/${GAME_ID}`).on('value', (snapshot) => {
    if (snapshot.exists()) {
        gameState = snapshot.val();
        updateUI();
    } else {
        // First time initialization
        initGameInDB();
    }
}, (error) => {
    console.error("Firebase listen error:", error);
    statusEl.innerHTML = `<span style="color:red;font-size:1rem">Could not connect to Database. Please check databaseURL in firebase-config.js.</span>`;
});
