const game = {
    gems: 0,
    totalGemsEarned: 0,
    shards: 0,
    flux: 0,
    playtime: 0,
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
        { name: 'Quantum Architect', threshold: 500000 },
        { name: 'Poly Universe God', threshold: 5000000 },
        { name: 'Dimensional Overlord', threshold: 50000000 }
    ],
    upgrades: [
        { id: 'worker', name: 'Poly Worker', cost: 15, cps: 1, count: 0, costMultiplier: 1.15 },
        { id: 'factory', name: 'Gem Generator', cost: 100, cps: 8, count: 0, costMultiplier: 1.2 },
        { id: 'quarry', name: 'Crystal Quarry', cost: 1100, cps: 47, count: 0, costMultiplier: 1.25 },
        { id: 'synthesizer', name: 'Flux Core', cost: 12000, cps: 260, count: 0, costMultiplier: 1.3 },
        { id: 'loom', name: 'Quantum Loom', cost: 130000, cps: 1400, count: 0, costMultiplier: 1.35 },
        { id: 'singularity', name: 'Singularity Engine', cost: 1500000, cps: 8500, count: 0, costMultiplier: 1.4 }
    ],
    refineryUpgrades: [
        { id: 'ref_shards', name: 'Shard Injector', cost: 50, currencyType: 'shards', effect: 'Boosts Gem production by +25%', count: 0, costMultiplier: 1.8 },
        { id: 'ref_flux', name: 'Flux Harmonizer', cost: 10, currencyType: 'flux', effect: 'Doubles all Shard & Gem yields', count: 0, costMultiplier: 2.5 }
    ],
    relics: [
        { id: 'relic_core', name: 'Ancient Core', cost: 5, effect: '+50% All Global Production', count: 0, costMultiplier: 3 },
        { id: 'relic_prism', name: 'Solar Prism', cost: 15, effect: 'Triples Critical Hit Multiplier', count: 0, costMultiplier: 4 },
        { id: 'relic_chronos', name: 'Chronos Gear', cost: 40, effect: 'Double Offline / Playtime scaling speed', count: 0, costMultiplier: 5 }
    ],
    achievements: [
        { id: 'c1', name: 'First Shard', desc: 'Earn 100 total gems', target: 100, unlocked: false },
        { id: 'c2', name: 'Poly Tycoon', desc: 'Earn 10,000 total gems', target: 10000, unlocked: false },
        { id: 'c3', name: 'Universal Magnate', desc: 'Earn 1,000,000 total gems', target: 1000000, unlocked: false },
        { id: 'c4', name: 'Dimensional Master', desc: 'Earn 100,000,000 total gems', target: 100000000, unlocked: false }
    ]
};

function clickGem(event) {
    let shardMultiplier = 1 + (game.refineryUpgrades[0].count * 0.25);
    let fluxMultiplier = Math.pow(2, game.refineryUpgrades[1].count);
    let relicMult = 1 + (game.relics[0].count * 0.5);
    let critPowerMult = game.relics[1].count > 0 ? 3 : 1;

    let power = game.clickPower * (1 + game.prestigeCrystals * 0.1) * shardMultiplier * fluxMultiplier * relicMult;
    
    let isCrit = Math.random() < 0.1; 
    if (isCrit) {
        power *= (5 * critPowerMult);
        triggerCritAnimation();
    }

    game.gems += power;
    game.totalGemsEarned += power;
    
    // Spawn floating number animation at click position
    if (event) {
        let clientX = event.clientX || (event.touches ? event.touches[0].clientX : window.innerWidth / 2);
        let clientY = event.clientY || (event.touches ? event.touches[0].clientY : window.innerHeight / 2);
        showFloatingNumber(Math.floor(power), clientX, clientY);
    }

    if (Math.random() < 0.2) game.shards += 1;
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

function buyRefineryUpgrade(upgradeId) {
    const ref = game.refineryUpgrades.find(u => u.id === upgradeId);
    if (!ref) return;

    let currencyPool = ref.currencyType === 'shards' ? game.shards : game.flux;
    if (currencyPool >= ref.cost) {
        if (ref.currencyType === 'shards') game.shards -= ref.cost;
        else game.flux -= ref.cost;

        ref.count++;
        ref.cost = Math.floor(ref.cost * ref.costMultiplier);
        recalculateCPS();
    }
}

function buyRelic(relicId) {
    const relic = game.relics.find(r => r.id === relicId);
    if (!relic) return;

    if (game.prestigeCrystals >= relic.cost) {
        game.prestigeCrystals -= relic.cost;
        relic.count++;
        relic.cost = Math.floor(relic.cost * relic.costMultiplier);
        recalculateCPS();
    }
}

function recalculateCPS() {
    let baseCPS = 0;
    game.upgrades.forEach(u => {
        baseCPS += u.cps * u.count;
    });
    
    let shardMultiplier = 1 + (game.refineryUpgrades[0].count * 0.25);
    let fluxMultiplier = Math.pow(2, game.refineryUpgrades[1].count);
    let relicMult = 1 + (game.relics[0].count * 0.5);
    let prestigeBoost = 1 + (game.prestigeCrystals * 0.1);
    let buffMultiplier = game.buffActive ? 2 : 1;

    game.cps = baseCPS * prestigeBoost * shardMultiplier * fluxMultiplier * relicMult * buffMultiplier;
}

function triggerRebirth() {
    let earnedCrystals = Math.floor(Math.sqrt(game.totalGemsEarned / 1000));
    if (earnedCrystals <= game.prestigeCrystals && game.prestigeCrystals === 0) return;
    
    game.prestigeCrystals += Math.max(1, earnedCrystals - game.prestigeCrystals);
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

    let timeMultiplier = game.relics[2].count > 0 ? 2 : 1;
    game.playtime += delta;

    let passiveYield = game.cps * delta * timeMultiplier;
    game.gems += passiveYield;
    game.totalGemsEarned += passiveYield;

    let factoryCount = game.upgrades.reduce((acc, u) => acc + u.count, 0);
    if (factoryCount > 0) {
        game.shards += (factoryCount * 0.05) * delta;
        if (game.upgrades[3].count > 0) {
            game.flux += (game.upgrades[3].count * 0.01) * delta;
        }
    }

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
