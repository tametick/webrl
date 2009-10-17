var SpartanImageScreen = function( width, height, target ) {
	var cells = [];

			/*	hackyVisibility, magic numbers.
				None (0): nothing is visible (except table background)
				Remembered (1): background layer visible, fog of war visible.
				Full (2): background layer visible, object layer overrides.
			*/
	
	var hackyFov = function( px, py ) {
		for(var x=0;x<this.width;x++) {
			var col = cells[x];
			for(var y=0;y<this.height;y++) {
				var cell = col[y];

				// this would normally be done somewhere else, in FOV code
				var d = (x-px)*(x-px) + (y-py)*(y-py);
				var lim = 10;
				if( d > lim*lim ) {
					if( cell.visibility > 0 ) {
						cell.visibility = 1;
					} else {
						cell.visibility = 0;
					}
				} else {
					cell.visibility = 2;
				}
			}
		}
		this.showFov();
	}

	for(var x = 0; x < width; x++) {
		cells[x] = [];
	}
	var tileWidth = 13;
	var tileHeight = 23;

	var showFov = function() {
		var classesVisible = "spartan-overlay-layer spartan-overlay-none";
		var classesFoggy = "spartan-overlay-layer spartan-overlay-fog";
		var classesDarkness = "spartan-overlay-layer spartan-overlay-darkness";
		for(var x=0;x<this.width;x++) {
			for(var y=0;y<this.height;y++) {
				var cell = this.cells[x][y];
				if( cell.visibilityCache != cell.visibility ) {
					cell.visibilityCache = cell.visibility;
					if( cell.visibility == 0 ) {
						cell.layerOverlay.className = classesDarkness;
					} else if( cell.visibility == 1 ) {
						cell.layerOverlay.className = classesFoggy;
					} else {
						cell.layerOverlay.className = classesVisible;
					}
				}
			}
		}
	}

	var rv = {
		cells: cells,

		width: width,
		height: height,

		showFov: showFov,

		hackyFov: hackyFov,

	}


	/* Per-tile functions. The "inverse" functions are alternates meant to
	   be used with the inverse image-set (which gives many choices for
	   foreground colours instead of many choices for background colours).
	 */
	var setSymbol = function( letterName, fgColour, bgColour ) {
		var imageName = "symbols/g" + letterName + "/g" + letterName + "-c" + fgColour + ".png";
		this.layerImage.src = imageName;
		this.layerColour.setAttribute( "STYLE", "background-color: #" + bgColour );
	}

	var setSymbolInverse = function( letterName, fgColour, bgColour ) {
		var imageName = "symbols/g" + letterName + "/g" + letterName + "-c" + bgColour + "-i.png";
		if( this.layerImage.src != imageName ) {
			this.layerImage.src = imageName;
		}
		this.layerColour.setAttribute( "STYLE", "background-color: #" + fgColour );
	}

	for(var y = 0; y < height; y++) {
		for(var x = 0; x < width; x++) {
			var layerColour = document.createElement( "DIV" );
				// The colour layer fills in the transparent parts of the
				// image in the background or object layer (whichever is
				// displayed).
				// It is always visible (but sometimes hidden).
			layerColour.className = "spartan-colour-layer";
			layerColour.setAttribute( "STYLE", "background-color: #FADADD;" );

			var layerImage = document.createElement( "IMG" );
				// The image layer(s) provide the actual shapes. It may be
				// possible to do some optimization with multiple image
				// layers (e.g. background and object).
				// Exactly one image layer is always visible.
			layerImage.className = "spartan-image-layer";
			layerImage.src = "images/blank.png";

			var layerOverlay = document.createElement( "DIV" );
				// The overlay layer provides darkness and/or fog of war, by
				// setting the opacity (and optionally background colour).
				// The overlay layer may or may not be visible.
			layerOverlay.className = "spartan-overlay-layer spartan-overlay-none";

			var tile = {
				layerColour: layerColour,
				layerImage: layerImage,
				layerOverlay: layerOverlay,

				setSymbol: setSymbolInverse,
				visibility: 0,
				
				visibilityCache: null,
			};

			cells[x][y] = tile;


			var parentDiv = document.createElement( "DIV" );
			parentDiv.className = "spartan-cell";
			parentDiv.setAttribute( "STYLE", "left: " + (x*tileWidth) + "px; top: " + (y*tileHeight) + "px;" );
			parentDiv.appendChild( layerColour );
			parentDiv.appendChild( layerImage );
			parentDiv.appendChild( layerOverlay );
			document.getElementById( target ).appendChild( parentDiv );
		}
	}

	return rv;
}

