MyGame.screens['controls'] = (function(game) {
    'use strict';
    let myKeyboard = MyGame.screens['game-play'].controls

    function initialize() {
        document.getElementById('id-controls-back').addEventListener(
            'click',
            function() { game.showScreen('main-menu'); });

        document.getElementById('hard-control').addEventListener('click',mapHard);
        document.getElementById('right-control').addEventListener('click',mapRight);
        document.getElementById('left-control').addEventListener('click',mapLeft);
        document.getElementById('down-control').addEventListener('click',mapDown);
        document.getElementById('clock-control').addEventListener('click',mapClock);
        document.getElementById('counter-control').addEventListener('click',mapCounter);
        document.getElementById('esc-control').addEventListener('click',mapEsc);
    }

    function mapHard(){
        document.getElementById('hard-control').addEventListener('keyup',function(event){
            myKeyboard.overwrite(event.key, "hard")
            myKeyboard.save();
            updateControlList("hard");
        })
    }

    function mapRight(){
        document.getElementById('right-control').addEventListener('keyup',function(event){
            myKeyboard.overwrite(event.key, "right")
            myKeyboard.save();
            updateControlList("right");
        })
    }

    function mapLeft(){
        document.getElementById('left-control').addEventListener('keyup',function(event){
            myKeyboard.overwrite(event.key, "left")
            myKeyboard.save();
            updateControlList("left");
        })
    }

    function mapDown(){
        document.getElementById('down-control').addEventListener('keyup',function(event){
            myKeyboard.overwrite(event.key, "down")
            myKeyboard.save();
            updateControlList("down");
        })
    }

    function mapClock(){
        document.getElementById('clock-control').addEventListener('keyup',function(event){
            myKeyboard.overwrite(event.key, "clock")
            myKeyboard.save();
            updateControlList("clock");
        })
    }

    function mapCounter(){
        document.getElementById('counter-control').addEventListener('keyup',function(event){
            myKeyboard.overwrite(event.key, "counter")
            myKeyboard.save();
            updateControlList("counter");
        })
    }

    function mapEsc(){
        document.getElementById('esc-control').addEventListener('keyup',function(event){
            myKeyboard.overwrite(event.key, "escape")
            myKeyboard.save();
            updateControlList("escape");
        })
    }
    
    function run() {
        var thing = JSON.stringify({"keys":{},"handlers":[{"key":"ArrowUp","name":"hard"},{"key":"ArrowDown","name":"down"},{"key":"ArrowLeft","name":"left"},{"key":"ArrowRight","name":"right"},{"key":"Home","name":"counter"},{"key":"PageUp","name":"clock"},{"key":"Escape","name":"escape"}]})
        var test = JSON.parse(thing)
        updateControlList("hard");
        updateControlList("down");
        updateControlList("left");
        updateControlList("right");
        updateControlList("clock");
        updateControlList("counter");
        updateControlList("escape");
    }

    function updateControlList(name){
        var newheader
        document.getElementById(name+'Control').innerHTML = ""
        newheader = document.createElement("li").appendChild(document.createTextNode(name+": "+myKeyboard.getCode(name)))
        document.getElementById(name+'Control').appendChild(newheader)
    }
    
    return {
        initialize : initialize,
        run : run
    };
}(MyGame.game));
