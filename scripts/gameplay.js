MyGame.screens['game-play'] = (function(game, renderer, graphics, input) {
    'use strict';

    let canvas = null;
    let context = null;
    let board = [];
    let currentPiece = null;
    let nextPiece = null;

    let imgBackground = new Image();
    imgBackground.isReady = false;
    imgBackground.onload = function() {
        this.isReady = true;
    };
    imgBackground.src = 'assets/background.jpg';

    let lastTimeStamp = performance.now();
    let cancelNextRequest = true;

    let myKeyboard = input.Keyboard();

    class BoardPiece {
        constructor(){
            this.color = "rgb(255, 255, 102)"
            this.isOccupied = false;
        }
    }

    class Tetrimino {
        constructor(){
            this.x = 5
            this.y = 9
            this.angle = 0;
            this.setPosition(this.x,this.y);
        }

        setPosition(x,y){
            console.log(this.up)
            if(y+this.up > 9){
                this.setPosition(x,y-1);
                return;
            } else if(y-this.down < 0){
                this.setPosition(x,y+1);
                moveToNext();
                return;
            }
            if(x+this.right > 10){
                //wall kick
                this.setPosition(x-1,y);
                return;
            } else if(x-this.left < 0){
                //wall kick
                this.setPosition(x+1,y);
                return;
            } else {
                let positions = this.getPositions(x,y);
                for(var i = 0; i < positions.length; i++){
                    board[positions[i].x][positions[i].y].isOccupied = true;
                }
            }
            this.x = x;
            this.y = y;   
        }

        moveDown(){
            this.deleteCurrentPosition();
            this.y = this.y-1
            this.setPosition(this.x,this.y);
        }

        moveRight(){
            this.deleteCurrentPosition();
            this.x = this.x+1
            this.setPosition(this.x,this.y);
        }

        moveLeft(){
            this.deleteCurrentPosition();
            this.x = this.x-1
            this.setPosition(this.x,this.y);
        }

        checkCollision(){
            
        }
    }

    class Line extends Tetrimino{
        constructor(){
            super();
            this.left = 2
            this.right = 2
            this.up = 0
            this.down = 0
            this.moveDown = this.moveDown.bind(this)
            this.moveRight = this.moveRight.bind(this)
            this.moveLeft = this.moveLeft.bind(this)
            this.rotateClock = this.rotateClock.bind(this)
            this.rotateCounter = this.rotateCounter.bind(this)
        }

        deleteCurrentPosition(){
            board[this.x][this.y].isOccupied = false;
            if(this.angle == 0 || this.angle == 180){
                board[this.x+1][this.y].isOccupied = false;
                board[this.x+2][this.y].isOccupied = false;
                board[this.x-1][this.y].isOccupied = false;
                board[this.x-2][this.y].isOccupied = false;
            } else {
                board[this.x][this.y+1].isOccupied = false;
                board[this.x][this.y+2].isOccupied = false;
                board[this.x][this.y-1].isOccupied = false;
                board[this.x][this.y-2].isOccupied = false;
            }            
        }

        getPositions(x,y){
            let positions = [];
            positions.push({x:x,y:y})
            board[x][y].isOccupied = true;
            if(this.angle == 0 || this.angle == 180){
                //set new positions
                positions.push({x:x+1,y:y})
                positions.push({x:x+2,y:y})
                positions.push({x:x-1,y:y})
                positions.push({x:x-2,y:y})
            } else {
                //set new positions
                positions.push({x:x,y:y+1})
                positions.push({x:x,y:y+2})
                positions.push({x:x,y:y-1})
                positions.push({x:x,y:y-2})
            }
            return positions
        }

        rotateClock(){
            this.deleteCurrentPosition();
            this.angle += 90;
            this.angle = this.angle%360;
            if(this.left == 2){
                this.left = 0;
                this.right = 0;
                this.up = 2;
                this.down = 2
            } else {
                this.left = 2;
                this.right = 2;
                this.up = 0;
                this.down = 0
            }
            this.setPosition(this.x,this.y)
        }

        
        rotateCounter(){
            this.deleteCurrentPosition();
            this.angle -= 90;
            if(this.angle < 0){
                this.angle = 270;
            }
            if(this.left == 2){
                this.left = 0;
                this.right = 0;
                this.up = 2;
                this.down = 2                
            } else {
                this.left = 2;
                this.right = 2;
                this.up = 0;
                this.down = 0
            }
            this.setPosition(this.x,this.y)
        }
    }

    function processInput(elapsedTime) {
        myKeyboard.update(elapsedTime);
    }

    function update() {
        
    }

    function render() {
        graphics.clear();
        if (imgBackground.isReady) {
            context.drawImage(imgBackground,0,0, canvas.width, canvas.height);
        }
        displayBoard();
        renderSidebar();
        // renderer.Logo.render(myLogo);
        // renderer.Text.render(myText);
    }

    function renderSidebar(){
        let sidebarSize = canvas.width*.25;
        context.beginPath();
        context.fillStyle = "gray"
        context.fillRect(canvas.width-sidebarSize,0,sidebarSize,canvas.height);
    }

    function gameLoop(time) {
        let elapsedTime = time - lastTimeStamp;
        lastTimeStamp = time;

        processInput(elapsedTime);
        update();
        render();

        if (!cancelNextRequest) {
            requestAnimationFrame(gameLoop);
        }
    }

    function initialize() {
        canvas = document.getElementById('id-canvas');
        context = canvas.getContext('2d');
        scaleCanvas();
        createBoard();

        myKeyboard.register('ArrowDown', currentPiece.moveDown);
        myKeyboard.register('ArrowLeft', currentPiece.moveLeft);
        myKeyboard.register('ArrowRight', currentPiece.moveRight);
        myKeyboard.register('Home', currentPiece.rotateCounter);
        myKeyboard.register('PageUp', currentPiece.rotateClock);
        myKeyboard.register('Escape', function() {
            // Stop the game loop by canceling the request for the next animation frame
            cancelNextRequest = true;
            // Then, return to the main menu
            game.showScreen('main-menu');
        });
    }

    function generateNextPiece(){
        return new Line();
    }

    function moveToNext(){
        currentPiece = nextPiece;
        nextPiece = generateNextPiece();
        myKeyboard.register('ArrowDown', currentPiece.moveDown);
        myKeyboard.register('ArrowLeft', currentPiece.moveLeft);
        myKeyboard.register('ArrowRight', currentPiece.moveRight);
        myKeyboard.register('Home', currentPiece.rotateCounter);
        myKeyboard.register('PageUp', currentPiece.rotateClock);
    }

    function createBoard(){
        board = [
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
        ]

        for(var i = 0; i < board.length; i++){
            for(var j = 0; j < 10; j++){
                board[i].push(new BoardPiece());
            }
        }
        currentPiece = generateNextPiece();
        nextPiece = generateNextPiece();

    }

    function displayBoard(){
        //calculate cell size
        var cellSize = (canvas.width*.75)/13
        if(cellSize*board[0].length > canvas.height){
            cellSize = (canvas.height/board[0].length)-1
        }

        for(var i = 0; i < board.length; i++){
            for(var j = 0; j < board[i].length; j++){
                if(board[i][j].isOccupied){
                    context.fillStyle = "red"
                } else {
                    context.fillStyle = "rgba(0, 0, 200, 0)"
                    context.fillStyle = "blue"
                }
                context.fillRect((i*cellSize)+cellSize, canvas.height-((j+1)*cellSize), cellSize-3, cellSize-3);
            }
        }
        context.beginPath();
        context.lineWidth = "5";
        context.strokeStyle = "white";
        context.moveTo(cellSize, canvas.height-(board[i]/length)*cellSize)
        context.lineTo(cellSize,canvas.height);
        context.lineTo(cellSize*(board.length+1),canvas.height);
        context.lineTo(cellSize*(board.length+1),canvas.height-(board[0].length)*cellSize);
        context.lineTo(cellSize,canvas.height-(board[0].length)*cellSize);
        context.closePath();

        context.stroke();
    }

    function scaleCanvas(){
        canvas.height = window.innerHeight * .96;
        canvas.width = window.innerWidth * .98;
    }

    function run() {
        lastTimeStamp = performance.now();
        cancelNextRequest = false;
        requestAnimationFrame(gameLoop);
    }

    return {
        initialize : initialize,
        run : run
    };

}(MyGame.game, MyGame.render, MyGame.graphics, MyGame.input));