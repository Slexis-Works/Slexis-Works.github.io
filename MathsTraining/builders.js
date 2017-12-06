/**
 * Priorities of operators:
 * 1: additions, subtractions
 * 2: products, divisions
 * 3: exponentiation
 * 4: self-delimited operators (roots, functions)
 * 5: constants limited to themselves
 */

/*
 * Constants
 * Priority: 5
 */

function Constant(c, render) {
	this.c = c;
	this.render = render;
	this.priority = 5;
}

Constant.prototype.toTeX = function () {
	return this.render || this.c;
};

Constant.prototype.forceParenthesis = function () {
	return this.c < 0;
}

Constant.prototype.value = function () {
	return this.c;
}

function ConstantB(c, render) {
	this.c = c;
	this.render = render;
}

ConstantB.prototype.build = function() {
	return new Constant(this.c, this.render);
}

function ConstantIntB(min, max) {
	this.min = min;
	this.max = max;
}

ConstantIntB.prototype.build = function () {
	return new Constant(Math.floor(Math.random() * (this.max - this.min + 1) + this.min));
};

function PerfectSquareB(min, max) {
	this.min = min;
	this.max = max;
}

PerfectSquareB.prototype.build = function() {
	var ps = Math.floor(Math.random() * (this.max - this.min + 1) + this.min);
	return new Constant(ps * ps);
}

function PowOf10B(minPow, maxPow) {
	this.exp = new ConstantIntB(minPow, maxPow);
}

PowOf10B.prototype.build = function() {
	return new Constant(Math.pow(10, this.exp.build().value()));
}

var C_E = new ConstantB(Math.E, "e");

/*
 * Basic Addition
 * Priority: 1
 */

function Addition(terms, hasParenthesis) {
	// List of terms
	this.terms = terms;
	// Add useless parenthesis to disturb
	this.hasParenthesis = hasParenthesis;
	this.priority = 1;
}

Addition.prototype.toTeX = function () {
	var result = this.terms[0].toTeX();

	for (var term = 1 ; term < this.terms.length ; ++term) {
		var newTermTeX = this.terms[term].toTeX();
		console.log("term: " + term + " out of " + this.terms.length);
		console.log(this.terms[term]);
		if (this.terms[term].forceParenthesis(this.priority)) {
			newTermTeX = "\\left(" + newTermTeX + "\\right)";
		}
		result += " + " + newTermTeX;
	}

	if (this.hasParenthesis) {
		result = "\\left(" + result + "\\right)";
	}

	return result;
};

Addition.prototype.forceParenthesis = function () {
	return this.terms.length > 1;
}

Addition.prototype.value = function() {
	var sum = 0;

	for (var term = 0 ; term < this.terms.length ; ++term) {
		sum += this.terms[term].value();
	}

	return sum;
}

function AdditionB (terms, pb) {
	this.terms = terms;
	this.pb = pb;
}

AdditionB.prototype.build = function () {
	var builds = [];
	for (var b = 0 ; b < this.terms.length ; ++b) {
		builds.push(this.terms[b].build());
	}

	var hasParenthesis = Math.random() < this.pb;
	return new Addition(builds, hasParenthesis);
}

function Addition2B (lb, rb, pb) {
	this.lb = lb;
	this.rb = rb;
	this.pb = pb;
}

Addition2B.prototype.build = function () {
	var hasParenthesis = Math.random() < this.pb;
	return new Addition([this.lb.build(), this.rb.build()], hasParenthesis);
}

/*
 * Advanced sum
 * Priority: 1
 */

/**3dd
 * @param	terms	Array of Object: term and sign
 * term is any built class
 * sign must be evauated to false if the term has a - in front of it
 * any true-evaluated value will produce a + in front of the term
 */
function TermsSum (terms) {
	this.terms = terms;
	this.priority = 1;
}

TermsSum.prototype.toTeX = function() {
	var result = this.terms[0]["term"].toTeX();

	if (!this.terms[0]["sign"]) {
		if (this.terms[0]["term"].forceParenthesis(this.priority)) {
			result = "\\left(" + result + "\\right)";
		}
		result = " - " + result;
	}

	for (var term = 1 ; term < this.terms.length ; ++term) {
		var newTermTeX = this.terms[term]["term"].toTeX();
		if (this.terms[term]["term"].forceParenthesis(this.priority)) {
			newTermTeX = "\\left(" + newTermTeX + "\\right)";
		}
		if (this.terms[term]["sign"]) {
			result += " + " + newTermTeX;
		} else {
			result += " - " + newTermTeX;
		}
	}

	return result;
}

TermsSum.prototype.forceParenthesis = function () {
	return this.terms.length > 1 || !this.terms[0]["sign"];
}

TermsSum.prototype.value = function() {
	var sum = 0;

	for (var term = 0 ; term < this.terms.length ; ++term) {
		if (this.terms[term]["sign"]) {
			sum += this.terms[term]["term"].value();
		} else {
			sum -= this.terms[term]["term"].value();
		}
	}

	return sum;
}

/**
 * @param	terms	list of classes
 * @param	sp	array of probabilities for each sign
 *				the closer to 1 it is, the more likely
 *				you'll get a + in front of the matching term
 */
function TermsSumB (terms, sp) {
	this.terms = terms;
	this.sp = sp;
}

TermsSumB.prototype.build = function() {
	var builds = [];
	for (var b = 0 ; b < this.terms.length ; ++b) {
		builds.push({
			"term": this.terms[b].build(),
			"sign": Math.random() < this.sp[b]
		});
	}

	return new TermsSum(builds);
}


/*
 * Multiplication
 * Priority: 2
 */
function Multiplication(factors) {
	this.factors = factors;
	this.priority = 2;
}

Multiplication.prototype.toTeX = function() {
	var res = this.factors[0].toTeX();
	if (this.factors[0].forceParenthesis(this.priority)) {
		res = "\\left(" + res + "\\right)";
	}

	for (var f = 1 ; f < this.factors.length ; ++f) {
		var newFactor = this.factors[f].toTeX();
		if (this.factors[f].forceParenthesis(this.priority)) {
			newFactor = "\\left(" + newFactor + "\\right)";
		}
		res += "\\times " + newFactor;
	}
	return res;
}

Multiplication.prototype.forceParenthesis = function(parentPriority) {
	return parentPriority > 2;
}

Multiplication.prototype.value = function() {
	var product = 1;
	for (var f = 0 ; f < this.factors.length ; ++f) {
		product *= this.factors[f].value();
	}
	return product;
}

function MultiplicationB (terms) {
	this.terms = terms;
}

MultiplicationB.prototype.build = function() {
	var builds = [];
	for (var b = 0 ; b < this.terms.length ; ++b) {
		builds.push(this.terms[b].build());
	}
	return new Multiplication(builds);
}

/*
 * Division
 * Priority: 2
 */
function Division(num, den) {
	this.num = num;
	this.den = den;
	this.priority = 2;
}

Division.prototype.toTeX = function() {
	return "\\frac{" + this.num.toTeX() + "}{" + this.den.toTeX() + "}";
}

Division.prototype.forceParenthesis = function() {
	return false;
}

Division.prototype.value = function() {
	var numV = this.num.value();
	var denV = this.den.value();

	var div = this.num.value() / this.den.value();

	// Maximum 10 numbers after comma
	return Math.round(div * Math.pow(10, 10))/Math.pow(10, 10);


}

Division.prototype.simplify = function() {
	var numV = this.num.value();
	var denV = this.den.value();

	// Make the fraction smaller
	var gcd = GCD(numV, denV);
	numV /= gcd;
	denV /= gcd;

	if (denV == 1) {
		return new Constant(numV);
	}

	if (denV == -1) {
		return new Constant(-numV);
	}

	return new Division(numV, denV);
}

function DivisionB(num, den) {
	this.num = num;
	this.den = den;
}

DivisionB.prototype.build = function() {
	return new Division(this.num.build(), this.den.build());
}

/*
 * Exponentiations
 * Priority: 3
 */

function Power(base, exp) {
	this.base = base;
	this.exp = exp;
	this.priority = 3;
}

Power.prototype.toTeX = function() {
	var res = this.base.toTeX();

	if (this.base.forceParenthesis(this.priority)) {
		res = "\\left(" + res + "\\right)";
	}
	res += "^{" + this.exp.toTeX() + "}";
	return res;
}

Power.prototype.value = function() {
	return Math.pow(this.base.value(), this.exp.value());
}

Power.prototype.forceParenthesis = function (parentPriority) {
	return parentPriority > this.parentPriority;
}

function SquareB(base) {
	this.base = base;
}

SquareB.prototype.build = function() {
	return new Power(this.base.build(), new Constant(2));
}

function PowerB(base, exp) {
	this.base = base;
	this.exp = exp;
}

PowerB.prototype.build = function() {
	return new Power(this.base.build(), this.exp.build());
}

/*
 * Roots
 */

// Awful argument names from https://en.wikipedia.org/wiki/Nth_root
function Root(index, radicand) {
	this.index = index;
	this.radicand = radicand;
	this.priority = 4;
}

Root.prototype.toTeX = function() {
	var indexStr = "";
	var indexTeX = this.index.toTeX();
	if (indexTeX != "2") {
		indexStr = "[" + indexTeX + "]";
	}
	return "\\sqrt" + indexStr + "{" + this.radicand.toTeX() + "}";
}

Root.prototype.value = function() {
	return Math.pow(this.radicand.value(), 1/this.index.value());
}

Root.prototype.forceParenthesis = function() {
	return false;
}

function SquareRootB(radicand) {
	this.radicand = radicand;
}

SquareRootB.prototype.build = function() {
	return new Root(new Constant(2), this.radicand.build());
}

function CubeRootB(radicand) {
	this.radicand = radicand;
}

CubeRootB.prototype.build = function() {
	return new Root(new Constant(3), this.radicand.build());
}

/*
 * Logarithm
 */

function Logarithm(base, op) {
	this.base = base;
	this.op = op;
	this.priority = 4;
}

Logarithm.prototype.toTeX = function() {
	var opTeX = this.op.toTeX();
	if (this.op.forceParenthesis(4)) {
		opTeX = "\\left(" + opTeX + "\\right)";
	}
	var logTeX = "";
	if (this.base instanceof Constant) {
		if (this.base.c == Math.E) {
			logTeX = "\\ln ";
		} else if (this.base.c == 10) {
			logTeX = "\\log ";
		}
	}
	if (logTeX == "") {
		logTeX = "\\log_{" + this.base.toTeX() + "}";
	}
	return logTeX + opTeX;
}

Logarithm.prototype.value = function() {
	return Math.log(this.op.value()) / Math.log(this.base.value());
}

function Log10B(op) {
	this.op = op;
}

Log10B.prototype.build = function() {
	console.log(this.op);
	return new Logarithm(new Constant(10), this.op.build());
}

function LogNep(op) {
	this.op = op;
}

LogNep.prototype.build = function() {
	return new Logarithm(C_E.build(), this.op.build());
}


