// Internal vars
var score = 0, maxScore = 0, life = 100, currentColorCount = 0, currentX = 0, nextColorX = 0, newColorTime = 0;
var mappings = [], notes = [], availableColors = ["red", "blue", "lime", "green", "cyan", "orange", "fuchsia"];
var pressedKeys = [], alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), freeKeys = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

var hNotes, hScore, hNextKey, gameInterval;
var speed, maxColorCount;

function initGame() {
	// HTML IDs
	hNotes = document.getElementById("ttc-game");
	hScore = document.getElementById("ttc-score");
	hNextKey = document.getElementById("ttc-new-key");

	// Difficulty configuration
	speed = parseFloat(document.getElementById("inSpeed").value) || 2.0;
	maxColorCount = parseInt(document.getElementById("inNbColors").value) || 3;

	hNotes.innerHTML = "";
	hNextKey.onclick = "";

	document.addEventListener("keydown", function(e) {
		var key = e.key.toUpperCase();
		if (alphabet.indexOf(key) > -1)
			hitNote(key);
	});

	hNotes.className = "ready";
	gameInterval = setInterval(gameLoop, 1000/60);
}

function gameLoop() {
	currentX+= speed;
	newColorTime = Math.max(0, newColorTime-speed);

	for(var n=0 ; n<notes.length ; n++) {
		var shift = currentX - notes[n].x + 650;
		if (shift >= 800) {
			hitNote(false);
			n--;
		} else
			hNotes.children[n].style.left = shift + "px";
	}

	var newCount = Math.floor(Math.random()*5) + 2;
	var usableColors = Object.keys(mappings);
	var newX = currentX + 1000;
	if (notes.length == 0) {
		if (nextColorX > -1 && nextColorX <= currentX) {
			// Adding a new color
			var newColor = availableColors.splice(Math.floor(Math.random()*availableColors.length), 1)[0];
			var newKey = freeKeys.splice(Math.floor(Math.random()*freeKeys.length), 1)[0];
			mappings[newColor] = newKey;
			usableColors.push(newColor);

			hNextKey.innerText = newKey;
			hNextKey.style.backgroundColor = newColor;

			addNote(newColor, newKey, newX);
			addNote(newColor, "", newX + 200);
			addNote(newColor, "", newX + 400);
			newX += 600;

			if (availableColors.length == 0 || usableColors.length == maxColorCount) {
				nextColorX = -1;
				newColorTime = 2000;
			} else {
				newColorTime = Math.floor(Math.random()*4000) + 2000;
				nextColorX = currentX + newColorTime;
			}
		}

		// Will be better with some patterns
		for (var n=0 ; n<newCount ; n++) {
			addNote(usableColors[Math.floor(Math.random()*usableColors.length)], "", newX);
			newX += Math.random()*500 + 100;
		}
	}


	if (maxScore == 0)
		hScore.innerHTML = "Go!";
	else
		hScore.innerHTML = score + " &nbsp; " + (Math.floor(score/maxScore*10000)/100) + "%";

	if (life > 0) {
		var hue = 120*life/100;
		hScore.style.background = "-webkit-linear-gradient(left, hsl(" + hue + ", 100%, 20%) 0%, hsl(" + hue + ", 100%, 50%) " + life + "%, white " + life + "%, white 100%)";
		hNextKey.style.opacity = Math.sin(Math.PI/2*(Math.min(1, newColorTime/1000)));
	} else {
		clearInterval(gameInterval);
		notes = [];
		hNotes.className = "";
		hNotes.innerHTML = "Game over!";
		hScore.style.background = "white";
	}
}

function addNote(color, letter, x) {
	notes.push({"color": color, "text": letter, "x": x});
	var newCircle = document.createElement("div");
	newCircle.style.left = "-100px";
	newCircle.style.backgroundColor = color;
	newCircle.innerText = letter;
	hNotes.appendChild(newCircle);
}

function hitNote(key) {
	if (notes.length) {
		maxScore += Math.round(50*Math.exp((speed-2)/10));

		if (key === false) {
			life -= 20;
		} else {
			var hitted = notes[0];
			if (key == mappings[hitted.color]) {
				var deltaX = Math.abs(currentX - hitted.x);
				if (deltaX > 50)
					life -= Math.min(15, deltaX/100);
				else {
					score += Math.round(50*Math.exp((speed-2)/10)*Math.cos(Math.PI*deltaX/100));
					life++;
					if (life > 100)
						life = 100;
				}
			} else
				life -= 15;
		}
	
	
		notes.shift();
		hNotes.removeChild(hNotes.children[0]);
	}
}
