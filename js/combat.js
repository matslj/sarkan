GAME.combat = {

    performCombat : function () {
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
            for(j = i - 1; j>-1 && combatOrder[j].characterData.stats.smi > combatOrder[i].characterData.stats.smi; j--) {
                tempObj = combatOrder[j+1];
                combatOrder[j+1] = combatOrder[j];
                combatOrder[j] = tempObj;
            }
        }
        
        // Attack
        // Observe that combatants are iterated in reverse order. 
        for (i = ilength - 1; i>-1; i--) {
            tempObj = combatOrder[i];
            
            console.log(tempObj.characterData.getTitle() + " smi: " + tempObj.characterData.stats.smi);
        }
    }
    
};