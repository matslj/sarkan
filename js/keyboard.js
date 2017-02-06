var GAME = GAME || {};

GAME.keyboard = (function() {
    var keys = {
        getDown: [],
        UP: 38,
        DOWN: 40,
        LEFT: 37,
        RIGHT: 39,
        C: 67
    },
    
    inArray = function(element, arr) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === element) {
                return true;
            }
        }    
        return false;
    },

    removeFromArray = function (element, arr) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === element)
                arr.splice(i, 1);
        }
        return arr;
    },
    
    handleKeyDown = function(e) {
        switch (e.keyCode) {
            case keys.LEFT:
                if (!inArray(keys.RIGHT, keys.getDown) && !inArray(keys.LEFT, keys.getDown)) {
                    keys.getDown.push(keys.LEFT);
                }
                break;
            case keys.RIGHT:
                if (!inArray(keys.LEFT, keys.getDown) && !inArray(keys.RIGHT, keys.getDown)) {
                    keys.getDown.push(keys.RIGHT);
                }
                break;
            case keys.UP:
                if (!inArray(keys.UP, keys.getDown) && !inArray(keys.DOWN, keys.getDown)) {
                    keys.getDown.push(keys.UP);
                }
                break;
            case keys.DOWN:
                if (!inArray(keys.DOWN, keys.getDown) && !inArray(keys.UP, keys.getDown)) {
                    keys.getDown.push(keys.DOWN);
                }
                break;
        }
    },
    
    handleKeyUp = function(e) {
        switch (e.keyCode) {
            case keys.C:
            break;
            case keys.LEFT:
            case keys.RIGHT:
            case keys.UP:
            case keys.DOWN:
            keys.getDown = removeFromArray(e.keyCode, keys.getDown);
            break;
        }
    };
    
    return {
        keys : keys,
        
        init : function() {
            window.addEventListener('keydown', handleKeyDown, false);
	    window.addEventListener('keyup', handleKeyUp, false);
        }
    };
}());