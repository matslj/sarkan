GAME.character = {

    loadCharacter : function(characterData) {
        var char = {
            type : characterData.type,
            race : characterData.race,
            name : characterData.name,
            movement: characterData.movement,
            imgArray: characterData.imgArray,
            trade: characterData.trade,
            stats : (function(stats) {
                var copy = jQuery.extend({}, stats);
                for (var property in copy) {
                    if (copy.hasOwnProperty(property)) {
                        if (!GAME.utils.game.isNumeric(copy[property])) {
                            var propVal = GAME.utils.dice.parseDiceString(copy[property]);
                            copy[property] = GAME.utils.dice.rollDice(propVal.nr, propVal.type) + propVal.add;
                        }
                    }
                }
                return copy;
            }(characterData.stats)),
            hitPoints : function() {
                return (Math.ceil((this.stats.sto + this.stats.fys) / 2));
            },
            sb: function() {
                return GAME.utils.tables.getDamageBonus(this.stats.sty, this.stats.sto);
            },
            armor: (function (armor) {
                var arms = [];
                for (var i = 0; i < armor.length; i++) {
                    arms.push(Game.armorData[armor[i]]);
                }
                return arms;
            }(characterData.armor)),
            totalAbs : function() {
                var total = 0;
                for (var i = 0; i < this.armor.length; i++) {
                    total += this.armor[i].abs;
                }
                return total;
            },
            // ****** IN PROGRESS *******
            weapons : (function(dWeapons) {
                var obj = {};
                obj.weapons = [];
                for (var i = 0; i < dWeapons.length; i++) {
                    arms.push(Game.weaponData[dWeapons[i]]);
                }
                return arms;
            }(characterData.weapons))
       };
       return char;
   }
};