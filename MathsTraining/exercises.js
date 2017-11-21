/**
 * Current state of the program
 * -1 : waiting the end of a process
 * 0 : waiting for exercise selection
 * 1 : running an exercise
 */
var state = -1;

var currentExercise;

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
			"title": "Multiplications"
		},
		{
			"title": "Divisions"
		},
		{
			"title": "Carrés"
		},
		{
			"title": "Racines"
		},
		{
			"title": "Logarithmes"
		},
		{
			"title": "Trigonométrie"
		},
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

	state = 0;
}

function launchExercise(section, index) {
	if (status != 0)
		return;

	console.log("Launching: " + section + "[" + index + "]");
	state = -1;

	currentExercise = exercises[section][index];

	document.getElementById("exercise").className = "";
	document.getElementById("calculus").innerText = "Cliquez sur le bouton ci-dessous pour démarrer !";

	state = 1;
}

function nextQuestion() {
	if (state != 1)
		return;

	var chosenBuilder = Math.floor(Math.random() * currentExercise["builders"].length);
	console.log(currentExercise["builders"][chosenBuilder]);
	var built = currentExercise["builders"][chosenBuilder].build();
	console.log(built);
	var equTxt = built.toTeX();
	console.log(equTxt);

	var equTag = document.getElementById("calculus");
	equTag.innerText = "$$" + equTxt + "$$";
	jsMath.ConvertTeX(equTag);
	jsMath.ProcessBeforeShowing(equTag);
}

function stopExercise() {
	if (state != 1)
		return;
	
	state = -1;
	document.getElementById("exercise").className = "hidden";

}
