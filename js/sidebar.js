var sidebar = {
    
    buttons : {
        move: false,
        attack: false,
        search: false,
        stealth: false,
    },

    enableSidebarButtons: function () {
        // Disable all
        $("#sidebarButtons input[type='button'] ").attr("disabled", true);
        // If no selectable item is selected, then no point checking below
        if (!GAME.selected) {
            return;
        }

        $("#sidebarButtons input[type='button'] ").attr("disabled", false);
    },
    init: function () {
        $("#moveButton").click(function () {
            sidebar.action("move");
        });
        $("#attackButton").click(function () {
            sidebar.action("attack");
        });

        $("#sidebarButtons input[type='button'] ").attr("disabled", true);
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
                    break;
                default:
                    console.log("Default action");
            }
        }
    }
};