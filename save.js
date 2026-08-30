const SAVE_KEY = 'POLY_UNIVERSE_INFINITE_SAVE_V2';

function saveGame() {
    const saveData = {
        gems: game.gems,
        totalGemsEarned: game.totalGemsEarned,
        shards: game.shards,
        flux: game.flux,
        playtime: game.playtime,
        clickPower: game.clickPower,
        prestigeCrystals: game.prestigeCrystals,
        upgrades: game.upgrades.map(u => ({ id: u.id, count: u.count, cost: u.cost })),
        refineryUpgrades: game.refineryUpgrades.map(r => ({ id: r.id, count: r.count, cost: r.cost })),
        relics: game.relics.map(rc => ({ id: rc.id, count: rc.count, cost: rc.cost })),
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
        game.shards = saveData.shards || 0;
        game.flux = saveData.flux || 0;
        game.playtime = saveData.playtime || 0;
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

        if (saveData.refineryUpgrades) {
            saveData.refineryUpgrades.forEach(savedRef => {
                const target = game.refineryUpgrades.find(r => r.id === savedRef.id);
                if (target) {
                    target.count = savedRef.count;
                    target.cost = savedRef.cost;
                }
            });
        }

        if (saveData.relics) {
            saveData.relics.forEach(savedRelic => {
                const target = game.relics.find(r => r.id === savedRelic.id);
                if (target) {
                    target.count = savedRelic.count;
                    target.cost = savedRelic.cost;
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
