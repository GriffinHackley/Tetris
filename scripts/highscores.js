MyGame.screens['high-scores'] = (function(game) {
    'use strict';
    
    function initialize() {
        document.getElementById('id-high-scores-back').addEventListener(
            'click',
            function() { game.showScreen('main-menu'); });
    }
    
    function run() {
        //get and sort scores
        console.log(MyGame.screens["game-play"])
        var scores = MyGame.screens["game-play"].scores
        scores.sort(function(a,b){return a - b;})
        console.log(scores)

        //print scores to the screen
        var string
        document.getElementById("scores").innerHTML = ""
        for(var i = 0; i < scores.length; i++){
            string = document.createTextNode(scores[i].toFixed(2))
            var newheader = document.createElement("li")
            newheader.appendChild(string)
            document.getElementById("scores").appendChild(newheader)
        }
    }
    
    return {
        initialize : initialize,
        run : run
    };
}(MyGame.game));
