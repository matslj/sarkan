var mouse = {
    // x,y coordinates of mouse relative to top left corner of GAME.container
    x:0,
    y:0,
    // game grid x,y coordinates of mouse 
    gridX:0,
    gridY:0,
    // whether or not the left mouse button is currently pressed
    buttonPressed:false,

	click:function(ev,rightClick){
		// Player clicked inside the canvas

		var clickedItem = this.itemUnderMouse();
		//var shiftPressed = ev.shiftKey;

		if (!rightClick){ // Player left clicked
			if (clickedItem){				

			}
		} else { // Player right clicked
			// Handle actions like attacking and movement of selected units
		}
	},
	itemUnderMouse:function(){
		for (var i = game.items.length - 1; i >= 0; i--){
	        var item = game.items[i];
	        if (item.type=="buildings" || item.type=="terrain"){
	            if(item.lifeCode != "dead" 
					&& item.x<= (mouse.gameX)/game.gridSize 
	                && item.x >= (mouse.gameX - item.baseWidth)/game.gridSize
	                && item.y<= mouse.gameY/game.gridSize 
	                && item.y >= (mouse.gameY - item.baseHeight)/game.gridSize
	                ){
	                    return item;
	            }
	        } else if (item.type=="aircraft"){
	            if (item.lifeCode != "dead" && 
					Math.pow(item.x-mouse.gameX/game.gridSize,2)+Math.pow(item.y-(mouse.gameY+item.pixelShadowHeight)/game.gridSize,2) < Math.pow((item.radius)/game.gridSize,2)){
	                return item;
	            }
		   }else {
	            if (item.lifeCode != "dead" && Math.pow(item.x-mouse.gameX/game.gridSize,2)+Math.pow(item.y-mouse.gameY/game.gridSize,2) < Math.pow((item.radius)/game.gridSize,2)){
	                return item;
	            }
	        }
		}
	},
	calculateGameCoordinates:function(){
        // At the moment no offset is used
		mouse.gameX = mouse.x + GAME.offsetX ;
		mouse.gameY = mouse.y + GAME.offsetY;

		mouse.gridX = mouse.gameX / GAME.tileWidth >> 0;
		mouse.gridY = mouse.gameY / GAME.tileHeight >> 0;	
	},
    init:function(){
        var $eventArea = GAME.container;
        
        $eventArea.mousemove(function(ev) {
            var offset = $eventArea.offset();
            mouse.x = ev.pageX - offset.left;
            mouse.y = ev.pageY - offset.top;  
            
            mouse.calculateGameCoordinates();               
        });
        
        $eventArea.click(function(ev) {
            mouse.click(ev,false);                
            return false;
        });

        $eventArea.mouseleave(function(ev) {
            mouse.insideCanvas = false;
        });
        
        $eventArea.mouseenter(function(ev) {
            mouse.buttonPressed = false;
            mouse.insideCanvas = true;
        });
    }
};
