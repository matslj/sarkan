var mouse = {
    // x,y coordinates of mouse relative to top left corner of GAME.container
    x: 0,
    y: 0,
    // game grid x,y coordinates of mouse 
    gridX: 0,
    gridY: 0,
    gridXOld: 0,
    gridYOld: 0,
    // whether or not the left mouse button is currently pressed
    buttonPressed: false,
    insideCanvas: false,
    initiated: false,
    click: function (ev, rightClick) {
        // console.log("clicked");

        var clickedItem = this.itemUnderMouse();
        //var shiftPressed = ev.shiftKey;

        if (!rightClick) { // Player left clicked
            GAME.selected = null;
            if (clickedItem) {
                GAME.selected = clickedItem;
            }
            GAME.selectDeselectGameObjects();
            // sidebar.enableSidebarButtons();
        } else { // Player right clicked
            // Handle actions like attacking and movement of selected units
            if (GAME.selected) {
                if (GAME.selected.character.type === "hero") {
                    if (!clickedItem || !clickedItem.character.isAlive()) {
                        // Move
                        GAME.selected.moveTo(mouse.gridX, mouse.gridY);
                    } else if (clickedItem.character.type === "npc") {
                        // Attack
                        var coord = GAME.selected.getCoordinates();
                        // console.log("x: " + coord.x + ", " + coord.y);
                        if (GAME.utils.game.checkIfAdjacent(mouse.gridX, mouse.gridY, coord.x, coord.y)) {
                            GAME.selected.markAttacking(clickedItem, true);
                        }
                    }
                }
            }
        }
        sidebar.refresh();
    },
    itemUnderMouse: function () {
//         console.log(mouse.gridX + ", " + mouse.gridY);
        var i = 0, length = GAME.objects.length;
        var selectedItem = null, coord = null;
        for (i; i < length; i++) {
            coord= GAME.objects[i].getCoordinates();
            if (coord.x == mouse.gridX &&
                    coord.y == mouse.gridY) {
                selectedItem = GAME.objects[i];
            }
        }
        
        return selectedItem;
    },
    calculateGameCoordinates: function (mX, mY) {
        // At the moment no offset is used
        mouse.gameX = mX + GAME.offsetX;
        mouse.gameY = mY + GAME.offsetY;
        
        mouse.gridXOld = mouse.gridX;
        mouse.gridYOld = mouse.gridY;

        mouse.gridX = (mouse.gameX / GAME.tileWidth) >> 0;
        mouse.gridY = (mouse.gameY / GAME.tileHeight) >> 0;
    },
    mouseMoveHandler : function(mX, mY) {
        mouse.calculateGameCoordinates(mX, mY);
            
            // Only perform new action if grid position has changed
            if (mouse.gridX !== mouse.gridXOld || mouse.gridY !== mouse.gridYOld) {
                // console.log("new: (" + mouse.gridX + ", " + mouse.gridY + ") old: (" +
                //         + mouse.gridXOld + ", " + mouse.gridYOld + ")");
                if (GAME.selected) { //  && sidebar.buttons.move
                    if (!GAME.selected.isLocked()) {
                        var coord = GAME.selected.getCoordinates();
                        var itemUnderPointer = mouse.itemUnderMouse();
                        // Mark move to empty space (=space with no live character)
                        if (itemUnderPointer === null || !itemUnderPointer.character.isAlive()) {
                            if (GAME.selected.character.type === "hero") {
//                                GAME.selected.unAttack();
                                GAME.selected.markMove(mouse.gridX, mouse.gridY);
                            }
                        }
                    }
                }
            }
    },
    init: function () {
        var $eventArea = GAME.container;
        var offset = $eventArea.offset();

        $eventArea.mousemove(function (ev) {
            mouse.initiated = true;
            mouse.x = ev.pageX - offset.left;
            mouse.y = ev.pageY - offset.top;

            mouse.mouseMoveHandler(mouse.x, mouse.y);
        });

        $eventArea.click(function (ev) {
            if (!mouse.initiated) {
                mouse.x = ev.pageX - offset.left;
                mouse.y = ev.pageY - offset.top;

                mouse.mouseMoveHandler(mouse.x, mouse.y);
            }
            mouse.click(ev, false);
            return false;
        });
        
        $eventArea.bind("contextmenu", function (ev) {
            mouse.click(ev, true);
            return false;
        });

        $eventArea.mouseleave(function (ev) {
            mouse.insideCanvas = false;
        });

        $eventArea.mouseenter(function (ev) {
            mouse.buttonPressed = false;
            mouse.insideCanvas = true;
        });
    }
};
