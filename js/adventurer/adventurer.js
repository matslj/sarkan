GAME.namespace("adventurer").Adventurer = function (params) {

    var that = GAME.sprite.DHTMLSprite(params),
        target = null,
        attackLocked = false;
    
    /**
     * Overriding the old select function. Note that the old select function
     * is saved (and used) inside the newly constructed function. This is achieved
     * through a self calling function (with the old function as a parameter)
     * which returns a parameterless function.
     */
    that.select = (function(oldSelect) {
        return function() {
            var callback = oldSelect;
            callback();
            if (target) {
                target.markAttackedBy();
            }
        };
    })(that.select);
    
    /**
     * See comment over that.select.
     */
    that.deselect = (function(oldDeselect) {
        return function() {
            var callback = oldDeselect;
            callback();
            if (target) {
                target.deselect();
            }
            that.movePath.remove();
        };
    })(that.deselect);
    
    that.attack = function(theTarget, finalizeAttack) {
        if(that.movement.canAttack()) {
            attackLocked = typeof finalizeAttack !== "undefined" ? finalizeAttack : false;
            target = theTarget;
            target.markAttackedBy();
            that.movePath.remove();
        } else {
            alert("Mer än hälften av förflyttningen är förbrukad och då är inte anfall möjligt.");
        }
    };
    
    that.unAttack = function() {
        if (!attackLocked) {
            if (target) {
                target.deselect();
            }
            target = null;
        }
    };
    
    that.isLocked = function() {
        return attackLocked;
    };
    
    that.markMove = function(toX, toY) {
        // If this character has made an attack, his turn is over.
        if (attackLocked) {
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
            m = i + that.movement.used;
            $el.css({
                position: 'absolute',
                width: GAME.tileWidth,
                height: GAME.tileHeight,
                backgroundColor: m<=that.movement.half ? 'rgba(0,255,0,0.3)' : m<=that.movement.max ? 'rgba(255,255,0,0.3)' : 'rgba(255,0,0,0.3)',
                left: that.movePath.list[i].x * GAME.tileWidth + 'px',
                top: that.movePath.list[i].y * GAME.tileHeight + 'px'
            });
        }
    };
    
    that.moveTo = function(toX, toY, attack) {
        if (that.movement.used < that.movement.max) {
            attack = typeof attack !== "undefined" ? attack : false;
            // Check if the move is a legal move; the toX and toY
            // coordinates must be on the move path.
            var i = 1, m = 0, found = -1, length;
            length = attack ? that.movePath.length - 1 : that.movePath.length;
            for (i; i < that.movePath.length; i++) {
                m = i + that.movement.used;
                if (attack) {
                    if (m <= that.movement.half + 1) {
                        if (that.movePath.list[i].x === toX && that.movePath.list[i].y === toY) {
                            found = i;
                        }
                    }
                } else {
                    if (m <= that.movement.max) {
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
                that.movement.used += found;
                this.draw(that.movePath.list[found].x, that.movePath.list[found].y);
            }
            that.movePath.remove();
        }
    };

    return that;
    
};