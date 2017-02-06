
var GAME = GAME || {};

GAME.gameboard = (function ($) {
    var x = null,
    
    // The width of the gameboard in number of tiles
    tilesAcross = 0,
    // The height of the gameboard in number of tiles
    tilesDown = 0,

    // *** Private constants ***

    // Flags/Masks to check orientation on tiles(editor)-produced data
    FLIPPED_HORIZONTALLY_FLAG = 0x80000000,
    FLIPPED_VERTICALLY_FLAG   = 0x40000000,
    FLIPPED_DIAGONALLY_FLAG   = 0x20000000,

    // *** Private methods ***
    dec2Bin = function (dec){
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
     * @param {Boolean} hf true = horizontal flip
     * @param {Boolean} vf true = vertical flip
     * @param {Boolean} df true = diagonal flip
     * @returns {Number} rotation in degrees
     */
    getRotation = function (hf, vf, df) {
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
     * @param {Boolean} hf true = horizontal flip
     * @param {Boolean} vf true = vertical flip
     * @param {Boolean} df true = diagonal flip
     * @returns {undefined}
     */
    setCssRotation = function (elementStyle, hf, vf, df) {
        elementStyle.webkitTransform = "rotate(" + getRotation(hf, vf, df) + "deg)";
        elementStyle.MozTransform = "rotate(" + getRotation(hf, vf, df) + "deg)";
        elementStyle.msTransform = "rotate(" + getRotation(hf, vf, df) + "deg)";
        elementStyle.OTransform = "rotate(" + getRotation(hf, vf, df) + "deg)";
        elementStyle.transform = "rotate(" + getRotation(hf, vf, df) + "deg)";
    },

    /**
     * Check rotation of tile from tiles-editor-data and perform rotation
     * 
     * @param {type} tileIndex
     * @param {type} tiles
     * @param {type} tileInView
     * @returns {unresolved}
     */
    rotate = function(tileIndex, tiles, tileInView) {
        // Mask out the flags for the different flipping directions. Through setting
        // of one or more of these flags, rotation can be achieved.
        var hf = (~(tileIndex & FLIPPED_HORIZONTALLY_FLAG) + 1) === FLIPPED_HORIZONTALLY_FLAG,
            vf = (tileIndex & FLIPPED_VERTICALLY_FLAG) === FLIPPED_VERTICALLY_FLAG,
            df = (tileIndex & FLIPPED_DIAGONALLY_FLAG) === FLIPPED_DIAGONALLY_FLAG;
        // Clear flags from tileIndex. We need to do this to get the index position for
        // the underlying image (the unrotated image).
        tileIndex &= ~(FLIPPED_HORIZONTALLY_FLAG | FLIPPED_VERTICALLY_FLAG | FLIPPED_DIAGONALLY_FLAG);
        // console.log("tileIndex: " + tileIndex + " hf: " + hf + " vf: " + vf + " df: " + df);
        // Apply rotation through CSS
        setCssRotation(tiles[tileInView], hf, vf, df);
        return tileIndex;
    },

    // One instance of tileScroller is required for each viewport. 
    tileScroller = function(params) {
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
        // Preserve viewable tiles across and down (the number and tiles x and y that fits into viewport)
        that.viewportTilesAcross = tilesAcross;
        that.viewportTilesDown = tilesDown;

        that.draw = function(scrollX, scrollY, handleRotations) {
            // If wrapping, transform start positions to valid positive
            // positions within the dimensions of the map.
            // This makes the wrapping code simpler later on.
            var wrapX = params.wrapX,
                wrapY = params.wrapY;
            if (wrapX) {
                scrollX = (scrollX % mapWidthPixels);
                if (scrollX < 0) {
                    scrollX += mapWidthPixels;
                }
            }
            if (wrapY) {
                scrollY = (scrollY % mapHeightPixels);
                if (scrollY < 0) {
                    scrollY += mapHeightPixels;
                }
            }
            
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
                // Wrap vertically?
                if (wrapY) {
                    if (sy >= mapHeight) {
                        sy -= mapHeight;
                    }
                } else
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
                    // Wrap horizontally?
                    if (wrapX) {
                        if (sx >= mapWidth) {
                            sx -= mapWidth;
                        }
                    } else
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
                            tileIndex = rotate(tileIndex, tiles, tileInView);
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
        
    return {
        
        getTilesAcross : function () {
            return tilesAcross;
        },
        
        getTilesDown : function () {
            return tilesDown;
        },
        
        /**
         * Load a tiled-data-map. The map data is produced by the map editor tiled. The map data
         * consists of several layers:
         * <ul>
         *     <li>floor-layer
         *     <li>walls-layer
         *     <li>object-layer
         * </ul>
         * 
         * @param {type} xmlFile path to the tiled map file
         * @param {type} $viewports element in which the map should be drawn
         * @param {type} callback
         * @returns {undefined}
         */
        loadMap : function(xmlFile, $viewports, callback) {
            //console.log($viewports.attr("id"));
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

                    // Extract width and height in number of tiles
                    tilesAcross = +$mapInfo.attr('width');
                    tilesDown = +$mapInfo.attr('height');
                    
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
                        // Get the actual map data from each layer as an array of strings (numbers in string form).
                        // 'this' refers to the 'each-instance'.
                        mapText = $(this).find('data').text().split(','),
                        // Create a viewport.
                        $viewport = $('<div>');
                        // Assign the name of the layer as id for the constructed viewport element
                        // and position it.
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
        }
    };
}(jQuery));
