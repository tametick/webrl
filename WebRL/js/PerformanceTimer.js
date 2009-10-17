var PerformanceTimer = function() {

	return {
		t0: new Date().getTime(),
		start: function() {
			this.t0 = new Date().getTime();
		},
		end: function() {
			var t1 = new Date().getTime();
			var delta = t1 - this.t0;
			return delta;
		}
	}
}
