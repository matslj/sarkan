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
            if (GAME.selected.character.type === "npc") {
                $("#npc").show();
                
                $("#npc .header").html(GAME.selected.character.getTitle());
                
                // Update movement points
                $("#npc div.ff").html(GAME.selected.character.movement.ffString());
                
                // Update movement points
                $("#npc div.hp").html(GAME.selected.character.getHpString());
            }
            
            if (GAME.selected.character.type === "hero") {
                $("#hero").show();
                
                $("#hero div.right div.namn").html(GAME.selected.character.name);
                $("#hero div.right div.ras").html(GAME.selected.character.race);
                $("#hero div.right div.yrke").html(GAME.selected.character.trade);
                
                // Update movement points
                $("#ffEdit").html(GAME.selected.character.movement.ffString());
                
                $("#hero table td.sty").html(GAME.selected.character.stats.sty);
                $("#hero table td.fys").html(GAME.selected.character.stats.fys);
                $("#hero table td.sto").html(GAME.selected.character.stats.sto);
                $("#hero table td.int").html(GAME.selected.character.stats.int);
                $("#hero table td.psy").html(GAME.selected.character.stats.psy);
                $("#hero table td.smi").html(GAME.selected.character.stats.smi);
                $("#hero table td.kar").html(GAME.selected.character.stats.kar);
                
                // Update health points
                $("#kpEdit").html(GAME.selected.character.getHpString());
                
                if (GAME.selected.character.movement.used < GAME.selected.character.movement.max) {
                    $("#sidebarButtons input[type='button'] ").attr("disabled", false);
                    // When a hero is selected move is default
                    sidebar.buttons.move = true;
                } 
            }
        }
    }
};