/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var GAME = GAME || {};

$(function() {
    
    // Game wide variables and constants
    GAME.container = $('#viewports');
    
    var tempGame = {
        mapFile : "maps/sh-dungeon-v2.tmx",
        tileWidth : 32,
        tileHeight : 32,
        offsetX : -4,
        offsetY : -4,
        objects : [],
        selected : null,
        hero : {
            $hitpoints : $('#kpEdit'),
            $movementpoints : $('#ffEdit'),
            $picture : $('#hero #info .picture')
        },
        SYS_spriteParams : {
            width: 32,
            height: 32,
            images: 'img/DungeonCrawl_ProjectUtumnoTileset.png',
            $drawTarget: GAME.container
        },
        
        selectDeselectGameObjects : function() {
            var i = 0, length = GAME.objects.length, tempObj = null, sel = null, m;
            for (i; i < length; i++) {
                tempObj = GAME.objects[i];
                if (GAME.selected !== null && tempObj === GAME.selected) {
                    // sel = tempObj;
                    tempObj.select();
                } else {
                    tempObj.deselect();
                }
            }
//            if (sel) {
//                sel.select();
//                if (sel.type === "hero") {
//                    m = sel.movement;
//                    sidebar.setMoveData(m.ffString());
//                }
//            }
        },
        
        rebuildPassableGrid : function() {
            // Perform deep copy of obstructedTiles
            GAME.currentMapPassableTiles = $.extend(true,[],GAME.obstructedTiles);
            var i = 0, length = GAME.objects.length, tempObj = null, c;
            for (i; i < length; i++) {
                tempObj = GAME.objects[i];
                c = tempObj.getCoordinates();
                GAME.currentMapPassableTiles[c.y][c.x] = 1;
            }
        }
    };
    
    $.extend(GAME,tempGame);
    
    // Initiazlisers which can be loaded without the map being fully
    // loaded.
    sidebar.init();
    mouse.init();

    // Call the loadMap function. The callback passed
    // is a function that scrolls each viewport according
    // to mouse movement.
    GAME.utils.loadMap(GAME.mapFile, GAME.container, function(tileScrollers) {

        GAME.floor = tileScrollers[0]; // Floor from tmx-file
        GAME.walls = tileScrollers[1]; // Walls from tmx-file
        GAME.staticObjects = tileScrollers[2];
        console.log(tileScrollers[2]);

        // Create a matrix with obstructed tiles (only 'wall' tiles
        // are counted at this point
        GAME.obstructedTiles = [];
        var i = 0, x = -1, y = -1, mapLength = GAME.walls.map.length;
        // GAME.obstructedTiles[y] = [];
        for (i; i < mapLength; i++) {
            if (i % GAME.tilesAcross === 0) {
                y++;
                x = -1;
                GAME.obstructedTiles[y] = [];
            }
            x++;
            GAME.obstructedTiles[y][x] = GAME.walls.map[i] === 0 ? 0 : 1;
        }

        // Width and height of viewports.
        GAME.viewWidth = GAME.container.innerWidth();
        GAME.viewHeight = GAME.container.innerHeight();

        // Current scroll position.
        var scrollX = 0,
            scrollY = 0;

        GAME.floor.draw(scrollX, scrollY);
        GAME.walls.draw(scrollX, scrollY);
        GAME.staticObjects.draw(scrollX, scrollY, true);
        
        var char = GAME.adventurer.Adventurer(GAME.characterData.elf);
        char.draw(6, 9);
        GAME.objects.push(char);
        
        var villian = GAME.npc.NPC(GAME.characterData.troll("mage"));
        villian.draw(14, 12);
        GAME.objects.push(villian);
        
        villian = GAME.npc.NPC(GAME.characterData.troll("fighter"));
        villian.draw(8,13);
        GAME.objects.push(villian);

        // GAME.adventurers.paintObstructedTiles();
    });

});
