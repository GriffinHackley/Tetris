MyGame.screens['controls'] = (function(game) {
    'use strict';
    
    function initialize() {
        document.getElementById('id-controls-back').addEventListener(
            'click',
            function() { game.showScreen('main-menu'); });

        document.getElementById('thrust-control').addEventListener('click',mapThrust);
        document.getElementById('right-control').addEventListener('click',mapRight);
        document.getElementById('left-control').addEventListener('click',mapLeft);
        document.getElementById('esc-control').addEventListener('click',mapEsc);
    }

    function mapThrust(){
        console.log("thrust")
        document.getElementById('thrust-control').addEventListener('keyup',function(event){
            MyGame.screens["game-play"].map.thrust(event.key)
        })
    }
    function mapRight(){
        console.log("Right")
        document.getElementById('right-control').addEventListener('keyup',function(event){
            MyGame.screens["game-play"].map.right(event.key)
        })
    }
    function mapLeft(){
        console.log("Left")
        document.getElementById('left-control').addEventListener('keyup',function(event){
            MyGame.screens["game-play"].map.left(event.key)
        })
    }
    function mapEsc(){
        console.log("Esc")
        document.getElementById('esc-control').addEventListener('keyup',function(event){
            MyGame.screens["game-play"].map.escape(event.key)
        })
    }
    
    function run() {
        //
        // I know this is empty, there isn't anything to do.
    }
    
    return {
        initialize : initialize,
        run : run
    };
}(MyGame.game));
