/**
 * Contains basic data about characters in the game. For each character/type of
 * character, the following data is provided:
 * <ul>
 * <li>imgArray - an array of image referencing coordinates. For hero characters
 *     this array references their basic character and all their gear (weapons n
 *     stuff). For npc this array only contains a single coordinate.
 * <li>movement - the movement of a character of this type
 * </ul>
 * 
 * @type type
 */
GAME.characterData = {

    elf : {
        // Background images; the char + all clothes and gear
        imgArray : [
            {x:10, y:39}, // Shield
            {x:8, y:36},  // Sword
            {x:2, y:34},  // Pants
            {x:15, y:35}, // Helmet
            {x:6, y:33},  // Chainmail
            {x:0, y:31}   // The character
        ],
        movement : 10,
        hitPoints : 14,
        type: "hero"
    },
    troll : function (type) {
        var subType = {
            mage : {x:21, y:7},
            fighter : {x:20, y:7}
        };

        var object = {
            // Background images; the char + all clothes and gear
            imgArray : [subType[type]],
            movement : 10,
            hitPoints : Math.random(10),
            type: "npc"
        };
        return object;
    }
};