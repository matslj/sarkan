GAME.namespace("npc.AI").movement = {

    moveNpcs: function () {
        
        var i = 0, ilength = GAME.objects.length, tempObj = null;
        for (i; i < ilength; i++) {
            if (GAME.objects[i].character.type === "npc") {
                tempObj = GAME.objects[i];
                console.log("Npc som ska flytta: " + tempObj.character.name);
                this.findClosestTarget(tempObj);
            }
        }
    },
    
    findClosestTarget: function (npc) {
        var tempObj = null,
            bestTarget = null,
            targetArray = [];
    
        // First pick out the heroes in a list with possible targets
        var i = 0, j = 0, ilength = GAME.objects.length;
        for (i; i < ilength; i++) {
            if (GAME.objects[i].character.type === "hero") {
                targetArray.push(GAME.objects[i]);
                console.log(GAME.objects[i].character.name + " - " + GAME.objects[i].getCoordinates());
            }
        }
        
        // Sort the hero list with possible targets on their distance from
        // the npc object.
        i = 0, ilength = targetArray.length;
        for (i; i < ilength; i++) {
            for(j = i - 1; j>-1 && this.compareCoordinates(npc.getCoordinates(), targetArray[j].getCoordinates(), targetArray[i].getCoordinates()) > 0 ; j--) {
                tempObj = targetArray[j+1];
                targetArray[j+1] = targetArray[j];
                targetArray[j] = tempObj;
            }
        }
        
        i = 0, ilength = targetArray.length;
        for (i; i < ilength; i++) {
            console.log(targetArray[i].character.name);
        }
    },
    
    /**
     * Compares two coordinates to an third coordinat and
     * returns -1
     * 
     * @param {type} orgCoord
     * @param {type} coordA
     * @param {type} coordB
     * @returns {undefined}
     */
    compareCoordinates : function(orgCoord, coordA, coordB) {
        var diffAx = 0, diffAy = 0, diffBx = 0, diffBy = 0, aMin = 0, bMin = 0;
        diffAx = Math.abs(Math.abs(orgCoord.x) - Math.abs(coordA.x));
        diffAy = Math.abs(Math.abs(orgCoord.y) - Math.abs(coordA.y));
        diffBx = Math.abs(Math.abs(orgCoord.x) - Math.abs(coordB.x));
        diffBy = Math.abs(Math.abs(orgCoord.y) - Math.abs(coordB.y));
        aMin = diffAx < diffAy ? diffAx : diffAy;
        bMin = diffBx < diffBy ? diffBx : diffBy;
        if (aMin === bMin) return 0;
        if (aMin < bMin) return -1;
        if (aMin > bMin) return 1;
    }
    
};