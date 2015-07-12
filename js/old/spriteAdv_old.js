GAME.namespace("adventurer").sprite = {

    /**
     * Creates a css background property. It uses CSS3 to set multiple backgrounds.
     * Example:
     * <p>
     * <code>background: url(img_flwr.gif) right bottom no-repeat, url(img_flwr.gif) left top no-repeat;</code>
     * <p>
     * The same url will be used for all backgrounds and all backgrounds will have no-repeat set.
     * 
     * @param {type} backgroundCoords
     * @returns {String}
     */
    processMultipleBackgrounds : function(backgroundCoords) {
        var background = "",
                coordX,
                coordY,
                i = 0,
                bcLength = backgroundCoords.length;

        for (i = 0; i < bcLength; i++) {
            coordX = -(GAME.SYS_spriteParams.width * backgroundCoords[i].x);
            coordY = -(GAME.SYS_spriteParams.height * backgroundCoords[i].y);
            // background: url(img_flwr.gif) right bottom no-repeat, url(paper.gif) left top repeat;
            background += "url(" + GAME.SYS_spriteParams.images + ") " + coordX + "px " + coordY + "px no-repeat";
            if (i !== (bcLength - 1)) {
                background += ", ";
            }
        }
        return background;
    },

    /**
    * A sprite template. The sprite consists of a div-elementwith width, height and
    * backgroundimage defined by the incoming parameter-object.
    * 
    * <p>
    * Params:
    * <ul>
    * <li>spriteArray - an array of javascript objects on the form <code>{x:1, y: 10}</code>
    *     (the numbers are example numbers) which is the coordinates of all the images
    *     from the global spritesheet, that will be used to create this sprite. The
    *     images will be layed on top of each other so the order of the coordinates
    *     is important. Laborate to get it right.
    * </ul>
    * "param" is of course an arbitrary name.
    * 
    * @param {type} params
    * @returns {DHTMLSprite.that} an DHTMLSprite-instance
    */
    DHTMLSprite : function(params) {
        // The elementBase represents the square that the character stands on.
        var $elementBase = GAME.SYS_spriteParams.$drawTarget.append('<div/>').find(':last'), // this contains 'grid' cell for the element to be drawn
            // The element is the actual character standing on the elementBase (se above).
            $element =  $elementBase.append('<div/>').find(':last'), // this contains the element to be drawn
            // This is a shortcut to the style-property of the elementBase
            elemBaseStyle = $elementBase[0].style,
            // This is a shortcut to the style-property of the element
            elemStyle = $element[0].style,
            // The processed image-array of the character. In the bottom of
            // the array consists of the naked character and the layers above
            // represents accessories as trousers, sword, shield, etc.
            backgroundCSS = this.processMultipleBackgrounds(params.imgArray),
            unitX = 0,
            unitY = 0,
            objType = params.type,
            target = null, //.......
            attackLocked = false, //......
            mathFloor = Math.floor;

        var movement = {
            max : params.movement,
            half : (params.movement/2 >> 0),
            used : 0,
            ffString : function() {
                return this.used + " / " + this.max;
            }
        };

        var movePath = {
            $selected : null, // the aStar path (below) as a series of squares (divs) in a container element (div)
            list : null, // the array returned from aStar
            length : 0, // precalculated length of the aStar path (extracted from list.length)
            remove : function () {
                this.list = null;
                this.length = 0;
                if (this.$selected !== null && this.$selected instanceof jQuery) {
                    this.$selected.remove();
                }
            }
        };

        // The cssdata which does not change over time for the sprite
        var cssObj = {
            position: 'absolute',
            width: GAME.SYS_spriteParams.width,
            height: GAME.SYS_spriteParams.height,
            background: backgroundCSS,
            display: 'none',
            // The element with the images to be drawn (the actual sprite)
            // is displaced by a third in order to create a simple 3d-effect.
            left: '0px',
            top: -(GAME.SYS_spriteParams.height/3 >> 0) + 'px'
        };
        // console.log(cssObj);
        $element.css(cssObj);
        $elementBase.css({
            position: 'absolute',
            width: GAME.SYS_spriteParams.width,
            height: GAME.SYS_spriteParams.height,
            border: "1px solid transparent"
        });
        var that = {
            type: objType,
            // x and y in tile unit
            draw: function(x, y) {
                unitX = x;
                unitY = y;
                x = x * GAME.SYS_spriteParams.width; // convert from tile unit to pixels
                y = y * GAME.SYS_spriteParams.height; // convert from tile unit to pixels
                elemBaseStyle.left = x + 'px';
                elemBaseStyle.top = y + 'px';
                this.show();
            },
            getCoordinates: function() {
                return {x:unitX, y:unitY};
            },
            show: function() {
                elemStyle.display = 'block';
            },
            hide: function() {
                elemStyle.display = 'none';
            },
            destroy: function() {
                $element.remove();
            },
            select: function() {
                elemBaseStyle.border = "1px solid yellow";
                if (target) {
                    target.markAttackedBy();
                }
            },
            deselect: function() {
                elemBaseStyle.border = "1px solid transparent";
                if (target) {
                    target.deselect();
                }
                movePath.remove();
            },
            getCssAsObject: function() {
                return cssObj;
            },
            markMove: function(toX, toY) {
                // If this character has made an attack, his turn is over.
                if (attackLocked) {
                    return;
                }
                GAME.rebuildPassableGrid();
                var coords = this.getCoordinates(); // Get current position in tile square units
    //            var x = ((+(elemBaseStyle.left.replace("px", ""))/width) >>0);
    //            var y = ((+(elemBaseStyle.top.replace("px", ""))/height) >>0);
                movePath.remove(); // Remove old path
    //            movePath.destX = toX;
    //            movePath.destY = toY;
                movePath.list = AStar(GAME.currentMapPassableTiles, [coords.x,coords.y], [toX,toY]);
                movePath.$selected = GAME.container.append('<div/>').find(':last');
                var i = 1, m = 0;
                movePath.length = movePath.list.length;
                for (i; i < movePath.length; i++) {
                    var $el  = movePath.$selected.append('<div/>').find(':last');
                    m = i + movement.used;
                    $el.css({
                        position: 'absolute',
                        width: GAME.tileWidth,
                        height: GAME.tileHeight,
                        backgroundColor: m<=movement.half ? 'rgba(0,255,0,0.3)' : m<=movement.max ? 'rgba(255,255,0,0.3)' : 'rgba(255,0,0,0.3)',
                        left: movePath.list[i].x * GAME.tileWidth + 'px',
                        top: movePath.list[i].y * GAME.tileHeight + 'px'
                    });
                }
    //            if (attack) {
    //                var $el = movePath.$selected.append('<div/>').find(':last');
    //                var coordX = -(GAME.SYS_spriteParams.width * 10);
    //                var coordY = -(GAME.SYS_spriteParams.height * 0);
    //                $el.css({
    //                    position: 'absolute',
    //                    width: GAME.tileWidth,
    //                    height: GAME.tileHeight,
    //                    background: "url(" + GAME.SYS_spriteParams.images + ") " + coordX + "px " + coordY + "px no-repeat",
    //                    left: movePath.list[movePath.length - 1].x * GAME.tileWidth + 'px',
    //                    top: movePath.list[movePath.length - 1].y * GAME.tileHeight + 'px'
    //                });
    //            }
            },
            moveTo : function(toX, toY, attack) {
                if (movement.used < movement.max) {
                    attack = typeof attack !== "undefined" ? attack : false;
                    // Check if the move is a legal move; the toX and toY
                    // coordinates must be on the move path.
                    var i = 1, m = 0, found = -1, length;
                    length = attack ? movePath.length - 1 : movePath.length;
                    for (i; i < movePath.length; i++) {
                        m = i + movement.used;
                        if (attack) {
                            if (m <= movement.half + 1) {
                                if (movePath.list[i].x === toX && movePath.list[i].y === toY) {
                                    found = i;
                                }
                            }
                        } else {
                            if (m <= movement.max) {
                                if (movePath.list[i].x === toX && movePath.list[i].y === toY) {
                                    found = i;
                                }
                            }
                        }
                    }
                    if (found > 0) {
                        if (attack) {
                            found--;
                        }
                        movement.used += found;
                        this.draw(movePath.list[found].x, movePath.list[found].y);
                    }
                    movePath.remove();
                }
            },
            getMovementObject : function() {
                return movement;
            },
            attack : function(theTarget, finalizeAttack) {
                attackLocked = typeof finalizeAttack !== "undefined" ? finalizeAttack : false;
                target = theTarget;
                target.markAttackedBy();
                movePath.remove();
            },
            unAttack : function() {
                if (!attackLocked) {
                    if (target) {
                        target.deselect();
                    }
                    target = null;
                }
            },
            isLocked : function() {
                return attackLocked;
            }
        };
        return that;
    },

    Elf : function (x, y) {
        var localParams = {
            // Background images; the char + all clothes and gear
            imgArray : [{x:10, y:39}, {x:8, y:36}, {x:2, y:34}, {x:15, y:35}, {x:6, y:33}, {x:0, y:31}],
            myX : x,
            myY : y,
            movement : 10
        };
        var params = $.extend({}, GAME.SYS_spriteParams, localParams);
        var that = this.DHTMLSprite(params);

        that.draw(x, y);

        return that;
    }
};

/**
 * Help class for showing, on the grid, which tiles that
 * are obstructed.
 * 
 * @returns {undefined}
 */
GAME.adventurer.paintObstructedTiles = function() {
    // Tile matrix to paint
    var tileMatrix = GAME.currentMapPassableTiles; // alt. GAME.obstructedTiles
    
    for (var i = 0; i < GAME.tilesDown; i++) {
        for( var j = 0; j < GAME.tilesAcross; j++) {
            // console.log(emptyTiles[i].x + " - " + emptyTiles[i].y)
            if (tileMatrix[i][j]) {
                var $el  = GAME.container.append('<div/>').find(':last');
                $el.css({
                    position: 'absolute',
                    width: GAME.SYS_spriteParams.width,
                    height: GAME.SYS_spriteParams.height,
                    backgroundColor: 'blue',
                    left: j * GAME.SYS_spriteParams.width + 'px',
                    top: i * GAME.SYS_spriteParams.height + 'px'
                });
            }
        }
    }
}

