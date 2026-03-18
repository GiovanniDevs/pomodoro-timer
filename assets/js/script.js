document.addEventListener("DOMContentLoaded", () => {
  // Variables
  // setting variables
  let setWorkTime =
    (parseInt(document.getElementById("work-timer").value, 10) || 25) * 60;
  let setShortBreak =
    (parseInt(document.getElementById("short-timer").value, 10) || 5) * 60;
  let setLongBreak =
    (parseInt(document.getElementById("long-timer").value, 10) || 30) * 60;
  let setReps = parseInt(document.getElementById("reps").value, 10) || 4;

  // timer state
  let timer = null;
  let timeLeft = setWorkTime;
  let currentMode = "work"; // "work" | "short" | "long"
  let completedWorkSessions = 0;
  let completedWorkSets = 0;

  //  Event listeners to update timers from settings

  document.getElementById("work-timer").addEventListener("input", (e) => {
    setWorkTime = (parseInt(e.target.value, 10) || 0) * 60;
    saveSettings();
    if (!timer && currentMode === "work") {
      timeLeft = setWorkTime;
      updateDisplay();
    }
  });

  document.getElementById("short-timer").addEventListener("input", (e) => {
    setShortBreak = (parseInt(e.target.value, 10) || 0) * 60;
    saveSettings();
    if (!timer && currentMode === "short") {
      timeLeft = setShortBreak;
      updateDisplay();
    }
  });

  document.getElementById("long-timer").addEventListener("input", (e) => {
    setLongBreak = (parseInt(e.target.value, 10) || 0) * 60;
    saveSettings();
    if (!timer && currentMode === "long") {
      timeLeft = setLongBreak;
      updateDisplay();
    }
  });

  document.getElementById("reps").addEventListener("input", (e) => {
    setReps = Math.max(1, parseInt(e.target.value, 10) || 1);
    saveSettings();
  });

  // ----- update buttons active/inactive

  function updateModeButtons() {
    const focusBtn = document.getElementById("focus-mode");
    const shortBtn = document.getElementById("short-mode");
    const longBtn = document.getElementById("long-mode");

    if (!focusBtn || !shortBtn || !longBtn) return;

    focusBtn.classList.remove("btn-active");
    focusBtn.classList.add("btn-default");
    shortBtn.classList.remove("btn-active");
    shortBtn.classList.add("btn-default");
    longBtn.classList.remove("btn-active");
    longBtn.classList.add("btn-default");

    if (currentMode === "work") {
      focusBtn.classList.add("btn-active");
      focusBtn.classList.remove("btn-default");
    } else if (currentMode === "short") {
      shortBtn.classList.add("btn-active");
      shortBtn.classList.remove("btn-default");
    } else {
      longBtn.classList.add("btn-active");
      longBtn.classList.remove("btn-default");
    }
  }

  // ------ Local Storage ------

  function saveSoundSettings() {
    const soundSettings = {
      alertsEnabled: soundToggle.checked,
      sessionSound: soundSelect.value,
      setSound: soundSelect2.value,
      volume1: volumeSlider.value,
      volume2: volumeSlider2.value,
    };

    localStorage.setItem(
      "pomodoroSoundSettings",
      JSON.stringify(soundSettings),
    );
  }

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
    if (!saved) {
      timeLeft = setWorkTime;
      updateModeButtons();
      updateDisplay();
      return;
    }

    let s;

    try {
      s = JSON.parse(saved);
    } catch (error) {
      console.warn("Invalid JSON in localStorage, resetting settings");

      localStorage.removeItem("pomodoroSettings");

      timeLeft = setWorkTime;
      updateModeButtons();
      updateDisplay();
      return;
    }

    setWorkTime = (parseInt(s.work, 10) || 25) * 60;
    setShortBreak = (parseInt(s.shortBreak, 10) || 5) * 60;
    setLongBreak = (parseInt(s.longBreak, 10) || 30) * 60;
    setReps = Math.max(1, parseInt(s.reps, 10) || 4);

    document.getElementById("work-timer").value = setWorkTime / 60;
    document.getElementById("short-timer").value = setShortBreak / 60;
    document.getElementById("long-timer").value = setLongBreak / 60;
    document.getElementById("reps").value = setReps;

    timeLeft = getModeDuration(currentMode);
    updateModeButtons();
    updateDisplay();
  }

  function loadSoundSettings() {
    const saved = localStorage.getItem("pomodoroSoundSettings");
    if (!saved) return;

    let s;

    try {
      s = JSON.parse(saved);
    } catch {
      localStorage.removeItem("pomodoroSoundSettings");
      return;
    }

    soundToggle.checked = s.alertsEnabled ?? true;
    soundSelect.value = s.sessionSound || "chime";
    soundSelect2.value = s.setSound || "chime";
    volumeSlider.value = s.volume1 || 100;
    volumeSlider2.value = s.volume2 || 100;

    updateSoundControls();
    updateVolumeText();
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

  // Mode helper functions

  function getModeDuration(mode) {
    if (mode === "work") return setWorkTime;
    if (mode === "short") return setShortBreak;
    return setLongBreak;
  }

  function stopTimer() {
    clearInterval(timer);
    timer = null;
  }

  function setMode(mode, autoStart = false) {
    stopTimer();
    currentMode = mode;
    timeLeft = getModeDuration(mode);
    updateModeButtons();
    updateDisplay();

    if (autoStart) {
      startTimer();
    } else {
      enableSettings();
    }
  }

  // ------ Main Timer Logic ------

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

    let sessions = document.getElementById("done-sessions");
    let sets = document.getElementById("done-sets");

    sessions.textContent = `${completedWorkSessions}`;
    sets.textContent = `${completedWorkSets}`;
  }

  function updateTimer() {
    if (timeLeft <= 0) {
      handleTimerCompletion();
      return;
    }

    timeLeft -= 20;
    updateDisplay();

    if (timeLeft <= 0) {
      handleTimerCompletion();
    }
  }

  function handleTimerCompletion() {
    stopTimer();

    if (currentMode === "work") {
      completedWorkSessions += 1;

      if (completedWorkSessions >= setReps) {
        completedWorkSessions = 0;
        completedWorkSets += 1;
        qAlarm = soundSet;
        playAlarm();
        setMode("long", true);
      } else {
        qAlarm = soundSession;
        playAlarm();
        setMode("short", true);
      }
      return;
    }

    if (currentMode === "short") {
      qAlarm = soundSession;
      playAlarm();
    } else if (currentMode === "long") {
      qAlarm = soundSet;
      playAlarm();
    }

    setMode("work", true);
  }

  // Run Short Break

  // Buttons logic
  const startBtn = document.getElementById("start");
  const pauseBtn = document.getElementById("pause");

  startBtn.addEventListener("click", () => {
    startTimer();
    startBtn.classList.add("invis");
    pauseBtn.classList.remove("invis");
  });

  pauseBtn.addEventListener("click", () => {
    stopTimer();
    enableSettings();

    startBtn.classList.remove("invis");
    pauseBtn.classList.add("invis");
  });

  document.getElementById("reset").addEventListener("click", () => {
    stopTimer();
    completedWorkSessions = 0;
    completedWorkSets = 0;
    currentMode = "work";
    timeLeft = setWorkTime;
    updateModeButtons();
    enableSettings();
    updateDisplay();
    startBtn.classList.remove("invis");
    pauseBtn.classList.add("invis");
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

  /* Sound settings for lap */

  var soundSelect = document.getElementById("alert-sound");
  var soundToggle = document.getElementById("enable-alert");
  var volumeSlider = document.getElementById("alert-volume");
  var volumeValue = document.getElementById("volume-value");

  var soundSelect2 = document.getElementById("alert-sound2");
  var volumeSlider2 = document.getElementById("alert-volume2");
  var volumeValue2 = document.getElementById("volume-value2");

  function updateSoundControls() {
    var alertsEnabled = soundToggle.checked;
    soundSelect.disabled = !alertsEnabled;
    volumeSlider.disabled = !alertsEnabled;
    soundSelect2.disabled = !alertsEnabled;
    volumeSlider2.disabled = !alertsEnabled;
  }

  function updateVolumeText() {
    volumeValue.textContent = volumeSlider.value + "%";
    volumeValue2.textContent = volumeSlider2.value + "%";
  }

  if (
    soundSelect &&
    soundToggle &&
    volumeSlider &&
    volumeValue &&
    soundSelect2 &&
    volumeSlider2 &&
    volumeValue2
  ) {
    soundToggle.addEventListener("change", () => {
      updateSoundControls();
      saveSoundSettings();
    });
    volumeSlider.addEventListener("input", () => {
      updateVolumeText();
      saveSoundSettings();
    });

    volumeSlider2.addEventListener("input", () => {
      updateVolumeText();
      saveSoundSettings();
    });

    updateSoundControls();
    updateVolumeText();
  }

  /* alarm settings */

  let chime = new Audio("assets/sounds/chime.mp3");
  let gong = new Audio("assets/sounds/gong.mp3");
  let beep = new Audio("assets/sounds/beep.mp3");
  let smooth = new Audio("assets/sounds/smooth.mp3");
  let bell = new Audio("assets/sounds/bell.mp3");
  let qAlarm = chime;

  let soundSession = chime;
  let soundSet = chime;

  function playAlarm() {
    qAlarm.currentTime = 0;
    qAlarm.play();
  }

  let sessionSelector = document.getElementById("alert-sound");
  let setSelector = document.getElementById("alert-sound2");

  sessionSelector.addEventListener("change", () => {
    sessionAlarm = sessionSelector.value;
    applySoundSelection();
    saveSoundSettings();
  });

  setSelector.addEventListener("change", () => {
    setAlarm = setSelector.value;
    applySoundSelection();
    saveSoundSettings();
  });

  function applySoundSelection() {
    // Session sound
    switch (soundSelect.value) {
      case "gong":
        soundSession = gong;
        break;
      case "chime":
        soundSession = chime;
        break;
      case "beep":
        soundSession = beep;
        break;
      case "smooth":
        soundSession = smooth;
        break;
      case "bell":
        soundSession = bell;
        break;
      default:
        soundSession = chime;
    }

    // Set sound
    switch (soundSelect2.value) {
      case "gong":
        soundSet = gong;
        break;
      case "chime":
        soundSet = chime;
        break;
      case "beep":
        soundSet = beep;
        break;
      case "smooth":
        soundSet = smooth;
        break;
      case "bell":
        soundSet = bell;
        break;
      default:
        soundSet = chime;
    }
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
  updateModeButtons();
  loadSettings();
  loadSoundSettings();
  applySoundSelection();
});
