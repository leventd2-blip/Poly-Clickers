const gemCountEl = document.getElementById('gem-count');
const cpsCountEl = document.getElementById('cps-count');
const clickBtn = document.getElementById('click-btn');
const shopContainer = document.getElementById('shop-container');
const achievementsContainer = document.getElementById('achievements-container');
const rankTitleEl = document.getElementById('rank-title');
const crystalCountEl = document.getElementById('crystal-count');
const crystalBoostEl = document.getElementById('crystal-boost');
const prestigeBtn = document.getElementById('prestige-btn');
const buffBtn = document.getElementById('buff-btn');
const critPopup = document.getElementById('crit-popup');

// Standard mouse click
clickBtn.addEventListener('click', clickGem);

// iPad/Mobile fast touch handler to completely block zoom gestures
clickBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    clickGem();
}, { passive: false });

prestigeBtn.addEventListener('click', triggerRebirth);
buffBtn.addEventListener('click', activateBuff);

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    if (tabName === 'shop') {
        document.getElementById('shop-tab').classList.remove('hidden');
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
    } else {
        document.getElementById('achievements-tab').classList.remove('hidden');
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
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

function updateUI() {
    gemCountEl.textContent = Math.floor(game.gems).toLocaleString();
    cpsCountEl.textContent = game.cps.toFixed(1);
    crystalCountEl.textContent = game.prestigeCrystals;
    crystalBoostEl.textContent = game.prestigeCrystals * 10;

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
        buffBtn.textContent = `Boost Active (${Math.ceil(game.buffTimer)}s)`;
        buffBtn.classList.add('disabled');
    } else {
        buffBtn.textContent = `Activate Boost (15s)`;
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
