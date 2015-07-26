GAME.combat = {

    performCombat : function () {
        // Establish combat order
        var i = 0, 
            j = 0,
            combatOrder = GAME.objects.slice(0), // Shallow copy
            ilength = combatOrder.length,
            tempObj = null;
        
        for (i; i < ilength; i++) {
            tempObj = combatOrder[i];
            for(j = i - 1; j>-1 && combatOrder[j].characterData.stats.smi > tempObj.characterData.stats.smi; j--) {
                combatOrder[j+1] = combatOrder[j];
            }
            combatOrder[j+1] = tempObj;
        }
        
        // Observe that combatants are in reverse order.
        
        for (i = ilength - 1; i>-1; i--) {
            tempObj = combatOrder[i];
            
        }
    }
    
};