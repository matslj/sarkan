GAME.combat = {

    performCombat : function () {
        
                
//        for (var l =0; l < GAME.objects.length; l++) {
//            tempObj = GAME.objects[l];
//            console.log("OOO " + tempObj.character.type + " - " + tempObj.target);
//        }
        
        
        // Establish combat order
        var i = 0, 
            j = 0,
            combatOrder = GAME.objects.slice(0), // Shallow copy of all characters
            ilength = combatOrder.length,
            tempObj = null;
//        
//        for (i; i < ilength; i++) {
//            tempObj = combatOrder[i];
//            console.log(tempObj.characterData.getTitle() + " smi: " + tempObj.characterData.stats.smi);
//        }
        
        // Sort the combatants using their respective SMI (dexterity) value
        i = 0;
        for (i; i < ilength; i++) {
            for(j = i - 1; j>-1 && combatOrder[j].character.stats.smi > combatOrder[i].character.stats.smi; j--) {
                tempObj = combatOrder[j+1];
                combatOrder[j+1] = combatOrder[j];
                combatOrder[j] = tempObj;
            }
        }
        
        // Attack
        // Observe that combatants are iterated in reverse order. 
        for (i = ilength - 1; i>-1; i--) {
            tempObj = this.determineOpponent(combatOrder[i]);
            if (tempObj) {
                tempObj.printDamage(combatOrder[i].character.selectedWeapon().rollForDamage());
            }
            //console.log(tempObj.character.getTitle() + " smi: " + tempObj.character.stats.smi);
        }
    },
    
    determineOpponent : function(characterObject) {
        // console.log("determineOpponent - type: " + characterObject.character.type);
        // console.log(characterObject.character.type + " - " + characterObject.target);
        if (characterObject.character.type === "hero") {
            // For heros it is always the player selected target that counts
            // if it is set.
            if (characterObject.target) {
                return characterObject.target;
            }
            return null;
        } else {
            // Npc
            // If already attacking someone, keep on doing it
            if (characterObject.target) {
                return characterObject.target;
            } else {
                // AI for npc opponent choosing
                var i = 0, length = GAME.objects.length, tempObj = null, possibleTargets = [];
                for (i; i < length; i++) {
                    tempObj = GAME.objects[i];
                    // Check if the npc is attacked by anyone
                    if (tempObj.target === characterObject) {
                        possibleTargets.push(tempObj);
                    }
                }
                if (possibleTargets) {
                    // choose one target
                    // at this point I choose the first of the targets
                    // close combat only
                    return possibleTargets[0];
                }
                return null;
            }
        }
    }
    
};