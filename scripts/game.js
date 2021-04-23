// ------------------------------------------------------------------
// 
// This is the game object.  Everything about the game is located in 
// this object.
//
// ------------------------------------------------------------------

MyGame.game = (function(screens, systems, renderer, graphics) {
    'use strict';

    console.log(MyGame.systems)

    let lastTimeStamp = performance.now();
    //
    // Define a sample particle system to demonstrate its capabilities
    let particlesFire = systems.ParticleSystem({
            center: { x: 300, y: 300 },
            size: { mean: 10, stdev: 4 },
            speed: { mean: 50, stdev: 25 },
            lifetime: { mean: 4, stdev: 1 }
        },
        graphics);
    let renderFire = renderer.ParticleSystem(particlesFire, graphics, 'assets/fire.png');
    
    //------------------------------------------------------------------
    //
    // This function is used to change to a new active screen.
    //
    //------------------------------------------------------------------
    function showScreen(id) {
        //
        // Remove the active state from all screens.  There should only be one...
        let active = document.getElementsByClassName('active');
        for (let screen = 0; screen < active.length; screen++) {
            active[screen].classList.remove('active');
        }
        //
        // Tell the screen to start actively running
        screens[id].run();
        //
        // Then, set the new screen to be active
        document.getElementById(id).classList.add('active');
    }

    //------------------------------------------------------------------
    //
    // This function performs the one-time game initialization.
    //
    //------------------------------------------------------------------
    function initialize() {
        let screen = null;
        //
        // Go through each of the screens and tell them to initialize
        for (screen in screens) {
            if (screens.hasOwnProperty(screen)) {
                screens[screen].initialize();
            }
        }
        
        //
        // Make the main-menu screen the active one
        showScreen('main-menu');
        
    }

    function initializeControls(){
        if(window.localStorage) {
            var controls = window.localStorage.getItem('controls')
            if(controls != null && controls.length < 7){
                window.localStorage.setItem('controls', JSON.stringify({"keys":{},"handlers":[{"key":"ArrowUp","name":"hard"},{"key":"ArrowDown","name":"down"},{"key":"ArrowLeft","name":"left"},{"key":"ArrowRight","name":"right"},{"key":"Home","name":"counter"},{"key":"PageUp","name":"clock"},{"key":"Escape","name":"escape"}]}))
                controls = JSON.parse(localStorage.getItem('controls'))
                console.log(window.localStorage.getItem('controls'))
            }
        }
        
        return controls;
    }

    
    return {
        initialize : initialize,
        showScreen : showScreen,
        controls:initializeControls
    };
}(MyGame.screens, MyGame.systems, MyGame.render, MyGame.graphics));
