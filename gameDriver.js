import { Player, createGameboard, Ship } from "./game.js"; 

const GameManager = (() => {
    let player1, player2;
    let direction = 'horizontal'; // Default direction

    function deployFleet(player, ship) {
        let row, col;
        do {
            direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';
            [row, col] = player.getRandomCoordinates();
        } while (!player.getGameBoard().placeShip(ship, row, col, direction));
    }

    function placeShip(ship, x, y, direction) {
        return player1.getGameBoard().placeShip(ship, x, y, direction);
    }

    function removePlaceShipDisplay() {
        const inputBox = document.getElementById('input-box');
        if (inputBox) inputBox.remove();
    }

    function placeShipDisplay() {
        const body = document.querySelector('body');
        const inputBox = document.createElement('div');
        inputBox.id = 'input-box';
        body.appendChild(inputBox);

        const horizontalButton = document.createElement('button');
        horizontalButton.id = 'horizontal';
        horizontalButton.textContent = 'Horizontal';
        const verticalButton = document.createElement('button');
        verticalButton.id = 'vertical';
        verticalButton.textContent = 'Vertical';
        const messageDiv=document.createElement('div');
        messageDiv.textContent ='the one on the left side is your board. place the ships before starting to attack!';

        inputBox.append(horizontalButton, verticalButton,messageDiv);

        horizontalButton.addEventListener('click', () => {
            direction = 'horizontal';
            horizontalButton.style.backgroundColor = 'green';
            verticalButton.style.backgroundColor = '';
        });

        verticalButton.addEventListener('click', () => {
            direction = 'vertical';
            verticalButton.style.backgroundColor = 'green';
            horizontalButton.style.backgroundColor = '';
        });
    }

    function initGame() {
        player1 = new Player('You');
        player2 = new Player('Computer', true);

        // Deploy computer's fleet
        const computerFleet = createFleet();
        for (let ship of computerFleet) {
            deployFleet(player2, ship);
        }

        // Display ship placement UI for player
        placeShipDisplay();

        const playerBoard = document.querySelector('#player1-board');
        const humanFleet = createFleet();

        let currentShipIndex = 0;

        playerBoard.addEventListener('click', (e) => {
            if (currentShipIndex >= humanFleet.length) return;

            const cell = e.target;
            const row = parseInt(cell.dataset.row, 10);
            const col = parseInt(cell.dataset.col, 10);

            const ship = humanFleet[currentShipIndex];
            if (placeShip(ship, row, col, direction)) {
                currentShipIndex++;
                if (currentShipIndex === humanFleet.length) {
                    removePlaceShipDisplay();
                }
                renderGameboards();
            } else {
                alert('Invalid placement. Try again.');
            }
        });

        renderGameboards();
        addAttackListeners();
    }

    function createFleet() {
        return [
            new Ship(1),
            new Ship(2),
            new Ship(3),
            new Ship(4),
            new Ship(5),
        ];
    }

    function renderGameboards() {
        const player1Board = document.getElementById('player1-board');
        const player2Board = document.getElementById('player2-board');

        player1Board.innerHTML = renderBoard(player1.getGameBoard().getBoard());
        player2Board.innerHTML = renderBoard(player2.getGameBoard().getBoard(), true);
    }

    function renderBoard(board, hideShips = false) {
        return board.split('\n')
            .map((row, rowIndex) =>
                row.split(' ')
                    .map((cell, colIndex) =>
                        `<div class="cell" data-row="${rowIndex}" data-col="${colIndex}">
                            ${hideShips && cell === 'S' ? 'O' : cell}
                        </div>`
                    )
                    .join('')
            )
            .join('');
    }

    function addAttackListeners() {
        const player2Board = document.getElementById('player2-board');
        player2Board.addEventListener('click', handleAttack);
    }

    function handleAttack(e) {
        const cell = e.target;
        if (!cell.classList.contains('cell')) return;

        const row = parseInt(cell.dataset.row, 10);
        const col = parseInt(cell.dataset.col, 10);

        const attackResult = player1.attack(row, col, player2.getGameBoard());
        if (!attackResult) {
            alert('Invalid attack. Try again.');
            return;
        }

        updateCellState(cell, attackResult[1]);
        if (checkWinCondition()) return;

        computerAttack();
    }

    const body = document.querySelector('body');
    body.addEventListener('click',()=>{
        document.querySelectorAll('div').forEach(div => {
            if (div.textContent.trim() === 'S') {
                div.style.color = 'red';
                div.style.backgroundColor = '#ffb067';
            }
        });

    })

    function updateCellState(cell, state) {
        
        if (state === 'miss') {
            cell.style.backgroundColor = 'red';
            cell.textContent = '.';
        } else if(state==='hit'){
            cell.style.backgroundColor = 'green';
            cell.textContent = 'X';
        }
    }

    function computerAttack() {
        const [[row, col], status] = player2.attack(null, null, player1.getGameBoard());
        const cell = document.querySelector(`#player1-board [data-row="${row}"][data-col="${col}"]`);
        updateCellState(cell, status[1]);
        checkWinCondition();
    }

    function checkWinCondition() {
        if (player2.getGameBoard().allShipSunk()) {
            displayWinner(player1);
            return true;
        } else if (player1.getGameBoard().allShipSunk()) {
            displayWinner(player2);
            return true;
        }
        return false;
    }

    function displayWinner(winner) {
        const body = document.querySelector('body');
        const messageBox = document.createElement('div');
        messageBox.classList.add('message-box');
        messageBox.textContent = `${winner.name} wins!`;
        body.appendChild(messageBox);

        const resetButton = document.createElement('button');
        resetButton.textContent = 'New Game';
        resetButton.addEventListener('click', resetGame);
        messageBox.appendChild(resetButton);
    }

    function resetGame() {
        document.querySelector('body').style.backgroundColor = 'peachpuff';
        const messageBox = document.querySelector('.message-box');
        if (messageBox) messageBox.remove();
        const inputBox  = document.getElementById('input-box');
        if(inputBox) inputBox.remove();

        initGame();
    }

    return { initGame };
})();

export default GameManager;
