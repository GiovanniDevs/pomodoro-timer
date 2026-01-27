/* 
Set the color of the visible button to the color picked via 
the invisible picker, for the main timer
 */

const colorInput = document.getElementById("favcolor");
const colorButton = document.getElementById("color-button");

colorInput.addEventListener("input", () => {
  colorButton.style.backgroundColor = colorInput.value;
});

/* 
Set the color of the visible button to the color picked via 
the invisible picker, for the canvas
 */

const canvasInput = document.getElementById("favcolor-canvas");
const canvasButton = document.getElementById("canvas-button");

canvasInput.addEventListener("input", () => {
  canvasButton.style.backgroundColor = canvasInput.value;
});
