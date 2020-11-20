/*----- constants -----*/

const suits = ['h','d','s','c']

const values = ['02','03','04','05','06','07','08','09','10','J','Q','K','A'];

const chips = [5,10,20,50,100];


/*----- app's state (variables) -----*/
let pHand;

let pTotal;

let dealHand;

let dealTotal;

let currDeck = []; 

let pot = []; 

let cash = 1000;

let potTotal = 0;

let bustSum;

let countOnce = true;

/*----- cached element references -----*/

const dealerContainer = document.getElementById('dealer-container');

const dTotalEl = document.getElementById('dealer-total');

const hitFunc = document.getElementById("hit");

const stayFunc = document.getElementById("stay");

const playerContainer = document.getElementById('player-container');

const pTotalEl = document.getElementById('player-total');

const chipFunc = document.getElementById("chip-container");

const dealFunc = document.getElementById('deal');

const cashEl = document.getElementById('current-cash');

const potTotalEl = document.getElementById('pot-total')

const winEl = document.querySelector('p')

/*----- event listeners -----*/

dealFunc.addEventListener('click', init);

chipFunc.addEventListener('click', evalBet);

hitFunc.addEventListener('click', manageHit);

stayFunc.addEventListener('click', manageStay);

/*----- functions -----*/

init();

// start of the match
function dealHands() {
    while(pHand.length <= 1) {
        drawCard(pHand,pTotal,1);
    }
    while(dealHand.length <= 1) {
        drawCard(dealHand,dealTotal,0);
    }

}

//RNGJESUS
function drawCard(currentHand,currentTotal,active) {

    let randomDraw = Math.floor(Math.random() * currDeck.length);
    let card = currDeck[randomDraw];

    currentHand.push(card);
    currDeck.splice(randomDraw,1);

    updateHand(currentHand,currentTotal,active);

    render();
}


function updateHand(currentHand,currentTotal,active) {
    currentHand.forEach(function (ele) {
// adds or updates the value of the hand also evals ace and the face cards. Ace is either 1 or 11. AKA wild card
        let num = ele.slice(1,3);  

        if((num === 'K')||(num === 'Q')||(num === 'J')) {
            num = 10;
        }
        if(num === 'A') {
            if(currentTotal < 10) {
                num = 11;
            } else {
                num = 1;
            }
        }
        num = parseInt(num)
        currentTotal = num;  
    })

    //totals the sum of the bet

    if(active) {
        pTotal += currentTotal;
    }

    if( 0 === active ) {
        dealTotal += currentTotal;
        dealTotal += bustSum;
        bustSum = 0;
    }

    if(dealHand.length === 2 && countOnce) {
        dealTotal -= currentTotal;
        bustSum = currentTotal;
        countOnce = false;
    }
}

// Manages the betting, counting of the bet uses chips as a visual interface on the html as well as shifts total into pot
function evalBet(evt) {
    selectedChip = evt.target.id
    if('chip-container' === selectedChip) {
        return;
    }
    selectedChip = selectedChip.slice(2,5);
    selectedChip = parseInt(selectedChip);
    if(cash < selectedChip) return;
    
    cash -= selectedChip;
    pot.push(selectedChip);
    countPot();
    render();
}

function countPot() {
    potTotal = pot.reduce((acc,ele) => acc + ele)
}


function renderWinCond(cond) {

    if(cond === 0) {
        winEl.textContent = 'Boom You Lose!';
    }
    if(cond === 1) {
        winEl.textContent = "You Win!";
    }
    if(cond === -1) {
        winEl.textContent = "";
    }
    if(cond === 2) {
        winEl.textContent = "Tie...";
    }
}

function manageHit() {

    drawCard(pHand,pTotal, 1);

    if(pTotal > 21) {
        whoWon();
    }
    renderDisableBetting(0);

}
//manages the stay button and hides it when match is over to show DEAL
function manageStay() {

    dealerTurn();
    whoWon();
    renderDisableBetting(0);
}

function dealerTurn() {
    while(pTotal >= dealTotal) {
        if (dealTotal >= 17) {
            break;
        }
        drawCard(dealHand,dealTotal, 0);
    }
}


function whoWon() {
    if(pTotal > 21) {
        renderWinCond(0);
    }
    
    if (dealTotal > 21) {
        renderWinCond(1);
        cash += (potTotal*2);
    }

    if((dealTotal < 21 && pTotal <= 21) && pTotal > dealTotal) {
        renderWinCond(1);
        cash += (potTotal*2);
    }
    if((dealTotal <= 21 && pTotal < 21) && dealTotal > pTotal) {
        renderWinCond(0);
    } 

    if(pTotal === 21 && dealTotal === 21) {
        renderWinCond(2);
        cash += potTotal;
    }
    renderDealHandButton(1);
    render();
}


function renderDealHandButton(cond) {
    if(cond === 0) {
        dealFunc.style.display = 'none'
        hitFunc.style.display = "block"
        stayFunc.style.display = "block"
    }
    if(cond === 1) {
        dealFunc.style.display = "block"
        hitFunc.style.display = "none"
        stayFunc.style.display = "none"
    }
}

//Renders the values in the middle of screen.

function renderValue() {
    dTotalEl.innerHTML = `<div id="dealer-total">${dealTotal}</div>`;
    pTotalEl.innerHTML = `<div id="player-total">${pTotal}</div>`;
    potTotalEl.innerHTML = `<div id="player-total">$${potTotal}</div>`;
    cashEl.innerHTML = `<div id="player-total">Cash : $${cash}</div>`;
}

//Prevents players from hitting the chips to bet more

function renderDisableBetting(cond){
    if(cond === 1) {
        chipFunc.style.pointerEvents = 'all';
    } else if (cond === 0) {
        chipFunc.style.pointerEvents = 'none' ;

    }
}

//RendersCards
function renderCards() {
    playerContainer.innerHTML = ` `;
    pHand.forEach(function(ele) {
        playerContainer.insertAdjacentHTML('afterbegin',`<div class="card ${ele}" align-content="flex-end"></div>`);
    })
    
    dealerContainer.innerHTML = ` `;
    dealHand.forEach(function(ele) {
        dealerContainer.insertAdjacentHTML('afterbegin',`<div class="card ${ele}" align-content="flex-end"></div>`);
    })

    if(dealHand.length === 2) {
        dealerContainer.innerHTML = ` `;
        dealerContainer.insertAdjacentHTML('afterbegin',`<div class="card back" align-content="flex-end"></div>`);
        dealerContainer.insertAdjacentHTML('afterbegin',`<div class="card ${dealHand[0]}" align-content="flex-end"></div>`);
    }        
}

// Cycles the cards and updates both player and dealer values

function render() {

   renderCards();

   renderValue();
}

//Creates new deck at beginning of game

function refreshDeck() {
    let suitIdx = 0;
    let rankIdx = 0;

    while (suitIdx<4) {
        rankIdx = 0;
        while(rankIdx<13) {
            currDeck.push(`${suits[suitIdx]}${values[rankIdx]}`);
            rankIdx += 1;
        }
        suitIdx += 1;
    }
}

// All the inits

function init() {
    pot = [];
    countOnce = true;
    bustSum = 0;
    potTotal = 0;
    pHand = [];
    pTotal = null;
    dealHand = [];
    dealTotal = null;
    renderWinCond(-1);
    renderDealHandButton(0);
    renderDisableBetting(1)
    refreshDeck();
    dealHands();
    render();
}


