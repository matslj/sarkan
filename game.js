/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var GAME = GAME || {};

$(function() {

    // Game wide variables and constants
    GAME.container = $('#viewports');
    GAME.mapFile = "maps/sh-dungeon2.tmx";
    GAME.tileWidth = 32;
    GAME.tileHeight = 32;
    GAME.offsetX = 0;
    GAME.offsetY = 0;
    GAME.heroes = [];
    GAME.villians = [];
    GAME.objects = [];
    GAME.selected = null;
    GAME.FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
    GAME.FLIPPED_VERTICALLY_FLAG   = 0x40000000;
    GAME.FLIPPED_DIAGONALLY_FLAG   = 0x20000000;
    GAME.SYS_spriteParams = {
        width: 32,
        height: 32,
        images: 'img/DungeonCrawl_ProjectUtumnoTileset.png',
        $drawTarget: GAME.container
    };

    // Call the loadMap function. The callback passed
    // is a function that scrolls each viewport according
    // to mouse movement.
    loadMap(GAME.mapFile, GAME.container, function(tileScrollers) {

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
        
        sidebar.init();

        var char = ADV_elf(6, 9);

        // paintObstructedTiles();
    });

});
