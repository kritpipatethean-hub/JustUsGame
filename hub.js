document.addEventListener('DOMContentLoaded', () => {
    const authSection = document.getElementById('auth-section');
    const hubSection = document.getElementById('hub-section');
    const playerNameSpan = document.getElementById('current-player-name');
    
    const btnEarth = document.getElementById('btn-earth');
    const btnNoon = document.getElementById('btn-noon');
    const btnLogout = document.getElementById('btn-logout');

    let isEarthActive = false;
    let isNoonActive = false;

    // Listen to Firebase for active players
    const activePlayersRef = db.ref('activePlayers');
    activePlayersRef.on('value', (snapshot) => {
        const data = snapshot.val() || {};
        isEarthActive = !!data.Earth;
        isNoonActive = !!data.Noon;

        // Update button states
        if (btnEarth) {
            if (isEarthActive && localStorage.getItem('currentPlayer') !== 'Earth') {
                btnEarth.disabled = true;
                btnEarth.style.opacity = '0.5';
                btnEarth.textContent = 'Earth (Playing)';
            } else {
                btnEarth.disabled = false;
                btnEarth.style.opacity = '1';
                btnEarth.textContent = 'I am Earth';
            }
        }

        if (btnNoon) {
            if (isNoonActive && localStorage.getItem('currentPlayer') !== 'Noon') {
                btnNoon.disabled = true;
                btnNoon.style.opacity = '0.5';
                btnNoon.textContent = 'Noon (Playing)';
            } else {
                btnNoon.disabled = false;
                btnNoon.style.opacity = '1';
                btnNoon.textContent = 'I am Noon';
            }
        }
    });

    function checkAuth() {
        const player = localStorage.getItem('currentPlayer');
        if (player) {
            authSection.classList.add('hidden');
            hubSection.classList.remove('hidden');
            playerNameSpan.textContent = player;
            playerNameSpan.className = `highlight ${player.toLowerCase()}-text`;
        } else {
            authSection.classList.remove('hidden');
            hubSection.classList.add('hidden');
        }
    }

    function setPlayer(name) {
        // Prevent setting if already active by someone else, but allow re-clicking own name
        if (name === 'Earth' && isEarthActive && localStorage.getItem('currentPlayer') !== 'Earth') return;
        if (name === 'Noon' && isNoonActive && localStorage.getItem('currentPlayer') !== 'Noon') return;

        localStorage.setItem('currentPlayer', name);
        
        // Claim the spot in Firebase
        db.ref(`activePlayers/${name}`).set(true);
        // Automatically release the spot if this device disconnects
        db.ref(`activePlayers/${name}`).onDisconnect().remove();

        checkAuth();
    }

    if (btnEarth) btnEarth.addEventListener('click', () => setPlayer('Earth'));
    if (btnNoon) btnNoon.addEventListener('click', () => setPlayer('Noon'));
    
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            const player = localStorage.getItem('currentPlayer');
            if (player) {
                // Free up the spot in Firebase
                db.ref(`activePlayers/${player}`).remove();
                // Cancel the onDisconnect listener
                db.ref(`activePlayers/${player}`).onDisconnect().cancel();
            }
            localStorage.removeItem('currentPlayer');
            checkAuth();
        });
    }

    // Attempt to reclaim spot on page load if already logged in locally
    const savedPlayer = localStorage.getItem('currentPlayer');
    if (savedPlayer) {
        db.ref(`activePlayers/${savedPlayer}`).set(true);
        db.ref(`activePlayers/${savedPlayer}`).onDisconnect().remove();
    }

    checkAuth();
});
