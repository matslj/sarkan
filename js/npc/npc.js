/**
 * This 'class' returns an object which represents a npc
 * character in the game. The object created by this function extends
 * the GAME.sprite.DHTMLSprite-object.
 * 
 * @param {type} params
 * @returns {GAME.sprite.DHTMLSprite.that|DHTMLSprite.that}
 */
GAME.namespace("npc").NPC = function (params) {

    var that = GAME.sprite.DHTMLSprite(params);
    
    return that;
    
};