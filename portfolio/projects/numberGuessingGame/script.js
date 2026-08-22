let randomNumber = Math.floor(Math.random() * 100) + 1;

const guesses = document.querySelector(".guesses");
const guessResult = document.querySelector(".lastResults");
const lowOrHi = document.querySelector(".lowOrHi");
const guessFeild = document.querySelector(".guessFeild");
const guessSubmit = document.querySelector(".guessSubmit");

let guessesCount = 1;
let resetButton;

function guessCalculation() {

  const userGuess = Number(guessFeild.value);

  guessResult.textContent = "previous guess:";

  if (userGuess < 1 || userGuess > 100 || isNaN(userGuess)) {
    guesses.textContent = "don't be oversmart";
    lowOrHi.style.backgroundColor = "pink";
    guessFeild.value = "";
    guessFeild.focus();
    return;
  }

  if (guessesCount === 1) {
    guessResult.textContent = `${guessResult.textContent} ${userGuess}`;
  } else {
    guessResult.textContent = `${guessResult.textContent} ${userGuess}`;
  }

  if (userGuess === randomNumber) {
    guesses.textContent = "Congratulations!!, You Won";
    lowOrHi.textContent = "";
    guesses.style.backgroundColor = "green";
    gameOver();
    return;
  }

  if (userGuess > randomNumber) {
    lowOrHi.textContent = "Too high";
  } else {
    lowOrHi.textContent = "Too low";
  }

  if (guessesCount === 10) {
    guesses.textContent = `The randomNumber was: ${randomNumber}`;
    guesses.style.backgroundColor = "red";
    lowOrHi.style.backgroundColor = "red";
    gameOver();
    return;
  }

  guesses.textContent = "Wrong!!";
  guesses.style.backgroundColor = "red";

  guessesCount++;
  guessFeild.value = "";
  guessFeild.focus();
}

guessSubmit.addEventListener("click", guessCalculation);

function gameOver() {
  guessSubmit.disabled = true;
  guessFeild.disabled = true;

  resetButton = document.createElement("button");
  resetButton.textContent = "Try Again";
  document.body.append(resetButton);

  resetButton.addEventListener("click", resetGame);
}

function resetGame() {
  guessesCount = 1;
  randomNumber = Math.floor(Math.random() * 100) + 1;

  guesses.textContent = "";
  guessResult.textContent = "";
  lowOrHi.textContent = "";

  guesses.style.backgroundColor = "";
  lowOrHi.style.backgroundColor = "";

  guessSubmit.disabled = false;
  guessFeild.disabled = false;
  guessFeild.value = "";
  guessFeild.focus();

  if (resetButton) {
    resetButton.remove();
    resetButton = null;
  }
}
