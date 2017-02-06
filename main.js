/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var GAME = GAME || {};

GAME.main = (function($) {
    // Dependencies
    var constants = GAME.constants,
        gameboard = GAME.gameboard,
        
    keys = {
        UP: 38,
        DOWN: 40,
        LEFT: 37,
        RIGHT: 39
    },

    // Private attributes
    actionsRunning = false,
    npcsHasMovedThisSR = false,
    uniqueIdCounter = 1,
    objects = [],
    
    // Width and height of view container element (in pixels)
    viewWidth = 0,
    viewHeight = 0,
    
    // Map layers
    floorLayer = null,
    wallLayer = null,
    objectLayer = null,
    
    // Matrix for showing free/occupied tiles. The matrix corresponds
    // to the map size.
    obstructedTiles = null,
    
    // Current scroll position.
    scrollX = 0,
    scrollY = 0,
    lastScrollX = -1,
    lastScrollY = -1,
    
    // Private methods
    handleKeyDown = function(e) {
        var scroll = true; // true if one of the scroll keys has been hit
        
	switch (e.keyCode) {
            case keys.UP:
                scrollY += constants.TILE_HEIGHT;
                break;
            case keys.DOWN:
                scrollY -= constants.TILE_HEIGHT;
                break;
            case keys.LEFT:
                scrollX += constants.TILE_WIDTH;
                break;
            case keys.RIGHT:
                scrollX -= constants.TILE_WIDTH;
                break;
            default:
                scroll = false; 
	}
        
        if (scroll) {
            // Stop scrolling at edges of map.
            if (scrollX < 0) {
                scrollX = 0;
            }
            if (scrollX > floorLayer.mapWidthPixels - viewWidth) {
                scrollX = floorLayer.mapWidthPixels - viewWidth;
            }
            if (scrollY < 0) {
                scrollY = 0;
            }
            if (scrollY > floorLayer.mapHeightPixels - viewHeight) {
                scrollY = floorLayer.mapHeightPixels - viewHeight;
            }

            updateScreen();
            e.preventDefault();
        }
    },
    
    updateScreen = function() {
        // Update scroll position if necessary
        if (scrollX !== lastScrollX || scrollY !== lastScrollY) {
            
            floorLayer.draw(scrollX, scrollY);
            wallLayer.draw(scrollX, scrollY);
            objectLayer.draw(scrollX, scrollY, true);
            
            console.log("scrollxy: " + scrollX + " " + scrollY);
            console.log("lastscrollxy: " + lastScrollX + " " + lastScrollY);
            // Update char
            var i = 0, length = objects.length, diffX = 0, diffY = 0;
            if (lastScrollX >= 0) {
                diffX = (lastScrollX - scrollX) / constants.TILE_WIDTH;
            }
            if (lastScrollY >= 0) {
                diffY = (lastScrollY - scrollY) / constants.TILE_HEIGHT;
            }
            console.log(diffX + " " + diffY);
            for (i; i < length; i++) {
                objects[i].setDeltaCoords(diffX, diffY);
                objects[i].draw();
            }
            
            lastScrollX = scrollX;
            lastScrollY = scrollY;
        }
        
        
    };
    
    return {
        
        selected : null,
        
        init : function() {
            // Character loading - heroes and npcs
            var char = GAME.adventurer.Adventurer(GAME.character.loadCharacter(GAME.characterData.elf));
            char.setCoordinates(6, 9);
            objects.push(char);
            
            // Call the loadMap function. The callback passed
            // is a function that creates a matrix for the obstructed tiles
            // and sets up user scrolling.
            gameboard.loadMap(constants.MAP_FILE, constants.CONTAINER, function (tileScrollers) {
                floorLayer = tileScrollers[0]; // Floor from tmx-file
                wallLayer = tileScrollers[1]; // Walls from tmx-file
                objectLayer = tileScrollers[2];

                // Create a matrix with obstructed tiles (only 'wall' tiles
                // are counted at this point
                obstructedTiles = [];
                var i = 0, x = -1, y = -1, mapLength = wallLayer.map.length;
                // obstructedTiles[y] = [];
                for (i; i < mapLength; i++) {
                    if (i % gameboard.getTilesAcross() === 0) {
                        y++;
                        x = -1;
                        obstructedTiles[y] = [];
                    }
                    x++;
                    obstructedTiles[y][x] = wallLayer.map[i] === 0 ? 0 : 1;
                }
                // Width and height of the viewport container.
                viewWidth = constants.CONTAINER.innerWidth();
                viewHeight = constants.CONTAINER.innerHeight();
                
                // Handle user scrolling
                $(document).keydown(handleKeyDown);

                updateScreen();
            });
        }
    }; 
}(jQuery));

(function($) {
    $(document).ready(function() {
        GAME.main.init();
    });
}(jQuery));