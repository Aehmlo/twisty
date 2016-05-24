var should = require("chai").should();
var mocha = require("mocha"),
	describe = mocha.describe,
	it = mocha.it;

var Cube = require("..").Cube;
var Move = Cube.Types.Move;
var Scramble = Cube.Types.Scramble;

describe("Cube", function() {
	describe("constructor", function() {
		it("should create an nth-order cube", function() {
			var cube = new Cube(3);
			should.exist(cube);
		});
		it("should complain about stupidly high- or low-degree cubes", function() {
			(function() {
				var cube = new Cube(1);
			}).should.throw();
			(function() {
				var cube = new Cube(6);
			}).should.throw();
			(function() {
				var cube = new Cube(73);
			}).should.throw();
		});
		it("should allow stupidly high- or low-degree cubes when explicitly told to", function() {
			(function() {
				var cube = new Cube(1, true);
			}).should.not.throw();
			(function() {
				var cube = new Cube(6, true);
			}).should.not.throw();
			(function() {
				var cube = new Cube(73, true);
			}).should.not.throw();
		});
	});
	describe("createScramble", function() {
		it("should return an object of type Scramble", function() {
			var cube = new Cube(3);
			cube.createScramble().should.be.instanceof(Cube.Types.Scramble);
		});
		it("should return a scramble with the desired length", function() {
			var cube = new Cube(3);
			cube.createScramble(25).moves.length.should.equal(25);
		});
	});
	describe("toString", function() {
		it("should create a string description of the form n by n by n", function() {
			(new Cube(3)).toString().should.have.string("3x3x3");
			(new Cube(4)).toString().should.have.string("4x4x4");
		});
	});
});

describe("Move", function() {
	describe("toString", function() {
		it("should show the move in human-readable form", function() {
			var move = new Move(2, 3);
			move.toString().should.equal("D'");
			move = new Move(21, 3);
			move.toString().should.equal("F2");
			move = new Move(41, 4);
			move.toString().should.equal("r2");
		});
	});
});

describe("Scramble", function() {
	describe("addMove", function() {
		it("should reject invalid move parameters", function() {
			((function() {
				var scramble = new Scramble();
				scramble.addMove("foo");
			})).should.throw();
			((function() {
				var scramble = new Scramble();
				scramble.addMove(123);
			})).should.throw();
		});
		it("should add valid moves to the move array", function() {
			var scramble = new Scramble();
			var length = scramble.moves.length;
			scramble.addMove(new Move(10));
			scramble.moves.length.should.equal(length + 1);
			scramble.addMove(new Move(12));
			scramble.moves.length.should.equal(length + 2);
		});
	});
	describe("toString", function() {
		it("should show the scramble in human-readable form", function() {
			var cube = new Cube(3);
			cube.createScramble().toString().replace("'", "").should.match(/([FRUBDLfrubdl2] )+/);
		});
	});
})