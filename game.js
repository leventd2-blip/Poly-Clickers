const game = {
    gems: 0,
    totalGemsEarned: 0,
    clickPower: 1,
    cps: 0,
    prestigeCrystals: 0,
    buffActive: false,
    buffTimer: 0,
    ranks: [
        { name: 'Novice Miner', threshold: 0 },
        { name: 'Poly Apprentice', threshold: 500 },
        { name: 'Crystal Smith', threshold: 5000 },
        { name: 'Gem Master', threshold: 50000 },
        { name: 'Poly God', threshold: 500000 }
    ],
    upgrades: [
        { id: 'worker', name: 'Poly Worker', cost: 15, cps: 1, count: 0, costMultiplier: 1.15 },
        { id: 'factory', name: 'Gem Generator', cost: 100, cps: 8, count: 0, costMultiplier: 1.2 },
        { id: 'quarry', name: 'Crystal Quarry', cost: 1100, cps: 47, count: 0, costMultiplier: 1.25 }
    ],
    achievements: [
        { id: 'c1', name: 'First Shard', desc: 'Earn 100 total gems', target: 100, unlocked: false },
        { id: 'c2', name: 'Poly Tycoon', desc: 'Earn 10,000 total gems', target: 10000, unlocked: false }
    ]
};

function clickGem() {
    let power = game.clickPower * (1 + game.prestigeCrystals * 0.1);
    let isCrit = Math.random() < 0.1; // 10% Crit Chance
    
    if (isCrit) {
        power *= 5;
        triggerCritAnimation();
    }

    game.gems += power;
    game.totalGemsEarned += power;
    checkAchievements();
}

function buyUpgrade(upgradeId) {
    const upgrade = game.upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;

    if (game.gems >= upgrade.cost) {
        game.gems -= upgrade.cost;
        upgrade.count++;
        upgrade.cost = Math.floor(upgrade.cost * upgrade.costMultiplier);
        recalculateCPS();
    }
}

function recalculateCPS() {
    let totalCPS = 0;
    game.upgrades.forEach(u => {
        totalCPS += u.cps * u.count;
    });
    let multiplier = 1 + (game.prestigeCrystals * 0.1);
    if (game.buffActive) multiplier *= 2;
    game.cps = totalCPS * multiplier;
}

function triggerRebirth() {
    let earnedCrystals = Math.floor(Math.sqrt(game.totalGemsEarned / 1000));
    if (earnedCrystals <= game.prestigeCrystals) return;
    
    game.prestigeCrystals = earnedCrystals;
    game.gems = 0;
    game.totalGemsEarned = 0;
    game.upgrades.forEach(u => {
        u.count = 0;
        u.cost = Math.floor(u.cost / Math.pow(u.costMultiplier, u.count));
    });
    recalculateCPS();
}

function activateBuff() {
    if (game.buffActive) return;
    game.buffActive = true;
    game.buffTimer = 15;
    recalculateCPS();
}

function checkAchievements() {
    game.achievements.forEach(ach => {
        if (!ach.unlocked && game.totalGemsEarned >= ach.target) {
            ach.unlocked = true;
        }
    });
}

let lastTick = Date.now();
function gameLoop() {
    const now = Date.now();
    const delta = (now - lastTick) / 1000;
    lastTick = now;

    let passiveYield = game.cps * delta;
    game.gems += passiveYield;
    game.totalGemsEarned += passiveYield;

    if (game.buffActive) {
        game.buffTimer -= delta;
        if (game.buffTimer <= 0) {
            game.buffActive = false;
            recalculateCPS();
        }
    }

    checkAchievements();
    updateUI();
    requestAnimationFrame(gameLoop);
}

window.addEventListener('DOMContentLoaded', () => {
    recalculateCPS();
    requestAnimationFrame(gameLoop);
});
