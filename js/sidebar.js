var sidebar = {
	enableSidebarButtons:function() {
		// Disable all
		$("#sidebarButtons input[type='button'] ").attr("disabled", true);		
		// If no selectable item is selected, then no point checking below
		if (!GAME.selected){		
			return;
		}

	},
	init:function(){		
		$("#moveButton").click(function(){
			sidebar.move();
		});
		$("#attackButton").click(function(){
			sidebar.attack();
		});
        
        $("#sidebarButtons input[type='button'] ").attr("disabled", true);
	},
	move:function(){
		console.log("hej");
	},
	attack:function(){
		console.log("uhuh");
	}
};