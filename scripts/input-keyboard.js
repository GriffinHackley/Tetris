MyGame.input.Keyboard = function () {
    let that = {
        keys: {},
        handlers: []
    };

    function keyRelease(e) {
        for(var i = 0; i < that.handlers.length; i++){
            if(that.handlers[i].key == e.key){
                that.handlers[i].function();
                break;
            }
        }
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

    that.getKey = function(name){
        for(var i = 0; i < that.handlers.length; i++){
            if(that.handlers[i].name == name){
                return i;
            }
        }
        return 0;
    }

    that.getCode = function (name){
        return that.handlers[that.getKey(name)].key
    }

    that.updateFunction = function (name, handler){
        that.handlers[that.getKey(name)].function = handler
    }

    that.register = function (key, handler, name) {
        //search for handler with the same name
        if(that.getKey(name) != 0){
            that.handlers[i] = {key:key, name:name, function:handler}
        } else {
            that.handlers.push({key:key, name:name ,function:handler});
        }
    };

    that.overwrite = function (newKey, name){
        that.handlers[that.getKey(name)].key = newKey;
        return that;
    }

    that.save = function (){
        localStorage.setItem('controls', JSON.stringify(that))
    }

    window.addEventListener('keyup', keyRelease);

    return that;
};
