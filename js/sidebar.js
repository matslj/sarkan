/**
 * The sidebar.
 * 
 * @type type
 */
var sidebar = {
    buttons: {
        move: false,
        attack: false,
        search: false,
        stealth: false,
    },
    /**
     * Handles the hinding/showing of sidebar panels and buttons.
     * Should be called when a new game object has been
     * selected or when initializing the game.
     * 
     * @returns {undefined}
     */
    enableSidebarButtons: function () {
        // Disable all
        $("#sidebarButtons input[type='button'] ").attr("disabled", true);
        $(".objectView").hide();
        sidebar.buttons.move = false;
        // If no selectable item is selected, then no point checking below
        if (!GAME.selected) {
            return;
        }

        if (GAME.selected.type === "npc") {
            $("#npc").show();
        }
        if (GAME.selected.type === "hero") {
            $("#hero").show();
            $("#sidebarButtons input[type='button'] ").attr("disabled", false);
            // When a hero is selected move is default
            sidebar.buttons.move = true;
        }
    },
    /**
     * Initializes sidebar. Should be called during game setup.
     * Only needs to be called once.
     * 
     * @returns {undefined}
     */
    init: function () {
        $("#moveButton").click(function () {
            sidebar.action("move");
        });
        $("#attackButton").click(function () {
            sidebar.action("attack");
        });

        sidebar.enableSidebarButtons();
    },
    action: function (action) {
        for (var property in sidebar.buttons) {
            if (sidebar.buttons.hasOwnProperty(property)) {
                sidebar.buttons[property] = false;
            }
        }
        if (GAME.selected) {
            switch (action) {
                case "move":
                    console.log("Moving");
                    sidebar.buttons.move = true;
                    break;
                case "attack":
                    console.log("Attacking");
                    paintObstructedTiles();
                    break;
                default:
                    console.log("Default action");
            }
        }
    },
    setMoveData: function (moveData) {
        $("#ffEdit").html(moveData);
    },
    refresh : function() {
        // Disable all
        $("#sidebarButtons input[type='button'] ").attr("disabled", true);
        $(".objectView").hide();
        sidebar.buttons.move = false;
        
        if (GAME.selected) {            
            if (GAME.selected.type === "npc") {
                $("#npc").show();
            }
            
            if (GAME.selected.type === "hero") {
                $("#hero").show();
                
                $("#ffEdit").html(GAME.selected.movement.ffString());
                
                if (GAME.selected.movement.used < GAME.selected.movement.max) {
                    $("#sidebarButtons input[type='button'] ").attr("disabled", false);
                    // When a hero is selected move is default
                    sidebar.buttons.move = true;
                } 
            }
        }
    }
};