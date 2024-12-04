const MIN_NUM = 0;
const MAX_NUM = 99999;
let targetNumber;
let currentMin = MIN_NUM;
let currentMax = MAX_NUM;
const minRange = document.querySelector(".min-range");
const maxRange = document.querySelector(".max-range");

// Slot machine related variables
const slotButton = document.querySelector(".slot-btn-handle");
const slotBg = document.querySelector(".slot-bg-handle");
let isDragging = false;
let randomStarted = false;
let isSlotRunning = false;
let numbers = document.querySelectorAll(".slot-machin-number"); // Declare numbers globally
const output = document.getElementById("output");
const feedback = document.getElementById("feedback");

// Game level related variables
const levelsItem = document.querySelectorAll(".levels .item");
const btnPlay = document.querySelector(".play-game");

// Function to set the target number
function setTargetNumber(num) {
  targetNumber = Math.floor(Math.random() * num);
  console.log(`Target Number: ${targetNumber}`);
  currentMax = num;
  hideElement();
}

// Function to hide elements if target number is not set
function hideElement() {
  if (typeof targetNumber === "undefined") {
    alert("Please set a target number first!");
    return;
  }
  const initialNumbers = generateNumbers(currentMin, currentMax);
  displayNumbers(initialNumbers);
  minRange.textContent = currentMin;
  maxRange.textContent = currentMax;
}

// Function to generate random numbers
function generateNumbers(min, max, count = 9) {
  return Array.from(
    { length: count },
    () => Math.floor(Math.random() * (max - min + 1)) + min
  );
}

// Function to display numbers in boxes
function displayNumbers(numbers) {
  const boxes = document.getElementById("boxes");
  boxes.innerHTML = ""; // Clear previous numbers

  numbers
    .sort((a, b) => a - b)
    .forEach((num) => {
      const box = document.createElement("div");
      box.classList.add(
        "col-4",
        
        "my-2",
        
        
        "text-light",
        "d-flex",
        "fs-4",
        "align-items-center",
        "justify-content-center"
      );
      box.innerHTML = `<span class="number p-5 w-100 bg-danger">${num}</span>`;
      box.addEventListener("click", () => checkGuess(num));
      boxes.appendChild(box);
    });
}

// Function to check the user's guess
let clickCounter = 0; // Click counter
let startTime = null; // Start time for reaction time calculation
let resultsSelected = []; // Store click results

function checkGuess(selectedNumber) {
  if (startTime === null) {
    startTime = Date.now(); // Record start time
  }

  const totalTime = (Date.now() - startTime) / 1000; // Calculate reaction time in seconds
  let comparison = "";

  if (selectedNumber === targetNumber) {
    feedback.textContent = `🎉 Congratulations! You found the number ${selectedNumber}!`;
    feedback.style.color = "green";
    document.getElementById("boxes").innerHTML = ""; // Clear numbers
    document.querySelector(".number-range").style.display = "none";
    document.querySelector(".game-description").style.display = "block";
    document.querySelector(".notice-banner").classList.remove("d-none");
    document.querySelector(".game-win-loss").classList.add("d-block");
    comparison = "Equal";

    // Record result in table
    resultsSelected.push({
      clickNumber: ++clickCounter,
      totalTime,
      totalTimer: `${totalTime.toFixed(2)}s`,
      reactionTime:
        resultsSelected.length > 0
          ? totalTime - resultsSelected[resultsSelected.length - 1].totalTime
          : 0,
      comparison: comparison,
      selected: selectedNumber,
    });

    updateResultsTable(resultsSelected);
    return;
  }

  // Number comparison
  if (selectedNumber < targetNumber) {
    currentMin = Math.max(currentMin, selectedNumber);
    comparison = "Smaller";
    feedback.textContent = `🔼 The target number is greater than ${selectedNumber}.`;
    feedback.style.color = "#28a745";
  } else {
    currentMax = Math.min(currentMax, selectedNumber);
    comparison = "Bigger";
    feedback.textContent = `🔽 The target number is smaller than ${selectedNumber}.`;
    feedback.style.color = "#C72C41";
  }

  // Record result in table
  resultsSelected.push({
    clickNumber: ++clickCounter,
    totalTime,
    totalTimer: `${totalTime.toFixed(2)}s`,
    reactionTime:
      resultsSelected.length > 0
        ? totalTime - resultsSelected[resultsSelected.length - 1].totalTime
        : 0,
    comparison: comparison,
    selected: selectedNumber,
  });

  updateResultsTable(resultsSelected);

  // Generate new numbers within the range
  const newNumbers = generateNumbers(currentMin, currentMax);
  displayNumbers(newNumbers);

  // Update range display
  minRange.textContent = currentMin;
  maxRange.textContent = currentMax;
}

// Function to update results table
function updateResultsTable(resultsSelected) {
  const resultTable = `
    <table class="table mt-4">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Total Time</th>
          <th scope="col">Reaction Time</th>
          <th scope="col">Comparison</th>
          <th scope="col">Selected Number</th>
        </tr>
      </thead>
      <tbody>
        ${resultsSelected
          .map(
            (result) => `
          <tr>
            <th scope="row">${result.clickNumber}</th>
            <td>${result.totalTimer}</td>
            <td>${result.reactionTime.toFixed(4)}</td>
            <td>${result.comparison}</td>
            <td>${result.selected}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
  document.querySelector("#boxes").innerHTML = resultTable;
}

// Slot machine event listeners
slotButton.addEventListener("mousedown", (e) => {
  isDragging = true;
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    const containerRect = slotBg.getBoundingClientRect();
    const buttonHeight = slotButton.offsetHeight;
    let newTop = e.clientY - containerRect.top - buttonHeight / 2;

    // Limit button movement within 5% to 95% range
    const minTop = containerRect.height * 0.05;
    const maxTop = containerRect.height * 0.95 - buttonHeight;

    if (newTop < minTop) newTop = minTop;
    if (newTop > maxTop) newTop = maxTop;

    slotButton.style.top = `${newTop}px`;

    // Check if button is moved more than 50% from top
    if (newTop >= containerRect.height * 0.5 && !randomStarted) {
      randomStarted = true;

      // Start slot if no other operation is running
      if (!isSlotRunning) {
        isSlotRunning = true;
        startSlotMachine();
      }
    }
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  randomStarted = false;
  setTimeout(() => {
    slotButton.style.top = `5%`;
  }, 200);
});

let resultRandomNumber = null;

// Function to start slot machine
function startSlotMachine() {
  output.textContent = ""; // Clear previous result

  // Generate random numbers for each slot
  numbers.forEach((number) => {
    number.textContent = Math.floor(Math.random() * 10);
  });

  // Simulate number rotation
  let rotationTime = 70; // Rotation time for each number
  let totalDuration = 3000; // Total operation duration

  // Settings to stop operation after 3 seconds
  setTimeout(() => {
    resultRandomNumber = Number(
      Array.from(numbers)
        .map((number) => number.textContent)
        .join("")
    );

    output.textContent = `Result: ${resultRandomNumber}`; // Display result
    // Reset flag after completion
    isSlotRunning = false;
  }, totalDuration);

  // Simulate number rotation in defined intervals
  let intervalId = setInterval(() => {
    numbers.forEach((number) => {
      number.textContent = Math.floor(Math.random() * 10);
    });
  }, rotationTime);

  // Stop rotation after total duration
  setTimeout(() => {
    clearInterval(intervalId); // Stop number rotation
  }, totalDuration);
}

// Update number slots based on selected level
levelsItem.forEach((item) => {
  item.addEventListener("click", () => {
    const activeItem = document.querySelector(".levels .item.active");
    if (activeItem) {
      activeItem.classList.remove("active");
    }
    item.classList.add("active");

    const level = item.dataset.set;
    updateNumberSlots(level);
  });
});

// Function to update number slots
function updateNumberSlots(level) {
  const numberContainer = document.querySelector(".random-numbers");
  numberContainer.innerHTML = ""; // Clear previous numbers

  for (let i = 0; i < level; i++) {
    const numberDiv = document.createElement("div");
    numberDiv.classList.add(
      "slot-machin-number",
      "bg-danger",
      "fs-2",
      "text-light",
      "mx-2"
    );
    numberDiv.textContent = Math.floor(Math.random() * 10);
    numberContainer.appendChild(numberDiv);
  }

  // Reset number selection
  numbers = document.querySelectorAll(".slot-machin-number");
}

// Set default level to 2
updateNumberSlots(2);

let myModalElement = document.getElementById("slot-machine-modal");

// Reset values when modal is shown
myModalElement.addEventListener("show.bs.modal", () => {
  targetNumber = undefined; // Clear target number
  resultRandomNumber = null; // Clear generated number
  output.textContent = ""; // Clear previous slot machine result
  numbers.forEach((number) => (number.textContent = "-")); // Reset slot machine numbers

  // Reset ranges
  currentMin = MIN_NUM;
  currentMax = MAX_NUM;
  minRange.textContent = currentMin;
  maxRange.textContent = currentMax;

  // Reset click results
  resultsSelected.length = 0; // Clear results
  document.querySelector("#boxes").innerHTML = ""; // Clear result table and numbers
  feedback.textContent = ""; // Clear feedback message
});

// Function to start the game
btnPlay.addEventListener("click", () => {
  if (isSlotRunning) {
    alert("Please wait until the numbers finish spinning.");
    return;
  }

  // Check if target number is set
  if (!resultRandomNumber) {
    alert("Please pull the lever to generate the target number first.");
    return;
  } else if (resultRandomNumber < 10) {
    alert("The number is too small. Please try again.");
    return;
  }

  if (resultRandomNumber && resultRandomNumber > 0) {
    setTargetNumber(resultRandomNumber);

    // Close the modal
    let modalInstance = bootstrap.Modal.getOrCreateInstance(myModalElement);
    modalInstance.hide();

    // Reset game for a new round
    resultsSelected = [];
    clickCounter = 0;
    currentMin = MIN_NUM;
    minRange.textContent = currentMin;
    maxRange.textContent = currentMax;
    startTime = null;

    // Hide welcome message and show number range
    document.querySelector(".game-description").style.display = "none";
    document.querySelector(".notice-banner").classList.add("d-none");
    document.querySelector(".number-range").style.display = "block";
    document.querySelector(".game-win-loss").classList.remove("d-block");
    feedback.innerHTML = "";
  } else {
    alert("Please wait until the numbers finish spinning.");
  }
});
