MyGame.screens['high-scores'] = (function(game) {
    'use strict';
    
    function initialize() {
        document.getElementById('id-high-scores-back').addEventListener(
            'click',
            function() { game.showScreen('main-menu'); });
    }
    
    function run() {
        //get scores scores
        var temp = JSON.parse(localStorage.getItem('scores'));

        //get scores from current session
        var scores = MyGame.screens["game-play"].scores
        MyGame.screens["game-play"].clear

        //add old scores and new scores together then sort them
        scores  = scores.concat(temp);
        scores.sort(function(a,b){return b - a;})
        scores = scores.splice(0,5)
        
        //store scores into local storage
        localStorage.setItem('scores', JSON.stringify(scores))

        //print scores to the screen
        var string
        document.getElementById("scores").innerHTML = ""
        for(var i = 0; i < scores.length; i++){
            string = document.createTextNode(scores[i])
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
