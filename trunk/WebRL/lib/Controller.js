function Controller(toControl) {
	this.puppet = toControl;
}

Controller.prototype.move = function(deltaX, deltaY) {
	this.puppet.tryMove(deltaX, deltaY);
}

Controller.prototype.think = function() {
	
}

// random walk AI

RandomWalkAI.prototype = Controller;
RandomWalkAI.constructor = RandomWalkAI;

function RandomWalkAI(toControl) {
	Controller.call(this);
}

RandomWalkAI.prototype.think = function() {
	
}

// straight hunter AI

StraightWalkerAI.prototype = Controller;
StraightWalkerAI.constructor = StraightWalkerAI;

function StraightWalkerAI(toControl, setToHunt) {
	Controller.call(this, toControl);
	//StraightWalkerAI.baseConstructor.call(toControl);
	
	this.toHunt = setToHunt;
}

StraightWalkerAI.prototype.think = function() {
	var dx = this.toHunt.tile.x - this.puppet.tile.x;
	var dy = this.toHunt.tile.y - this.puppet.tile.y;
	
	if (dx != 0)
		Controller.prototype.move.call(this, dx/Math.abs(dx),0);
	if (dy != 0)
		Controller.prototype.move.call(this, 0, dy/Math.abs(dy));
}

