/**
 * This class deals with everything that has to do with combat.
 * 
 * @type type
 */
GAME.namespace("combat").Combat = function() {
    var combatOrder = null,    // Array of combatants in increasing dex order
        source = null,         // Source of an attack (the attacker)
        targetOfAttack = null, // Target of an attack (the defender)
        state = 0;
        
    function findAdjacentAdversary(characterObject, targetType) {
        var x = 0, y = 0, i = 0, length = GAME.objects.length, tempObj = null, possibleTargets = [];
        for (i; i < length; i++) {
            tempObj = GAME.objects[i];
            if (tempObj.character.type === targetType && tempObj.character.isAlive()) {
                //console.log("tempobj: " + tempObj.character.type + " - " + (tempObj.target != null ? tempObj.target.character.name : ""));
                //console.log("id compare: " + (tempObj.target != null ? tempObj.target.id : "-") + " och " + characterObject.id);

                // Check if the npc is attacked by anyone
//                    if (tempObj.target && tempObj.target.id === characterObject.id) {
//                        possibleTargets.push(tempObj);
//                    }
                // Check if adjacent - close combat is prioritized; if attacked
                // in close combat it is reasonable that those attacking you
                // have the highest priority.
                x = tempObj.getCoordinates().x;
                y = tempObj.getCoordinates().y;
                if(GAME.utils.game.checkIfAdjacent(characterObject.getCoordinates().x, characterObject.getCoordinates().y, x, y)) {
                    possibleTargets.push(tempObj);
                }
            }
        }
        return possibleTargets;
    }

    /**
     * AI for determining opponent.
     * 
     * @param {type} characterObject
     * @returns {unresolved}
     */
    function determineOpponent(characterObject) {
        var possibleTargets = null;
        if (characterObject.character.type === "hero") {
            // For heros it is always the player selected target that has highest priority
            if (characterObject.target && characterObject.target.character.isAlive()) {
                return characterObject.target;
            }
            // If the player character is surrounded by enemies and the playser is lazy
            // this algorithm finds the a target for the player.
            possibleTargets = findAdjacentAdversary(characterObject, "npc");
            if (possibleTargets.length > 0) {
                return possibleTargets[0];
            }
            return null;
        } else {
            // Npc
            // Can the npc attack? (is alive, used less than half movement, has a selected weapon, etc)
            if (!characterObject.character.canAttack()) {
                return null;
            }
            // If already attacking someone, keep on doing it
            else if (characterObject.target && characterObject.target.character.isAlive()) {
                console.log(characterObject.target.character.getTitle() + " is alive and can be fought");
                return characterObject.target;
            } else {
                // AI for npc opponent choosing
                possibleTargets = findAdjacentAdversary(characterObject, "hero");
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
       
    /**
     * Sets attacker (source) and defender (targetOfAttack).
     * This method loops util it finds an attacker has a target to attack or
     * util the list of combatants (combatOrder) is empty.
     * 
     * @returns {boolean} true if a attacker defender pair could be found, else false
     */
    function setAttackerAndDefender() {
         source = combatOrder.pop();
         targetOfAttack = determineOpponent(source);
         while(combatOrder.length !== 0 && targetOfAttack === null) {
             source = combatOrder.pop();
             targetOfAttack = determineOpponent(source);
         }
         // console.log(source.character.name + " found " + targetOfAttack.character.name);

         return source !== null && targetOfAttack !== null;
    }
        
    function isHeroAndCanParry() {
        if (targetOfAttack.character.type === "hero") {
            return false;
        }
        return false;
    }
        
    function isAttackParried(parry) {
        return false;
    }

    /**
     * Private (to the combat-class).
     * 
     * @param {type} attacker
     * @returns {undefined}
     */
     function makeTheAttack(attacker) {
        var attackRoll = 0;
        var msgStr = '';

        if (attacker.character.isAlive() && targetOfAttack !== null) {
            attackRoll = GAME.utils.dice.rollDie(100);
            msgStr = attacker.character.name + " attackerar " + targetOfAttack.character.name + " och ";
            if (attackRoll <= attacker.character.selectedWeapon().attack) {
                msgStr += "träffar";
                sidebar.addMessage(msgStr);
                targetOfAttack.printDamage(attacker.character.selectedWeapon().rollForDamage());
            } else {
                msgStr += "missar";
                sidebar.addMessage(msgStr);
            }             
        }
    }

    var that = {
        
        COMBAT_PHASE_INITIATED : 0,
        COMBAT_PHASE_COMPLETE : 1,
        WAIT_FOR_PARRY : 2,
        NEXT_COMBATANT : 3,
    
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
         * <li>combatOrder - an array populated as mentioned above
         * <li>source - reset to null
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

            // Reset source
            source = null;
            // Reset state
            state = this.COMBAT_PHASE_INITIATED;
            // Reset array with combatants
            combatOrder = GAME.objects.slice(0); // Shallow copy of all characters
            var ilength = combatOrder.length;

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
            // Observe that combatants are sorted in reverse order; the first to 
            // perform an action is the last in the list.
            
            for (i=0; i < ilength; i++) {
            tempObj = combatOrder[i];
            console.log(tempObj.character.getTitle() + " smi: " + tempObj.character.stats.smi);
            }
        },

        /**
         * Performs a round of combat.
         * 
         * @returns {Boolean} true if all the combatants has been popped out
         *                    of the combat order array (=combatOrder is empty)
         *                    _OR_ if targetOfAttack is not null. This last part
         *                    only means that we want the performCombat method
         *                    to be called one more time so that the damage
         *                    marker on the targetOfAttack will be cleared. I
         *                    do it like this because the calling of this method
         *                    is supposed to be timed within a self calling
         *                    timout loop. So true means "call this method again,
         *                    please" and false means "you do not have to call
         *                    this method again this round".
         */
        performCombat : function (parry) {
            parry = typeof parry != "undefined" ? parry : false;
            
            if (parry) {
                console.log("A parry is attempted");
                if (!isAttackParried(parry)) {
                    makeTheAttack(source);  
                }
                if (combatOrder.length !== 0 || targetOfAttack !== null) {
                    state = this.NEXT_COMBATANT;
                } else {
                    state = this.COMBAT_PHASE_COMPLETE;
                }
            } else {
                // Remove (graphic) damage marker placed in the last attack.
                if (targetOfAttack !== null) {
                    targetOfAttack.removeDamageMarker();
                    targetOfAttack = null;
                }
            
                // Determine attacker and defender
                if (combatOrder.length > 0) {
                    if (setAttackerAndDefender()) {
                        if (isHeroAndCanParry()) {
                            state = WAIT_FOR_PARRY;
                        } else {
                            if (!isAttackParried()) {
                                makeTheAttack(source);  
                            }
                            if (combatOrder.length !== 0 || targetOfAttack !== null) {
                                state = this.NEXT_COMBATANT;
                            } else {
                                state = this.COMBAT_PHASE_COMPLETE;
                            }
                        }
                    } else {
                        state = this.COMBAT_PHASE_COMPLETE;
                    }
                } else {
                    state = this.COMBAT_PHASE_COMPLETE;
                }
            }
            
            return {
                state : state,
                attacker: source,
                defender: targetOfAttack
            };
        },
        
//        combatPhaseOne : function() {
//            
//            if (combatOrder.length > 0) {    
//                this.setAttackerAndDefender();
//            }
//
//            return source !== null && targetOfAttack !== null;
//        },
        
        combatPhaseTwo : function() {
            // Remove (graphic) damage marker placed in the last attack by this char.
            this.makeTheAttack(source);

            return combatOrder.length !== 0 || targetOfAttack !== null;
        }
    };
    return that; 
};