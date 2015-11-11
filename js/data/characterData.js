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
            {x:6, y:32},  // Chainmail
            {x:0, y:31}   // The character
        ],
        movement : 10,
        stats : {
            sty: "2t6+3",
            fys: "3t6",
            sto: "2t6+2",
            int: "4t6",
            psy: "3t6",
            smi: "3t6+3",
            kar: "3t6+2"
        },
        type: "hero",
        race: "Alv",
        trade: "Krigare",
        name: "Ladogas",
        armor: [
            0
        ],
        weapons: [
            {
                type: 0,
                attack: 85,
                defence: 70
            }
        ]
    },
    human : {
        // Background images; the char + all clothes and gear
        imgArray : [
            {x:51, y:35},  // Sword
            {x:4, y:34},  // Pants
            {x:10, y:35}, // Helmet
            {x:9, y:33},  // Chainmail
            {x:8, y:31}   // The character
        ],
        movement : 10,
        stats : {
            sty: "18",
            fys: "3t6",
            sto: "15",
            int: "3t6",
            psy: "3t6",
            smi: "3t6",
            kar: "3t6"
        },
        type: "hero",
        race: "Människa",
        trade: "Krigare",
        name: "Cromos",
        armor: [
            3
        ],
        weapons: [
            {
                type: 2,
                attack: 85,
                defence: 70
            }
        ]
    },
    troll : function (type, theName) {
        var subType = {
            mage : {x:21, y:7},
            fighter : {x:20, y:7}
        };

        var object = {
            // Background images; the char + all clothes and gear
            imgArray : [subType[type]],
            movement : 10,
            stats : {
                sty: "3t6+6",
                fys: "2t6+6",
                sto: "3t6+6",
                int: "2t6+3",
                psy: "3t6",
                smi: "3t6",
                kar: 0
            },
            type: "npc",
            race: "Grottroll",
            name: (typeof theName === "undefined" ? "" : theName),
            armor: [
                1
            ],
            weapons: [
                {
                    type: 1,
                    attack: 65,
                    defence: 50
                }
            ]
        };
        return object;
    }
};