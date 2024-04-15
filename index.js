import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0";

// No need for local model since we will be using a resnet50 here from huggingface
env.allowLocalModels = false;

// all the references we will need to modify them throughout our code
const fileUpload = document.getElementById("file-upload");
const imageContainer = document.getElementById("image-container");
const status = document.getElementById("status");

// Loading the model, will be cached for the next useage
status.textContent = "Loading model...";
const detector = await pipeline("object-detection", "Xenova/detr-resnet-50");
status.textContent = "Ready";

// event listener for uploading a file and running our detection method on the saved element
fileUpload.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
  
    const reader = new FileReader();
  
    // Set up a callback when the file is loaded
    // this will create the imageContainer object which will be populated in renderBox
    reader.onload = function (e2) {
      imageContainer.innerHTML = "";
      const image = document.createElement("img");
      image.src = e2.target.result;
      imageContainer.appendChild(image);
      detect(image); // Uncomment this line to run the model
    };

    reader.readAsDataURL(file);
});

// detection method that feeds the model with the right parameters for it to work
async function detect(img) {
    status.textContent = "Analysing...";
    const output = await detector(img.src, {
      threshold: 0.5, // the confidence interval here to make a prediction
      percentage: true,
    });
    status.textContent = "";
    console.log("output", output);

    // render a cosmetic bounding box around the detected item
    output.forEach(renderBox);
}

// Render a bounding box and label on the image
function renderBox({ box, label }) {
    const { xmax, xmin, ymax, ymin } = box;
  
    // Generate a random color for the box
    const color = "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, 0);
  
    // Draw the box
    const boxElement = document.createElement("div");
    boxElement.className = "bounding-box";
    Object.assign(boxElement.style, {
      borderColor: color,
      left: 100 * xmin + "%",
      top: 100 * ymin + "%",
      width: 100 * (xmax - xmin) + "%",
      height: 100 * (ymax - ymin) + "%",
    });
  
    // Draw the label
    const labelElement = document.createElement("span");
    labelElement.textContent = label;
    labelElement.className = "bounding-box-label";
    labelElement.style.backgroundColor = color;
  
    boxElement.appendChild(labelElement);
    imageContainer.appendChild(boxElement);
}
