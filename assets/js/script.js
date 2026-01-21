const colorInput = document.getElementById("favcolor");
const colorButton = document.querySelector(".color-button");

colorInput.addEventListener("input", () => {
  colorButton.style.backgroundColor = colorInput.value;
});
