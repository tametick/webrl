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
	var log = document.getElementById("msglog");
	if (log == null) 
		return;
	
	while (log.hasChildNodes()) 
		log.removeChild(log.childNodes[0]);
	
	var max = this.data.length - 1;
	var min = max - this.visibleLogBuffer;
	if (min < 0) 
		min = 0;
	
	for (var i = max; i >= min; i--) {
		var newItem = document.createElement("p");
		var newText = document.createTextNode(this.data[i]);
		newItem.appendChild(newText);
		log.appendChild(newItem);
	}
}
