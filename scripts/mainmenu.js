MyGame.screens['main-menu'] = (function(game) {
    'use strict';
    
    function initialize() {
        //
        // Setup each of menu events for the screens
        document.getElementById('id-new-game').addEventListener(
            'click',
            function() {
                game.showScreen('game-play'); 
                MyGame.screens["game-play"].run
            });
        
        document.getElementById('id-high-scores').addEventListener(
            'click',
            function() { game.showScreen('high-scores'); });
        
        document.getElementById('id-controls').addEventListener(
            'click',
            function() { game.showScreen('controls'); });
        
        document.getElementById('id-about').addEventListener(
            'click',
            function() { game.showScreen('about'); });
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
