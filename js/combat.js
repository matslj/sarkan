GAME.combat = {
    combatOrder: null,
    lastCharToTakeAHit: null,
    
    resolveCombatOrder : function () {
        // Establish combat order
        var i = 0, 
            j = 0,
            tempObj = null;
    
        this.currentCombatant = 0;
        this.combatOrder = GAME.objects.slice(0); // Shallow copy of all characters
        var ilength = this.combatOrder.length;
                
//        for (i; i < ilength; i++) {
//            tempObj = combatOrder[i];
//            console.log(tempObj.characterData.getTitle() + " smi: " + tempObj.characterData.stats.smi);
//        }
    
        // Sort the combatants using their respective SMI (dexterity) value
        i = 0;
        for (i; i < ilength; i++) {
            for(j = i - 1; j>-1 && this.combatOrder[j].character.stats.smi > this.combatOrder[i].character.stats.smi; j--) {
                tempObj = this.combatOrder[j+1];
                this.combatOrder[j+1] = this.combatOrder[j];
                this.combatOrder[j] = tempObj;
            }
        }
    },

    performCombat : function () {
        var source = null;
        // Attack
        // Observe that combatants are iterated in reverse order. 
//        for (i = ilength - 1; i>-1; i--) {
//            tempObj = this.determineOpponent(combatOrder[i]);
//            if (tempObj) {
//                tempObj.printDamage(combatOrder[i].character.selectedWeapon().rollForDamage());
//            }
//            //console.log(tempObj.character.getTitle() + " smi: " + tempObj.character.stats.smi);
//        }

        if (this.lastCharToTakeAHit !== null) {
            this.lastCharToTakeAHit.removeDamageMarker();
            this.lastCharToTakeAHit = null;
        }
        // console.log("combat order length: " + this.combatOrder.length);
        if (this.combatOrder.length > 0) {
            
            source = this.combatOrder.pop();
            this.lastCharToTakeAHit = this.determineOpponent(source);
            while((!source.character.isAlive() || this.lastCharToTakeAHit === null) && this.combatOrder.length !== 0) {
                source = this.combatOrder.pop();
                this.lastCharToTakeAHit = this.determineOpponent(source);
            }
            
            if (source.character.isAlive() && this.lastCharToTakeAHit !== null) {
                var attackRoll = GAME.utils.dice.rollDie(100);
                var msgStr = source.character.name + " attackerar " + this.lastCharToTakeAHit.character.name + " och ";
                if (attackRoll <= source.character.selectedWeapon().attack) {
                    msgStr += "träffar";
                    sidebar.addMessage(msgStr);
                    this.lastCharToTakeAHit.printDamage(source.character.selectedWeapon().rollForDamage());
                } else {
                    msgStr += "missar";
                    sidebar.addMessage(msgStr);
                }             
            }
        }
        
        return this.combatOrder.length !== 0 || this.lastCharToTakeAHit !== null;
    },
    
    determineOpponent : function(characterObject) {
        // console.log("determineOpponent - type: " + characterObject.character.type);
//        if(characterObject.character.type === "hero") {
//            console.log("determineOpponent " + characterObject.character.type + " - " + characterObject.target.character.name);
//        } else {
//            console.log("determineOpponent " + characterObject.character.type);
//        }
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
                    //console.log("tempobj: " + tempObj.character.type + " - " + (tempObj.target != null ? tempObj.target.character.name : ""));
                    //console.log("id compare: " + (tempObj.target != null ? tempObj.target.id : "-") + " och " + characterObject.id);
                    // Check if the npc is attacked by anyone
                    if (tempObj.target && tempObj.target.id === characterObject.id) {
                        possibleTargets.push(tempObj);
                    }
                }
                // console.log("pp: " + possibleTargets.length);
                if (possibleTargets && possibleTargets.length > 0) {
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