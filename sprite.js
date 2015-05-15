
var GAME = GAME || {};

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
var DHTMLSprite = function(params) {
    var width = params.width,
        height = params.height,
        // The elementBase represents the square that the character stands on.
        $elementBase = params.$drawTarget.append('<div/>').find(':last'), // this contains 'grid' cell for the element to be drawn
        // The element is the actual character standing on the elementBase (se above).
        $element =  $elementBase.append('<div/>').find(':last'), // this contains the element to be drawn
        // This is a shortcut to the style-property of the elementBase
        elemBaseStyle = $elementBase[0].style,
        // This is a shortcut to the style-property of the element
        elemStyle = $element[0].style,
        $drawTarget = params.$drawTarget,
        // The processed image-array of the character. In the bottom of
        // the array consists of the naked character and the layers above
        // represents accessories as trousers, sword, shield, etc.
        backgroundCSS = processMultipleBackgrounds(params.imgArray),
        unitX = 0,
        unitY = 0,
        mathFloor = Math.floor,
        $selectedPath = null,
        movement = params.movement,
        pathLength = 0;

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
    // console.log(cssObj);
    $element.css(cssObj);
    $elementBase.css({
        position: 'absolute',
        width: width,
        height: height,
        border: "1px solid transparent"
    });
    var that = {
        // x and y in tile unit
        draw: function(x, y) {
            unitX = x;
            unitY = y;
            x = x * width; // convert from tile unit to pixels
            y = y * height; // convert from tile unit to pixels
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
        },
        deselect: function() {
            elemBaseStyle.border = "1px solid transparent";
        },
        getCssAsObject: function() {
            return cssObj;
        },
        markMove: function(toX, toY) {
            var coords = this.getCoordinates();
//            var x = ((+(elemBaseStyle.left.replace("px", ""))/width) >>0);
//            var y = ((+(elemBaseStyle.top.replace("px", ""))/height) >>0);
            var x = coords.x, y = coords.y;
            // console.log([x,y]);
            // console.log(GAME.obstructedTiles);
            var path = AStar(GAME.obstructedTiles, [x,y], [toX,toY]);
            // console.log(path);
            if ($selectedPath instanceof jQuery) {
                $selectedPath.remove();
            }
            $selectedPath = GAME.container.append('<div/>').find(':last');
            var i = 1;
            pathLength = path.length;
            for (i; i < pathLength; i++) {
                // console.log(emptyTiles[i].x + " - " + emptyTiles[i].y)
                var $el  = $selectedPath.append('<div/>').find(':last');
                $el.css({
                    position: 'absolute',
                    width: GAME.tileWidth,
                    height: GAME.tileHeight,
                    backgroundColor: i<=5 ? 'rgba(0,255,0,0.3)' : i<=10 ? 'rgba(255,255,0,0.3)' : 'rgba(255,0,0,0.3)',
                    left: path[i].x * GAME.tileWidth + 'px',
                    top: path[i].y * GAME.tileHeight + 'px'
                });
            }
        },
        removePath: function() {
            if ($selectedPath !== null && $selectedPath instanceof jQuery) {
                pathLength = 0;
                $selectedPath.remove();
            }
        }
    };
    return that;
};

var ADV_elf = function (x, y) {
    var localParams = {
        // Background images; the char + all clothes and gear
        imgArray : [{x:10, y:39}, {x:8, y:36}, {x:2, y:34}, {x:15, y:35}, {x:6, y:33}, {x:0, y:31}],
        myX : x,
        myY : y,
        movement : 10
    };
    var params = $.extend({}, GAME.SYS_spriteParams, localParams);
    var that = DHTMLSprite(params);
        
    that.draw(x, y);
       
    return that;
};

/**
 * Help class for showing, on the grid, which tiles that
 * are obstructed.
 * 
 * @returns {undefined}
 */
var paintObstructedTiles = function() {
    for (var i = 0; i < GAME.tilesDown; i++) {
        for( var j = 0; j < GAME.tilesAcross; j++) {
            // console.log(emptyTiles[i].x + " - " + emptyTiles[i].y)
            if (GAME.obstructedTiles[i][j]) {
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
};

