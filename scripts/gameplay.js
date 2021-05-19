MyGame.screens['game-play'] = (function(game, renderer, graphics, input, systems) {
    'use strict';

    let canvas = null;
    let context = null;
    let board = [];
    let scores = [];
    let particles = [];
    let currentPiece = null;
    let nextPiece = null;
    let linesCleared = 0;
    let score = 0;
    let currentLevel = 1;
    let timeCounter = 0;
    let cellSize = 0;
    let gameOver = false;

    let imgBackground = new Image();
    imgBackground.isReady = false;
    imgBackground.onload = function() {
        this.isReady = true;
    };
    imgBackground.src = 'assets/background.jpg';

    let music = new Audio();
    music.src = "assets/music.mp3"

    let clear = new Audio();
    clear.src = "assets/clear.wav"

    let drop = new Audio();
    drop.src = "assets/drop.wav"

    // Define a sample particle system to demonstrate its capabilities
    

    // renderer.ParticleSystem(particlesFire, graphics, 'assets/fire.png');

    let lastTimeStamp = performance.now();
    let cancelNextRequest = true;

    let myKeyboard = input.Keyboard();

    class BoardPiece {
        constructor(){
            this.color = "rgb(255, 255, 102)"
            this.isOccupied = false;
            this.isSet = false;
            this.simulating = false;
        }
    }

    class Tetrimino {
        constructor(){
            this.x = 5
            this.y = 9
            this.simY = this.y
            this. simX = this.x
            this.direction = {left:0, right:0, up:0, down:0}
            this.moveDown = this.moveDown.bind(this)
            this.hardDown = this.hardDown.bind(this)
            this.moveRight = this.moveRight.bind(this)
            this.moveLeft = this.moveLeft.bind(this)
            this.rotateClock = this.rotateClock.bind(this)
            this.rotateCounter = this.rotateCounter.bind(this)
            this.setPosition(this.x,this.y);
        }

        setPosition(x,y){
            let position = this.checkCollision(x,y)
            if(position != true){
                x = position.x
                y = position.y
                let positions = this.getPositions(x,y);
                for(var i = 0; i < positions.length; i++){
                    board[positions[i].x][positions[i].y].isOccupied = true;
                }
                this.x = x;
                this.y = y; 
            }
        }

        simulatePosition(x,y){
            let positions = this.checkPositions(this.getPositions(x,y));
            for(var i = 0; i < positions.length; i++){
                board[positions[i].x][positions[i].y].simulating = true;
            }
        }

        checkPositions(positions){
            for(var i = 0; i < positions.length; i++){
                if(positions[i].y < 0){
                    return this.checkPositions(this.getPositions(positions[0].x,positions[0].y+1))
                }
                if(positions[i].y > 9){
                    return this.checkPositions(this.getPositions(positions[0].x,positions[0].y-1))
                }
                if(positions[i].x < 0){
                    return this.checkPositions(this.getPositions(positions[0].x+1,positions[0].y))
                }
                if(positions[i].x > 10){
                    return this.checkPositions(this.getPositions(positions[0].x-1,positions[0].y))
                }
            }
            return positions
        }

        simMoveDown(){
            this.simY = this.simY-1
            if(this.simCollision(this.x,this.simY) == true){
                this.simY++;
                return false;
            } else {
                this.simulatePosition(this.x,this.simY);
            }
            return true;
        }

        
        simHardDown(x){
            this.simY = this.y;
            this.simX = x;
            while(this.simMoveDown() && this.simY-this.direction.down > 0){

            }
            if(this.simY-this.direction.down == 0){
                this.simMoveDown()
            }
            return{x:this.simX, y:this.simY}
        }

        simCollision(x,y){
            if(x+this.direction.right > 10){
                return this.simCollision(x-1,y);
            } else if(x-this.direction.left < 0){
                return this.simCollision(x+1,y);
            }
            if(y+this.direction.up > 9){
                return this.simCollision(x,y-1);
            } else if(y-this.direction.down < 0){
                if(y >= 0 && y-this.direction.down < -1){
                    this.simY++
                    return this.simCollision(x,y+1);
                }
                this.simY++
                this.simulatePosition(x,y+1)
                return {x:x,y:y+1};
            }

            //check to see if any positions collide with occupied spaces
            let positions = this.getPositions(x,y);
            for(var i = 0; i < positions.length; i++){
                let current = positions[i];
                if(board[current.x][current.y].isSet){
                    return true;
                }
            }

            //if no colisions then return 
            return {x:x, y:y}
        }

        moveDown(){
            this.y = this.y-1
            if(this.checkCollision(this.x,this.y) == true){
                this.y++;
                moveToNext()
                return false;
            } else {
                this.setPosition(this.x,this.y);
            }
            return true;
        }

        hardDown(){
            while(this.moveDown() && this.y-this.direction.down > 0){

            }
            if(this.y-this.direction.down == 0){
                this.moveDown()
            }
        }

        moveRight(){
            this.x = this.x+1
            if(this.checkCollision(this.x,this.y) == true){
                this.x--;
            }
            this.setPosition(this.x,this.y);
        }

        moveLeft(){
            this.x = this.x-1
            if(this.checkCollision(this.x,this.y) == true){
                this.x++;
            }
            this.setPosition(this.x,this.y);
        }

        rotateClock(){
            var temp = Object.assign({},this.direction);
            this.direction.up = temp.left
            this.direction.right = temp.up
            this.direction.down = temp.right
            this.direction.left = temp.down
            let position = this.checkCollision(this.x, this.y)
            this.setPosition(position.x,position.y)
        }

        
        rotateCounter(){
            var temp = Object.assign({},this.direction);
            this.direction.up = temp.right
            this.direction.left = temp.up
            this.direction.down = temp.left
            this.direction.right = temp.down
            let position = this.checkCollision(this.x, this.y)
            this.setPosition(position.x,position.y)
        }

        checkCollision(x,y){
            if(x+this.direction.right > 10){
                return this.checkCollision(x-1,y);
            } else if(x-this.direction.left < 0){
                return this.checkCollision(x+1,y);
            }
            if(y+this.direction.up > 9){
                return this.checkCollision(x,y-1);
            } else if(y-this.direction.down < 0){
                if(y >= 0 && y-this.direction.down < -1){
                    this.y++
                    return this.checkCollision(x,y+1);
                }
                this.y++
                moveToNext();
                return {x:x,y:y+1};
            }

            //check to see if any positions collide with occupied spaces
            let positions = this.getPositions(x,y);
            for(var i = 1; i < positions.length; i++){
                let current = positions[i];
                if(board[current.x][current.y].isSet){
                    return true;
                }
            }

            //if no colisions then return 
            return {x:x, y:y}
        }
    }

    class Line extends Tetrimino{
        constructor(){
            super();
            this.direction.left = 2
            this.direction.right = 1
            this.direction.up = 0
            this.direction.down = 0
        }

        getPositions(x,y){
            let positions = [];
            positions.push({x:x,y:y})
            for(var i = 1; i <= this.direction.left; i++){
                positions.push({x:x-i,y:y})
            }
            for(var i = 1; i <= this.direction.right; i++){
                positions.push({x:x+i,y:y})
            }
            for(var i = 1; i <= this.direction.up; i++){
                positions.push({x:x,y:y+i})
            }
            for(var i = 1; i <= this.direction.down; i++){
                positions.push({x:x,y:y-i})
            }
            return positions
        }
    }

    class T extends Tetrimino{
        constructor(){
            super();
            this.direction.left = 1
            this.direction.right = 1
            this.direction.up = 0
            this.direction.down = 1
        }

        getPositions(x,y){
            let positions = [];
            positions.push({x:x,y:y})
            for(var i = 1; i <= this.direction.left; i++){
                positions.push({x:x-i,y:y})
            }
            for(var i = 1; i <= this.direction.right; i++){
                positions.push({x:x+i,y:y})
            }
            for(var i = 1; i <= this.direction.up; i++){
                positions.push({x:x,y:y+i})
            }
            for(var i = 1; i <= this.direction.down; i++){
                positions.push({x:x,y:y-i})
            }
            return positions
        }
    }

    class L extends Tetrimino{
        constructor(){
            super();
            this.direction.left = 1
            this.direction.right = 1
            this.direction.up = 0
            this.direction.down = 1
        }

        getPositions(x,y){
            let positions = [];
            positions.push({x:x,y:y})
            if(this.direction.up == 0){
                positions.push({x:x+1,y:y})
                positions.push({x:x-1,y:y})
                positions.push({x:x-1,y:y-1})
            } else if(this.direction.left == 0){
                positions.push({x:x,y:y+1})
                positions.push({x:x,y:y-1})
                positions.push({x:x+1,y:y-1})
            } else if(this.direction.down == 0){
                positions.push({x:x+1,y:y})
                positions.push({x:x-1,y:y})
                positions.push({x:x+1,y:y+1})
            } else if(this.direction.right == 0){
                positions.push({x:x,y:y+1})
                positions.push({x:x,y:y-1})
                positions.push({x:x-1,y:y+1})
            }
            return positions
        }
    }

    class J extends Tetrimino{
        constructor(){
            super();
            this.direction.left = 1
            this.direction.right = 1
            this.direction.up = 0
            this.direction.down = 1
        }

        getPositions(x,y){
            let positions = [];
            positions.push({x:x,y:y})
            if(this.direction.up == 0){
                positions.push({x:x+1,y:y})
                positions.push({x:x-1,y:y})
                positions.push({x:x+1,y:y-1})
            } else if(this.direction.left == 0){
                positions.push({x:x,y:y+1})
                positions.push({x:x,y:y-1})
                positions.push({x:x+1,y:y+1})
            } else if(this.direction.down == 0){
                positions.push({x:x+1,y:y})
                positions.push({x:x-1,y:y})
                positions.push({x:x-1,y:y+1})
            } else if(this.direction.right == 0){
                positions.push({x:x,y:y+1})
                positions.push({x:x,y:y-1})
                positions.push({x:x-1,y:y-1})
            }
            return positions
        }
    }

    class Square extends Tetrimino{
        constructor(){
            super();
            this.direction.right = 1
            this.direction.down = 1
        }

        getPositions(x,y){
            let positions = [];
            positions.push({x:x,y:y})
            positions.push({x:x+1,y:y})
            positions.push({x:x,y:y-1})
            positions.push({x:x+1,y:y-1})
            
            return positions
        }

        rotateClock(){

        }

        rotateCounter(){

        }
    }

    class S extends Tetrimino{
        constructor(){
            super();
            this.direction.left = 1
            this.direction.up = 0
            this.direction.down = 1
            this.direction.right = 1
        }

        getPositions(x,y){
            let positions = [];
            positions.push({x:x,y:y})
            if(this.direction.up == 0){
                positions.push({x:x+1,y:y})
                positions.push({x:x,y:y-1})
                positions.push({x:x-1,y:y-1})
            } else if(this.direction.left == 0){
                positions.push({x:x+1,y:y})
                positions.push({x:x+1,y:y-1})
                positions.push({x:x,y:y+1})
            }
            return positions
        }

        rotateClock(){
            if(this.direction.up == 0){
                this.direction.up = 1
                this.direction.left = 0
            } else {
                this.direction.up = 0
                this.direction.left = 1
            }
            let position = this.checkCollision(this.x, this.y)
            this.setPosition(position.x,position.y)
        }

        rotateCounter(){
            this.rotateClock();
        }
    }

    class Z extends Tetrimino{
        constructor(){
            super();
            this.direction.left = 1
            this.direction.right = 1
            this.direction.up = 0
            this.direction.down = 1
        }

        getPositions(x,y){
            let positions = [];
            positions.push({x:x,y:y})
            if(this.direction.up == 0){
                positions.push({x:x-1,y:y})
                positions.push({x:x,y:y-1})
                positions.push({x:x+1,y:y-1})
            } else if(this.direction.left == 0){
                positions.push({x:x,y:y-1})
                positions.push({x:x+1,y:y})
                positions.push({x:x+1,y:y+1})
            }
            return positions
        }

        rotateClock(){
            if(this.direction.up == 0){
                this.direction.up = 1
                this.direction.left = 0
            } else {
                this.direction.up = 0
                this.direction.left = 1
            }
            let position = this.checkCollision(this.x, this.y)
            this.setPosition(position.x,position.y)
        }

        rotateCounter(){
            this.rotateClock();
        }
    }

    class Particles{
        constructor(xCell, yCell){
            this.particles = systems.ParticleSystem({
                center: { x: (cellSize*(xCell+1)), y: canvas.height-(yCell*cellSize) },
                size: { mean: 10, stdev: 4 },
                speed: { mean: 150, stdev: 50 },
                lifetime: { mean: 1, stdev: 1 }
                },graphics)
            this.renderer = renderer.ParticleSystem(this.particles, graphics, 'assets/fire.png')
            this.lifeTime = 500;
        }

        refresh(elapsedTime){
            this.lifeTime -= elapsedTime
            this.particles.update(elapsedTime)

            if(this.lifeTime < 0){
                return true
            } else {
                return false;
            }
        }
    }

    function attractMode(){
        sampleMoves();
    }

    function sampleMoves(){
        //check value of all possible moves
        var best = -100000;
        let bestX = 0;
        var bestRot = 0;
        let current = 0
        
        for(var i = 0; i < board[i].length; i++){
            for(var j = 0; j < 4; j++){
                currentPiece.rotateClock();
                if(i+currentPiece.direction.right < board[i].length || i-currentPiece.direction.left > 0){
                    current = heuristic(currentPiece.simHardDown(i));
                    // console.log(i +": " + current)
                } else {
                    current = -1000
                }
                if(current > best){
                    // console.log(i +": " + current)
                    best = current
                    bestX = i
                    bestRot = j
                }
            }
        }
        clearSim();

        console.log(best + " at x=" + bestX)

        for(var i = 0; i < bestRot; i++){
            currentPiece.rotateClock();
        }
        
        //execute best move
        var counter = 0;
        while(bestX != currentPiece.x){
            if(bestX > currentPiece.x){
                currentPiece.moveRight();
            } else {
                currentPiece.moveLeft()
            }
            counter++;
            if(counter > 15){
                break;
            } 
        }
        currentPiece.hardDown();
    }

    function heuristic(location){
        clearSim();
        currentPiece.simulatePosition(location.x, location.y)

        var aggregateHeight = 0;
        for(var i = 0; i < board.length; i++){
            aggregateHeight += getHeight(i);
        }

        var aggregateHoles = 0;
        for(var i = 0; i < board.length; i++){
            aggregateHoles += findHoles(i);
        }

        var bumpiness = 0;
        var last = getHeight(0)
        for(var i = 1; i < board.length; i++){
            var current = getHeight(i)
            bumpiness += Math.abs(last-current)
            last = current;
        }

        var linesCleared = findClearedLines();
        
        aggregateHeight = aggregateHeight*1.510066;
        linesCleared = linesCleared*-400;
        aggregateHoles = aggregateHoles*.635663;
        bumpiness = bumpiness*.84483
        return aggregateHeight+linesCleared+aggregateHoles+bumpiness
    }

    function getHeight(rowNumber){
        for(var i = board[rowNumber].length-1; i >= 0; i--){
            if(board[rowNumber][i].isSet || board[rowNumber][i].simulating){
                return i;
            }
        }
        return 0;
    }

    function findHoles(rowNumber){
        var top = 0;
        var holes = 0;
        for(var i = board[rowNumber].length-1; i >= 0; i--){
            if(top == 0 && (board[rowNumber][i].isSet || board[rowNumber][i].simulating)){
                top = i;
            } else if(top != 0 && (!board[rowNumber][i].isSet && !board[rowNumber][i].simulating)){
                holes++
            }
        }
        return holes;
    }

    function findClearedLines(){
        var clearedLine = null;
        var numOfLine = 0;
        for(var i = 0; i < board[i].length; i++){
            var cleared = true;

            //check if all of line is set
            for(var j = 0; j < board.length; j++){
                if(!board[j][i].isSet && !board[j][i].simulating){
                    cleared = false;
                    clearedLine = i;
                    break;
                }
            }

            if(cleared){
                numOfLine++;
                console.log("opportunity")
            }
        }
        return numOfLine;
    }

    function processInput(elapsedTime) {
        myKeyboard.update(elapsedTime);
    }

    function update(elapsedTime) {
        timeCounter += elapsedTime
        let timer = 1000/currentLevel
        for(var i = 0; i <particles.length; i++){
            if(particles[i].refresh(elapsedTime)){
                particles.splice(i,1)
            }
        }
        while(timeCounter > timer){
            currentPiece.moveDown();
            timeCounter -= timer;
        }
    }

    function render() {
        graphics.clear();
        if (imgBackground.isReady) {
            context.drawImage(imgBackground,0,0, canvas.width, canvas.height);
        }
        displayBoard();
        renderSidebar();
        for(var i = 0; i <particles.length; i++){
            particles[i].renderer.render()
        }

        if(gameOver){
            showEndGame();
        }
    }

    function renderSidebar(){
        let sidebarSize = canvas.width*.25;
        let cellSize = sidebarSize/7;
        context.fillStyle = "gray"
        context.fillRect(canvas.width-sidebarSize,0,sidebarSize,canvas.height);
        displayNextPiece(sidebarSize, cellSize);
        displayStatus(cellSize, sidebarSize)
    }

    function displayNextPiece(sidebarSize, cellSize){
        context.font = '30px serif';
        context.fillStyle = "white"
        context.fillText("Next Piece", canvas.width-(3*sidebarSize/4), 90)
        //create display
        let showNext = []

        for(var i = 0; i < 5; i++){
            showNext.push([])
        }
        for(var i = 0; i < showNext.length; i++){
            for(var j = 0; j < 4; j++){
                showNext[i].push(new BoardPiece());
            }
        }

        //add piece to display
        let positions = nextPiece.getPositions(2,2);
        for(var i = 0; i < positions.length; i++){
            showNext[positions[i].x][3-positions[i].y].isOccupied = true;
        }

        //display board
        for(var i = 0; i < showNext.length; i++){
            for(var j = 0; j < showNext[i].length; j++){
                if(showNext[i][j].isOccupied){
                    context.fillStyle = "red"
                } else {
                    context.fillStyle = "black"
                }
                context.fillRect((canvas.width-sidebarSize)+ (i+1)*cellSize, 100+(j*cellSize), cellSize-3, cellSize-3);
            }
        }
    }

    function displayStatus(cellSize, sidebarSize){
        let half = canvas.height/2
        context.font = '30px serif';
        context.fillStyle = "white"
        context.fillText("Score: " + score, canvas.width-(4*sidebarSize/5), half)
        context.fillText("Level: " + currentLevel, canvas.width-(4*sidebarSize/5), half+50)
        context.fillText("Lines Cleared: " + linesCleared, canvas.width-(4*sidebarSize/5), half+100)
    }

    function gameLoop(time) {
        let elapsedTime = time - lastTimeStamp;
        lastTimeStamp = time;

        processInput(elapsedTime);
        update(elapsedTime);
        render();

        if (!cancelNextRequest) {
            requestAnimationFrame(gameLoop);
        }
    }

    function initialize() {
        canvas = document.getElementById('id-canvas');
        context = canvas.getContext('2d');
        createBoard();
        currentPiece = generateNextPiece();

        initializeControls();
        newGame();

        // attractMode();
    }

    function initializeControls(){
        if(localStorage.getItem('controls') == "" || localStorage.getItem('controls') == null){
            console.log("No controls detected, initializing")
            window.localStorage.setItem('controls', JSON.stringify({"keys":{},"handlers":[{"key":"ArrowUp","name":"hard"},{"key":"ArrowDown","name":"down"},{"key":"ArrowLeft","name":"left"},{"key":"ArrowRight","name":"right"},{"key":"Home","name":"counter"},{"key":"PageUp","name":"clock"},{"key":"Escape","name":"escape"}]}))
        }

        let handlers = JSON.parse(localStorage.getItem('controls'))
        handlers = handlers.handlers
        myKeyboard.register(handlers[0].key, currentPiece.hardDown, "hard");
        myKeyboard.register(handlers[1].key, currentPiece.moveDown, "down");
        myKeyboard.register(handlers[2].key, currentPiece.moveLeft, "left");
        myKeyboard.register(handlers[3].key, currentPiece.moveRight, "right");
        myKeyboard.register(handlers[4].key, currentPiece.rotateCounter, "counter");
        myKeyboard.register(handlers[5].key, currentPiece.rotateClock, "clock");
        myKeyboard.register(handlers[6].key, function() {
            // Stop the game loop by canceling the request for the next animation frame
            cancelNextRequest = true;
            // Then, return to the main menu
            game.showScreen('main-menu');
            music.pause();
        }, "escape");

        console.log(handlers)
    }

    function clearStorage(){
        localStorage.clear()
        console.log(localStorage.getItem('controls'))
    }



    function newGame(){
        scaleCanvas();
        board = [];
        particles = []
        createBoard();
        currentPiece = generateNextPiece();
        nextPiece = generateNextPiece();
        linesCleared = 0;
        score = 0;
        currentLevel = 1;
        timeCounter = 0;
        gameOver = false;
        
        updateControls();
    }

    function generateNextPiece(){
        let piece = Math.floor(Math.random()*7)
        switch(piece){
            case 0:
                return new Line();
                break;
            case 1:
                return new Square();
                break;
            case 2:
                return new T();
                break;
            case 3:
                return new J();
                break;
            case 4:
                return new L();
                break;
            case 5:
                return new S();
                break;
            case 6:
                return new Z();
                break;
            default:
                console.log("piece not recognized")
                break;
        }
    }

    function moveToNext(){
        //set all current pieces in place
        let positions = currentPiece.getPositions(currentPiece.x,currentPiece.y)
        particles = []
        for(var i = 0; i < positions.length; i++){
            let current = positions[i];
            board[current.x][current.y].isSet = true;

            //add particles
            particles.push(
                new Particles(current.x, current.y)
            )
            particles.push(
                new Particles(current.x+1, current.y+1)
            )
        }

        checkForLineClear();

        //check if pieces are set in spawn area
        positions = nextPiece.getPositions(5,9)
        for(var i = 0; i <positions.length; i++){
            if(board[positions[i].x][positions[i].y].isSet){
                console.log("lost")
                showEndGame();
                scores.push(score);
                cancelNextRequest = true;
                break;
            }
        }
        currentPiece = nextPiece;
        nextPiece = generateNextPiece();
        
        updateControls();
        drop.play()
    }

    function updateControls(){
        myKeyboard.updateFunction("hard", currentPiece.hardDown)
        myKeyboard.updateFunction("down", currentPiece.moveDown)
        myKeyboard.updateFunction("left", currentPiece.moveLeft)
        myKeyboard.updateFunction("right", currentPiece.moveRight)
        myKeyboard.updateFunction("counter", currentPiece.rotateCounter)
        myKeyboard.updateFunction("clock", currentPiece.rotateClock)
    }

    function showEndGame(){
        gameOver = true;
        context.font = '50px serif';
        context.fillStyle = "white"
        context.fillText("Game Ended", canvas.width/3, canvas.height/2)
        context.fillText("Final Score: " + score, canvas.width/3, (canvas.height/2)+100)
    }

    function clearBoard(){
        for(var i =0; i < board[0].length; i++){
            for(var j = 0; j < board.length; j++){
                board[j][i].isOccupied = false;
            }
        }
        
        let positions = currentPiece.getPositions(currentPiece.x,currentPiece.y);
        for(var i = 0; i < positions.length; i++){
            let current = positions[i];
            // console.log(current)
            board[current.x][current.y].isOccupied = true;
        }
    }

    function clearSim(){
        for(var i =0; i < board[0].length; i++){
            for(var j = 0; j < board.length; j++){
                board[j][i].simulating = false;
            }
        }
    }

    function checkForLineClear(){
        var clearedLine = null;
        var numOfLine = 0;
        for(var i = 0; i < board[i].length; i++){
            var cleared = true;

            //check if all of line is set
            for(var j = 0; j < board.length; j++){
                if(!board[j][i].isSet){
                    cleared = false;
                    clearedLine = i;
                    break;
                }
            }

            if(cleared){
                linesCleared++;
                currentLevel = Math.floor(linesCleared/10)+1
                numOfLine++;
                //clear line
                for(var j = 0; j < board.length; j++){
                    board[j][i].isSet = false
                    particles.push(new Particles(j,i))
                    particles.push(new Particles(j+1,i+1))
                }

                //drop all lines above by 1
                for(var k = i+1; k < board[k].length; k++){
                    for(var j = 0; j < board.length; j++){
                        if(board[j][k].isSet){
                            board[j][k].isSet = false;
                            board[j][k-1].isSet = true;
                        }
                    }
                }
                i--;
                increaseScore(numOfLine);
                clear.play()
            }
        }
    }

    function increaseScore(numOfLine){
        let points = 0;
        switch(numOfLine){
            case 1:
                points = 40;
                break;
            case 2:
                points = 100;
                break;
            case 3:
                points = 300;
                break;
            case 4:
                points = 1200;
                break;
            default:
                points = 0;
                console.log("That wasnt a valid number of lines")
                break;
        }

        score += (currentLevel+1)*points;
    }

    function createBoard(){
        for(var i = 0; i < 11; i++){
            board.push([]);
        }

        for(var i = 0; i < board.length; i++){
            for(var j = 0; j < 10; j++){
                board[i].push(new BoardPiece());
            }
        }

        currentPiece = generateNextPiece();
        nextPiece = generateNextPiece();
    }

    function displayBoard(){
        clearBoard()
        //calculate cell size
        cellSize = (canvas.width*.75)/13
        if(cellSize*board[0].length > canvas.height){
            cellSize = (canvas.height/board[0].length)-1
        }

        for(var i = 0; i < board.length; i++){
            for(var j = 0; j < board[i].length; j++){
                if(board[i][j].isOccupied){
                    context.fillStyle = "red"
                } else {
                    context.fillStyle = "rgba(0, 0, 200, 0)"
                }
                if(board[i][j].isSet){
                    context.fillStyle = "gray"
                } else if(board[i][j].simulating){
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
        music.play();
        newGame();
        requestAnimationFrame(gameLoop);
    }

    function clearScores(){
        scores = [];
    }

    return {
        initialize : initialize,
        run : run,
        clear: clearScores,
        scores: scores,
        controls: myKeyboard,
    };

}(MyGame.game, MyGame.render, MyGame.graphics, MyGame.input, MyGame.systems));