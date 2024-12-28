class Ship{
    constructor(length){
        this.length=length;
        this.hitCount=0;
    }
    hit() {
        this.hitCount++;
    }
    isSunk(){
        return this.length-this.hitCount===0;
    }
}

function createGameboard(){
    let board = Array(10).fill().map(()=> Array(10).fill(null))
    const ships = [];
    const missedAttacks =[];
    const receivedAttacks =[];

    function hasBeenAttacked(x,y){
        return ( missedAttacks.some(attack=>attack[0]===x&&attack[1]===y) ||
                receivedAttacks.some(attack=>attack[0]===x&&attack[1]===y)) ;
    }

    function placeShip(ship,x,y,direction='horizontal'){
        if(direction==='horizontal'){
            if (y + ship.length > 10) {
                throw new Error('cannot place ship');
            }
            for(let i = 0;i<ship.length;i++){
                if(board[x][y+i]!==null){
                    throw new Error('cannot place ship')
                }
                board[x][y+i]=ship;
            }
        } else if(direction==='vertical'){
            if (x + ship.length > 10) {  // Ensure ship fits vertically
                throw new Error('ccannot place ship');
            }
            for(let i = 0;i<ship.length;i++){
                if(board[x+i][y]!==null)
                    throw new Error('cannot place ship');
                else board[x+i][y]=ship;
            }
        }
        ships.push(ship);
    }

    function receiveAttack(x,y){
        if(hasBeenAttacked(x,y))
            return false;
        if(board[x][y]!==null){
            board[x][y].hit();
            receivedAttacks.push([x,y]);
            return true;
        } else {
            missedAttacks.push([x,y]);
            return false;
        }
    }

    function allShipSunk(){
        return ships.every((ship)=>ship.isSunk());
    } //returns true if no ship is inserted, cus every method returns true for empty array

    function getBoard(){
        return board.map(row=> row.map(cell=>cell?'S':'O').join(' ')).join('\n');
    }
    return {placeShip,getBoard,receiveAttack,allShipSunk,missedAttacks,hasBeenAttacked}
}

function Player(name,isComputer=false){
    const gameboard = createGameboard();
    
    function getRandomCoordinates(){
        const x = Math.floor(Math.random()*10);
        const y = Math.floor(Math.random()*10);
        return [x,y];
    }

    const computerPlayerAttack = (opponentGameboard)=>{
        let coords;
        do {
            coords = getRandomCoordinates();
        } while (opponentGameboard.receiveAttack(coords[0],coords[1]))
    }
    const realPlayerAttack = (x,y,opponentGameboard)=>{
        return opponentGameboard.receiveAttack(x,y);
    }

    const attack = (x,y,opponentGameboard)=>{
        return isComputer
        ?computerPlayerAttack(opponentGameboard)
        :realPlayerAttack(x,y,opponentGameboard);
    };

    const getGameBoard = ()=> gameboard;

    return {attack,getGameBoard,isComputer,name}
};



export {Ship,createGameboard,Player}