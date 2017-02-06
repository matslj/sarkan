/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var GAME = GAME || {};

GAME.constants = {
    CONTAINER : $('#viewports'),
    
    MAP_FILE : "maps/sh-dungeon-v2.tmx",
    TILE_WIDTH : 32,
    TILE_HEIGHT : 32,
    OFFSET_X : -4,
    OFFSET_Y : -4,
    ANIMATION_TIMEOUT:500, // 100 milliseconds or 10 times a second

    HERO : {
        $hitpoints : $('#kpEdit'),
        $movementpoints : $('#ffEdit'),
        $picture : $('#hero #info .picture')
    },

    SPRITE_DATA : {
        width: 32,
        height: 32,
        images: 'img/DungeonCrawl_ProjectUtumnoTileset.png',
        $drawTarget: $('#viewports')
    }
};
