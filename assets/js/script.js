const colorInput = document.getElementById("favcolor");
const colorButton = document.getElementById("color-button");

const canvasInput = document.getElementById("favcolor-canvas");
const canvasButton = document.getElementById("canvas-button");

colorInput.addEventListener("input", () => {
  colorButton.style.backgroundColor = colorInput.value;
});

canvasInput.addEventListener("input", () => {
  canvasButton.style.backgroundColor = canvasInput.value;
});
