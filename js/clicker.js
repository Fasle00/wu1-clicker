/* Med document.queryselector(selector) kan vi hämta
 * de element som vi behöver från html dokumentet.
 * Vi spearar elementen i const variabler då vi inte kommer att
 * ändra dess värden.
 * Läs mer:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const
 * https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
 * Viktigt: queryselector ger oss ett html element eller flera om det finns.
 */
const clickerButton = document.querySelector('#game-button');
const moneyTracker = document.querySelector('#money');
const mpsTracker = document.querySelector('#mps'); // money per second
const mpcTracker = document.querySelector('#mpc'); // money per click
const upgradesTracker = document.querySelector('#upgrades');
const upgradeList = document.querySelector('#upgradelist');
const msgbox = document.querySelector('#msgbox');
const audioAchievement = document.querySelector('#swoosh');
const soulsTracker = document.querySelector('#souls');
const soulsOnRebirthTracker = document.querySelector('#soulsOnRebirth');

/* Följande variabler använder vi för att hålla reda på hur mycket pengar som
 * spelaren, har och tjänar.
 * last används för att hålla koll på tiden.
 * För dessa variabler kan vi inte använda const, eftersom vi tilldelar dem nya
 * värden, utan då använder vi let.
 * Läs mer: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let
 */
let money = 0;
let cilckBase = 1;
let multiplyer = 1;
let moneyPerClick;
let secondBase = 0;
let moneyPerSecond;
let acquiredUpgrades = 0;
let last = 0;
let numberOfClicks = 0; // hur många gånger har spelare eg. klickat
let active = false; // exempel för att visa att du kan lägga till klass för att indikera att spelare får valuta
let souls = 0;
let soulMod = 0;
let reset = '';

// likt upgrades skapas här en array med objekt som innehåller olika former
// av achievements.
// requiredSOMETHING är vad som krävs för att få dem

let achievements = [
    {
        description: 'The research is expanding, knowledge is Power! ',
        requiredUpgrades: 1,
        acquired: false,
    },
    {
        description: 'We need to expand even more, keep on going!',
        requiredUpgrades: 10,
        acquired: false,
    },
    {
        description: 'Clicker with knowledge!',
        requiredClicks: 10,
        acquired: false,
    },
    {
        description: 'Tac-2 god!',
        requiredClicks: 10000,
        acquired: false,
    },
];

/* Med ett valt element, som knappen i detta fall så kan vi skapa listeners
 * med addEventListener så kan vi lyssna på ett specifikt event på ett html-element
 * som ett klick.
 * Detta kommer att driva klickerknappen i spelet.
 * Efter 'click' som är händelsen vi lyssnar på så anges en callback som kommer
 * att köras vi varje klick. I det här fallet så använder vi en anonym funktion.
 * Koden som körs innuti funktionen är att vi lägger till moneyPerClick till
 * money.
 * Läs mer: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
 */
clickerButton.addEventListener(
    'click',
    () => {
        // vid click öka score med moneyPerClick
        money += moneyPerClick;
        // håll koll på hur många gånger spelaren klickat
        numberOfClicks += 1;
        // console.log(clicker.score);
    },
    false
);

/* För att driva klicker spelet så kommer vi att använda oss av en metod som heter
 * requestAnimationFrame.
 * requestAnimationFrame försöker uppdatera efter den refresh rate som användarens
 * maskin har, vanligtvis 60 gånger i sekunden.
 * Läs mer: https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
 * funktionen step används som en callback i requestanaimationframe och det är
 * denna metod som uppdaterar webbsidans text och pengarna.
 * Sist i funktionen så kallar den på sig själv igen för att fortsätta uppdatera.
 */
function step(timestamp) {
    moneyPerClick = cilckBase * (multiplyer + soulMod);
    moneyPerSecond = secondBase * (multiplyer + soulMod);

    soulMod = Math.pow(1.5, (souls / 100)) - 1;

    moneyTracker.textContent = Math.round(money);
    mpsTracker.textContent = Math.round(moneyPerSecond,3);
    mpcTracker.textContent = Math.round(moneyPerClick,3);
    upgradesTracker.textContent = acquiredUpgrades;
    soulsTracker.textContent = souls;
    soulsOnRebirthTracker.textContent = Math.round(money / 100_000_000)

    if (timestamp >= last + 1000) {
        money += moneyPerSecond;
        last = timestamp;
    }

    if (moneyPerSecond > 0 && !active) {
        mpsTracker.classList.add('active');
        active = true;
    }

    // achievements, utgår från arrayen achievements med objekt
    // koden nedan muterar (ändrar) arrayen och tar bort achievements
    // som spelaren klarat
    // villkoren i första ifsatsen ser till att achivments som är klarade
    // tas bort. Efter det så kontrolleras om spelaren har uppfyllt kriterierna
    // för att få den achievement som berörs.
    achievements = achievements.filter((achievement) => {
        if (achievement.acquired) {
            return false;
        }
        if (achievement.requiredUpgrades && acquiredUpgrades >= achievement.requiredUpgrades) {
            achievement.acquired = true;
            message(achievement.description, 'achievement');
            return false;
        } else if (achievement.requiredClicks && numberOfClicks >= achievement.requiredClicks) {
            achievement.acquired = true;
            message(achievement.description, 'achievement');
            return false;
        }
        return true;
    });

    window.requestAnimationFrame(step);
}

/* Här använder vi en listener igen. Den här gången så lyssnar iv efter window
 * objeket och när det har laddat färdigt webbsidan(omvandlat html till dom)
 * När detta har skett så skapar vi listan med upgrades, för detta använder vi
 * en forEach loop. För varje element i arrayen upgrades så körs metoden upgradeList
 * för att skapa korten. upgradeList returnerar ett kort som vi fäster på webbsidan
 * med appendChild.
 * Läs mer:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
 * https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild
 * Efter det så kallas requestAnimationFrame och spelet är igång.
 */
window.addEventListener('load', (event) => {
    upgrades.forEach((upgrade) => {
        upgradeList.appendChild(createCard(upgrade));
    });
    window.requestAnimationFrame(step);
});

/* En array med upgrades. Varje upgrade är ett objekt med egenskaperna name, cost
 * och amount. Önskar du ytterligare text eller en bild så går det utmärkt att
 * lägga till detta.
 * Läs mer:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer
 */
let upgrades = [
    {
        name: 'T1 Assembler',
        cost: 10,
        clicks: 1,
        upg: 0,
    },
    {
        name: 'T2 Assembler',
        cost: 100,
        clicks: 5,
        upg: 0,
    },
    {
        name: 'T3 Assembler',
        cost: 1_500,
        clicks: 50,
        upg: 0,
    },
    {
        name: 'T4 Assembler',
        cost: 100_000,
        clicks: 1_000,
        upg: 0,
    },
    {
        name: 'Starter base',
        cost: 50,
        amount: 1,
        upg: 0,
    },
    {
        name: 'Medium Base',
        cost: 2_000,
        amount: 50,
        upg: 0,
    },
    {
        name: 'Advanced base',
        cost: 1_000_000,
        amount: 1_000,
        upg: 0,
    },
    {
        name: 'T1 Effciency Module',
        cost: 10,
        modifier: 0.5,
        upg: 0,
    },
    {
        name: 'T2 Effciency Module',
        cost: 1_000,
        modifier: 5,
        upg: 0,
    },
    {
        name: 'T3 Effciency Module',
        cost: 100_000,
        modifier: 10,
        upg: 0,
    },
    {
        name: 'Rebirth',
        cost: 100_000_000,
        Soul: 10,
        upg: 0,
    },
];

/* createCard är en funktion som tar ett upgrade objekt som parameter och skapar
 * ett html kort för det.
 * För att skapa nya html element så används document.createElement(), elementen
 * sparas i en variabel så att vi kan manipulera dem ytterligare.
 * Vi kan lägga till klasser med classList.add() och text till elementet med
 * textcontent = 'värde'.
 * Sedan skapas en listener för kortet och i den hittar vi logiken för att köpa
 * en uppgradering.
 * Funktionen innehåller en del strängar och konkatenering av dessa, det kan göras
 * med +, variabel + 'text'
 * Sist så fäster vi kortets innehåll i kortet och returnerar elementet.
 * Läs mer:
 * https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
 * https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
 * https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
 */
function createCard(upgrade) {
    const card = document.createElement('div');
    card.classList.add('card');
    const header = document.createElement('p');
    header.classList.add('title');
    const cost = document.createElement('p');
    if (upgrade.amount) {
        header.textContent = `${upgrade.name}, +${upgrade.amount} per sekund.`;
    } else if (upgrade.clicks) {
        header.textContent = `${upgrade.name}, +${upgrade.clicks} per klick.`;
    } else if (upgrade.modifier) {
        header.textContent = `${upgrade.name}, +${upgrade.modifier}%.`
    } else {
        header.textContent = `${upgrade.name}, Start over from 0`
    }
    cost.textContent = `Köp för ${upgrade.cost} flasks.`;

    card.addEventListener('click', (e) => {
        if (money >= (Math.pow(1.5,upgrade.upg) * upgrade.cost)) {
            if (upgrade.Soul) {
                cilckBase = 1;
                secondBase = 0;
                souls += Math.round(money / 100_000_000);
                money = 0;
                multiplyer = 1;
                active = false;

                reset = document.querySelector('#upgradelist');

                reset.innerHTML = '';

                upgrades.forEach((upgrade) => {
                    upgrade.upg = 0;
                    upgradeList.appendChild(createCard(upgrade));
                });

            } else if (upgrade.modifier) {
                money -= (Math.pow(1.5,upgrade.upg) * upgrade.cost);
                upgrade.upg++;
                multiplyer += (upgrade.modifier / 100);
                cost.textContent = 'Köp för ' + (Math.pow(1.5,upgrade.upg) * upgrade.cost) + ' flasks';
            } else {
                money -= (Math.pow(1.5,upgrade.upg) * upgrade.cost);
                upgrade.upg++;
                cost.textContent = 'Köp för ' + (Math.pow(1.5,upgrade.upg) * upgrade.cost) + ' flasks';
                secondBase += upgrade.amount ? upgrade.amount : 0;
                cilckBase += upgrade.clicks ? upgrade.clicks : 0;
            }
            acquiredUpgrades++;

            message('Grattis du har köpt en uppgradering!', 'success');
        } else {
            message('Du har inte råd.', 'warning');
        }
    });

    card.appendChild(header);
    card.appendChild(cost);
    return card;
}

/* Message visar hur vi kan skapa ett html element och ta bort det.
 * appendChild används för att lägga till och removeChild för att ta bort.
 * Detta görs med en timer.
 * Läs mer:
 * https://developer.mozilla.org/en-US/docs/Web/API/Node/removeChild
 * https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout
 */
function message(text, type) {
    const p = document.createElement('p');
    p.classList.add(type);
    p.textContent = text;
    msgbox.appendChild(p);
    if (type === 'achievement') {
        audioAchievement.play();
    }
    setTimeout(() => {
        p.parentNode.removeChild(p);
    }, 2000);
}
