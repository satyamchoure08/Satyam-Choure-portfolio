const questionEl = document.querySelector("#question");
const optionsEl = document.querySelector("#options");
const nextButton = document.querySelector("#quizNext");
const timerEl = document.querySelector("#quizTimer");
const questionCountEl = document.querySelector("#questionCount");
const progressEl = document.querySelector("#quizProgress");
const quizScreen = document.querySelector("#quizScreen");
const resultsScreen = document.querySelector("#resultsScreen");
const introScreen = document.querySelector("#introScreen");
const scoreEl = document.querySelector("#quizScore");
const resultMessageEl = document.querySelector("#resultMessage");
const restartButton = document.querySelector("#restartQuiz");
const startButton = document.querySelector("#startQuiz");

const questions = [
  {
    question: "What are the odds of making it?",
    answers: [
      "Why CAN'T I...",
      "200%",
      "Yes |*_*|",
      "I'm gonna do it at ANY COST"
    ],
    // All answers are valid — this is a motivational quiz
    correct: [0, 1, 2, 3]
  },
  {
    question: "New start: new perspective, .... ;",
    answers: [
      "Complete the PRODUCT first — you can make it BEAUTIFUL later.",
      "Can't stop until I finish THIS>",
      "TRUST YOUR INSTINCTS: BELIEVE IN THE DREAM, DO_SOMETHING",
      "ENJOY THE JOURNEY, success is GUARANTEED."
    ],
    correct: [0, 1, 2, 3]
  },
  {
    question: "WHAT ARE YOU SCARED OF?",
    answers: [
      "*failing??????",
      "SKIPPING costs a lot>",
      "chasing too many paths",
      "MAKING YOURSELF UNCOMFORTABLE",
      "learning? ITS ACTUALLY FUN>"
    ],
    correct: [0, 1, 2, 3, 4]
  },
  {
    question: "THERE'S A LOT TO LEARN | it's the game of BRAVES, a decades-long game: *I GAMBLED MY LIFE ON THIS/",
    answers: [
      "Sitting in front of your code editor feels better than wandering around with LOOSERS.",
      "*he was never wrong/",
      "It's just 'ME vs ME, & only ME/MY<='",
      "NEVER LOSE THE GRIP, *never/"
    ],
    correct: [0, 1, 2, 3]
  },
  {
    question: "TIME: *this is what you think you have — But You DON'T>",
    answers: [
      "BE CREATIVE & *unique",
      "You are Not part of the crowd;",
      "Just starting: *actually Works;",
      "TRACK THE PROGRESS *peace;"
    ],
    correct: [0, 1, 2, 3]
  },
  {
    question: "*BREAK the limits: Cause there ain't any..",
    answers: [
      "f*## them",
      "Only focus is STARTING THE COMPANY",
      "Dreams come true>",
      "I'M making it, TO THE TOP — of the World."
    ],
    correct: [0, 1, 2, 3]
  },
  {
    question: "What to do of those mf#*# losers?",
    answers: [
      "Just get away. Be rude asf — that's the only way;",
      "Best to get out of the trap ASAP. It's never always too late",
      "Sometimes just moving on is the best solution",
      "Being rude and minding my own business actually feels good"
    ],
    correct: [0, 1, 2, 3]
  }
];

let currentQuestion = 0;
let timeLeft = 30;
let score = 0;
let timerInterval = null;
let answered = false;

function startTimer() {
  clearInterval(timerInterval);
  timeLeft = 30;
  timerEl.textContent = timeLeft;
  timerEl.style.background = "#ef5350";

  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;

    if (timeLeft <= 10) {
      timerEl.style.background = "#c62828";
    }

    if (timeLeft === 0) {
      clearInterval(timerInterval);
      lockAnswers();
      nextButton.disabled = false;
    }
  }, 1000);
}

function lockAnswers() {
  const buttons = optionsEl.querySelectorAll(".answer-btn");
  buttons.forEach((btn) => {
    btn.disabled = true;
    btn.classList.add("locked");
  });
}

function showQuestion() {
  answered = false;
  nextButton.disabled = true;
  optionsEl.innerHTML = "";

  const q = questions[currentQuestion];

  questionEl.textContent = q.question;
  questionCountEl.textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
  progressEl.style.width = `${((currentQuestion + 1) / questions.length) * 100}%`;

  q.answers.forEach((answerText, index) => {
    const button = document.createElement("button");
    button.classList.add("answer-btn");
    button.type = "button";
    button.textContent = answerText;

    button.addEventListener("click", () => {
      if (answered) return;
      checkAnswer(button, index);
    });

    optionsEl.appendChild(button);
  });

  startTimer();
}

function checkAnswer(button, selectedIndex) {
  answered = true;
  clearInterval(timerInterval);
  lockAnswers();

  const correctIndices = questions[currentQuestion].correct;

  // Highlight the selected answer
  button.classList.add("selected");

  // Since this is a motivational quiz where every path is valid,
  // any selection counts as a point
  if (correctIndices.includes(selectedIndex)) {
    score++;
  }

  nextButton.disabled = false;
}

function showResults() {
  quizScreen.hidden = true;
  resultsScreen.hidden = false;

  const total = questions.length;
  scoreEl.textContent = `You scored ${score} / ${total}`;

  let message = "";
  if (score === total) {
    message = "All in. No excuses. You're already on the path — keep building.";
  } else if (score >= total * 0.7) {
    message = "Strong mindset. Keep the grip. The top of the world is still waiting.";
  } else {
    message = "Every answer was a choice. The only real failure is quitting. Restart and go again.";
  }
  resultMessageEl.textContent = message;
}

function nextQuestion() {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    showQuestion();
  } else {
    showResults();
  }
}

function restartQuiz() {
  currentQuestion = 0;
  score = 0;
  resultsScreen.hidden = true;
  quizScreen.hidden = false;
  showQuestion();
}

function startQuiz() {
  introScreen.hidden = true;
  quizScreen.hidden = false;
  currentQuestion = 0;
  score = 0;
  showQuestion();
}

// Event listeners
startButton.addEventListener("click", startQuiz);
nextButton.addEventListener("click", nextQuestion);
restartButton.addEventListener("click", restartQuiz);
