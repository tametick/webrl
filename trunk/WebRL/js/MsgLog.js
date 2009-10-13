function MsgLog() {
	this.logBuffer = 100;
	this.visibleLogBuffer = 5;
	this.data = [];
}

// a very generic method to append data to a log
MsgLog.prototype.append = function(toAdd) {
	this.data.push(toAdd);
	if (this.data.length > this.logBuffer) {
		this.data.shift();
	}
}

MsgLog.prototype.renderToHtml = function() {
	$("#msglog").html('');
	
	var max = this.data.length - 1;
	var min = max - this.visibleLogBuffer;
	if (min < 0) 
		min = 0;
	
	for (var i = max; i >= min; i--) {
		var string = '<p>' + this.data[i] + '</p>';
		$("#msglog").append(string);
	}
}
