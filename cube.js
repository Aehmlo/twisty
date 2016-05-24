"use strict";

class Move {

	constructor(rawValue, cubeDegree) {
		this.rawValue = rawValue;
		this.cubeDegree = cubeDegree || 3;
	};

	toString() { // Here be dragons (kind of)
		var multiSlice = false;
		var string = "";
		var j;
		var k = this.rawValue >> 2;
		j = k % 6;
		k = (k - j) / 6;
		if(k && this.cubeDegree <= 5 && !multiSlice) {
			string += "dlburf".charAt(j);	// Use lower case only for inner slices on 4x4x4 or 5x5x5
		} else {
			if(this.cubeDegree <= 5 && multiSlice){
				string += "DLBURF".charAt(j);
				if(k) {string += "w"; }// Use w only for double layers on 4x4x4 and 5x5x5
			} else {
				if(k) { string += (k + 1); }
				string += "DLBURF".charAt(j);
			}
		}
		j = this.rawValue & 3;
		if(j != 0) string += " 2'".charAt(j);
		return string;
	}

}

class Scramble {

	constructor() {
		this.moves = [];
	}

	addMove(move) {
		if(!move) { return; }
		if(!(move instanceof Move)) {
			throw new TypeError(`Expected move of type ${typeof move} to be an instance of ${typeof Move} instead.`);
		}
		this.moves.push(move);
	}

	toString() {
		var string = "";
		var once = false;
		for(let move of this.moves) {
			if(once) { string += " "; }
			string += `${move.toString()}`;
			once = true;
		}
		return string;
	}

};

class Puzzle {
}

class Cube extends Puzzle {

	constructor(degree, force) {
		super();
		this.degree = degree;
		if(!(2 <= degree && degree <= 5) && !force) {
			throw new Error(`This library currently only supports cubes from 2x2x2 to 5x5x5. If you know what you're doing and what's going to happen, try using \`new Cube(${degree}, true)\` to force the library to continue anyway.`);
		}
	}

	toString() {
		return `A ${this.degree}x${this.degree}x${this.degree} cube`;
	}

	createScramble(desiredLength) {

		desiredLength = desiredLength || 20

		var addMove = function(scramble, movements, twistableLayers, lastAxis, degree) { // Here be dragons.
			for(var s = 0; s<twistableLayers; s++){ // For each move type,
				if(movements[s]){	// if it occurs,
					var q = movements[s] - 1;

					// get the semi-axis of this move
					var sa = lastAxis;
					var m = s;
					if(s + s + 1 >= twistableLayers){ // If this is on the rear half of this axis,
						sa += 3; // get the semi-axis (i.e. face of the move)
						m = twistableLayers - 1 - m; // Slice number counting from that face
						q = 2 - q; // Opposite direction when looking at that face
					}
					scramble.addMove(new Move((m*6 + sa) * 4 + q), degree);
				}
			}
		};

		var scramble = new Scramble();

		const size = this.degree;
		const multiSlice = false;
		var twistableLayers = size; // Ignore middle layer (see next line)
		if(multiSlice || (size & 1) != 0) { twistableLayers--; } // Multiple slices is enabled or the cube is an odd cube
		var movements = new Array(twistableLayers); // Movement of each slice on axis
		var amounts = new Array(0, 0, 0); // Number of slices moved each amount
		var lastAxis = -1;
		var moveCount = 0;

		while(scramble.moves.length + moveCount < desiredLength) {
			var axis, slice, amount;
			do {
				do {
					axis = Math.floor(Math.random() * 3); // Choose random axis
					slice = Math.floor(Math.random() * twistableLayers); // Choose random move type on that axis
					amount = Math.floor(Math.random() * 3); // Choose random number of turns
				} while (axis == lastAxis && movements[slice] != 0); // Loop until new move type is encountered
			} while (axis == lastAxis && // Same move axis
					!multiSlice && // Multislice moves cannot be reduced, so they're always okay
					twistableLayers == size && // Only even-sided cubes can be reduced (odd cubes have middle layer)
					(2 * amounts[0] == twistableLayers || 2 * amounts[1] == twistableLayers || 2 * amounts[2] == twistableLayers || // Reduced if half the slices moved in the same direction
						2 * (amounts[amount] + 1)==tl	// Reduced if move makes exactly half the slices moved in same direction
						&& amounts[0] + amounts[1] + amounts[2] - amounts[amount] > 0 // and another slice has also moved
					) 
				);

			if(axis != lastAxis) { // We're on a new axis; dump cached moves

				addMove(scramble, movements, twistableLayers, lastAxis, size);

				// Reset counters/state
				for(var i = 0; i < twistableLayers.length; i++) {
					movements[i] = 0;
				}

				amounts[0] = amounts[1] = amounts[2] = 0;
				moveCount = 0;
				lastAxis = axis; // Save new axis

			}

			// Update counters for this move
			amounts[amount]++;
			moveCount++;
			movements[slice] = amount + 1; // Increment the amount of times the slice has moved

		}

		addMove(scramble, movements, twistableLayers, lastAxis, size);

		while(scramble.moves.length > desiredLength) {
			scramble.moves.pop(); // Hax
		}

		return scramble;

	}
}

Cube.Types = {
	Puzzle: Puzzle,
	Move: Move,
	Scramble: Scramble
}

module.exports = Cube;