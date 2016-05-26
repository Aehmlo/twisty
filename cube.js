"use strict";

(function() {

	var root = this;
	var previous_Cube = root.Cube;

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
			this.facelets = {};
		}

		noConflict() {
			root.Cube = previous_Cube;
			return Cube;
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
				scramble.moves.pop(); // Hax; TODO: Figure out why this is needed
			}

			return scramble;

		}

		applyMove(face, layer, count) { // TODO: Actually use Move class.

			var faces = {1: 0, 2: 0, 3: 0, 4: 0};
			var facelets = this.facelets;
			var size = this.degree;
			var sizeSquared = size * size;
			if(face > 5) { face -= 6; }
			for(var k = 0; k < count; k++) {
				for(var i = 0; i < size; i++) {
					switch(face) {
						case 0:
							faces[1] = 6 * sizeSquared - size * layer - size + i;
							faces[2] = 2 * sizeSquared - size * layer - 1 - i;
							faces[3] = 3 * sizeSquared - size * layer - 1 - i;
							faces[4] = 5 * sizeSquared - size * layer - size + i;
							break;
						case 1:
							faces[1] = 3 * sizeSquared + layer + size * i;
							faces[2] = 3 * sizeSquared + layer - size * (i + 1);
							faces[3] = sizeSquared + layer - size * (i + 1);
							faces[4] = 5 * sizeSquared + layer + size * i;
							break;
						case 2:
							faces[1] = 3 * sizeSquared + layer * size + i;
							faces[2] = 4 * sizeSquared + size - 1 - layer + size * i;
							faces[3] = layer * size + size - 1 - i;
							faces[4] = 2 * sizeSquared - 1 - layer - size * i;
							break;
						case 3:
							faces[1] = 4 * sizeSquared + layer * size + size - 1 - i;
							faces[2] = 2 * sizeSquared + layer * size + i;
							faces[3] = sizeSquared + layer * size + i;
							faces[4] = 5 * sizeSquared + layer * size + size - 1 - i;
							break;
						case 4:
							faces[1] = 6 * sizeSquared - 1 - layer - size * i;
							faces[2] = size - 1 - layer + size * i;
							faces[3] = 2 * sizeSquared + size - 1 - layer + size * i;
							faces[4] = 4 * sizeSquared - 1 - layer - size * i;
							break;
						case 5:
							faces[1] = 4 * sizeSquared - size - d * size + i;
							faces[2] = 2 * sizeSquared - size + d - size * i;
							faces[3] = sizeSquared - 1 - d * size - i;
							faces[4] = 4 * sizeSquared + layer + size * i;
							break;
					}
					var temp = facelets[faces[1]];
					facelets[faces[1]] = facelets[faces[2]];
					facelets[faces[2]] = facelets[faces[3]];
					facelets[faces[3]] = facelets[faces[4]];
					facelets[faces[4]] = temp;
				}

				if(layer == 0) { // Turn face
					for(var i = 0; i < size; i++) {
						for(var j = 0; j + j < size - 1; i++) {
							faces[1] = face * sizeSquared + i + j * size;
							faces[3] = face * sizeSquared + (size - 1 - i) + (size - 1 - j) * size;
							if(face < 3) {
								faces[2] = face * sizeSquared + (size - 1 - j) + i * size;
								faces[4] = face * sizeSquared + j + (size - 1 - i) * size;
							} else {
								faces[4] = face * sizeSquared + (size - 1 - j) + i * size;
								faces[2] = face * sizeSquared + j + (size - 1 - i) * size;
							}
							var temp = facelets[faces[1]];
							facelets[faces[1]] = facelets[faces[2]];
							facelets[faces[2]] = facelets[faces[3]];
							facelets[faces[3]] = facelets[faces[4]];
							facelets[faces[4]] = temp;
						}
					}
				}
			}
		}

	}

	Cube.Types = {
		Puzzle: Puzzle,
		Move: Move,
		Scramble: Scramble
	}

	if(typeof exports !== "undefined") {
		if(module && typeof module !== "undefined" && module.exports) {
			exports = module.exports = Cube;
		}
		exports = Cube;
	} else {
		root.Cube = Cube;
	}

}).call(this);