var user = {};

var levels = [
				{ level : "Beginner", guesses : 14 },
				{ level : "Intermediate", guesses : 11 },
				{ level : "Expert", guesses : 8 }
			 ];


var number = [];

var timeMode = false;

var gameLevel = 0;
var guessCount = 0;


// for Time Mode
var sec = 0, min = 0, hr = 0, time;
var timeTaken = 0;


//flags
var gameInProgress = false;


var container = document.querySelector(".container");
var section = document.querySelector("section");

var home = section.querySelector(".home-cont");
var helpCont = section.querySelector(".help-cont");
var statsCont = section.querySelector(".stats-cont");
var gameCont = section.querySelector(".game-cont");

var continueBtn = document.getElementById("continueBtn");

var answerBtn = document.getElementById("answerBtn");
var playPauseBtn = document.getElementById("playPauseBtn");
var timerSpan = document.getElementById("timer");

var ol = gameCont.querySelector("ol");
var gamePaused = document.getElementById("gamePaused");

var userInput = gameCont.querySelector(".user-input");
var inputField = document.getElementById("guessInput");

var resultCont = gameCont.querySelector(".result-cont");

var themeSwitcher = document.getElementById("themeSwitcher");
var timeModeSwitcher = document.getElementById("timeModeSwitcher");

var overlay = document.querySelector(".overlay");



window.addEventListener("load", init);

answerBtn.addEventListener("click", showAnswer);

inputField.addEventListener("keyup", function(event) {
	if (event.which === 13) {
	  event.preventDefault();
	  document.getElementById("goButton").click();
	}
});

function init() {
	var theme = localStorage.getItem("theme");
	if(theme == "light") {
		document.body.classList.remove("dark");
		themeSwitcher.checked = false;
	}
	else {
		themeSwitcher.checked = true;
	}

	user = JSON.parse(localStorage.getItem("user"));

	if(user == null) {
		user = { 
			timeMode: false,
			gameCount: 0,
			winCount: 0,
			bestGuess: 0,
			bestTime: 0
		};

		localStorage.setItem("user", JSON.stringify(user));
	}
	timeModeSwitcher.checked = user.timeMode;
	user.timeMode ? gameCont.classList.add("time-mode") : gameCont.classList.remove("time-mode");

	updateStats();
}

function switchTheme() {
    document.body.classList.toggle("dark");
    var theme = localStorage.getItem("theme");
    localStorage.setItem("theme", (theme == "light") ? "dark" : "light");
}

function switchTimeMode(el) {
	user.timeMode = el.checked;
	user.timeMode ? gameCont.classList.add("time-mode") : gameCont.classList.remove("time-mode");
	localStorage.setItem("user", JSON.stringify(user));
}


function showHelp() {
	container.className = "container help";
}

function showStats() {
	container.className = "container stats";
}

function updateStats() {

	document.getElementById("gameCount").textContent = user.gameCount;
	document.getElementById("winCount").textContent = user.winCount;

	document.getElementById("winRate").textContent = (user.gameCount) ? ((user.winCount / user.gameCount * 100).toFixed(2) + "%") : "-";

	document.getElementById("bestGuessStats").textContent = user.bestGuess || "-";
	document.getElementById("bestTimeStats").textContent = (user.bestTime) ? getTimeFormat(user.bestTime) : "-";
}


function generateNumber() {
	var arr = [];

	arr[0] = Math.floor(Math.random()*10);

	while(arr[0] == 0) {
		arr[0] = Math.floor(Math.random()*10);
	}

	arr[1] = Math.floor(Math.random()*10);

	while(arr[1] == arr[0]) {
		arr[1] = Math.floor(Math.random()*10);
	}

	arr[2] = Math.floor(Math.random()*10);

	while(arr[2] == arr[0] || arr[2] == arr[1]) {
		arr[2] = Math.floor(Math.random()*10);
	}

	arr[3] = Math.floor(Math.random()*10);

	while(arr[3] == arr[0] || arr[3] == arr[1] || arr[3] == arr[2]) {
		arr[3] = Math.floor(Math.random()*10);
	}

	console.log(arr);

	number = arr;
}


function selectLevel(level) {

	gameLevel = level;
	gameInProgress = true;
	guessCount = 0;
	clearTimer();

	generateNumber();

	container.className = "container game";

	answerBtn.style.display = "block";
	playPauseBtn.style.display = user.timeMode ? "block" : "none";
		
	resultCont.classList.add("hide");
	userInput.classList.remove("hide");

	ol.innerHTML = "";
	inputField.focus();
	timer();

	document.getElementById("gameLevel").textContent = levels[gameLevel].level;
	document.getElementById("totalGuesses").textContent = levels[gameLevel].guesses + " Guesses";
}


function goHome() {
	container.className = "container home";

	//section.querySelector(".confetti-cont").classList.add("hide");

	if(gameInProgress) {	
		continueBtn.classList.remove("hide");
		pauseTimer();
	}
}


function continueGame() {
	container.className = "container game";
	continueBtn.classList.add("hide");
	playPauseBtn.style.display = user.timeMode ? "block" : "none";
	timer();
}


function checkAnswer() {

	var guess = inputField.value.split("").map(x=>parseInt(x));

	if(guess[0] == 0) {
		alert("Enter a 4-digit number which starts with a non-zero.");
		return;
	}

	if(guess.length != 4) {
		alert("Enter a 4-digit number with distinct digits.");
		return;
	}

	var duplicate = false;
	guess.forEach(function(x, i){
		if(guess.indexOf(x) != -1 && guess.indexOf(x) != i) {
			duplicate = true;
		}
	});

	if(duplicate) {
		alert("Enter a 4-digit number with distinct digits.");
		return;
	}

	++guessCount;

	var li = document.createElement("li");
	var span1 = document.createElement("span");
	var span2 = document.createElement("span");

	span1.textContent =  inputField.value;
	li.appendChild(span1);
	li.appendChild(span2);

	inputField.value = "";
	inputField.focus();

	if(JSON.stringify(guess)==JSON.stringify(number)) {

		ol.appendChild(li);
		ol.scrollTop = ol.scrollHeight;

		showResult(true);		
		return;
	}

	var plus = 0, minus = 0;

	guess.forEach(function(x, i){
		if(number.indexOf(x) == i) {
			plus++;
		}
		else if(number.indexOf(x) != -1) {
			minus++;
		}
	});
	
	
	if(plus == 0 && minus == 0) {
		span2.textContent = "0";
	}
	else if(plus == 0) {
		span2.textContent = "-" + minus;
	}
	else if(minus == 0) {
		span2.textContent = "+" + plus;
	}
	else {
		span2.textContent = "+" + plus + " -" + minus;
	}

	ol.appendChild(li);

	ol.scrollTop = ol.scrollHeight;

	if(guessCount >= levels[gameLevel].guesses) {
		showResult(false);
	}
	
}

function showAnswer() {
	
	var show = confirm("This will be considered as a loss. Do you still want to see answer?");

	if(show) {
	  	showResult(false);
	}
}

function showResult(isWin) {

	userInput.classList.add("hide");
	resultCont.classList.remove("hide");
	gameInProgress = false;

	var span = resultCont.querySelector(".result-text");
	span.textContent = isWin ? "You Win !!" : "You Lose !!";
	isWin ? span.classList.add("glitter") : span.classList.remove("glitter");
	

	document.getElementById("answer").textContent = number.join("");

	(user.gameCount)++;

	if(isWin) {
		(user.winCount)++;

		if(user.bestGuess > guessCount || user.bestGuess == 0) {
			user.bestGuess = guessCount;
		}

		//section.querySelector(".confetti-cont").classList.remove("hide");
	}
	
	document.getElementById("totalUserGuesses").textContent = guessCount;
	document.getElementById("bestGuess").textContent = user.bestGuess || "-";


	if(user.timeMode) {

		pauseTimer();
		timeTaken = (hr*60*60) + (min*60) + sec; //converting to seconds

		//update user json

		if( isWin && (user.bestTime > timeTaken || user.bestTime == 0) ) {
			user.bestTime = timeTaken;
		}

		//fill info on page

		document.getElementById("timeTaken").textContent = getTimeFormat(timeTaken);
		document.getElementById("bestTime").textContent = (user.bestTime) ? getTimeFormat(user.bestTime) : "-";
		playPauseBtn.style.display = "none";
	}
	answerBtn.style.display = "none";

	updateStats();
	localStorage.setItem("user", JSON.stringify(user));
}

function pauseGame() {
	overlay.classList.remove("hide");
	document.addEventListener("click", playGame);
	pauseTimer();
	playPauseBtn.querySelector(".pause-icon").classList.add("hide");
	playPauseBtn.querySelector(".play-icon").classList.remove("hide");
}

function playGame() {
	overlay.classList.add("hide");
	document.removeEventListener("click", playGame);
	timer();
	playPauseBtn.querySelector(".pause-icon").classList.remove("hide");
	playPauseBtn.querySelector(".play-icon").classList.add("hide");
}



function getTimeFormat(time) {
	var h,m,s;
	h = Math.floor(time / 3600);
	m = Math.floor((time % 3600) / 60);
	s = Math.floor(time % 3600 % 60);

	if(h == 0) {
		return ( m + ":" + ((s<10) ? ("0"+s) : s) );
	}
	return ( h + ":" + ((m<10) ? ("0"+m) : m) + ":" + ((s<10) ? ("0"+s) : s) );
}


function timer() {
	time = setTimeout(function() {
	 
	 	sec++;
	    
		if(sec == 60) {
	    	sec = 0;
	        min++;
	        if(min == 60) {
	        	min = 0;
	            hr++;
	        }
	    }

	    timerSpan.textContent = ((min<10) ? ("0"+min) : min) + ":" + ((sec<10) ? ("0"+sec) : sec);

	    if(hr > 0) {
	    	timerSpan.textContent = ((hr<10) ? ("0"+hr) : hr) + ":" 
		    											+ ((min<10) ? ("0"+min) : min) + ":" 
		    											+ ((sec<10) ? ("0"+sec) : sec);
	    }
	    
	    timer();
	    
	 }, 1000);
}

function pauseTimer() {
	clearTimeout(time);
}

function clearTimer() {
	timerSpan.textContent = "00:00";
	sec = 0, min = 0, hr = 0;
}

window.addEventListener('resize', () => {
	let vh = window.innerHeight * 0.01;
	document.documentElement.style.setProperty('--vh', vh + 'px');
});


if('serviceWorker' in navigator) {
	window.addEventListener("load", function() {
		navigator.serviceWorker.register("/serviceWorker.js")
			.then(reg => console.log("service worker registered"))
			.catch(err => console.log("service worker not registered", err));
	});
}
