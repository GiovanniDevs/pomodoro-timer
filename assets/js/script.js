document.addEventListener("DOMContentLoaded", () => {
  // ============================================================
  // SECTION 1: Variables and Initial State
  // ============================================================

  /** @type {number} Focus session duration in seconds (default: 25 min) */
  let setWorkTime =
    (parseInt(document.getElementById("work-timer").value, 10) || 25) * 60;

  /** @type {number} Short break duration in seconds (default: 5 min) */
  let setShortBreak =
    (parseInt(document.getElementById("short-timer").value, 10) || 5) * 60;

  /** @type {number} Long break duration in seconds (default: 30 min) */
  let setLongBreak =
    (parseInt(document.getElementById("long-timer").value, 10) || 30) * 60;

  /** @type {number} Number of focus sessions before a long break (default: 4) */
  let setReps = parseInt(document.getElementById("reps").value, 10) || 4;

  /** @type {number|null} setInterval ID — null when stopped or paused */
  let timer = null;

  /** @type {number} Seconds remaining in the current countdown */
  let timeLeft = setWorkTime;

  /** @type {string} Active mode: "work", "short", or "long" */
  let currentMode = "work"; // "work" | "short" | "long"

  /** @type {number} Focus rounds completed in the current set */
  let completedWorkSessions = 0;

  /** @type {number} Full sets completed (focus × reps + long break) */
  let completedWorkSets = 0;

  // ============================================================
  // SECTION 2: Timer Setting Input Listeners
  // ============================================================
  // Each input is validated and clamped between 1–99.
  // If the timer is paused and the input matches the current mode,
  // the display updates immediately.
  // The blur event listener parses the set value back into the field past the input
  // listener validation and clamping

  document.getElementById("work-timer").addEventListener("input", (e) => {
    let val = parseInt(e.target.value, 10) || 1;
    val = Math.min(Math.max(val, 1), 99); // clamp 1-99
    setWorkTime = val * 60;
    saveSettings();
    if (!timer && currentMode === "work") {
      timeLeft = setWorkTime;
      updateDisplay();
    }
  });

  document.getElementById("work-timer").addEventListener("blur", (e) => {
    e.target.value = setWorkTime / 60;
  });

  document.getElementById("short-timer").addEventListener("input", (e) => {
    let val = parseInt(e.target.value, 10) || 1;
    val = Math.min(Math.max(val, 1), 99);
    setShortBreak = val * 60;
    saveSettings();
    if (!timer && currentMode === "short") {
      timeLeft = setShortBreak;
      updateDisplay();
    }
  });

  document.getElementById("short-timer").addEventListener("blur", (e) => {
    e.target.value = setShortBreak / 60;
  });

  document.getElementById("long-timer").addEventListener("input", (e) => {
    let val = parseInt(e.target.value, 10) || 1;
    val = Math.min(Math.max(val, 1), 99);
    setLongBreak = val * 60;

    saveSettings();
    if (!timer && currentMode === "long") {
      timeLeft = setLongBreak;
      updateDisplay();
    }
  });

  document.getElementById("long-timer").addEventListener("blur", (e) => {
    e.target.value = setLongBreak / 60;
  });

  document.getElementById("reps").addEventListener("input", (e) => {
    let val = parseInt(e.target.value, 10) || 1;
    val = Math.min(Math.max(val, 1), 99);
    setReps = val;
    saveSettings();
  });

  document.getElementById("reps").addEventListener("blur", (e) => {
    e.target.value = setReps;
  });

  // ============================================================
  // SECTION 3: Mode Button Indicators
  // ============================================================

  /**
   * Updates which pill button (Focus / Short Break / Long Break)
   * is visually highlighted based on the current mode.
   * Removes btn-active from all three, then adds it to the matching one.
   */
  function updateModeButtons() {
    const focusBtn = document.getElementById("focus-mode");
    const shortBtn = document.getElementById("short-mode");
    const longBtn = document.getElementById("long-mode");

    if (!focusBtn || !shortBtn || !longBtn) return;

    focusBtn.classList.remove("btn-active");
    shortBtn.classList.remove("btn-active");
    longBtn.classList.remove("btn-active");

    if (currentMode === "work") {
      focusBtn.classList.add("btn-active");
    } else if (currentMode === "short") {
      shortBtn.classList.add("btn-active");
    } else {
      longBtn.classList.add("btn-active");
    }
  }

  // ============================================================
  // SECTION 4: localStorage Persistence
  // ============================================================

  /**
   * Saves the current timer durations (converted back to minutes)
   * and reps count to localStorage under the key "pomodoroSettings".
   */
  function saveSettings() {
    const settings = {
      work: setWorkTime / 60, // store in minutes
      shortBreak: setShortBreak / 60,
      longBreak: setLongBreak / 60,
      reps: setReps,
    };
    localStorage.setItem("pomodoroSettings", JSON.stringify(settings));
  }

  /**
   * Loads saved timer settings from localStorage.
   * Parses JSON with try/catch, applies 1–99 clamping to each value,
   * updates state variables and DOM inputs, then refreshes the display.
   * Falls back to defaults if no data or corrupted JSON is found.
   */
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

    setWorkTime = Math.min(Math.max(parseInt(s.work, 10) || 25, 1), 99) * 60;
    setShortBreak =
      Math.min(Math.max(parseInt(s.shortBreak, 10) || 5, 1), 99) * 60;
    setLongBreak =
      Math.min(Math.max(parseInt(s.longBreak, 10) || 30, 1), 99) * 60;
    setReps = Math.min(Math.max(parseInt(s.reps, 10) || 4, 1), 99);

    document.getElementById("work-timer").value = setWorkTime / 60;
    document.getElementById("short-timer").value = setShortBreak / 60;
    document.getElementById("long-timer").value = setLongBreak / 60;
    document.getElementById("reps").value = setReps;

    timeLeft = getModeDuration(currentMode);
    updateModeButtons();
    updateDisplay();
  }

  /**
   * Saves sound preferences to localStorage under "pomodoroSoundSettings".
   * Stores the master toggle state, both sound selections, and both volumes.
   */
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

  /**
   * Loads saved sound preferences from localStorage.
   * Restores checkbox, dropdowns, and slider values with try/catch safety.
   * Uses nullish coalescing (??) for the checkbox to default to true.
   * Calls updateSoundControls() and updateVolumeText() to sync the UI.
   */
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

  // ============================================================
  // SECTION 5: Settings Lock
  // ============================================================

  /**
   * Disables all four timer/reps inputs.
   * Called when the timer starts to prevent changes mid-countdown.
   */
  function disableSettings() {
    document.getElementById("work-timer").disabled = true;
    document.getElementById("short-timer").disabled = true;
    document.getElementById("long-timer").disabled = true;
    document.getElementById("reps").disabled = true;
  }

  /**
   * Enables all four timer/reps inputs.
   * Called when the timer is paused, reset, or on a non-autostart mode switch.
   */
  function enableSettings() {
    document.getElementById("work-timer").disabled = false;
    document.getElementById("short-timer").disabled = false;
    document.getElementById("long-timer").disabled = false;
    document.getElementById("reps").disabled = false;
  }

  // ============================================================
  // SECTION 6: Mode Helpers
  // ============================================================

  /**
   * Returns the correct duration in seconds for a given mode string.
   * @param {string} mode - "work", "short", or "long"
   * @returns {number} Duration in seconds
   */
  function getModeDuration(mode) {
    if (mode === "work") return setWorkTime;
    if (mode === "short") return setShortBreak;
    return setLongBreak;
  }

  /**
   * Stops the running interval and resets the timer ID to null.
   */
  function stopTimer() {
    clearInterval(timer);
    timer = null;
  }

  /**
   * Switches to a new timer mode.
   * Stops any running countdown, updates state, refreshes the display,
   * and optionally auto-starts the new countdown.
   * @param {string} mode - The mode to switch to ("work", "short", or "long")
   * @param {boolean} [autoStart=false] - If true, starts the timer immediately
   */
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

  // ============================================================
  // SECTION 7: Core Timer Logic
  // ============================================================

  /**
   * Starts the countdown interval.
   * Guards against double intervals — returns immediately if already running.
   * Locks settings inputs while the timer is active.
   */
  function startTimer() {
    if (timer) return; // if already running, exit
    disableSettings();

    timer = setInterval(updateTimer, 1000);
  }

  /**
   * Refreshes the on-screen timer display (MM:SS) and the
   * session/set counters. Zero-pads seconds below 10.
   */
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
    scaleTimer();
  }

  /**
   * Called every second by the interval.
   * Decrements timeLeft and refreshes the display.
   * Triggers handleTimerCompletion() when the countdown reaches zero.
   */
  function updateTimer() {
    if (timeLeft <= 0) {
      handleTimerCompletion();
      return;
    }

    timeLeft -= 1;
    updateDisplay();

    if (timeLeft <= 0) {
      handleTimerCompletion();
    }
  }

  /**
   * The automatic Pomodoro progression engine.
   * Determines what happens when a timer reaches zero:
   * - After a focus session: short break (or long break if reps reached)
   * - After a short break: back to focus
   * - After a long break: back to focus
   * Plays the appropriate alarm sound and auto-starts the next mode.
   */
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

  // ============================================================
  // SECTION 8: Button Event Listeners
  // ============================================================
  // Start/Pause toggle visibility using the CSS class "invis".

  const startBtn = document.getElementById("start");
  const pauseBtn = document.getElementById("pause");

  /** Start button — begins countdown, hides Start, shows Pause */
  startBtn.addEventListener("click", () => {
    startTimer();
    startBtn.classList.add("invis");
    pauseBtn.classList.remove("invis");
  });

  /** Pause button — stops countdown, enables settings, shows Start, hides Pause */
  pauseBtn.addEventListener("click", () => {
    stopTimer();
    enableSettings();

    startBtn.classList.remove("invis");
    pauseBtn.classList.add("invis");
  });

  /** Reset button — stops timer, resets all counters and mode to defaults */
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

  // ============================================================
  // SECTION 9: Colour Pickers
  // ============================================================

  /** @type {HTMLInputElement} Colour input for the timer area */
  var colorInput = document.getElementById("favcolor");
  /** @type {HTMLElement} Small round preview chip for timer area colour */
  var colorButton = document.getElementById("color-button");
  /** @type {HTMLInputElement} Colour input for the page background */
  var canvasInput = document.getElementById("favcolor-canvas");
  /** @type {HTMLElement} Small round preview chip for canvas colour */
  var canvasButton = document.getElementById("canvas-button");

  /** @type {HTMLElement} The main timer area container */
  var timerAreaBox = document.getElementById("timer-area");
  /** @type {HTMLElement} The page body element */
  var pageBody = document.body;

  /**
   * Reads the timer area colour input, applies it to the preview chip
   * and the timer area background, and saves to localStorage.
   */
  function updateMainColor() {
    var selectedColor = colorInput.value;

    colorButton.style.backgroundColor = selectedColor; // small preview chip
    timerAreaBox.style.backgroundColor = selectedColor; // timer-area background
    localStorage.setItem("mainTimerAreaColor", selectedColor);
  }

  /**
   * Reads the canvas colour input, applies it to the preview chip
   * and the page body background, and saves to localStorage.
   */
  function updateCanvasColor() {
    var selectedColor = canvasInput.value;

    canvasButton.style.backgroundColor = selectedColor; // small preview chip
    pageBody.style.backgroundColor = selectedColor; // body background
    localStorage.setItem("mainCanvasColor", selectedColor);
  }

  // Attach colour input event listeners
  if (colorInput && colorButton) {
    colorInput.addEventListener("input", updateMainColor);
  }

  if (canvasInput && canvasButton) {
    canvasInput.addEventListener("input", updateCanvasColor);
  }

  // Load saved colour values from localStorage
  var savedTimerAreaColor = localStorage.getItem("mainTimerAreaColor");
  if (savedTimerAreaColor && colorInput) {
    colorInput.value = savedTimerAreaColor;
  }

  var savedCanvasColor = localStorage.getItem("mainCanvasColor");
  if (savedCanvasColor && canvasInput) {
    canvasInput.value = savedCanvasColor;
  }

  // Apply colours once at startup
  if (colorInput && colorButton && timerAreaBox) {
    updateMainColor();
  }

  if (canvasInput && canvasButton && pageBody) {
    updateCanvasColor();
  }

  // ============================================================
  // SECTION 10: Sound Settings
  // ============================================================

  /** @type {HTMLSelectElement} Dropdown for session/lap alert sound */
  var soundSelect = document.getElementById("alert-sound");
  /** @type {HTMLInputElement} Master toggle checkbox for all alerts */
  var soundToggle = document.getElementById("enable-alert");
  /** @type {HTMLInputElement} Volume slider for session/lap alert */
  var volumeSlider = document.getElementById("alert-volume");
  /** @type {HTMLElement} Percentage label for session/lap volume */
  var volumeValue = document.getElementById("volume-value");

  /** @type {HTMLSelectElement} Dropdown for set completion alert sound */
  var soundSelect2 = document.getElementById("alert-sound2");
  /** @type {HTMLInputElement} Volume slider for set completion alert */
  var volumeSlider2 = document.getElementById("alert-volume2");
  /** @type {HTMLElement} Percentage label for set completion volume */
  var volumeValue2 = document.getElementById("volume-value2");

  /**
   * Enables or disables the sound dropdowns and volume sliders
   * based on whether the master toggle checkbox is checked.
   */
  function updateSoundControls() {
    var alertsEnabled = soundToggle.checked;
    soundSelect.disabled = !alertsEnabled;
    volumeSlider.disabled = !alertsEnabled;
    soundSelect2.disabled = !alertsEnabled;
    volumeSlider2.disabled = !alertsEnabled;
  }

  /**
   * Updates the percentage text labels next to both volume sliders
   * to reflect their current value (e.g. "70%").
   */
  function updateVolumeText() {
    volumeValue.textContent = volumeSlider.value + "%";
    volumeValue2.textContent = volumeSlider2.value + "%";
  }

  // Attach sound setting event listeners (with safety check)
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
      applyVolumes();
    });

    volumeSlider2.addEventListener("input", () => {
      updateVolumeText();
      saveSoundSettings();
      applyVolumes();
    });

    updateSoundControls();
    updateVolumeText();
  }

  // ============================================================
  // SECTION 11: Alarm System
  // ============================================================

  /** @type {HTMLAudioElement} Chime alert sound */
  let chime = new Audio("assets/sounds/chime.mp3");
  /** @type {HTMLAudioElement} Gong alert sound */
  let gong = new Audio("assets/sounds/gong.mp3");
  /** @type {HTMLAudioElement} Beep alert sound */
  let beep = new Audio("assets/sounds/beep.mp3");
  /** @type {HTMLAudioElement} Smooth alert sound */
  let smooth = new Audio("assets/sounds/smooth.mp3");
  /** @type {HTMLAudioElement} Bell alert sound */
  let bell = new Audio("assets/sounds/bell.mp3");

  /** @type {HTMLAudioElement} The sound queued to play next */
  let qAlarm = chime;
  /** @type {HTMLAudioElement} Audio object for session/lap alerts */
  let soundSession = chime;
  /** @type {HTMLAudioElement} Audio object for set completion alerts */
  let soundSet = chime;

  /**
   * Plays the currently queued alarm sound.
   * Resets playback to the start so it works even if still playing.
   * Only plays if the master sound toggle is enabled.
   */
  function playAlarm() {
    qAlarm.currentTime = 0;
    if (soundToggle.checked) {
      qAlarm.play();
    }
  }

  // Sound selection dropdown listeners
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

  /**
   * Reads both sound selection dropdowns and maps their values
   * to the correct Audio objects using switch statements.
   * Updates soundSession and soundSet accordingly.
   */
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

  /**
   * Reads both volume sliders and sets the .volume property (0–1 scale)
   * on the corresponding Audio objects.
   */
  function applyVolumes() {
    // session sounds
    soundSession.volume = volumeSlider.value / 100;

    // set sounds
    soundSet.volume = volumeSlider2.value / 100;
  }

  // ============================================================
  // SECTION 12: Settings Tab Navigation
  // ============================================================

  /** @type {NodeList} All settings navigation buttons */
  var tabButtons = document.querySelectorAll(".settings-nav-btn");
  /** @type {NodeList} All settings panels */
  var sections = document.querySelectorAll(".settings-panel");

  /**
   * Shows the panel matching the given section ID and hides all others.
   * Also toggles the is-active class on the corresponding nav button.
   * @param {string} sectionId - The ID of the panel to show
   */
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

  /**
   * Click handler for tab buttons.
   * Reads the data-target attribute and calls showSection().
   * @param {Event} event - The click event
   */
  function onTabClick(event) {
    var selectedSectionId = event.currentTarget.getAttribute("data-target");
    showSection(selectedSectionId);
  }

  // Attach click listeners to all tab buttons
  if (tabButtons.length > 0 && sections.length > 0) {
    var j;

    for (j = 0; j < tabButtons.length; j++) {
      tabButtons[j].addEventListener("click", onTabClick);
    }
  }

  // ============================================================
  // SECTION 13: Font Settings
  // ============================================================

  /** @type {HTMLSelectElement} Font family dropdown */
  var fontSelect = document.getElementById("font-select");
  /** @type {HTMLElement} The timer area element to apply fonts to */
  var timerArea = document.getElementById("timer-area");

  /**
   * Applies a font family to the timer area based on the given font name.
   * Uses if/else if to map short names to full CSS font-family strings.
   * @param {string} fontName - The font identifier (e.g. "poiret", "bitcount", "noto", "zain")
   */
  function setMainFont(fontName) {
    if (fontName === "poiret") {
      timerArea.style.fontFamily = '"Poiret One", sans-serif';
    } else if (fontName === "bitcount") {
      timerArea.style.fontFamily = '"Bitcount Single", system-ui';
    } else if (fontName === "noto") {
      timerArea.style.fontFamily = '"Noto Serif", serif';
    } else if (fontName === "zain") {
      timerArea.style.fontFamily = '"Zain", sans-serif';
    } else {
      // default
      timerArea.style.fontFamily = '"Work Sans", sans-serif';
    }
  }

  fontSelect.addEventListener("change", function () {
    var selectedFont = fontSelect.value;
    setMainFont(selectedFont);
    localStorage.setItem("mainTimerFont", selectedFont);
  });

  // Load saved font at startup
  var savedFont = localStorage.getItem("mainTimerFont");

  if (savedFont) {
    fontSelect.value = savedFont;
    setMainFont(savedFont);
  } else {
    setMainFont(fontSelect.value);
  }

  // ============================================================
  // SECTION 14: Border Style Settings and timer scale
  // ============================================================

  /** @type {HTMLSelectElement} Border style dropdown */
  var borderSelect = document.getElementById("border-select");

  /**
   * Sets the CSS border-style on the timer area element.
   * @param {string} styleName - A valid CSS border-style value (e.g. "solid", "double", "none")
   */
  function setTimerAreaBorderStyle(styleName) {
    timerArea.style.borderStyle = styleName;
  }

  borderSelect.addEventListener("change", function () {
    var selectedStyle = borderSelect.value;
    setTimerAreaBorderStyle(selectedStyle);
    localStorage.setItem("mainTimerBorderStyle", selectedStyle);
  });

  // Load saved border style at startup
  var savedBorderStyle = localStorage.getItem("mainTimerBorderStyle");

  if (savedBorderStyle && borderSelect) {
    borderSelect.value = savedBorderStyle;
    setTimerAreaBorderStyle(savedBorderStyle);
  } else if (borderSelect) {
    setTimerAreaBorderStyle(borderSelect.value);
  }

  // Scales timer to fit the DIV
  
  function scaleTimer() {
    const container = document.querySelector(".col-6");
    const text = document.getElementById("timer");

    let size = 10;
    text.style.fontSize = size + "px";

    while (text.scrollWidth <= container.clientWidth) {
      size++;
      text.style.fontSize = size + "px";
    }

    // step back one size so it never overflows
    text.style.fontSize = size - 1 + "px";
  }

  window.addEventListener("load", scaleTimer);
  window.addEventListener("resize", scaleTimer);

  // ============================================================
  // SECTION 15: Initialisation Sequence
  // ============================================================
  // These five calls boot the app in the correct order.

  updateModeButtons(); // Highlight the correct mode pill (Focus)
  loadSettings(); // Restore saved timer durations from localStorage
  loadSoundSettings(); // Restore saved sound preferences
  applySoundSelection(); // Map dropdown values to Audio objects
  applyVolumes(); // Set volume levels on Audio objects
});
