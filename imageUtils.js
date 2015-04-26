var imageUtils = {
    
    dec2Bin: function (dec){
        return (dec >>> 0).toString(2);
    },
    
    /**
     * Translates flags for:
     * <ul>
     * <li> hf - horizontal flip
     * <li> vf - vertical flip
     * <li> df - diagonal flip
     * </ul>
     * into rotation in degrees.
     * 
     * @param {type} hf true = hor flip
     * @param {type} vf true = vert flip
     * @param {type} df true = diag flip
     * @returns {Number}
     */
    getRotation: function (hf, vf, df) {
        if (hf && !vf && df) {
            return 90;
        }
        if (hf && vf && df) {
            return 180;
        }
        if (!hf && vf && df) {
            return 270;
        }
        return 0;
    },
    
    /**
     * Sets x browser css rotation for an element using three flags
     * <ul>
     * <li> hf - horizontal flip
     * <li> vf - vertical flip
     * <li> df - diagonal flip
     * </ul>
     * 
     * @param {type} elementStyle ref to the style property of an element
     * @param {type} hf true = hor flip
     * @param {type} vf true = vert flip
     * @param {type} df true = diag flip
     * @returns {undefined}
     */
    setCssRotation: function (elementStyle, hf, vf, df) {
        elementStyle.webkitTransform = "rotate(" + imageUtils.getRotation(hf, vf, df) + "deg)";
        elementStyle.MozTransform = "rotate(" + imageUtils.getRotation(hf, vf, df) + "deg)";
        elementStyle.msTransform = "rotate(" + imageUtils.getRotation(hf, vf, df) + "deg)";
        elementStyle.OTransform = "rotate(" + imageUtils.getRotation(hf, vf, df) + "deg)";
        elementStyle.transform = "rotate(" + imageUtils.getRotation(hf, vf, df) + "deg)";
    }
};

// One instance of tileScroller is required for each viewport.        
var tileScroller = function(params) {

    var that = {},
            $viewport = params.$viewport,
            // Calculate maximum number of tiles that can be displayed in viewport.
            tilesAcross = Math.ceil(($viewport.innerWidth() + params.tileWidth) / params.tileWidth),
            tilesDown = Math.ceil(($viewport.innerHeight() + params.tileHeight) / params.tileHeight),
            // Create a handle element that all tiles will be attached to.
            // If this element is moved, so all the attached tiles will move.
            html = '<div class="handle" style="position:absolute;">',
            left = 0,
            top = 0,
            // General counters.
            tiles = [],
            // Stores are reference to each tile's style property.
            tileBackPos = [],
            // Stores the background position offset for each tile bitmap.
            mapWidthPixels = params.mapWidth * params.tileWidth,
            mapHeightPixels = params.mapHeight * params.tileHeight,
            handle, i; // General counter.

    // Attach all the tiles to the handle. This is done by creating
    // one big DOM string and attaching the in one jQuery call.
    // This is faster than attaching each one individually.
    for (top = 0; top < tilesDown; top++) {
        for (left = 0; left < tilesAcross; left++) {
            html += '<div class="tile" style="position:absolute;' +
                    'background-image:url(\'' + params.image + '\');' +
                    'width:' + params.tileWidth + 'px;' +
                    'height:' + params.tileHeight + 'px;' +
                    'background-position: 0px 0px;' +
                    'left:' + (left * params.tileWidth) + 'px;' +
                    'top:' + (top * params.tileHeight) + 'px;' + '"/>';
        }
    }
    html += '</div>';
    // Put the whole lot in the viewport.
    $viewport.html(html);

    // Get a reference to the handle DOM element.
    handle = $('.handle', $viewport)[0];

    // For each tile in the viewport, store a reference to its
    // css style attribute for speed.
    // This will be updated with the tile's visbility status
    // when scrolling later on.
    for (i = 0; i < tilesAcross * tilesDown; i++) {
        tiles.push($('.tile', $viewport)[i].style);
    }

    // For each tile image in the large bitmap, calculate and store the
    // the pixel offsets to be used for the tiles' background image.
    // This is quicker than calculating when updating later.
    tileBackPos.push('0px 0px'); // Tile zero - special 'hidden' tile.
    for (top = 0; top < params.imageHeight; top += params.tileHeight) {
        for (left = 0; left < params.imageWidth; left += params.tileWidth) {
            tileBackPos.push(-left + 'px ' + -top + 'px');
        }
    }

    // Useful public variables.
    that.mapWidthPixels = mapWidthPixels;
    that.mapHeightPixels = mapHeightPixels;

    // Preserve original map (for collision detection).
    that.map = params.map;
    that.tilesAcross = tilesAcross;
    that.tilesDown = tilesDown;

    that.draw = function(scrollX, scrollY, handleRotations) {
        var xoff = -(scrollX % params.tileWidth),
                yoff = -(scrollY % params.tileHeight);
        // >> 0 alternative to math.floor. Number changes from a float to an int.
        handle.style.left = (xoff >> 0) + 'px';
        handle.style.top = (yoff >> 0) + 'px';

        // Convert pixel scroll positions to tile units.
        scrollX = (scrollX / params.tileWidth) >> 0;
        scrollY = (scrollY / params.tileHeight) >> 0;


        var map = params.map,
                sx, sy = scrollY, // Copies of scrollX & Y positions (tile units).
                countAcross, countDown, // Loop counts for tiles across and down viewport. 
                mapWidth = params.mapWidth, // Copy of map width (tile units). 
                mapHeight = params.mapHeight, // Copy of map height (tile units).
                i, // General counter.        
                tileInView = 0, // Start with top left tile in viewport.

                tileIndex, // Tile index number taken from map.
                mapRow;

        // Main drawing loop.
        for (countDown = tilesDown; countDown; countDown--) {
            // Otherwise clip vertically (just make the whole row blank)
            if (sy < 0 || sy >= mapHeight) {
                for (i = tilesW; i; i--) {
                    tiles[tileInView++].visibility = 'hidden';
                }
                sy++;
                continue;
            }
            // Draw a row.
            sx = scrollX;
            mapRow = sy * mapWidth;
            for (countAcross = tilesAcross; countAcross; countAcross--) {
                // Or clipping horizontally?
                if (sx < 0 || sx >= mapWidth) {
                    tiles[tileInView++].visibility = 'hidden';
                    sx++;
                    continue;
                }
                // Get tile index no.
                tileIndex = map[mapRow + sx];
                sx++;
                // If tile index non zero, then 'draw' it,
                if (tileIndex) {
                    // if handleRotations is set to true, it means that rotations
                    // for the layer should be considered.
                    if (handleRotations) {
                        // Mask out the flags for the different flipping directions. Through setting
                        // of one or more of these flags, rotation can be achieved.
                        var hf = (~(tileIndex & GAME.FLIPPED_HORIZONTALLY_FLAG) + 1) === GAME.FLIPPED_HORIZONTALLY_FLAG;
                        var vf = (tileIndex & GAME.FLIPPED_VERTICALLY_FLAG) === GAME.FLIPPED_VERTICALLY_FLAG;
                        var df = (tileIndex & GAME.FLIPPED_DIAGONALLY_FLAG) === GAME.FLIPPED_DIAGONALLY_FLAG;
                        // Clear flags from tileIndex. We need to do this to get the index position for
                        // the underlying image (the unrotated image).
                        tileIndex &= ~(GAME.FLIPPED_HORIZONTALLY_FLAG | GAME.FLIPPED_VERTICALLY_FLAG | GAME.FLIPPED_DIAGONALLY_FLAG);
                        // console.log("tileIndex: " + tileIndex + " hf: " + hf + " vf: " + vf + " df: " + df);
                        // Apply rotation through CSS
                        imageUtils.setCssRotation(tiles[tileInView], hf, vf, df);
                    }
                    tiles[tileInView].visibility = 'visible';
                    tiles[tileInView++].backgroundPosition = tileBackPos[tileIndex];
                }
                // otherwise hide it. 
                else {
                    tiles[tileInView++].visibility = 'hidden';
                }
            }
            sy++;
        }
    };
    return that;
};
                
var loadMap = function(xmlFile, $viewports, callback) {
    var tileScrollers = []; // Array of tileScroller instances for each viewport.
    $.ajax({
        type: "GET",
        url: xmlFile,
        dataType: "xml",
        // Success function called when map has loaded.
        success: function(xml) {
            // Get references to image and map information.
            var $imageInfo = $(xml).find('image'),
                    $mapInfo = $(xml).find('map'),
                    i;

//                            tileWidth: +$mapInfo.attr('tilewidth');
//                            tileHeight: +$mapInfo.attr('tileheight');
            GAME.tilesAcross = +$mapInfo.attr('width');
            GAME.tilesDown = +$mapInfo.attr('height');
//                            image: $imageInfo.attr('source');
//                            imageWidth: +$imageInfo.attr('width');
//                            imageHeight: +$imageInfo.attr('height');

            // For each layer, create a tileScroller object.
            $(xml).find('layer').each(function() {
                // Setup parameters to pass to tileScroller.
                // The + operator before some values is to ensure
                // they are treated as numerics instead of strings.
                var params = {
                    tileWidth: +$mapInfo.attr('tilewidth'),
                    tileHeight: +$mapInfo.attr('tileheight'),
                    wrapX: true,
                    wrapY: true,
                    mapWidth: +$mapInfo.attr('width'),
                    mapHeight: +$mapInfo.attr('height'),
                    image: $imageInfo.attr('source'),
                    imageWidth: +$imageInfo.attr('width'),
                    imageHeight: +$imageInfo.attr('height')
                },
                // Get the actual map data as an array of strings.
                mapText = $(this).find('data').text().split(','),
                // Create a viewport.
                $viewport = $('<div>');
                // console.log($(this).attr('name'));
                $viewport.attr({
                    'id': $(this).attr('name')
                }).css({
                    'width': '100%',
                    'height': '100%',
                    'position': 'absolute',
                    'overflow': 'hidden'
                });

                // Attach viewport to viewports wrapper.
                $viewports.append($viewport);
                // Store viewport in parameters.
                params.$viewport = $viewport;
                // Create a map array and store in parameters.
                params.map = [];
                // Convert previous text array map into numeric array.
                for (i = 0; i < mapText.length; i++) {
                    params.map.push(+mapText[i]);
                }
                // Create a tileScroller and save reference.
                tileScrollers.push(tileScroller(params));
            });
            // Call callback when map loaded, passing array
            // of tileScrollers as parameter.
            callback(tileScrollers);
        }
    });
};
