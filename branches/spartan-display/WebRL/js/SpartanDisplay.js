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
	}

	for(var x = 0; x < width; x++) {
		cells[x] = [];
	}
	var tileWidth = 13;
	var tileHeight = 23;

	var updateInverse = function() {
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
				if( cell.fgColourCache != cell.fgColour ) {
					cell.fgColourCache = cell.fgColour;
					cell.layerColour.setAttribute( "STYLE", "background-color: #" + cell.fgColour );
				}
				if( cell.shapeCache != cell.shape || cell.bgColourCache != cell.bgColour ) {
					cell.bgColourCache = cell.bgColour;
					cell.shapeCache = cell.shape;
					var imageName = "symbols/g" + cell.shape + "/g" + cell.shape + "-c" + cell.bgColour + "-i.png";
					cell.layerImage.src = imageName;
				}
			}
		}
	}

	var updateInverseDirty = function() {
		var classesVisible = "spartan-overlay-layer spartan-overlay-none";
		var classesFoggy = "spartan-overlay-layer spartan-overlay-fog";
		var classesDarkness = "spartan-overlay-layer spartan-overlay-darkness";
		var dirtyX = this.dirtyX;
		var dirtyY = this.dirtyY;
		this.dirtyX = [];
		this.dirtyY = [];
		for(var i=0;i<dirtyX.length;i++) {
			var x = dirtyX[i];
			var y = dirtyY[i];
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
			if( cell.fgColourCache != cell.fgColour ) {
				cell.fgColourCache = cell.fgColour;
				cell.layerColour.setAttribute( "STYLE", "background-color: #" + cell.fgColour );
			}
			if( cell.shapeCache != cell.shape || cell.bgColourCache != cell.bgColour ) {
				cell.bgColourCache = cell.bgColour;
				cell.shapeCache = cell.shape;
				var imageName = "symbols/g" + cell.shape + "/g" + cell.shape + "-c" + cell.bgColour + "-i.png";
				cell.layerImage.src = imageName;
			}
		}
	}

	var displayObject = {
		cells: cells,

		width: width,
		height: height,

		update: updateInverseDirty,

		hackyFov: hackyFov,

		dirtyX: [],
		dirtyY: [],

		/* These are conversion functions, meant for an abstraction layer. Their
		   output must be cached, otherwise performance will suffer needlessly.
		   Do not call them once for every screen update!
		*/
		colour: function(r,g,b) {
			return (r.toString(16) + g.toString(16) + b.toString(16)).toUpperCase();
		},
		symbol: function(s) {
			return s.charCodeAt(0).toString(16).toUpperCase();
		},
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

				x: x,
				y: y,

				shapeCache: null,
				fgColourCache: null,
				bgColourCache: null,
				visibilityCache: null,

					/* These should be set by other code. */
				shape: "2E",
				fgColour: "000000",
				bgColour: "000000",
				visibility: 0,

				set: function( sh, fg, bg ) {
					this.shape = sh;
					this.fgColour = fg;
					this.bgColour = bg;
					displayObject.dirtyX.push( this.x );
					displayObject.dirtyY.push( this.y );
				},
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

	return displayObject;
}

