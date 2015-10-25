/**
 * This 'class' returns an object which represents an adventurer
 * character in the game. The object created by this function extends
 * the GAME.sprite.DHTMLSprite-object.
 * 
 * @param {type} params
 * @returns {GAME.sprite.DHTMLSprite.that|DHTMLSprite.that|GAME.namespace.Adventurer.that}
 */
GAME.namespace("adventurer").Adventurer = function (params) {

    var that = GAME.sprite.DHTMLSprite(params);
    
    /**
     * Overriding the old select function. Note that the old select function
     * is saved (and used) inside the newly constructed function. This is achieved
     * through a self calling function (with the old function as a parameter)
     * which returns a parameterless function.
     */
    that.deselect = (function(oldDeselect) {
        return function() {
            var callback = oldDeselect;
            callback();
            that.movePath.remove();
        };
    })(that.deselect);
    
    that.markMove = function(toX, toY) {
        // If this character has made an attack, his turn is over.
        if (that.target !== null) {
            return;
        }
        GAME.rebuildPassableGrid();
        var coords = that.getCoordinates(); // Get current position in tile square units
        that.movePath.remove(); // Remove old path
        that.movePath.list = AStar(GAME.currentMapPassableTiles, [coords.x,coords.y], [toX,toY]);
        that.movePath.$selected = GAME.container.append('<div/>').find(':last');
        var i = 1, m = 0;
        that.movePath.length = that.movePath.list.length;
        for (i; i < that.movePath.length; i++) {
            var $el  = that.movePath.$selected.append('<div/>').find(':last');
            m = i + that.character.movement.used;
            $el.css({
                position: 'absolute',
                width: GAME.tileWidth,
                height: GAME.tileHeight,
                backgroundColor: m<=that.character.movement.half ? 'rgba(0,255,0,0.3)' : m<=that.character.movement.max ? 'rgba(255,255,0,0.3)' : 'rgba(255,0,0,0.3)',
                left: that.movePath.list[i].x * GAME.tileWidth + 'px',
                top: that.movePath.list[i].y * GAME.tileHeight + 'px'
            });
        }
    };
    
    that.moveTo = function(toX, toY, attack) {
        if (that.character.movement.used < that.character.movement.max) {
            attack = typeof attack !== "undefined" ? attack : false;
            // Check if the move is a legal move; the toX and toY
            // coordinates must be on the move path.
            var i = 1, m = 0, found = -1, length;
            length = attack ? that.movePath.length - 1 : that.movePath.length;
            for (i; i < that.movePath.length; i++) {
                m = i + that.character.movement.used;
                if (attack) {
                    if (m <= that.character.movement.half + 1) {
                        if (that.movePath.list[i].x === toX && that.movePath.list[i].y === toY) {
                            found = i;
                        }
                    }
                } else {
                    if (m <= that.character.movement.max) {
                        if (that.movePath.list[i].x === toX && that.movePath.list[i].y === toY) {
                            found = i;
                        }
                    }
                }
            }
            if (found > 0) {
                if (attack) {
                    found--;
                }
                that.character.movement.used += found;
                this.draw(that.movePath.list[found].x, that.movePath.list[found].y);
                that.movePath.remove();
            }
        }
    };

    return that;
    
};