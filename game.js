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
        
        combat : GAME.combat.Combat(),
        npcMovement : GAME.npc.AI.Movement(),
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
        
        toggleCoordinatePassability : function(x, y) {
            if (GAME.currentMapPassableTiles[y][x] === 1) {
                GAME.currentMapPassableTiles[y][x] = 0;
            } else {
                GAME.currentMapPassableTiles[y][x] = 1;
            }
            console.log("x: " + x + " y: " + y + " - " + GAME.currentMapPassableTiles[y][x]);
        },
        
        /**
         * 
         * 
         * @param {type} x
         * @param {type} y
         * @param {numeric} setting
         * @returns {undefined}
         */
        setCoordinatePassability : function(x, y, setting) {
            GAME.currentMapPassableTiles[y][x] = setting;
        },
        
        rollForInitiative: function() {
            var npcInitiative = 0, heroInitiative = 0;
            // Roll for initiative (each side roll a d10)
            heroInitiative = GAME.utils.dice.rollDie(10);
            npcInitiative = GAME.utils.dice.rollDie(10);
            while (heroInitiative === npcInitiative) {
                heroInitiative = GAME.utils.dice.rollDie(10);
                npcInitiative = GAME.utils.dice.rollDie(10);
            }
            console.log("heroI: " + heroInitiative + " - npcI: " + npcInitiative);
            if (npcInitiative > heroInitiative) {
                GAME.npcMovement.calculateNpcMovement();
                this.npcsHasMovedThisSR = true;
            }
        },
        
        resetGameObjects : function() {
            var i = 0, length = GAME.objects.length, tempObj = null;
            // Reset all used movement and deselect all selected game objects
            for (i; i < length; i++) {
                tempObj = GAME.objects[i];
                tempObj.character.movement.reset();
                tempObj.deselect();
                if (tempObj.target !== null && !tempObj.target.character.isAlive()) {
                    tempObj.target = null;
                }
            }
        },
        
        nextRound : function() {
            // Clear selected
            GAME.selected = null;
            // Clear sidebar (with status messages and such)
            sidebar.clearMessages();
            
            // If NPC hasn't moved this SR, it is time for them to move
            // The first round of each action map like this one, always
            // goes to the playing characters.
            if (!this.npcsHasMovedThisSR) {
                GAME.npcMovement.calculateNpcMovement();
            }
            
            // When all movement is done for the current round -> determine
            // attack order among the combat participants.
            GAME.combat.resolveCombatOrder();
            
            // Enact the actions (movement and combat)
            this.actionLoop();
        },
        
        /**
         * 
         * @param {type} parry set to true to indicate an parry attempt
         */
        actionLoop:function(parry) {
            var combatObject = null;
            // NPC move action
            if (GAME.npcMovement.moreToMove()) {
                GAME.npcMovement.moveNpcs();
                setTimeout(GAME.actionLoop, 500);
            }
            // Combat phase
            else {
                combatObject = GAME.combat.performCombat(parry);
                if (combatObject.state === GAME.combat.NEXT_COMBATANT) {
                    console.log("Next combatant");
                    sidebar.refresh();
                    setTimeout(GAME.actionLoop, 1000);
                } else if (combatObject.state === GAME.combat.WAIT_FOR_PARRY) {
                    console.log("Wait for parry");
                    // call dialog and have dialog call this GAME.actionLoop() with
                    // the parry parameter set to true or false
                } else {
                    console.log("End of combat");
                    GAME.selected = null;
                    GAME.resetGameObjects();
                    
                    sidebar.refresh();
                    this.npcsHasMovedThisSR = false;

                    // Roll for initiative for the two sides fighting
                    GAME.rollForInitiative();
                    console.log("Round complete");
                }						
            }
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

//        GAME.rebuildPassableGrid();
//        GAME.paintObstructedTiles();
    });
    
    GAME.paintObstructedTiles = function() {
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

});
