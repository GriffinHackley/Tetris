MyGame.screens['game-play'] = (function(renderer, graphics, input, systems) {
    'use strict';

    let lastTimeStamp = performance.now();
    let cancelNextRequest = true;
    
    let canvas = null;
    let context = null;
    let upBuffer = {};
    let downBuffer = {};
    let allPoints = [];
    let points = [];
    let safeZones = [];
    let scores = [];
    var lastUpdate = 0;
    var maxVel = 7;
    var maxAccel = 1;
    var canRotate = true;
    var hasWon = false;
    var wonRound1 = false;
    var wonRound2 = false;
    var round1Ended = false;
    var round2Started = false;
    var round2Ended = false;
    var landingTime = 0;
    var startTime;
    var totalTime = 0;

    class Key{
        constructor(defaultKey){
            this.defaultKey = defaultKey
            this.currentKey = defaultKey
            this.isPressed = false;
            this.timePressed = 0;
            this.timeDown = 0;
        }

        equals(key){
            if(key == this.currentKey){
                return true;
            }
            return false;
        }
    }

    let controls = function(){
        return{
            thrust:new Key("ArrowUp"),
            rotateLeft:new Key("ArrowLeft"),
            rotateRight: new Key("ArrowRight"),
            escape: new Key("Escape")
        }
    }();

    let imgBackground = new Image();
    imgBackground.isReady = false;
    imgBackground.onload = function() {
        this.isReady = true;
    };
    imgBackground.src = 'assets/background.jpg';

    let thrustSound = new Audio();
    thrustSound.src = "assets/thruster.mp3"

    let crashSound = new Audio();
    crashSound.addEventListener("ended", function(){
        cancelNextRequest = true;
        MyGame.game.showScreen("main-menu")
    })
    crashSound.addEventListener("play", function(){
        maxAccel = 0;
        maxVel = 0;
        canRotate = false
        myCharacter.isCrashed = true;
        render();
        myCharacter.location.y = myCharacter.location.y-100
    })
    crashSound.src = "assets/explosion.mp3"

    let winSound = new Audio();
    winSound.src = "assets/win.mp3"

    let myCharacter = function(landerSource, flamesSource, location) {
        let lander = new Image();
        let flames = new Image();
        lander.isReady = false;
        flames.isReady = false
        lander.onload = function() {
            this.isReady = true;
        };
        flames.onload = function() {
            this.isReady = true;
        };
        lander.src = landerSource;
        flames.src = flamesSource;
        return {
            location: location,
            lander: lander,
            flames: flames,
            accel: {x:0, y:0},
            vel: {x:0, y:0},
            angle: 0,
            fuel: 200,
            isCrashed: false
        };
    }('assets/character.png', 'assets/flames.png',{x:50, y:50});

    function initialize() {
        canvas = document.getElementById('id-canvas');
        context = canvas.getContext('2d');
        scaleCanvas();

        cancelNextRequest = false;
    
        generateTerrain(2);
    
        window.addEventListener('keyup', function(event) {
            upBuffer[event.key] = event.key;
        });
        window.addEventListener('keydown', function(event) {
            downBuffer[event.key] = event.key;
        });
    
        requestAnimationFrame(gameLoop);
    }

    function resetGame(){
        myCharacter.location = {x:50,y:50}
        lastTimeStamp = performance.now();

        myCharacter.isCrashed = false;
        maxVel = 7;
        maxAccel = 1;
        canRotate = true;
        hasWon = false;
        wonRound1 = false;
        wonRound2 = false;
        round1Ended = false;
        round2Started = false;
        round2Ended = false;
        landingTime = 0;
        totalTime = 0;

        generateTerrain(2);
    }

    function mapThrust(key){
        controls.thrust.currentKey = key;
    }
    function mapLeft(key){
        controls.rotateLeft.currentKey = key;
    }
    function mapRight(key){
        controls.rotateRight.currentKey = key;
    }
    function mapEscape(key){
        controls.escape.currentKey = key;
    }
    
    function gameLoop() {
        var current = performance.now()
        update(current)
        processInput();
        render();
        if (!cancelNextRequest) {
            requestAnimationFrame(gameLoop);
        }
    }
    
    function getMovement(elapsedTime){
        var elapsed = elapsedTime/30
        let thrust = .03
        var moonGrav = .01
    
        myCharacter.accel.y += (moonGrav*elapsed)
    
        //get accel from thrusting
        if(controls.thrust.isPressed && myCharacter.fuel>0){
            myCharacter.accel.x += elapsed*thrust*Math.sin(myCharacter.angle)
            myCharacter.accel.y -= elapsed*thrust*Math.cos(myCharacter.angle)
        }
    
        if(canRotate){
            if(controls.rotateLeft.isPressed){
                myCharacter.angle -= elapsed * 2.5 * Math.PI/180
            }
            if(controls.rotateRight.isPressed){
                myCharacter.angle += elapsed * 2.5 * Math.PI/180
            }
            myCharacter.angle = myCharacter.angle%(Math.PI*2)
        }
        
        //get y values
        myCharacter.accel.y = myCharacter.accel.y*.99
        if(myCharacter.accel.y >= maxAccel){
            myCharacter.accel.y = maxAccel
        }
        if(myCharacter.accel.y <= -maxAccel){
            myCharacter.accel.y = -maxAccel
        }
    
    
        myCharacter.vel.y = (elapsed*myCharacter.accel.y)+myCharacter.vel.y
    
        if(myCharacter.vel.y >= maxVel){
            myCharacter.vel.y = maxVel
        }
        if(myCharacter.vel.y <= -maxVel){
            myCharacter.vel.y = -maxVel
        }
    
        myCharacter.location.y += (myCharacter.vel.y*elapsed)*.5
        
        if(myCharacter.location.y > canvas.height || myCharacter.location.y < 0){
            myCharacter.location.y = 0
        }
    
        //get x values
        myCharacter.accel.x = myCharacter.accel.x*.99
        if(myCharacter.accel.x >= maxAccel){
            myCharacter.accel.x = maxAccel
        }
        if(myCharacter.accel.x <= -maxAccel){
            myCharacter.accel.x = -maxAccel
        }
    
        myCharacter.vel.x = (elapsed*myCharacter.accel.x)+myCharacter.vel.x
    
        if(myCharacter.vel.x >= maxVel){
            myCharacter.vel.x = maxVel
        }
        if(myCharacter.vel.x <= -maxVel){
            myCharacter.vel.x = -maxVel
        }
    
        myCharacter.location.x += myCharacter.vel.x*elapsed*.5
        
        if(myCharacter.location.x > canvas.width || myCharacter.location.x < 0){
            myCharacter.location.x = 0
        }    
    }
    
    function getShipStatus(elapsedTime){
        var elapsed = elapsedTime/30
        if(controls.thrust.isPressed){
            myCharacter.fuel -= (elapsed*.6)
        }
    }
    
    function update(current){
        var elapsed = current-lastUpdate
        lastUpdate = current
        getMovement(elapsed)
        getShipStatus(elapsed)
        // particlesSmoke.update(elapsed);
        // particlesFire.update(elapsed);
        var status = detectCollision();
        if(status == "crashed"){
            crashSound.play()
            console.log("End Game")
        } else if(status == "safe"){
            displayWin()
            transition()
        }
    }
    
    function transition(){
        //ship cant move
        maxAccel = 0;
        maxVel = 0;
        canRotate = false
        if(!wonRound1){
            winSound.play()
            if(performance.now() - landingTime > 3000){
                generateTerrain(1)
                myCharacter.angle = 0;
                maxAccel = 1;
                maxVel = 7;
                canRotate = true;
                myCharacter.location = {x:50,y:50}
                wonRound1 = true;
                round2Started = true;
            } else {
                round1Ended = true;
            }
            
        } else if(!round2Ended && round2Started){
            if(performance.now() - landingTime > 3000){
                round2Ended = true;
            } else {
                wonRound2 = true;
                if(totalTime == 0){
                    totalTime = (performance.now()-startTime)/1000
                    scores.push(totalTime)
                }
            }
        }
    }
    
    function displayWin(){
        if(round1Ended && !round2Started){
            context.font = '100px serif';
            context.fillStyle = "white"
            context.fillText("You win this round", canvas.width/4, canvas.height/2);
        } else if(wonRound2){
            context.font = '100px serif';
            context.fillStyle = "white"
            context.fillText("You won the game", canvas.width/4, canvas.height/2);
        }
        
    }

    function createExplosion(){
        console.log("gbfhjidosaghouisadb")
    }
    
    function processInput() {
        for(input in downBuffer) {
            moveCharacter(downBuffer[input],"down");
        }
        for (input in upBuffer) {
            moveCharacter(upBuffer[input],"up");
        }
        upBuffer = {};
        downBuffer = {};
    }
    
    function render(){
        context.clearRect(0, 0, canvas.width, canvas.height);
        if (imgBackground.isReady) {
            context.drawImage(imgBackground,0,0, canvas.width, canvas.height);
        }
        renderTerrain()
        // renderSmoke.render();
        // renderFire.render();
        if(myCharacter.isCrashed){
            createExplosion()
        } else {
            renderCharacter(myCharacter)
        }
        renderStatus()
        displayWin()
    }
    
    function renderCharacter(character) {
        if(!myCharacter.isCrashed){
            let landerSize = .1*character.lander.width
            let flamesSize = .03*character.flames.width
            if (character.lander.isReady && character.flames.isReady) {
                context.save()
                context.translate(character.location.x, character.location.y)
            
                //rotate for lander
                context.rotate(character.angle)
                context.drawImage(character.lander,landerSize/-2,landerSize/-2,landerSize,landerSize);
            
                if(controls.thrust.isPressed && myCharacter.fuel > 0){
                    //rotate for flames
                    context.rotate((Math.PI/2))
                    context.translate(53,-3)
                    context.drawImage(character.flames,flamesSize/-2,flamesSize/-2,flamesSize,flamesSize);
                    thrustSound.play()
                } else {
                    if(!thrustSound.paused){
                        thrustSound.pause()
                    }
                }
                context.restore()
            }
        }
    }
    
    function renderStatus(){
        context.font = '30px serif';
    
        //display fuel
        if(myCharacter.fuel <= 0){
            myCharacter.fuel = 0
            context.fillStyle = "white"
        } else {
            context.fillStyle = "green"
        }
        context.fillText("Fuel: " + myCharacter.fuel.toFixed(2), canvas.width-200, 50)
    
        //display speed
        if(myCharacter.vel.y > 3.5){
            context.fillStyle = "white"
        } else {
            context.fillStyle = "green"
        }
        context.fillText("Speed: " + myCharacter.vel.y.toFixed(2), canvas.width-200, 80)
    
        //display angle
        var displayAng = myCharacter.angle*180/Math.PI
        if(displayAng < 0){
            displayAng = 360+displayAng
        }
        if((displayAng < 10 && displayAng >= 0) || (displayAng > 350 && displayAng <= 360)){
            context.fillStyle = "green"
        } else {
            context.fillStyle = "white"
        }
        context.fillText("Angle: " + displayAng.toFixed(2), canvas.width-200, 110)
    }
    
    function moveCharacter(key, type) {
        if(controls.escape.equals(key)){
            console.log(MyGame.game)
            cancelNextRequest = true;
            resetGame()
            MyGame.game.showScreen("main-menu")
        }
        if(type == "up"){
            if (controls.thrust.equals(key)) {
                controls.thrust.isPressed = false
                controls.thrust.timePressed = performance.now()-controls.thrust.timeDown
            }
            if (controls.rotateRight.equals(key)) {
                controls.rotateRight.isPressed = false
                controls.rotateRight.timePressed = performance.now()-controls.rotateRight.timeDown
            }
            if (controls.rotateLeft.equals(key)) {
                controls.rotateLeft.isPressed = false
                controls.rotateLeft.timePressed = performance.now()-controls.rotateLeft.timeDown
            }
        } else {
            if (controls.thrust.isPressed || controls.thrust.equals(key)) {
                controls.thrust.isPressed = true
                controls.thrust.timeDown = performance.now()
            }
            if (controls.rotateRight.isPressed ||controls.rotateRight.equals(key)) {
                controls.rotateRight.isPressed = true
                controls.rotateRight.timeDown = performance.now()
            }
            if (controls.rotateLeft.isPressed ||controls.rotateLeft.equals(key)) {
                controls.rotateLeft.isPressed = true
                controls.rotateLeft.timeDown = performance.now()
            }
        }
    }
    
    function detectCollision(){
        var status;
        var ship = {
            center: {
                x: myCharacter.location.x,
                y: myCharacter.location.y
            },
            radius: 35
        }
        context.beginPath();
        context.strokeStyle = 'rgb(255, 255, 255)';
        context.arc(ship.center.x, ship.center.y, ship.radius, 0, 2 * Math.PI);
        context.stroke();
        context.closePath();
    
    
        //determine what part of the terrain the ship is above
        var closest;
        var section;
        var zone;
        var isSafe = false;
        for(var i = 0; i < safeZones.length; i++){
            if(myCharacter.location.x > safeZones[safeZones.length-1].end.x){
                section  = safeZones.length
                closest = getClosestX(section)
                break;
            }
            if(myCharacter.location.x < safeZones[i].end.x && myCharacter.location.x > safeZones[i].start.x){
                isSafe = true;
                zone = i;
                break;
            }
            if(myCharacter.location.x < safeZones[i].start.x){
                closest = getClosestX(i);
                section = i;
                break;
            }
        }
    
        if(!isSafe){
            //determine which side of the point the ship is on
            if(!(closest+1 >= allPoints[section].length) && lineCircleIntersection(allPoints[section][closest], allPoints[section][closest+1], ship)){
                status = "crashed"
                // myCharacter.location.y = allPoints[section][closest].y-200;
            } 
            if(!(closest-1 < 0) && lineCircleIntersection(allPoints[section][closest], allPoints[section][closest-1], ship)){
                status = "crashed"
                // myCharacter.location.y = allPoints[section][closest].y-200;
            }
            var lowest;
            if(!(closest+1 >= allPoints[section].length) && allPoints[section][closest].y < allPoints[section][closest+1].y){
                lowest = allPoints[section][closest+1]
            } else {
                lowest = allPoints[section][closest]
            }
    
            if(!(closest-1 < 0) &&lowest.y < allPoints[section][closest-1].y){
                lowest = allPoints[section][closest-1]
            }
    
            if(myCharacter.location.y > lowest.y){
                status = "crashed"
                // myCharacter.location.y = allPoints[section][closest].y-200;
            }
        } else {
            if(lineCircleIntersection(safeZones[i].start, safeZones[i].end, ship)){
                var displayAng = myCharacter.angle*180/Math.PI
                if(myCharacter.vel.y <= 3.5 && ((displayAng < 10 && displayAng >= 0) || (displayAng > 350 && displayAng <= 360))){
                    status = "safe"
                    if(landingTime == 0){
                        landingTime = performance.now()
                    }
                } else {
                    status = "crashed"
                    myCharacter.location.y = safeZones[i].start.y-200;
                }
                // status = "safe"
                // if(landingTime == 0 || (round2Started && !round2Ended)){
                //     landingTime = performance.now()
                // }
            }
        }
        return status;
    }
    
    function getClosestX(section){
        //get closest x value to the ship
        var closest = 0;
    
        //loop through all points in this section
        for(var i = 0; i < allPoints[section].length; i++){
            //if current point is closer than last point, update
            var checking = Math.abs(myCharacter.location.x-allPoints[section][i].x)
            var current  = Math.abs(myCharacter.location.x-allPoints[section][closest].x)
            if(checking <= current){
                closest = i;
            }
        }
        return closest
    }
    
    function lineCircleIntersection(pt1, pt2, circle) {
        let v1 = { x: pt2.x - pt1.x, y: pt2.y - pt1.y };
        let v2 = { x: pt1.x - circle.center.x, y: pt1.y - circle.center.y };
        let b = -2 * (v1.x * v2.x + v1.y * v2.y);
        let c =  2 * (v1.x * v1.x + v1.y * v1.y);
        let d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - circle.radius * circle.radius));
        if (isNaN(d)) { // no intercept
            return false;
        }
        // These represent the unit distance of point one and two on the line
        let u1 = (b - d) / c;  
        let u2 = (b + d) / c;
        if (u1 <= 1 && u1 >= 0) {  // If point on the line segment
            return true;
        }
        if (u2 <= 1 && u2 >= 0) {  // If point on the line segment
            return true;
        }
        return false;
    }
    
    function generateTerrain(numOfZones){
        safeZones = [];
        allPoints = [];
        //divide line based on length of line
        let begin = {x:0, y:canvas.height/2};
        let end = {x:canvas.width , y:canvas.height/2} 
    
        context.beginPath();
        context.moveTo(begin.x, begin.y);
    
        //generate 2 safe zones then sort them based on x value
        for(var i = 0; i < numOfZones; i++){
            generateSafeZone(numOfZones);
        }
    
        safeZones.sort(function(a,b){return a.start.x - b.start.x;})
    
        //generate the terrain between safe zones
        if(numOfZones == 1){
            makeLine(begin, safeZones[0].start);
            makeLine(safeZones[0].end, end);  
        } else {
            makeLine(begin, safeZones[0].start);
            makeLine(safeZones[0].end, safeZones[1].start);
            makeLine(safeZones[1].end, end);  
        }
    }
    
    function generateSafeZone(numOfZones){
        if(numOfZones == 1){
            var length = 100;
        } else {
            var length = 150;
        }
        
        //make sure the x value cant be within 15% of the edges of the screen
        let xVal = (Math.random()*canvas.width*.7)+(.15*canvas.width) 
        let yVal = Math.random()*canvas.height*.7+(.1*canvas.height)
    
        //if the safe zones generate on the same x values, change it
        while(safeZones.length != 0 && Math.abs(safeZones[0].start.x-xVal) < 300){
            console.log("Changed it from " + xVal + ": " + safeZones[0].start.x)
            xVal = (Math.random()*canvas.width*.7)+(.15*canvas.width)
        }
    
        var safeZone = {
            start: {x:xVal, y:yVal},
            end: {x:xVal+length, y:yVal}
        }
        safeZones.push(safeZone)
    }
    
    function makeLine(start, end){
        //the bigger the distance between points, the more iterations
        let xDist = end.x - start.x
        let iterations = Math.floor(xDist/50)
    
        //get the midpoints and then sort them based on x value
        midpoint(start, end, iterations, 0);
        points.push(start)
        points.push(end)
        points.sort(function(a,b){return a.x - b.x;})
    
        
        allPoints.push(points)
        points = [];
    }
    
    function midpoint(start, end, iterations){
        if(iterations != 0){
            //get distance from start to end
            let xDist = end.x-start.x
            let mid = {x:null, y:null};
    
            mid.x = (xDist/2) + start.x
    
            //TODO: make rand a gaussian random number
            let roughness = .3
            let rand = ((Math.random()*2)-1);
            let random = roughness * rand * Math.abs(xDist)
            mid.y = .5*(start.y + end.y) + random;
    
            points.push(mid)
            
            midpoint(mid, end, iterations-1)
            midpoint(start, mid, iterations-1)
        }
    }
    
    function renderTerrain(){
        context.beginPath();
        //print line
        for(var j = 0; j < allPoints.length; j++){
            var current = allPoints[j]
            context.moveTo(current[0].x, current[0].y)
            for(var i = 0; i < current.length; i++){
                var point = current[i];
                context.lineTo(point.x, point.y)
            }
            var start = current[0]
            var end = current[current.length-1]
            context.lineTo(end.x+1, end.y)
            context.lineTo(end.x+1,canvas.height)
            context.lineTo(start.x-1,canvas.height)
            context.lineTo(start.x-1,start.y)
            context.fillStyle = 'gray'
        }
        context.fill()
        context.closePath()
        context.strokeStyle = 'rgb(255, 255, 255)';
        context.stroke();
    
        //print safe zones
        for(var i = 0; i < safeZones.length; i++){
            var zone = safeZones[i];
            context.beginPath();
            context.moveTo(zone.start.x-1, zone.start.y)
            context.lineTo(zone.end.x+1, zone.end.y)
            context.closePath()
            context.stroke()
            context.fillStyle = 'gray'
            context.fillRect(zone.start.x-1, zone.start.y,zone.end.x-zone.start.x+2,canvas.height - zone.start.y)
        }
        context.fill()
    }
    
    function scaleCanvas(){
        canvas.height = window.innerHeight * .96;
        canvas.width = window.innerWidth * .98;
    }

    function run() {
        lastTimeStamp = performance.now();
        startTime = performance.now()
        cancelNextRequest = false;

        // console.log("called")
        resetGame();

        requestAnimationFrame(gameLoop);
    }

    return {
        initialize : initialize,
        run : run,
        scores: scores,
        map:{
            thrust: mapThrust,
            right: mapRight,
            left: mapLeft,
            escape: mapEscape,
        }
    };

}(MyGame.render, MyGame.graphics, MyGame.input, MyGame.systems));
