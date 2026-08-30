const gemCountEl = document.getElementById('gem-count');
const shardCountEl = document.getElementById('shard-count');
const fluxCountEl = document.getElementById('flux-count');
const cpsCountEl = document.getElementById('cps-count');
const clickBtn = document.getElementById('click-btn');
const clickerPanel = document.querySelector('.clicker-panel');
const shopContainer = document.getElementById('shop-container');
const refineryContainer = document.getElementById('refinery-container');
const relicsContainer = document.getElementById('relics-container');
const achievementsContainer = document.getElementById('achievements-container');
const rankTitleEl = document.getElementById('rank-title');
const crystalCountEl = document.getElementById('crystal-count');
const crystalBoostEl = document.getElementById('crystal-boost');
const prestigeBtn = document.getElementById('prestige-btn');
const buffBtn = document.getElementById('buff-btn');
const critPopup = document.getElementById('crit-popup');
const playtimeDisplayEl = document.getElementById('playtime-display');

clickBtn.addEventListener('click', (e) => clickGem(e));
clickBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    clickGem(e);
}, { passive: false });

prestigeBtn.addEventListener('click', triggerRebirth);
buffBtn.addEventListener('click', activateBuff);

function showFloatingNumber(amount, clientX, clientY) {
    const el = document.createElement('div');
    el.classList.add('floating-number');
    el.textContent = `+${amount.toLocaleString()}`;
    
    // Position relative to clicker panel container
    const rect = clickerPanel.getBoundingClientRect();
    let x = clientX - rect.left + (Math.random() * 30 - 15);
    let y = clientY - rect.top - 10;
    
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    
    clickerPanel.appendChild(el);
    setTimeout(() => {
        el.remove();
    }, 700);
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    if (tabName === 'shop') {
        document.getElementById('shop-tab').classList.remove('hidden');
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
    } else if (tabName === 'refinery') {
        document.getElementById('refinery-tab').classList.remove('hidden');
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        initRefinery();
    } else if (tabName === 'relics') {
        document.getElementById('relics-tab').classList.remove('hidden');
        document.querySelectorAll('.tab-btn')[2].classList.add('active');
        initRelics();
    } else {
        document.getElementById('achievements-tab').classList.remove('hidden');
        document.querySelectorAll('.tab-btn')[3].classList.add('active');
        initAchievements();
    }
}

function initShop() {
    shopContainer.innerHTML = '';
    game.upgrades.forEach(upgrade => {
        const itemEl = document.createElement('div');
        itemEl.classList.add('shop-item');
        itemEl.id = `shop-item-${upgrade.id}`;
        itemEl.addEventListener('click', () => buyUpgrade(upgrade.id));

        itemEl.innerHTML = `
            <div class="shop-item-info">
                <span class="item-name">${upgrade.name}</span>
                <span class="item-count" id="count-${upgrade.id}">${upgrade.count}</span>
            </div>
            <div class="shop-item-info">
                <span class="item-cost" id="cost-${upgrade.id}">${upgrade.cost} Gems</span>
                <span class="item-yield">+${upgrade.cps}/s</span>
            </div>
        `;
        shopContainer.appendChild(itemEl);
    });
}

function initRefinery() {
    refineryContainer.innerHTML = '';
    game.refineryUpgrades.forEach(ref => {
        const itemEl = document.createElement('div');
        itemEl.classList.add('shop-item');
        itemEl.id = `ref-item-${ref.id}`;
        itemEl.addEventListener('click', () => buyRefineryUpgrade(ref.id));

        itemEl.innerHTML = `
            <div class="shop-item-info">
                <span class="item-name">${ref.name}</span>
                <span class="item-count" id="ref-count-${ref.id}">Lv.${ref.count}</span>
            </div>
            <div style="font-size:0.75rem; opacity:0.8; margin:2px 0;">${ref.effect}</div>
            <div class="shop-item-info">
                <span class="item-cost" id="ref-cost-${ref.id}">${ref.cost} ${ref.currencyType.toUpperCase()}</span>
            </div>
        `;
        refineryContainer.appendChild(itemEl);
    });
}

function initRelics() {
    relicsContainer.innerHTML = '';
    game.relics.forEach(relic => {
        const itemEl = document.createElement('div');
        itemEl.classList.add('shop-item');
        itemEl.id = `relic-item-${relic.id}`;
        itemEl.addEventListener('click', () => buyRelic(relic.id));

        itemEl.innerHTML = `
            <div class="shop-item-info">
                <span class="item-name">${relic.name}</span>
                <span class="item-count" id="relic-count-${relic.id}">Owned: ${relic.count}</span>
            </div>
            <div style="font-size:0.75rem; opacity:0.8; margin:2px 0;">${relic.effect}</div>
            <div class="shop-item-info">
                <span class="item-cost" id="relic-cost-${relic.id}">${relic.cost} Crystals</span>
            </div>
        `;
        relicsContainer.appendChild(itemEl);
    });
}

function initAchievements() {
    achievementsContainer.innerHTML = '';
    game.achievements.forEach(ach => {
        const itemEl = document.createElement('div');
        itemEl.classList.add('shop-item');
        if (!ach.unlocked) itemEl.classList.add('disabled');
        itemEl.innerHTML = `
            <div class="shop-item-info">
                <span>${ach.name} ${ach.unlocked ? '✅' : '🔒'}</span>
            </div>
            <div style="font-size: 0.8rem; opacity: 0.8;">${ach.desc}</div>
        `;
        achievementsContainer.appendChild(itemEl);
    });
}

function formatPlaytime(seconds) {
    let hrs = Math.floor(seconds / 3600);
    let mins = Math.floor((seconds % 3600) / 60);
    let secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateUI() {
    gemCountEl.textContent = Math.floor(game.gems).toLocaleString();
    shardCountEl.textContent = Math.floor(game.shards).toLocaleString();
    fluxCountEl.textContent = Math.floor(game.flux).toLocaleString();
    cpsCountEl.textContent = game.cps.toFixed(1);
    crystalCountEl.textContent = game.prestigeCrystals;
    crystalBoostEl.textContent = game.prestigeCrystals * 10;
    playtimeDisplayEl.textContent = formatPlaytime(game.playtime);

    let currentRank = game.ranks[0].name;
    for (let r of game.ranks) {
        if (game.totalGemsEarned >= r.threshold) currentRank = r.name;
    }
    rankTitleEl.textContent = currentRank;

    if (game.totalGemsEarned >= 10000) {
        prestigeBtn.classList.remove('disabled');
        prestigeBtn.removeAttribute('disabled');
    } else {
        prestigeBtn.classList.add('disabled');
        prestigeBtn.setAttribute('disabled', 'true');
    }

    if (game.buffActive) {
        buffBtn.textContent = `Surge Active (${Math.ceil(game.buffTimer)}s)`;
        buffBtn.classList.add('disabled');
    } else {
        buffBtn.textContent = `Activate Energy Surge (15s)`;
        buffBtn.classList.remove('disabled');
    }

    game.upgrades.forEach(upgrade => {
        const costEl = document.getElementById(`cost-${upgrade.id}`);
        const countEl = document.getElementById(`count-${upgrade.id}`);
        const itemEl = document.getElementById(`shop-item-${upgrade.id}`);

        if (costEl && countEl && itemEl) {
            costEl.textContent = `${upgrade.cost} Gems`;
            countEl.textContent = upgrade.count;
            if (game.gems >= upgrade.cost) {
                itemEl.classList.remove('disabled');
            } else {
                itemEl.classList.add('disabled');
            }
        }
    });

    game.refineryUpgrades.forEach(ref => {
        const costEl = document.getElementById(`ref-cost-${ref.id}`);
        const countEl = document.getElementById(`ref-count-${ref.id}`);
        const itemEl = document.getElementById(`ref-item-${ref.id}`);

        if (costEl && countEl && itemEl) {
            costEl.textContent = `${ref.cost} ${ref.currencyType.toUpperCase()}`;
            countEl.textContent = `Lv.${ref.count}`;
            let currencyPool = ref.currencyType === 'shards' ? game.shards : game.flux;
            if (currencyPool >= ref.cost) {
                itemEl.classList.remove('disabled');
            } else {
                itemEl.classList.add('disabled');
            }
        }
    });

    game.relics.forEach(relic => {
        const costEl = document.getElementById(`relic-cost-${relic.id}`);
        const countEl = document.getElementById(`relic-count-${relic.id}`);
        const itemEl = document.getElementById(`relic-item-${relic.id}`);

        if (costEl && countEl && itemEl) {
            costEl.textContent = `${relic.cost} Crystals`;
            countEl.textContent = `Owned: ${relic.count}`;
            if (game.prestigeCrystals >= relic.cost) {
                itemEl.classList.remove('disabled');
            } else {
                itemEl.classList.add('disabled');
            }
        }
    });
}

function triggerCritAnimation() {
    critPopup.style.top = `${Math.random() * 40 + 20}%`;
    critPopup.style.left = `${Math.random() * 40 + 30}%`;
    critPopup.classList.remove('hidden');
    setTimeout(() => critPopup.classList.add('hidden'), 400);
}

window.addEventListener('DOMContentLoaded', () => {
    initShop();
});
