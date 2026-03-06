// =================================================
// ✅ Teachable Machine URL
// =================================================
const URL = "https://teachablemachine.withgoogle.com/models/rpcXnG0Zq/";

// =================================================
// ✔️ Variables
// =================================================
let model, webcam, labelContainer, maxPredictions;
const THRESHOLD = 0.9; // probability threshold to trigger flying text
let lastSpawnTime = 0; // timestamp of last flying text

// Map maxIndex to flying text message
const classEffects = {
  0: { text: "+" },
  1: { text: "friendly" },
  2: { text: "cool" },
  3: { text: "smart" }
};

// =================================================
// ✔️ Initialize the model and webcam
// =================================================
async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  webcam = new tmImage.Webcam(400, 400, true); // mirrored
  await webcam.setup();
  await webcam.play();

  document.getElementById("webcam-container").appendChild(webcam.canvas);

  labelContainer = $("#label-container");
  for (let i = 0; i < maxPredictions; i++) {
    labelContainer.append("<div></div>");
  }

  // Latest Issue Date
  const dateEl = document.getElementById("latestIssue");
  const now = new Date();
  const options = { month: "short", day: "2-digit", year: "numeric" };
  dateEl.textContent =
    "LATEST ISSUE • " + now.toLocaleDateString("en-US", options).toUpperCase();

  requestAnimationFrame(loop);
}

// =================================================
// ✔️ Main loop
// =================================================
async function loop() {
  webcam.update();
  await predict();
  requestAnimationFrame(loop);
}

// =================================================
// ✔️ Predict and trigger flying text (throttled)
// =================================================
async function predict() {
  const prediction = await model.predict(webcam.canvas);
  const probabilities = prediction.map(p => p.probability);
  const maxProb = Math.max(...probabilities);
  const maxIndex = probabilities.indexOf(maxProb);

  const now = Date.now();
  if (maxProb > THRESHOLD && now - lastSpawnTime > 500) { // ~2 bursts/sec
    const effect = classEffects[maxIndex];
    if (effect) {
      spawnText(effect.text);
    }
    lastSpawnTime = now;
  }

  // Optional: display prediction probabilities for debug
  $("#label-container").children().each((i, el) => {
    $(el).text(
      prediction[i].className + ": " + prediction[i].probability.toFixed(2)
    );
  });
}

// =================================================
// ✔️ Spawn flying text from webcam center
// =================================================
function spawnText(message) {
  const container = document.getElementById("flyingText");
  const el = document.createElement("div");
  el.className = "fly";
  el.innerText = message;

  const rect = webcam.canvas.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const offsetX = (Math.random() - 0.5) * rect.width * 0.5;
  const offsetY = (Math.random() - 0.5) * rect.height * 0.5;

  el.style.left = centerX + offsetX + "px";
  el.style.top = centerY + offsetY + "px";

  const scale = 0.8 + Math.random() * 0.8;
  const rotate = (Math.random() - 0.5) * 30;
  el.style.transform = `scale(${scale}) rotate(${rotate}deg)`;

  container.appendChild(el);

  setTimeout(() => el.remove(), 2000);
}

// =================================================
// ✔️ Initialize when page loads
// =================================================
$(document).ready(init);