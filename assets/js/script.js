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
