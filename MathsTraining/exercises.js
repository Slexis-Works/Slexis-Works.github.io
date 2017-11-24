/**
 * Current state of the program
 * -1 : waiting the end of a process
 * 0 : waiting for exercise selection
 * 1 : running an exercise
 */
var state = -1;

var curExercise, curEquation;
var chronoTotal = new Date(0), chronoCur = new Date(0), lastDate;

var hLastResult, hChronos, hTotalChrono, hCurChrono;

var exercises = {
	"calcul": [
		{
			"title": "Additions",
			"builders": [
				new Addition2B(new ConstantIntB(0, 20), new ConstantIntB(0, 30), 0),
				new AdditionB([new ConstantIntB(0, 15), new ConstantIntB(0, 15), new ConstantIntB(0, 15)], 0),
				new Addition2B(new ConstantIntB(0, 10), new Addition2B(new ConstantIntB(0, 15), new ConstantIntB(0, 10)), 0)
			]
		},
		{
			"title": "Soustractions",
			"builders": [
				new TermsSumB([new ConstantIntB(1, 30), new ConstantIntB(1, 20)], [0.7, 0.4]),
				new TermsSumB([new ConstantIntB(1, 30), new ConstantIntB(1, 20), new ConstantIntB(1, 20)], [0.7, 0.4, 0.6]),
				new TermsSumB(
					[
						new ConstantIntB(1, 30),
						new TermsSumB(
							[
								new ConstantIntB(1, 30),
								new ConstantIntB(1, 30)
							],
							[0.8, 0.5]
						)
					],
					[0.5, 0.5]
				)
			]
		},
		{
			"title": "Multiplications",
			"builders": [
				new MultiplicationB([
					new ConstantIntB(1, 10),
					new ConstantIntB(1, 10)
				]),
				new MultiplicationB([
					new ConstantIntB(-1, 5),
					new ConstantIntB(1, 15)
				]),
				new MultiplicationB([
					new ConstantIntB(1, 4),
					new ConstantIntB(1, 7),
					new ConstantIntB(3, 5)
				])
			]
		},
		{
			"title": "Divisions",
			"builders": [
				new DivisionB(new ConstantIntB(-20, 20), new ConstantIntB(1, 5)),
				new DivisionB(
					new Addition2B(new ConstantIntB(-15, 10), new ConstantIntB(-10, 15)),
					new ConstantIntB(1, 5)
				),
				new DivisionB(
					new MultiplicationB([new ConstantIntB(-5, 5), new ConstantIntB(-4, 4)]),
					new ConstantIntB(1, 5)
				)
			]
		},
		{
			"title": "Carrés",
			"builders": [
				new SquareB(new ConstantIntB(1, 15)),
				new SquareB(new Addition2B(new ConstantIntB(1, 8), new ConstantIntB(1, 8)))
			]
		}/*,
		{
			"title": "Racines"
		},
		{
			"title": "Logarithmes"
		},
		{
			"title": "Trigonométrie"
		},*/
	],
	"equations": [

	],
	"inequations": [

	]
};

function init() {
	for (var section in exercises) {
		console.log(section);
		var hList = document.getElementById("exos-" + section);
		var exList = exercises[section];
		var exCount = exList.length;
		for (var curEx = 0 ; curEx < exCount ; ++curEx) {
			var hItem = document.createElement("li");
			var exItem = exList[curEx];
			hItem.innerText = exItem["title"];
			hItem.dataSection = section;
			hItem.dataIndex = curEx;
			hItem.onclick = function () {
				launchExercise(this.dataSection, this.dataIndex);
			};
			hList.appendChild(hItem);
		}
	}

	hLastResult = document.getElementById("last-result");
	hChronos = document.getElementById("chronos-list");
	hTotalChrono = document.getElementById("total-chrono").children[0];
	hCurChrono = document.getElementById("current-chrono").children[0];

	state = 0;
}

function launchExercise(section, index) {
	if (status != 0)
		return;

	console.log("Launching: " + section + "[" + index + "]");
	state = -1;

	curExercise = exercises[section][index];

	var chronoTitle = document.createElement("li");
	chronoTitle.className = "title";
	chronoTitle.innerText = curExercise["title"];
	hChronos.appendChild(chronoTitle);

	document.getElementById("exercise").className = "";
	document.getElementById("calculus").innerText = "Cliquez sur le bouton ci-dessous pour démarrer !";

	state = 1;
}

function nextQuestion() {
	if (state != 1)
		return;

	showLastResult();

	var chosenBuilder = Math.floor(Math.random() * curExercise["builders"].length);
	curEquation = curExercise["builders"][chosenBuilder].build();
	var equTxt = curEquation.toTeX();

	var equTag = document.getElementById("calculus");
	equTag.innerText = "$$" + equTxt + "$$";
	jsMath.ConvertTeX(equTag);
	jsMath.ProcessBeforeShowing(equTag);

	if (lastDate) {
		var chronoQuestion = document.createElement("li");
		chronoQuestion.className = "time";
		chronoQuestion.innerText = formatDate(chronoCur);
		hChronos.appendChild(chronoQuestion);
		chronoCur.setTime(0);
	}

	lastDate = new Date();
	chronoHandling();
}

function stopExercise() {
	if (state != 1)
		return;

	showLastResult();

	state = -1;
	lastDate = null;
	chronoCur.setTime(0);

	document.getElementById("exercise").className = "hidden";

}

function showLastResult() {
	if (curEquation) {
		hLastResult.innerText = "$$" + curEquation.value() + "$$";
		jsMath.ConvertTeX(hLastResult);
		jsMath.ProcessBeforeShowing(hLastResult);
	}
}

function chronoHandling() {
	var newDate = new Date();
	if (lastDate) {
		var dateDifference = newDate.getTime() - lastDate.getTime();
		lastDate = newDate;

		chronoTotal.setTime(chronoTotal.getTime() + dateDifference);
		chronoCur.setTime(chronoCur.getTime() + dateDifference);

		hTotalChrono.innerText = formatDate(chronoTotal);
		hCurChrono.innerText = formatDate(chronoCur);

		if (state == 1) {
			window.requestAnimationFrame(chronoHandling);
		}
	} else if (state == 1) {
		newDate = newDate;
		window.requestAnimationFrame(chronoHandling);
	}
}

function formatDate(date) {
	var res = date.getMinutes() + ":";
	var seconds = date.getSeconds();
	if (seconds < 10) {
		res += "0";
	}
	res += seconds + ":";
	var centiseconds = date.getMilliseconds();
	centiseconds = Math.floor(centiseconds / 10);
	if (centiseconds < 10) {
		res += "0";
	}
	res += centiseconds;
	return res;
}
