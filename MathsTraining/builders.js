/*
 * Me faudrait un moyen de pouvoir instancier une première fois dans "builders" avec des bornes et autres configurations, puis de pouvoir être instancié avec une vraie valeur.
 * Peut-être des classes suffixées par le B de builder
 * Peut-être stocker un tableau de configuration puis sortir un truc aléatoire lors de l'appel à toTeX mais du coup on oubliera ce que l'on a eu
 */

/*
 * Constants
 */

function ConstantInt(c) {
	this.c = c;
}

ConstantInt.prototype.toTeX = function () {
	return this.c;
};

ConstantInt.prototype.forceParenthesis = function () {
	return this.c < 0;
}

ConstantInt.prototype.value = function () {
	return this.c;
}

function ConstantIntB(min, max) {
	this.min = min;
	this.max = max;
}

ConstantIntB.prototype.build = function () {
	return new ConstantInt(Math.floor(Math.random() * (this.max - this.min + 1) + this.min));
};

/*
 * Basic Addition
 */

function Addition(terms, hasParenthesis) {
	// List of terms
	this.terms = terms;
	// Add useless parenthesis to disturb
	this.hasParenthesis = hasParenthesis;
}

Addition.prototype.toTeX = function () {
	var result = this.terms[0].toTeX();

	for (var term = 1 ; term < this.terms.length ; ++term) {
		var newTermTeX = this.terms[term].toTeX();
		console.log("term: " + term + " out of " + this.terms.length);
		console.log(this.terms[term]);
		if (this.terms[term].forceParenthesis()) {
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
 */

/**3dd
 * @param	terms	Array of Object: term and sign
 * term is any built class
 * sign must be evauated to false if the term has a - in front of it
 * any true-evaluated value will produce a + in front of the term
 */
function TermsSum (terms) {
	this.terms = terms;
}

TermsSum.prototype.toTeX = function() {
	var result = this.terms[0]["term"].toTeX();

	if (!this.terms[0]["sign"]) {
		if (this.terms[0]["term"].forceParenthesis()) {
			result = "\\left(" + result + "\\right)";
		}
		result = " - " + result;
	}

	for (var term = 1 ; term < this.terms.length ; ++term) {
		var newTermTeX = this.terms[term]["term"].toTeX();
		if (this.terms[term]["term"].forceParenthesis()) {
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
 */
function Multiplication(factors) {
	this.factors = factors;
}

Multiplication.prototype.toTeX = function() {
	var res = this.factors[0].toTeX();
	if (this.factors[0].forceParenthesis()) {
		res = "\\left(" + res + "\\right)";
	}

	for (var f = 1 ; f < this.factors.length ; ++f) {
		var newFactor = this.factors[f].toTeX();
		if (this.factors[f].forceParenthesis()) {
			newFactor = "\\left(" + newFactor + "\\right)";
		}
		res += "\\times " + newFactor;
	}
	return res;
}

Multiplication.prototype.forceParenthesis = function() {
	return false;
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
 */
function Division(num, den) {
	this.num = num;
	this.den = den;
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
		return new ConstantInt(numV);
	}

	if (denV == -1) {
		return new ConstantInt(-numV);
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
