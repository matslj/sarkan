GAME.namespace("npc.AI").movement = {
    
    npcMovement : null,
    
    /**
     * Moves all npcs one step along their individual movement path.
     * 
     * @returns {undefined} does not return anything
     */
    moveNpcs : function () {
        var i = 0, ilength = this.npcMovement.length, tempObj = null;
        
        for (i; i < ilength; i++) {
            tempObj = this.npcMovement[i];
            tempObj.moveCounter++;
            if (tempObj.moveCounter < tempObj.moveStop) {
                // Move
                tempObj.npc.draw(tempObj.path[tempObj.moveCounter].x, tempObj.path[tempObj.moveCounter].y);
            }
        }
    },
    
    /**
     * Checks if there are movement left to do on any of the npcs.
     * 
     * @returns {Boolean} true if there are any movement left to do on any npc, otherwise false
     */
    moreToMove : function () {
        var i = 0, ilength = this.npcMovement.length, tempObj = null, moreToMove = false;
        
        if (this.npcMovement === null || this.npcMovement.length === 0) {
            return false;
        }
        
        for (i; i < ilength; i++) {
            tempObj = this.npcMovement[i];
            if (tempObj.moveCounter < tempObj.moveStop) {
                moreToMove = true;
            }
        }
        return moreToMove;
    },

    /**
     * Calculates movement for all the npcs (with one call) and stores the movement
     * paths for each npc in this.npcMovement.
     * 
     * @returns {undefined}
     */
    calculateNpcMovement: function () {
        this.npcMovement = []; // Reset
        var i = 0, ilength = GAME.objects.length, tempObj = null, result = null;
        GAME.rebuildPassableGrid();
        for (i; i < ilength; i++) {
            if (GAME.objects[i].character.type === "npc") {
                tempObj = GAME.objects[i];
                // console.log("Npc som ska flytta: " + tempObj.character.name);
                result = this.findClosestTarget(tempObj);
                if (result !== null) {
                    // Make the position where the npc will end up impassable.
                    GAME.setCoordinatePassability(result.path[result.path.length - 2].x, result.path[result.path.length - 2].y, 1);
                    // console.log(tempObj.character.name + " - " + result.path[result.path.length - 1].x + " - " + result.path[result.path.length - 1].y);
                    result.npc = tempObj;
                    result.moveCounter = 0;
                    result.moveStop = result.path.length - 1;
                    this.npcMovement.push(result);
                }
            }
        }
    },
    
    /**
     * Finds the closest hero target for an npc.
     * 
     * @param {type} npc the npc to find the closest hero target for
     * @returns {GAME.namespace.movement.findClosestTarget.AImovementsNpcAnonym$2}
     */
    findClosestTarget: function (npc) {
        var tempObj = null,
            bestPath = null,
            tempList = null,
            bestTarget = null,
            targetArray = [],
            x,y;
    
        // First pick out the heroes in a list with possible targets
        var i = 0, ilength = GAME.objects.length;
        for (i; i < ilength; i++) {
            if (GAME.objects[i].character.type === "hero" && GAME.objects[i].character.isAlive()) {
                targetArray.push(GAME.objects[i]);
                // console.log(GAME.objects[i].character.name + " - " + GAME.objects[i].getCoordinates());
            }
        }
        
        // console.log("npc coords: " + npc.getCoordinates().x + " - " + npc.getCoordinates().y);
        
        // Check the number of steps to each hero and choose the hero with the least amount of steps
        // This is done using astar and by temporarily disabling the impassability of each hero.
        // More explanation: If the hero is marked as implassablie the astar-function cannot calculate
        // a distance to the hero. So each hero has to be marked passable (but only the hero currently
        // measured to, other heroes still block movement.
        i = 0, ilength = targetArray.length;
        for (i; i < ilength; i++) {
            tempObj = targetArray[i];
            x = tempObj.getCoordinates().x;
            y = tempObj.getCoordinates().y;
            GAME.setCoordinatePassability(x,y, 0); // Toogle passability on for the target (in order to calculate path)
            console.log("target coords: " + x + " - " + y);
            tempList = AStar(GAME.currentMapPassableTiles, [npc.getCoordinates().x,npc.getCoordinates().y], [x,y]);
            GAME.setCoordinatePassability(x,y, 1); // Toggle passability off (in order to make the target impassabile again)
            // console.log(tempList);
            // console.log("tempList.length: " + tempList.length + " bestPath: " + bestPath);
            if (tempList.length > 0 && (bestPath === null || tempList.length < bestPath.length)) {
                bestPath = tempList;
                bestTarget = tempObj;
            }
        }
        
        if (bestPath === null) {
            return null;
        } else {
            npc.target = bestTarget; // Set the target for future attack
            return { path : bestPath };
        }
    }
    
};