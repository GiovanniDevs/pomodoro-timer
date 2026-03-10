document.addEventListener("DOMContentLoaded", () => {
  // Variables
  // setting variables
  let setWorkTime = parseInt(document.getElementById("work-timer").value);
  let setShortBreak = parseInt(document.getElementById("short-timer").value);
  let setLongBreak = parseInt(document.getElementById("long-timer").value);
  let setReps = parseInt(document.getElementById("reps").value);

  //  Event listeners to update timers from settings

  document.getElementById("work-timer").addEventListener("input", (e) => {
    setWorkTime = parseInt(e.target.value) * 60 || 0;
    saveSettings();
    loadSettings();
  });

  document.getElementById("short-timer").addEventListener("input", (e) => {
    setShortBreak = parseInt(e.target.value) * 60 || 0;
    saveSettings();
    loadSettings();
  });

  document.getElementById("long-timer").addEventListener("input", (e) => {
    setLongBreak = parseInt(e.target.value) * 60 || 0;
    saveSettings();
    loadSettings();
  });

  document.getElementById("reps").addEventListener("input", (e) => {
    setReps = parseInt(e.target.value) || 1;
    saveSettings();
    loadSettings();
  });

  // ------ Local Storage ------

  function saveSettings() {
    const settings = {
      work: setWorkTime / 60, // store in minutes
      shortBreak: setShortBreak / 60,
      longBreak: setLongBreak / 60,
      reps: setReps,
    };
    localStorage.setItem("pomodoroSettings", JSON.stringify(settings));
  }

  function loadSettings() {
    const saved = localStorage.getItem("pomodoroSettings");
    if (saved) {
      const s = JSON.parse(saved);

      // update variables
      setWorkTime = s.work * 60;
      setShortBreak = s.shortBreak * 60;
      setLongBreak = s.longBreak * 60;
      setReps = s.reps;

      // update input fields to match saved settings
      document.getElementById("work-timer").value = s.work;
      document.getElementById("short-timer").value = s.shortBreak;
      document.getElementById("long-timer").value = s.longBreak;
      document.getElementById("reps").value = s.reps;

      // reset timer to saved work time
      timeLeft = setWorkTime;
      updateDisplay();
    }
  }

  // ------ Disable/Enable Setting while running/reset ------

  function disableSettings() {
    document.getElementById("work-timer").disabled = true;
    document.getElementById("short-timer").disabled = true;
    document.getElementById("long-timer").disabled = true;
    document.getElementById("reps").disabled = true;
  }

  function enableSettings() {
    document.getElementById("work-timer").disabled = false;
    document.getElementById("short-timer").disabled = false;
    document.getElementById("long-timer").disabled = false;
    document.getElementById("reps").disabled = false;
  }

  // ------ Main Timer Logic ------

  let timer;

  function startTimer() {
    if (timer) return; // if already running, exit
    disableSettings();
    timer = setInterval(updateTimer, 1000);
  }

  function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    let printedSeconds = seconds;

    if (seconds < 10) {
      printedSeconds = "0" + seconds.toString();
    }

    let timerDoc = document.getElementById("timer");
    timerDoc.textContent = `${minutes}:${printedSeconds}`;
  }

  function updateTimer() {
    if (timeLeft <= 0) {
      clearInterval(timer);
      enableSettings();
      return;
    }

    timeLeft--;
    updateDisplay();
  }

  // Buttons logic

  document.getElementById("start").addEventListener("click", startTimer);

  document.getElementById("pause").addEventListener("click", () => {
    clearInterval(timer);
    timer = null;
  });

  document.getElementById("reset").addEventListener("click", () => {
    clearInterval(timer);
    timer = null;
    timeLeft = setWorkTime;
    enableSettings();
    updateDisplay();
  });

  /* Color pickers */

  var colorInput = document.getElementById("favcolor");
  var colorButton = document.getElementById("color-button");
  var canvasInput = document.getElementById("favcolor-canvas");
  var canvasButton = document.getElementById("canvas-button");

  function updateMainColor() {
    colorButton.style.backgroundColor = colorInput.value;
  }

  function updateCanvasColor() {
    canvasButton.style.backgroundColor = canvasInput.value;
  }

  if (colorInput && colorButton) {
    colorInput.addEventListener("input", updateMainColor);
  }

  if (canvasInput && canvasButton) {
    canvasInput.addEventListener("input", updateCanvasColor);
  }

  /* Sound settings */

  var soundSelect = document.getElementById("alert-sound");
  var soundToggle = document.getElementById("enable-alert");
  var volumeSlider = document.getElementById("alert-volume");
  var volumeValue = document.getElementById("volume-value");

  function updateSoundControls() {
    var alertsEnabled = soundToggle.checked;
    soundSelect.disabled = !alertsEnabled;
    volumeSlider.disabled = !alertsEnabled;
  }

  function updateVolumeText() {
    volumeValue.textContent = volumeSlider.value + "%";
  }

  if (soundSelect && soundToggle && volumeSlider && volumeValue) {
    soundToggle.addEventListener("change", updateSoundControls);
    volumeSlider.addEventListener("input", updateVolumeText);

    updateSoundControls();
    updateVolumeText();
  }

  /* Settings section show/hide */

  var tabButtons = document.querySelectorAll(".settings-nav-btn");
  var sections = document.querySelectorAll(".settings-panel");

  function showSection(sectionId) {
    var i;

    for (i = 0; i < sections.length; i++) {
      if (sections[i].id === sectionId) {
        sections[i].classList.add("is-active");
      } else {
        sections[i].classList.remove("is-active");
      }
    }

    for (i = 0; i < tabButtons.length; i++) {
      if (tabButtons[i].getAttribute("data-target") === sectionId) {
        tabButtons[i].classList.add("is-active");
      } else {
        tabButtons[i].classList.remove("is-active");
      }
    }
  }

  function onTabClick(event) {
    var selectedSectionId = event.currentTarget.getAttribute("data-target");
    showSection(selectedSectionId);
  }

  if (tabButtons.length > 0 && sections.length > 0) {
    var j;

    for (j = 0; j < tabButtons.length; j++) {
      tabButtons[j].addEventListener("click", onTabClick);
    }
  }

  loadSettings();
});
