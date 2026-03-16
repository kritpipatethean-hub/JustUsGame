document.addEventListener('DOMContentLoaded', () => {
    const authSection = document.getElementById('auth-section');
    const hubSection = document.getElementById('hub-section');
    const playerNameSpan = document.getElementById('current-player-name');
    
    const btnEarth = document.getElementById('btn-earth');
    const btnNoon = document.getElementById('btn-noon');
    const btnLogout = document.getElementById('btn-logout');

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
        localStorage.setItem('currentPlayer', name);
        checkAuth();
    }

    if (btnEarth) btnEarth.addEventListener('click', () => setPlayer('Earth'));
    if (btnNoon) btnNoon.addEventListener('click', () => setPlayer('Noon'));
    
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.removeItem('currentPlayer');
            checkAuth();
        });
    }

    checkAuth();
});
