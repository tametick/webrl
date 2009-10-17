// Call with LoadingScreen(func1, func2, func3), this class
// will store the functions and the execute them after
// using .load(). In order for the DOM to update, control
// has to be given back to the browser. This achieves that.

var LoadingScreen = function() {
	var funcs = [];
	for(var i=0;i<arguments.length;i++) {
		funcs.push( arguments[i] );
	}
	var schedule = function( f ) {
		this.funcs.push( f );
	}
	
	// This can eventually be changed to add a modern overlay
	// load.
	var load = function() {
		var message = "Loading, please wait...<br />";
		var numSteps = this.funcs.length;
		
		// Hide everything.
		$("#loading_screen").html(message);
		$("#screen").hide();
		$("#canvasScreen").hide();
		$("#hp-display").hide();
		$("#msglog").hide();
		
		// For each function except last, put in queue.
		for (var i = 0; i < this.funcs.length - 1; ++i) {
			setTimeout(this.funcs[i], 1);
			$("#loading_screen").html(message + ((i + 1) / numSteps * 100) + "%");
		}
		
		setTimeout(this.funcs[this.funcs.length - 1], 1);
		setTimeout(function() {
			$("#screen").show();
			$("#canvasScreen").show();
			$("#hp-display").show();
			$("#msglog").show();
			$("#loading_screen").html("");
		}, 1);
	}
	
	return {
		funcs: funcs,
		load: load,
		schedule: schedule,
	};
}
startupLoader = LoadingScreen();

