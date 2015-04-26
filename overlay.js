var overlay = {
    init: function() {
        var x = GAME.tilesAcross,
            y = GAME.tilesDown,
            i, j,
            html = "";
    
        var $viewport = $('<div>');

        $viewport.attr({
            'id': 'overlay'
        }).css({
            'width': '100%',
            'height': '100%',
            'position': 'absolute',
            'overflow': 'hidden'
        });

        // Attach viewport to viewports wrapper.
        GAME.container.append($viewport);
    
        for (i = 0; i < y; i++) {
            for (j = 0; j < x; j++) {
                html += '<div class="oTile" style="position:absolute;' +
                        'background-color: transparent;' +
                        'width:' + GAME.tileWidth + 'px;' +
                        'height:' + GAME.tileHeight + 'px;' +
                        'left:' + (j * GAME.tileWidth) + 'px;' +
                        'top:' + (i * GAME.tileHeight) + 'px;' + '"/>';
            }
        }
        html += '</div>';
        // Put the whole lot in the viewport.
        $viewport.html(html);
    }
};