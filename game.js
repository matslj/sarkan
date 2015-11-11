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
        animationTimeout:500, // 100 milliseconds or 10 times a second
        actionsRunning: false,
        uniqueIdCounter: 1,
        npcsHasMovedThisSR: false,
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
                    sel = tempObj;
                    // tempObj.select();
                } else {
                    tempObj.deselect();
                }
            }
            // The selected character must be selected last in order to preserve the markings
            // on attacked targets.
            if (sel) {
                sel.select();
            }
        },
        
        rebuildPassableGrid : function() {
            // Perform deep copy of obstructedTiles
            GAME.currentMapPassableTiles = $.extend(true,[],GAME.obstructedTiles);
            var i = 0, length = GAME.objects.length, tempObj = null, c;
            for (i; i < length; i++) {
                tempObj = GAME.objects[i];
                // Characters which are not alive is passable
                if (tempObj.character.isAlive()) {
                    c = tempObj.getCoordinates();
                    GAME.currentMapPassableTiles[c.y][c.x] = 1;
                }
            }
        },
        
        nextRound : function() {
            // Clear selected
            GAME.selected = null;
            sidebar.clearMessages();
            
            if (!this.npcsHasMovedThisSR) {
                GAME.npc.AI.movement.moveNpcs();
            }
            
            GAME.combat.resolveCombatOrder();
            
            this.actionLoop();
            
            // GAME.combat.performCombat();

            // Has any triggers been activated? (traps for example)
            // Has opponent acted yet in this round?
            // No -> perform opponent actions
            // 
            // Resolve combat
            
            // if close combat attack in smi order
            // - if target has cc weapon/shield
            //      - if target has not attacked
            //            -> choose between attack and parry
            
            // Resolve initiative (1d10) for each side; highest wins
            
            // If opponent wins -> perform opponent actions  
            
            // Reset all used movement and deselect all selected game objects
//            var i = 0, length = GAME.objects.length, tempObj = null;
//            for (i; i < length; i++) {
//                tempObj = GAME.objects[i];
//                tempObj.character.movement.reset();
//                tempObj.deselect();
//                tempObj.target = null;
//                
//            }
//            sidebar.refresh();
        },
        
        actionLoop:function() {

            GAME.actionsRunning = GAME.combat.performCombat();
            sidebar.refresh();
            if (GAME.actionsRunning) {
                //console.log("calling timeout");
                setTimeout(GAME.actionLoop, 1000);
            } else {
                console.log("finishing");
                GAME.selected = null;
                // Reset all used movement and deselect all selected game objects
                var i = 0, length = GAME.objects.length, tempObj = null;
                for (i; i < length; i++) {
                    tempObj = GAME.objects[i];
                    tempObj.character.movement.reset();
                    tempObj.deselect();
                    tempObj.target = null;

                }
                sidebar.refresh();
            }

            // Call the drawing loop for the next frame using request animation frame
//            if (GAME.running){
//                requestAnimationFrame(GAME.drawingLoop);	
//            }						
	}
    };
    
    $.extend(GAME,tempGame);
    
    // Initiazlisers which can be loaded without the map being fully
    // loaded.
    sidebar.init();
    mouse.init();
    $(".overlay-content a").click(function (ev) {
        $(".overlay-bg").hide();
    });
    
    $("#nextRound").click(function (ev) {
        GAME.nextRound();
    });

    // Call the loadMap function. The callback passed
    // is a function that scrolls each viewport according
    // to mouse movement.
    GAME.utils.loadMap(GAME.mapFile, GAME.container, function(tileScrollers) {

        GAME.floor = tileScrollers[0]; // Floor from tmx-file
        GAME.walls = tileScrollers[1]; // Walls from tmx-file
        GAME.staticObjects = tileScrollers[2];
        // console.log(tileScrollers[2]);

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
        
        // Character loading - heroes and npcs
        var char = GAME.adventurer.Adventurer(GAME.character.loadCharacter(GAME.characterData.elf));
        char.draw(6, 9);
        GAME.objects.push(char);
        
        char = GAME.adventurer.Adventurer(GAME.character.loadCharacter(GAME.characterData.human));
        char.draw(5, 9);
        GAME.objects.push(char);
        
        var villian = GAME.npc.NPC(GAME.character.loadCharacter(GAME.characterData.troll("mage", "Trollur Flams")));
        villian.draw(10, 9);
        GAME.objects.push(villian);
        //console.log(villian.character.toString());
        
        villian = GAME.npc.NPC(GAME.character.loadCharacter(GAME.characterData.troll("fighter", "Troll1")));
        villian.draw(8,13);
        GAME.objects.push(villian);

        // GAME.adventurers.paintObstructedTiles();
    });

});
