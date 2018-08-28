// TODO: update audio to use the audioContext api so that an audio clip can be played when its already being played. Currently if you click a button too fast after clicking the same button, no sound will play for that action (because it's already being played)

// object for holding game state
let state = {
  power: false,
  strict: false,
  count: 0,
  started: false,
  pattern: [],
  match: []
};

// the number of matches needed to win
const matchesToWin = 20;

// the delay between button presses
// during pattern play
let playDelay = 750;
const lightDelay = 500;

// the control buttons
const powerButton = document.querySelector('#power_button');
const startButton = document.querySelector('#start_button');
const strictButton = document.querySelector('#strict_mode');
const countDisplay = document.querySelector('#count');


/* get the play button elements and attach their sounds */
const blueButton = document.querySelector('#blue');
blueButton.sound = new Audio("https://s3.amazonaws.com/freecodecamp/simonSound1.mp3");

const redButton = document.querySelector('#red');
redButton.sound = new Audio("https://s3.amazonaws.com/freecodecamp/simonSound2.mp3");

const greenButton = document.querySelector('#green');
greenButton.sound = new Audio("https://s3.amazonaws.com/freecodecamp/simonSound3.mp3");

const yellowButton = document.querySelector('#yellow');
yellowButton.sound = new Audio("https://s3.amazonaws.com/freecodecamp/simonSound4.mp3");

// array that holds all play buttons
const playButtons = [blueButton, redButton, yellowButton, greenButton];


/*        Control button handlers        */

powerButton.addEventListener('change', () => {
  state.power = !state.power;
  if (state.power) {
    blueButton.style.backgroundColor = "blue";
    redButton.style.backgroundColor = "red";
    greenButton.style.backgroundColor = "green";
    yellowButton.style.backgroundColor = "yellow";
    countDisplay.textContent = '--';
  } else {
    reset();
    blueButton.style.backgroundColor = "darkblue";
    redButton.style.backgroundColor = "darkred";
    greenButton.style.backgroundColor = "darkgreen";
    yellowButton.style.backgroundColor = "goldenrod";
  }
});

startButton.addEventListener('click', () => {
  if (!state.power) return;
  if (state.strict) {
    resetStrictMode();
  } else {
    resetStarted();
  }
  blueButton.style.backgroundColor = "darkblue";
  redButton.style.backgroundColor = "darkred";
  greenButton.style.backgroundColor = "darkgreen";
  yellowButton.style.backgroundColor = "goldenrod";

  startButton.style.backgroundColor = 'green';

  // start the game
  start()
});

strictButton.addEventListener('click', () => {
  if (!state.power) return;
  state.strict = !state.strict;
  if (state.strict) {
    strictButton.style.backgroundColor = 'green';
  } else {
    strictButton.style.backgroundColor = 'yellow';
  }
});


/*            Play button handlers       */           

blueButton.addEventListener('mousedown', () => {
  if (state.power && state.started) {
    blueButton.classList = blueButton.classList + ' lit';
    blueButton.sound.play();
    state.match.push(blueButton);
    testPattern();
  }
});
blueButton.addEventListener('mouseup', () => {
  blueButton.classList = '';
});
redButton.addEventListener('mousedown', () => {
  if (state.power && state.started) {
    redButton.classList = redButton.classList + ' lit';
    redButton.sound.play();
    state.match.push(redButton);
    testPattern();
  }
});
redButton.addEventListener('mouseup', () => {
  redButton.classList = '';
});
greenButton.addEventListener('mousedown', () => {
  if (state.power && state.started) {
    greenButton.classList = greenButton.classList + ' lit';
    greenButton.sound.play();
    state.match.push(greenButton);
    testPattern();
  }
});
greenButton.addEventListener('mouseup', () => {
  greenButton.classList = '';
})
yellowButton.addEventListener('mousedown', () => {
  if (state.power && state.started) {
    yellowButton.classList = yellowButton.classList + ' lit';
    yellowButton.sound.play();
    state.match.push(yellowButton);
    testPattern();
  }
});
yellowButton.addEventListener('mouseup', () => {
  yellowButton.classList = '';
});

/*          Helpers      */

const start = () => {
  const startTime = Date.now();
  let i = setInterval(() => {
    if (countDisplay.textContent === '--') {
      countDisplay.textContent = '';
    } else {
      countDisplay.textContent = '--';
    }
    if (Date.now() - startTime > 1000) {
      updateCount();
      clearInterval(i);
      addToPattern();
      playPattern();
    }
  }, 250);
}

const updateCount = () => {
  state.count += 1;
  countDisplay.textContent = state.count;
}

// add a button to the pattern
// and play the current pattern
const nextRound = () => {
  addToPattern();
  playPattern();
}

// check for pattern matches
// when player inputs === the length of pattern inputs
const testPattern = () => {
  if (patternMatch()) {
    if (state.pattern.length === state.match.length) {
      state.match = [];
      
      updateCount();

      if (state.count === matchesToWin) {
        winner();
      } else {
        setTimeout(() => {
          nextRound();
        }, 500);
      }
    }
  } else {
    displayMatchError();
  }
}

// test of state.pattern matches state.match
const patternMatch = () => {
  let match = true;
  for (let i = 0; i < state.match.length; i++) {
    if (state.pattern[i] !== state.match[i]) {
      match = false;
    } 
  }
  return match;
}

// TODO: play the sound of the incorrect button
const displayMatchError = () => {
  countDisplay.textContent = '!!';
  // this isnt working for some reason
  // playButton(state.match[state.match.length - 1]);
  setTimeout(() => {
    state.match = [];
    countDisplay.textContent = state.count;
    if (state.strict) {
      resetStrictMode();
      nextRound();
    } else {
      setTimeout(() => {
        playPattern();
      }, playDelay);
    }
  }, 750);
}
// handle a won round
const winner = () => {
  // display the win
  setTimeout(() => {
    displayWinner();
  }, 250);
  
  // reset the game
  setTimeout(() => {
    (state.strict) ? resetStrictMode() : resetStarted();
    nextRound();
  }, 3000);
}

const addToPattern = () => {
  state.pattern.push(pickRandomButton());
}

// iterates through state.pattern
// and plays each button in the pattern
// with a delay between each play
const playPattern = (index = 0) => {
  const btn = state.pattern[index];
  setTimeout(() => {
    playButton(btn);
    const nextIndex = ++index;
    if (state.pattern[nextIndex]) {
      playPattern(nextIndex);
    }
  }, playDelay);
}

// return a random play button
const pickRandomButton = () => {
  const min = Math.ceil(0);
  const max = Math.floor(3);
  const randy = Math.floor(Math.random() * (max - min + 1)) + min;
  return playButtons[randy];
}

// takes a play button element 
// simulates the button being pressed
// by lighting it up, and playing its sound
const playButton = (button) => {
  // light the button
  button.classList = button.classList + ' lit';
  
  // set unlight button timer
  setTimeout(() => {
    button.classList = '';
  }, lightDelay);
  
  // play its sound
  button.sound.play();
}

const displayWinner = () => {
  state.pattern = playButtons;
  countDisplay.textContent = 'WIN';
  playDelay = 250;
  playPattern();
  setTimeout(() => {
    playPattern();
  }, 1000);
}

// reset the game to the off/not-playing state
const reset = () => {
  state.power = false;
  state.strict = false;
  state.started = false;
  state.count = 0;
  state.pattern = [];
  state.match = [];
  countDisplay.textContent = '';
  strictButton.style.backgroundColor = 'yellow';
  startButton.style.backgroundColor = 'red';
}

// reset the game into started strict mode
const resetStrictMode = () => {
  reset();
  state.power = true;
  state.started = true;
  state.strict = true;
  strictButton.style.backgroundColor = 'green';
  startButton.style.backgroundColor = 'green';
}

// reset the game into a started state
const resetStarted = () => {
  reset();
  state.power = true;
  state.started = true;
  startButton.style.backgroundColor = 'green';
}