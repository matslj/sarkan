/**
 * This class deals with everything that has to do with combat.
 * 
 * @type type
 */
GAME.combat = {
    combatOrder: null,
    source: null,
    targetOfAttack: null,
    
    /**
     * Before any blows are struck, the initiative order between the
     * combatants must be established. In this game, initiative order
     * is determined by the dexterity value of each character; higher
     * dex strikes before lower dex.
     * <p>
     * This method sorts the combatants in increasing dex order,
     * so the combatant with the highest dex is last in the resulting
     * array (which enables pop()-ing later on).
     * <p>
     * This method should only be called once each SR (combat round).
     * <p>
     * This method affects the following attributes:
     * <ul>
     * <li>this.combatOrder - an array populated as mentioned above
     * <li>this.source - reset to null
     * <li>this.currentCombattant - reset to 0
     * </ul>
     * 
     * @returns {undefined} nothing is returned
     */
    resolveCombatOrder : function () {
        // Establish combat order
        var i = 0, 
            j = 0,
            tempObj = null;
    
        this.source = null;
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
        // Observe that combatants are sorted in reverse order; the first to 
        // perform an action is the last in the list.
    },

    /**
     * Performs a round of combat.
     * 
     * @returns {Boolean}
     */
    performCombat : function () {
        // Remove (graphic) damage marker placed in the last attack by this char.
        if (this.targetOfAttack !== null) {
            this.targetOfAttack.removeDamageMarker();
            this.targetOfAttack = null;
        }
        // console.log("combat order length: " + this.combatOrder.length);
        if (this.combatOrder.length > 0) {    
            this.setAttackerAndDefender();
            this.makeTheAttack(this.source);
        }
        
        return this.combatOrder.length !== 0 || this.targetOfAttack !== null;
    },
    
    /**
     * Private (to the combat-class).
     * 
     * @param {type} attacker
     * @returns {undefined}
     */
    makeTheAttack : function(attacker) {
        var attackRoll = 0;
        var msgStr = '';
        
        if (attacker.character.isAlive() && this.targetOfAttack !== null) {
            attackRoll = GAME.utils.dice.rollDie(100);
            msgStr = attacker.character.name + " attackerar " + this.targetOfAttack.character.name + " och ";
            if (attackRoll <= attacker.character.selectedWeapon().attack) {
                msgStr += "träffar";
                sidebar.addMessage(msgStr);
                this.targetOfAttack.printDamage(attacker.character.selectedWeapon().rollForDamage());
            } else {
                msgStr += "missar";
                sidebar.addMessage(msgStr);
            }             
        }
    },
    
    /**
     * Sets attacker (this.source) and defender (this.targetOfAttack).
     * This method loops util it finds an attacker has a target to attack or
     * util the list of combatants (this.combatOrder) is empty.
     * 
     * @returns {undefined} only the default undefined
     */
    setAttackerAndDefender: function() {
        this.source = this.combatOrder.pop();
        this.targetOfAttack = this.determineOpponent(this.source);
        while((!this.source.character.isAlive() || this.targetOfAttack === null) && this.combatOrder.length !== 0) {
            this.source = this.combatOrder.pop();
            this.targetOfAttack = this.determineOpponent(this.source);
        }
    },
    
    /**
     * AI for determining opponent.
     * 
     * @param {type} characterObject
     * @returns {unresolved}
     */
    determineOpponent : function(characterObject) {
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
            if (characterObject.target && characterObject.target.character.isAlive()) {
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