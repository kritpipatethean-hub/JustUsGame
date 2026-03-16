const statsStatusEl = document.getElementById('stats-status');

// Listen to Earth's Stats
db.ref(`stats/4-in-a-row/Earth`).on('value', (snapshot) => {
    if (snapshot.exists()) {
        const data = snapshot.val();
        document.getElementById('earth-wins').textContent = data.wins || 0;
        document.getElementById('earth-losses').textContent = data.losses || 0;
        document.getElementById('earth-draws').textContent = data.draws || 0;
        statsStatusEl.textContent = "Live stats connected.";
    } else {
        statsStatusEl.textContent = "No games played yet by Earth.";
    }
}, (error) => {
    statsStatusEl.innerHTML = `<span style="color:red">Error loading stats. Check Firebase permissions / databaseURL.</span>`;
});

// Listen to Noon's Stats
db.ref(`stats/4-in-a-row/Noon`).on('value', (snapshot) => {
    if (snapshot.exists()) {
        const data = snapshot.val();
        document.getElementById('noon-wins').textContent = data.wins || 0;
        document.getElementById('noon-losses').textContent = data.losses || 0;
        document.getElementById('noon-draws').textContent = data.draws || 0;
    }
});
