MyGame.input.Keyboard = function () {
    let that = {
        keys: {},
        handlers: {}
    };

    function keyRelease(e) {
        that.handlers[e.key]();
    }

    that.update = function (elapsedTime) {
        // for (let key in that.keys) {
        //     if (that.keys.hasOwnProperty(key)) {
        //         if (that.handlers[key]) {
        //             that.handlers[key](elapsedTime);
        //         }
        //     }
        // }
    };

    that.register = function (key, handler) {
        that.handlers[key] = handler;
    };

    window.addEventListener('keyup', keyRelease);

    return that;
};
