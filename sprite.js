
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

//function translatePixelsToMatrix() {
//    
//}

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
        
        $elementBase = params.$drawTarget.append('<div/>').find(':last'), // this contains 'grid' cell for the element to be drawn
        $element =  $elementBase.append('<div/>').find(':last'), // this contains the element to be drawn
        elemBaseStyle = $elementBase[0].style,
        elemStyle = $element[0].style,
        $drawTarget = params.$drawTarget,
        backgroundCSS = processMultipleBackgrounds(params.imgArray),
        selected = false,
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
    var localParams = {
        // Background images; the char + all clothes and gear
        imgArray : [{x:10, y:39}, {x:8, y:36}, {x:2, y:34}, {x:15, y:35}, {x:6, y:33}, {x:0, y:31}],
        myX : x,
        myY : y
    };
    var params = $.extend({}, GAME.SYS_spriteParams, localParams);
    var that = DHTMLSprite(params);
    
//    that.markMove = function(toX, toY) {
//        selected = !selected;
//        if (selected) {
//            elemBaseStyle.border = "1px solid yellow";
//            var x = ((+(elemBaseStyle.left.replace("px", ""))/width) >>0);
//            var y = ((+(elemBaseStyle.top.replace("px", ""))/height) >>0);
//            console.log([x,y]);
//            console.log(GAME.obstructedTiles);
//            var path = AStar(GAME.obstructedTiles, [x,y], [11, 9]);
//            console.log(path);
//            for (var i = 0; i < path.length; i++) {
//                // console.log(emptyTiles[i].x + " - " + emptyTiles[i].y)
//                var $el  = $drawTarget.append('<div/>').find(':last');
//                $el.css({
//                    position: 'absolute',
//                    width: width,
//                    height: height,
//                    backgroundColor: 'blue',
//                    left: path[i].x * width + 'px',
//                    top: path[i].y * height + 'px'
//                });
//            }
//            
//        } else {
//            elemBaseStyle.border = "1px solid transparent";
//        }
//    };
    
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

