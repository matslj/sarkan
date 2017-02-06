/**
 * This represents a character (hero or npc) in the game, with all their skills
 * stats, inventory, etc.
 * <p>
 * In order to create a new character: run the loadCharacter-function (with 
 * characterspecific data as parameter). This method returns an object
 * representing the character. Properties and methods of this object:
 * <ul>
 * <li>type - type of character (hero or npc)
 * <li>race - race of character
 * <li>name - name of character (optional)
 * <li>movement - the speed by which the character moves
 * <li>imgArray - an array of images which are used to display the character
 * <li>trade - the trade of the character (fighter, monk, thief, wizard, etc)
 * <li>stats - the basic characteristics of the characters (smi, sty, kar, etc)
 * <li>(function) hitPoints - the total number of hitpoints
 * <li>(function) sb - the damage bonus, this bonus is added to a weapons damage in close combat
 * <li>armor - an array of the armor worn by the character.
 * <li>(function) totalAbs - total absorbationvalue of the armor
 * <li>weapons - a list of weapons worn
 * </ul>
 * 
 * @type type
 */
GAME.character = {

    loadCharacter : function(characterData) {
        
        var hp = -9999;
        
        var char = {
            type : characterData.type,
            race : characterData.race,
            name : characterData.name,
            imgArray: characterData.imgArray,
            trade: characterData.trade,
            
            movement : {
                max : characterData.movement,
                half : (characterData.movement/2 >> 0),
                used : 0,
                ffString : function() {
                    return this.used + " / " + this.max;
                },
                isMaxHalfUsed : function() {
                    return this.used <= this.half;
                },
                reset : function () {
                    this.used = 0;
                }
            },
            
            stats : (function(stats) {
                var copy = jQuery.extend({}, stats);
                for (var property in copy) {
                    if (copy.hasOwnProperty(property)) {
                        if (!GAME.utils.game.isNumeric(copy[property])) {
                            var propVal = GAME.utils.dice.parseDiceString(copy[property]);
                            copy[property] = GAME.utils.dice.rollDice(propVal.nr, propVal.type) + propVal.add;
                        } else {
                            // The stats in the data file is stored as a string and therefore
                            // needs to be converted to an integer
                            copy[property] = parseInt(copy[property]);
                        }
                    }
                }
                return copy;
            }(characterData.stats)),
            
            getHitPoints : function() {
                return (Math.ceil((this.stats.sto + this.stats.fys) / 2));
            },
            
            getCurrentHitPoints: function() {
                if (hp === -9999) {
                    hp = this.getHitPoints();
                }
                return hp;
            },
            
            heal: function(healingPoints) {
                if (this.isAlive()) {
                    hp += healingPoints;
                    if (hp > this.getHitPoints()) {
                        hp = this.getHitPoints();
                    }
                }
            },
            
            getHpString: function() {
                return this.getCurrentHitPoints() + " / " + this.getHitPoints();
            },
            
            setDamage: function(damage) {
                var afterAbs = this.getTotalAbs() - damage;
                if (afterAbs < 0) {
                    hp = this.getCurrentHitPoints() + afterAbs;
                    return Math.abs(afterAbs);
                }
                return 0; // return damage dealt
            },
            
            isAlive: function() {
                return (this.getCurrentHitPoints() > 0);
            },
            
            canAttack: function() {
                console.log(this.getTitle() + " can attack?: " + this.getCurrentHitPoints() + " : " + this.movement.used);
                return (this.getCurrentHitPoints() >= 0 && this.movement.isMaxHalfUsed());
            },
            
            getSb: function() {
                return GAME.utils.tables.getDamageBonus(this.stats.sty, this.stats.sto);
            },
            
            getTitle : function() {
                return this.name ? this.name : this.race;
            },
            
            armor: (function (armor) {
                var arms = [];
                for (var i = 0; i < armor.length; i++) {
                    arms.push(GAME.armorData[armor[i]]);
                }
                return arms;
            }(characterData.armor)),
            
            getTotalAbs : function() {
                var total = 0;
                for (var i = 0; i < this.armor.length; i++) {
                    total += this.armor[i].abs;
                }
                return total;
            },
            
            weapons : (function(dWeapons) {
                var weapons = [];
                for (var i = 0; i < dWeapons.length; i++) {
                    var wData = GAME.weaponData[dWeapons[i].type];
                    //console.log("wData: "+wData + " dWeapons: " + dWeapons[i].type);
                    var target = $.extend({}, wData, dWeapons[i]);
                    target.rollForDamage = (function(dmgString) {
                        var parsedDmg = GAME.utils.dice.parseDiceString(dmgString);
                        return function() {
                            var sb = (char.getSb() ? GAME.utils.dice.rollDice(char.getSb()[0], char.getSb()[1]) : 0);
                            return GAME.utils.dice.rollDice(parsedDmg.nr, parsedDmg.type) + parsedDmg.add + sb;
                        }
                    }(wData.damage));
                    weapons.push(target);
                }
                return weapons;
            }(characterData.weapons)),
            
            selectedWeapon : function() {
                return this.weapons[0];
            },
            
            toString : function() {
                var print = function(string) {
                        if (typeof string === "undefined") {
                            string = "";
                        }
                        txt = txt + string + "\n";
                    },
                    txt = '';
                
                print("*** Printing character data ***");
                print();
                print("Typ:          " + this.type);
                print("Ras:          " + this.race);
                print("Namn:         " + this.name);
                print("Yrke:         " + this.trade);
                print("Förflyttning: " + this.movement.max);
                print("Kroppspoäng:  " + this.getHitPoints());
                print("Skadebonus:   " + this.getSb());
                
                print();
                
                print("-- Grundegenskaper --")
                for (var stat in this.stats) {
                    if (this.stats.hasOwnProperty(stat)) {
                        print(stat + " : " + this.stats[stat]);
                    }
                }
                print();
                print("-- Rustning --")
                for (var i = 0; i < this.armor.length; i++) {
                    print(this.armor[i].name + " abs: " + this.armor[i].abs);
                }
                print();
                print("-- Vapen --")
                for (var i = 0; i < this.weapons.length; i++) {
                    print(this.weapons[i].name + " attack: " + this.weapons[i].attack + " parera: " + this.weapons[i].defence + " skada: " + this.weapons[i].damage);
                    print("Example dmg roll: " + this.weapons[i].rollForDamage());
                    print("Example dmg roll: " + this.weapons[i].rollForDamage());
                    print("Example dmg roll: " + this.weapons[i].rollForDamage());
                    print("Example dmg roll: " + this.weapons[i].rollForDamage());
                    print("Example dmg roll: " + this.weapons[i].rollForDamage());
                    print("Example dmg roll: " + this.weapons[i].rollForDamage());
                    print("Example dmg roll: " + this.weapons[i].rollForDamage());
                    print("Example dmg roll: " + this.weapons[i].rollForDamage());
                    print("Example dmg roll: " + this.weapons[i].rollForDamage());
                    print("Example dmg roll: " + this.weapons[i].rollForDamage());
                    print("Example dmg roll: " + this.weapons[i].rollForDamage());
                    print("Example dmg roll: " + this.weapons[i].rollForDamage());
                    print("Example dmg roll: " + this.weapons[i].rollForDamage());
                }
                
                return txt;
            }
       };
       return char;
   }
};