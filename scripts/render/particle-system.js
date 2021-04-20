// --------------------------------------------------------------
//
// Renders the particles in a particle system
//
// --------------------------------------------------------------
MyGame.render.ParticleSystem = function(system, graphics, imageSrc) {
    'use strict';

    let image = new Image();
    let isReady = false;  // Can't render until the texture is loaded

    //
    // Get the texture to use for the particle system loading and ready for rendering
    image.onload = function() {
        isReady = true;
    }
    image.src = imageSrc;

    //------------------------------------------------------------------
    //
    // Render all particles
    //
    //------------------------------------------------------------------
    function render() {
        if (isReady) {
            Object.getOwnPropertyNames(system.particles).forEach( function(value) {
                let particle = system.particles[value];
                graphics.drawTexture(image, particle.center, particle.rotation, particle.size);
            });
        }
    }

    let api = {
        render: render
    };

    return api;
};
