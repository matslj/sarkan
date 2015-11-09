GAME.sprite = {

    /**
     * Creates a css background property. It uses CSS3 to set multiple backgrounds.
     * Example:
     * <p>
     * <code>background: url(img_flwr.gif) right bottom no-repeat, url(img_flwr.gif) left top no-repeat;</code>
     * <p>
     * The same url will be used for all backgrounds and all backgrounds will have no-repeat set.
     * 
     * @param {type} backgroundCoords
     * @returns {String}
     */
    processMultipleBackgrounds : function(backgroundCoords) {
        var background = "",
            coordX,
            coordY,
            i = 0,
            bcLength = backgroundCoords.length;

        for (i = 0; i < bcLength; i++) {
            coordX = -(GAME.SYS_spriteParams.width * backgroundCoords[i].x);
            coordY = -(GAME.SYS_spriteParams.height * backgroundCoords[i].y);
            // background: url(img_flwr.gif) right bottom no-repeat, url(paper.gif) left top repeat;
            background += "url(" + GAME.SYS_spriteParams.images + ") " + coordX + "px " + coordY + "px no-repeat";
            if (i !== (bcLength - 1)) {
                background += ", ";
            }
        }
        return background;
    },

    /**
     * A sprite template. The sprite consists of a div-elementwith width, height and
     * backgroundimage defined by the incoming parameter-object.
     * 
     * <p>
     * Params:
     * <ul>
     * <li>spriteArray - an array of javascript objects on the form <code>{x:1, y: 10}</code>
     *     (the numbers are example numbers) which is the coordinates of all the images
     *     from the global spritesheet, that will be used to create this sprite. The
     *     images will be layed on top of each other so the order of the coordinates
     *     is important. Laborate to get it right.
     * </ul>
     * "param" is of course an arbitrary name.
     * 
     * @param {type} params
     * @returns {DHTMLSprite.that} an DHTMLSprite-instance
     */
    DHTMLSprite : function(aCharacter) {
        
        var character = aCharacter,
            // The elementBase represents the square that the object rest on.
            $elementBase = GAME.SYS_spriteParams.$drawTarget.append('<div/>').find(':last'), // this contains 'grid' cell for the element to be drawn
            // The element is the actual object standing on the elementBase (se above).
            $element =  $elementBase.append('<div/>').find(':last'), // this contains the element to be drawn
            // This is a shortcut to the style-property of the elementBase
            elemBaseStyle = $elementBase[0].style,
            // This is a shortcut to the style-property of the element
            elemStyle = $element[0].style,
            // The processed image-array of the character. In the bottom of
            // the array consists of the naked character and the layers above
            // represents accessories as trousers, sword, shield, etc.
            backgroundCSS = this.processMultipleBackgrounds(character.imgArray),
            unitX = 0,
            unitY = 0,
            mathFloor = Math.floor,
            targetI = null; // The target of an attack. There can be only one victim/turn.

        var movePath = {
            $selected : null, // the aStar path (below) as a series of squares (divs) in a container element (div)
            list : null, // the array returned from aStar
            length : 0, // precalculated length of the aStar path (extracted from list.length)
            remove : function () {
                this.list = null;
                this.length = 0;
                if (this.$selected !== null && this.$selected instanceof jQuery) {
                    this.$selected.remove();
                }
            }
        };

        // The cssdata which does not change over time for the sprite
        var cssObj = {
            position: 'absolute',
            width: GAME.SYS_spriteParams.width,
            height: GAME.SYS_spriteParams.height,
            background: backgroundCSS,
            display: 'none',
            // The element with the images to be drawn (the actual sprite)
            // is displaced by a third in order to create a simple 3d-effect.
            left: '0px',
            top: -(GAME.SYS_spriteParams.height/3 >> 0) + 'px'
        };
        // console.log(cssObj);
        $element.css(cssObj);
        $elementBase.css({
            position: 'absolute',
            width: GAME.SYS_spriteParams.width,
            height: GAME.SYS_spriteParams.height,
            border: "1px solid transparent"
        });
        var that = {
            movePath: movePath,
            character: character,
            target: targetI,
            // x and y in tile unit
            draw: function(x, y) {
                unitX = x;
                unitY = y;
                x = x * GAME.SYS_spriteParams.width; // convert from tile unit to pixels
                y = y * GAME.SYS_spriteParams.height; // convert from tile unit to pixels
                elemBaseStyle.left = x + 'px';
                elemBaseStyle.top = y + 'px';
                this.show();
            },
            getCoordinates: function() {
                return {x:unitX, y:unitY};
            },
            show: function() {
                elemStyle.display = 'block';
            },
            hide: function() {
                elemStyle.display = 'none';
            },
            destroy: function() {
                $element.remove();
            },
            select: function() {
                elemBaseStyle.border = "1px solid yellow";
                if (this.target) {
                    this.target.markAttackedBy();
                }
            },
            deselect: function() {
                elemBaseStyle.border = "1px solid transparent";
                if (this.target) {
                    this.target.deselect();
                }
            },
            getCssAsObject: function() {
                return cssObj;
            },
            markAttackedBy: function() {
                elemBaseStyle.border = "1px solid red";
            },            
            /**
            * Attack an NPC.
            * 
            * @param {type} theTarget the target of the attack. Must be an object of type
            *               GAME.npc.NPC.
            * @param {type} finalizeAttack if true th
            * @returns {undefined}
            */
            markAttacking : function(theTarget, finalizeAttack) {
                if(character.movement.isMaxHalfUsed()) {
                    if (this.target === null) {
                        // attackLocked = typeof finalizeAttack !== "undefined" ? finalizeAttack : false;
                        this.target = theTarget;
                        this.target.markAttackedBy();
                        that.movePath.remove();
                    }
                } else {
                    GAME.utils.showErrorMsg("Mer än hälften av förflyttningen är förbrukad och då är inte anfall möjligt.");
                }
            },
            unMarkAttacking: function() {
                if (that.target) {
                    that.target.deselect();
                }
                that.target = null;
            },
            printDamage: function(damage) {
                //console.log("sssssssssssssssssssssssssss");
                var dmg = this.character.setDamage(damage);
                console.log("damage: " + dmg);
                var $el  = $element.append('<div/>').find(':last');
                $el.append('<span style="display: inline-block; text-align: center; width: 100%; line-height: 32px; vertical-align: middle;">' + dmg + '</span>');
                $el.css({
                    fontSize: '12px',
                    fontWeight: 'bold',
                    position: 'absolute',
                    color: '#FFF',
                    width: GAME.tileWidth,
                    height: GAME.tileHeight,
                    backgroundColor: 'rgba(255,0,0,0.3)',
                    left: '0px',
                    top: '0px'
                });
//                setTimeout(function() {
//                    $el.remove();
//                }, 1000);
            },
            isLocked : function() {
                return this.target !== null;
            }
        };
        return that;
    }
};
