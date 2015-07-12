
var GAME = GAME || {};

//$(function() {
//    GAME.SYS_spriteParams = {
//        width: 32,
//        height: 32,
//        images: 'DungeonCrawl_ProjectUtumnoTileset.png',
//        $drawTarget: $('#viewports')
//   };
//});

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
function processMultipleBackgrounds(backgroundCoords) {
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
}

function getEmptyTiles(xPos, yPos, distance) {
    var visitedTiles = [],
        exploreQueue = [],
        emptyTiles = [],
        counter = 0,
        maxPosX = xPos,
        maxNegX = xPos,
        maxPosY = yPos,
        maxNegY = yPos,
        vt, // temporary vertice
        v = {x:xPos, y:yPos}; // current vertice

    for (var i = 0; i < GAME.tilesDown; i++) {
        visitedTiles[i] = [];
    }
    
//    console.log("x: " + xPos + ", y: " + yPos);
//    console.log(visitedTiles);
    // emptyTiles.push(v); do not visit first tile (the character is standing on it)
    visitedTiles[v.y][v.x] = 1;
    exploreQueue.push(v);
    while (exploreQueue.length !== 0 && counter < distance) {
        v = exploreQueue.shift();
        if (v.y > 0) {
            if (v.x > 0 && !visitedTiles[v.y - 1][v.x - 1]) {
                // *oo
                // ovo
                // ooo

                // Visit v
                vt = {x:(v.x - 1), y:(v.y - 1)};
                emptyTiles.push(vt);
                // Mark v visited
                visitedTiles[v.y - 1][v.x - 1] = 1;
                exploreQueue.push(vt);
                
                if (v.x - 1 < maxNegX) {
                    maxNegX = v.x - 1;
                }
                if (v.y - 1 < maxNegY) {
                    maxNegY = v.y - 1;
                }
            }
            if (!visitedTiles[v.y - 1][v.x]) {
                // o*o
                // ovo
                // ooo

                // Visit v
                vt = {x:(v.x), y:(v.y - 1)};
                emptyTiles.push(vt);
                // Mark v visited
                visitedTiles[v.y - 1][v.x] = 1;
                exploreQueue.push(vt);
                
                if (v.y - 1 < maxNegY) {
                    maxNegY = v.y - 1;
                }
            }
            if (!visitedTiles[v.y - 1][v.x + 1]) {
                // oo*
                // ovo
                // ooo

                // Visit v
                vt = {x:(v.x + 1), y:(v.y - 1)};
                emptyTiles.push(vt);
                // Mark v visited
                visitedTiles[v.y - 1][v.x + 1] = 1;
                exploreQueue.push(vt);
                
                if (v.x + 1 < maxPosX) {
                    maxPosX = v.x - 1;
                }
                if (v.y - 1 < maxNegY) {
                    maxNegY = v.y - 1;
                }
            }
        }
        if (v.x > 0 && !visitedTiles[v.y][v.x - 1]) {
            // ooo
            // *vo
            // ooo
            
            // Visit v
            vt = {x:(v.x - 1), y:(v.y)};
            emptyTiles.push(vt);
            // Mark v visited
            visitedTiles[v.y][v.x - 1] = 1;
            exploreQueue.push(vt);
            
            if (v.x - 1 < maxNegX) {
                maxNegX = v.x - 1;
            }
        }
        if (!visitedTiles[v.y][v.x + 1]) {
            // ooo
            // ov*
            // ooo

            // Visit v
            vt = {x:(v.x + 1), y:(v.y)};
            emptyTiles.push(vt);
            // Mark v visited
            visitedTiles[v.y][v.x + 1] = 1;
            exploreQueue.push(vt);
        }
        if (v.x > 0 && !visitedTiles[v.y + 1][v.x - 1]) {
            // ooo
            // ovo
            // *oo

            // Visit v
            vt = {x:(v.x - 1), y:(v.y + 1)};
            emptyTiles.push(vt);
            // Mark v visited
            visitedTiles[v.y + 1][v.x - 1] = 1;
            exploreQueue.push(vt);
        }
        if (!visitedTiles[v.y + 1][v.x]) {
            // ooo
            // ovo
            // o*o

            // Visit v
            vt = {x:(v.x), y:(v.y + 1)};
            emptyTiles.push(vt);
            // Mark v visited
            visitedTiles[v.y + 1][v.x] = 1;
            exploreQueue.push(vt);
        }
        if (!visitedTiles[v.y + 1][v.x + 1]) {
            // ooo
            // ovo
            // oo*

            // Visit v
            vt = {x:(v.x + 1), y:(v.y + 1)};
            emptyTiles.push(vt);
            // Mark v visited
            visitedTiles[v.y + 1][v.x + 1] = 1;
            exploreQueue.push(vt);
        }
        counter++;
    }
    return emptyTiles;
}

/**
 * A sprite template. The sprite consists of a div-elementwith width, height and
 * backgroundimage defined by the incoming parameter-object.
 * 
 * <p>
 * Params:
 * <ul>
 * <li>param.width - the width of the sprite
 * <li>param.height - the height of the sprite
 * <li>param.$drawTarget - the element to which the sprite should be appended
 * <li>spriteArray - an array of javascript objects on the form <code>{x:1, y: 10}</code>
 *     (the numbers are example numbers) which is the coordinates of all the images
 *     from the global spritesheet, that will be used to create this sprite. The
 *     images will be layed on top of each other so the order of the coordinates
 *     is important. Laborate to get it right.
 * </ul>
 * "param" is of course an arbitrary name.
 * 
 * @param {type} params
 * @param {type} spriteArray
 * @returns {DHTMLSprite.that} an DHTMLSprite-instance
 */
var DHTMLSprite = function(params, spriteArray) {
    var width = params.width,
        height = params.height,
        $elementBase = params.$drawTarget.append('<div/>').find(':last'), // this contains 'grid' cell for the element to be drawn
        $element =  $elementBase.append('<div/>').find(':last'), // this contains the element to be drawn
        elemBaseStyle = $elementBase[0].style,
        elemStyle = $element[0].style,
        $drawTarget = params.$drawTarget,
        backgroundCSS = processMultipleBackgrounds(spriteArray),
        selected = false,
        $emptyTilesList,
        mathFloor = Math.floor;

    // The cssdata which does not change over time for the sprite
    var cssObj = {
        position: 'absolute',
        width: width,
        height: height,
        background: backgroundCSS,
        display: 'none',
        // The element with the images to be drawn (the actual sprite)
        // is displaced by a third in order to create a simple 3d-effect.
        left: '0px',
        top: -(height/3 >> 0) + 'px'
    };
    console.log(cssObj);
    $element.css(cssObj);
    $elementBase.css({
        position: 'absolute',
        width: width,
        height: height,
        border: "1px solid transparent"
    });
    $elementBase.mousedown(function() {
        selected = !selected;
        if (selected) {
            elemBaseStyle.border = "1px solid yellow";
            var x = +(elemBaseStyle.left.replace("px", ""));
            var y = +(elemBaseStyle.top.replace("px", ""));
            var emptyTiles = getEmptyTiles((x/width)>>0, (y/width)>>0, 3);
            $emptyTilesList = [];
            for (var i = 0; i < emptyTiles.length; i++) {
                console.log(emptyTiles[i].x + " - " + emptyTiles[i].y)
                var $el  = $drawTarget.append('<div/>').find(':last');
                $el.css({
                    position: 'absolute',
                    width: width,
                    height: height,
                    backgroundColor: 'blue',
                    left: emptyTiles[i].x * width + 'px',
                    top: emptyTiles[i].y * height + 'px'
                });
                $emptyTilesList.push($el);
            }
            
        } else {
            elemBaseStyle.border = "1px solid transparent";
        }
    });
//    $element.mouseover(function() {
//        elemStyle.border = "1px solid yellow";
//    });
//    $element.mouseleave(function() {
//        if (!selected) {
//            elemStyle.border = "none";
//        }
//    });
    var that = {
        // x and y in tile unit
        draw: function(x, y) {
            x = x * width; // convert from tile unit to pixels
            y = y * height; // convert from tile unit to pixels
            elemBaseStyle.left = x + 'px';
            elemBaseStyle.top = y + 'px';
            this.show();
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
        setSelected: function(pSelected) {
            if (!pSelected) {
                elemBaseStyle.border = "1px solid transparent";
            }
            selected = pSelected;
        },
        isSelected: function() {
            return selected;
        },
        getCssAsObject: function() {
            return cssObj;
        }
    };
    return that;
};

var ADV_elf = function (x, y) {
    var imgArray = [{x:10, y:39}, {x:8, y:36}, {x:2, y:34}, {x:15, y:35}, {x:6, y:33}, {x:0, y:31}];
    var that = DHTMLSprite(GAME.SYS_spriteParams, imgArray);
    that.draw(x, y);
    return that;
};

