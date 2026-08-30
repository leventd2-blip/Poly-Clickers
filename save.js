const SAVE_KEY = 'LOW_POLY_CLICKER_DELUXE_SAVE';

function saveGame() {
    const saveData = {
        gems: game.gems,
        totalGemsEarned: game.totalGemsEarned,
        clickPower: game.clickPower,
        prestigeCrystals: game.prestigeCrystals,
        upgrades: game.upgrades.map(u => ({ id: u.id, count: u.count, cost: u.cost })),
        achievements: game.achievements.map(a => ({ id: a.id, unlocked: a.unlocked }))
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
}

function loadGame() {
    const savedString = localStorage.getItem(SAVE_KEY);
    if (!savedString) return;

    try {
        const saveData = JSON.parse(savedString);
        game.gems = saveData.gems || 0;
        game.totalGemsEarned = saveData.totalGemsEarned || 0;
        game.clickPower = saveData.clickPower || 1;
        game.prestigeCrystals = saveData.prestigeCrystals || 0;

        if (saveData.upgrades) {
            saveData.upgrades.forEach(savedUpgrade => {
                const target = game.upgrades.find(u => u.id === savedUpgrade.id);
                if (target) {
                    target.count = savedUpgrade.count;
                    target.cost = savedUpgrade.cost;
                }
            });
        }

        if (saveData.achievements) {
            saveData.achievements.forEach(savedAch => {
                const target = game.achievements.find(a => a.id === savedAch.id);
                if (target) target.unlocked = savedAch.unlocked;
            });
        }

        recalculateCPS();
        initShop();
    } catch (e) {
        console.error("Failed to load save data:", e);
    }
}

// Auto-save every 10 seconds
setInterval(saveGame, 10000);

window.addEventListener('DOMContentLoaded', () => {
    loadGame();
});
