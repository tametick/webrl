function MsgLog(){
    this._logBuffer = 100;
    this._visibleLogBuffer = 5;
    this._data = new Array();
}

/* a very generic method to append data to a log */
MsgLog.prototype.append = function(toAdd){
    this._data.push(toAdd);
    if (this._data.length > 5) {
        this._data.shift();
    }
    
}

MsgLog.prototype.renderToHtml = function(){
    var log = document.getElementById("msglog");
    if (log == null) 
        return;
    
    while (log.hasChildNodes()) 
        log.removeChild(log.childNodes[0]);
    
    var max = this._data.length - 1;
    var min = max - this._visibleLogBuffer;
	if (min < 0)
		min = 0;
		    
    for (var i = max; i >= min; i--) {
        var newItem = document.createElement("p");
        var newText = document.createTextNode(this._data[i]);
        newItem.appendChild(newText);
        log.appendChild(newItem);
    }
}
