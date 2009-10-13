// creature/player factions
function Faction(type) {
	this.type = type;
}

Faction.prototype.isHostileTo = function(faction) {
	return this.type != faction.type;
}

// base ai class
function Controller(toControl, livesIn) {
	this.puppet = toControl;
	this.map = livesIn;
}

Controller.prototype.move = function(deltaX, deltaY) {
	this.puppet.tryMove(deltaX, deltaY);
}

Controller.prototype.think = function() {

}

// random walk AI
RandomWalkAI.prototype = Controller;
RandomWalkAI.constructor = RandomWalkAI;

function RandomWalkAI(toControl, livesIn) {
	Controller.call(this, toControl, livesIn);
}

RandomWalkAI.prototype.think = function() {

}

// straight hunter AI
StraightWalkerAI.prototype = Controller;
StraightWalkerAI.constructor = StraightWalkerAI;

function StraightWalkerAI(toControl, setToHunt, livesIn) {
	Controller.call(this, toControl, livesIn);
	this.toHunt = setToHunt;
}

StraightWalkerAI.prototype.think = function() {
	var dx = this.toHunt.tile.x - this.puppet.tile.x;
	var dy = this.toHunt.tile.y - this.puppet.tile.y;
	
	if (dx != 0) 
		Controller.prototype.move.call(this, dx / Math.abs(dx), 0);
	if (dy != 0) 
		Controller.prototype.move.call(this, 0, dy / Math.abs(dy));
}

// straight hunter AI
KillAllAI.prototype = Controller;
KillAllAI.constructor = KillAllAI;

function KillAllAI(toControl, livesIn) {
	Controller.call(this, toControl, livesIn);
	this.toHunt = null;
}

KillAllAI.prototype.think = function() {
	// check for suitable enemy
	if (this.toHunt == null) {
		var list = this.map.creatures;
		var distance = 100;
		for (var i = 0; i < list.length; i++) {
			var mon = list[i];
			if (mon.dead) 
				continue;
			
			var curDistance = mon.distanceTo(this.puppet);
			// prefer player
			if (mon.faction.type == 'player') 
				curDistance = curDistance / 2;
			
			if (mon.faction.isHostileTo(this.puppet.faction) && (curDistance <= distance)) {
				this.toHunt = mon;
				distance = curDistance;
			}
		}
	}
	if (this.toHunt == null) 
		return;
	
	if (this.toHunt.dead == true) {
		this.toHunt = null;
		return;
	}
	var dx = this.toHunt.tile.x - this.puppet.tile.x;
	var dy = this.toHunt.tile.y - this.puppet.tile.y;
	
	if (dx != 0) 
		Controller.prototype.move.call(this, dx / Math.abs(dx), 0);
	if (dy != 0) 
		Controller.prototype.move.call(this, 0, dy / Math.abs(dy));
}