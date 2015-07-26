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
        stats : {
            sty: (GAME.utils.dice.rollDice(2,6) + 3),
            fys: (GAME.utils.dice.rollDice(3,6)),
            sto: (GAME.utils.dice.rollDice(2,6) + 2),
            int: (GAME.utils.dice.rollDice(4,6)),
            psy: (GAME.utils.dice.rollDice(3,6)),
            smi: (GAME.utils.dice.rollDice(3,6) + 3),
            kar: (GAME.utils.dice.rollDice(3,6) + 2)
        },
        hitPoints : function() {
            return (Math.ceil((this.stats.sto + this.stats.fys) / 2));
        },
        type: "hero",
        race: "Alv",
        trade: "Krigare",
        name: "Ladogas",
        armor: {
            type: "Ringbrynja",
            abs: 4
        },
        weapons: [
            {
                name: "Bredsvärd",
                attack: 70,
                parry: 60
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
                sty: (GAME.utils.dice.rollDice(3,6) + 6),
                fys: (GAME.utils.dice.rollDice(2,6) + 6),
                sto: (GAME.utils.dice.rollDice(3,6) + 6),
                int: (GAME.utils.dice.rollDice(2,6) + 3),
                psy: (GAME.utils.dice.rollDice(3,6)),
                smi: (GAME.utils.dice.rollDice(3,6)),
                kar: 0
            },
            hitPoints : function() {
                return (Math.ceil((this.stats.sto + this.stats.fys) / 2));
            },
            sb: function() {
                return GAME.utils.tables.getDamageBonus(this.stats.sty, this.stats.sto);
            },
            type: "npc",
            race: "Grottroll",
            name: (typeof theName === "undefined" ? "" : theName),
            armor: {
                type: "hud",
                abs: 3
            }
        };
        return object;
    }
};