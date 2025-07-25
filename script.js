// --- Global/App-wide DOM Element References ---
// These are accessed by multiple modules, so they are declared here once.
const projectileModeCheckbox = document.getElementById("projectile-mode");
const projectileInputsContainer = document.getElementById(
  "projectile-inputs-container"
);
const constantVelocityCheckbox = document.getElementById("constant-velocity");
const initialVelocityInput = document.getElementById("initial-velocity");
const finalVelocityInput = document.getElementById("final-velocity");
const accelerationInput = document.getElementById("acceleration");
const timeInput = document.getElementById("time");
const displacementInput = document.getElementById("displacement");
const initialHeightInput = document.getElementById("initial-height");
const launchAngleInput = document.getElementById("launch-angle");
const calculateButton = document.getElementById("calculate-btn");
const startButton = document.getElementById("start-btn");
const resetButton = document.getElementById("reset-btn");
const errorMessageDiv = document.getElementById("error-message");

const accelerationLabel = document.getElementById("acceleration-label");
const constantVelocityControlRow = document.getElementById(
  "constant-velocity-control-row"
);
const resultsGrid = document.getElementById("results-grid");
const solution2Container = document.getElementById("solution2-container");
const displacementLabel = document.querySelector('label[for="displacement"]');

// Output spans for Solution 1 (used by both kinematic and projectile)
const solution1V0 = document.getElementById("output-v0-1");
const solution1Vf = document.getElementById("output-vf-1");
const solution1A = document.getElementById("output-a-1");
const solution1T = document.getElementById("output-t-1");
const solution1D = document.getElementById("output-d-1");
const solution1H = document.getElementById("output-h-1");
const solution1HRow = document.getElementById("output-h-1-row");
const solution1Angle = document.getElementById("output-angle-1");
const solution1AngleRow = document.getElementById("output-angle-1-row");

// Output spans for Solution 2 (currently hidden, but kept for consistency)
const solution2V0 = document.getElementById("output-v0-2");
const solution2Vf = document.getElementById("output-vf-2");
const solution2A = document.getElementById("output-a-2");
const solution2T = document.getElementById("output-t-2");
const solution2D = document.getElementById("output-d-2");
const solution2H = document.getElementById("output-h-2");
const solution2HRow = document.getElementById("output-h-2-row");
const solution2Angle = document.getElementById("output-angle-2");
const solution2AngleRow = document.getElementById("output-angle-2-row");

const allInputElements = [
  initialVelocityInput,
  finalVelocityInput,
  accelerationInput,
  timeInput,
  displacementInput,
  initialHeightInput,
  launchAngleInput,
];

// --- Canvas and Animation State ---
const canvas = document.getElementById("simulation-canvas");
const ctx = canvas.getContext("2d");
const objectRadius = 5;

let animationFrameId = { current: null }; // Use an object to pass by reference
let simulationStartTime = { current: null }; // Use an object to pass by reference

// Helper to set simulation start time from within simulateKinematic (from kinematics.js)
const setSimulationStartTime = (time) => {
  simulationStartTime.current = time;
};

// Projectile-specific state variables
let currentScale = 10;
let animationTimeScale = 1;
let finalRange = 0;
let finalTimeOfFlight = 0;

// --- Core Canvas Drawing Functions ---

/**
 * Clears the canvas, removing any drawn objects or axes.
 */
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Draws X and Y axes on the canvas for projectile motion visualization.
 * Includes labels and tick marks based on the calculated range and height.
 */
function drawAxes() {
  ctx.save();

  ctx.strokeStyle = "#888";
  ctx.lineWidth = 1;
  ctx.font = "10px Arial";
  ctx.fillStyle = "#333";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  // Draw X-axis
  ctx.beginPath();
  ctx.moveTo(0, canvas.height);
  ctx.lineTo(canvas.width, canvas.height);
  ctx.stroke();

  // Draw Y-axis
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, canvas.height);
  ctx.stroke();

  // X-axis labels and ticks
  let xStep = 10;
  if (finalRange > 500) xStep = 100;
  else if (finalRange > 100) xStep = 50;
  else if (finalRange > 50) xStep = 20;
  else if (finalRange > 20) xStep = 10;
  else if (finalRange > 5) xStep = 5;
  else xStep = 1;

  for (let xMeters = 0; xMeters <= finalRange * 1.1 + xStep; xMeters += xStep) {
    const drawX = xMeters * currentScale;
    if (drawX > canvas.width) break;

    ctx.beginPath();
    ctx.moveTo(drawX, canvas.height);
    ctx.lineTo(drawX, canvas.height - 5);
    ctx.stroke();
    ctx.fillText(xMeters.toFixed(0), drawX, canvas.height - 8);
  }
  ctx.fillText("Horizontal Distance (m)", canvas.width / 2, canvas.height - 25);

  // Y-axis labels and ticks
  let yStep = 10;
  let maxDisplayedHeight = canvas.height / currentScale;
  if (maxDisplayedHeight > 500) yStep = 100;
  else if (maxDisplayedHeight > 100) yStep = 50;
  else if (maxDisplayedHeight > 50) yStep = 20;
  else if (maxDisplayedHeight > 20) yStep = 10;
  else if (maxDisplayedHeight > 5) yStep = 5;
  else yStep = 1;

  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (
    let yMeters = 0;
    yMeters <= maxDisplayedHeight * 1.1 + yStep;
    yMeters += yStep
  ) {
    const drawY = canvas.height - yMeters * currentScale;
    if (drawY < 0) break;

    ctx.beginPath();
    ctx.moveTo(0, drawY);
    ctx.lineTo(5, drawY);
    ctx.stroke();
    ctx.fillText(yMeters.toFixed(0), 8, drawY);
  }
  ctx.save();
  ctx.translate(25, canvas.height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.fillText("Vertical Height (m)", 0, 0);
  ctx.restore();

  ctx.restore();
}

/**
 * Draws the simulated object (a circle) on the canvas at the given coordinates.
 * Adjusts Y-coordinate for canvas drawing (origin at top-left).
 * @param {number} x - The x-coordinate of the object in meters.
 * @param {number} y - The y-coordinate of the object in meters.
 */
function drawObject(x, y) {
  clearCanvas();
  if (projectileModeCheckbox.checked) {
    drawAxes();
  }

  const drawX = x * currentScale;
  let drawY;

  if (projectileModeCheckbox.checked) {
    drawY = canvas.height - y * currentScale; // Invert Y for canvas coordinates
  } else {
    drawY = canvas.height / 2; // Keep object in the middle for kinematic
  }

  ctx.beginPath();
  ctx.arc(drawX, drawY, objectRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#FF5733"; // Orange-red color
  ctx.fill();
  ctx.closePath();
}

/**
 * Clears all output fields in the solution panels and hides projectile-specific rows.
 */
function clearOutputFields() {
  const outputSpans = document.querySelectorAll(
    '#results-grid span[id^="output-"]'
  );
  outputSpans.forEach((span) => (span.textContent = "-"));
  solution1HRow.classList.add("hidden");
  solution1AngleRow.classList.add("hidden");
  solution2HRow.classList.add("hidden");
  solution2AngleRow.classList.add("hidden");
  errorMessageDiv.classList.add("hidden");
}

// --- Projectile Motion Logic (remains in script.js) ---

/**
 * Displays the calculated projectile motion results in the solution panel.
 * @param {number} v0 - Initial velocity.
 * @param {number} vf - Final velocity.
 * @param {number} a - Effective acceleration (gravity).
 * @param {number} t - Time of flight.
 * @param {number} d - Horizontal range.
 * @param {number} h0 - Initial height.
 * @param {number} angle - Launch angle in degrees.
 */
function displayProjectileResults(v0, vf, a, t, d, h0, angle) {
  solution1A.textContent = a !== null && !isNaN(a) ? a.toFixed(2) : "-";
  solution1H.textContent = h0 !== null && !isNaN(h0) ? h0.toFixed(2) : "-";
  solution1Angle.textContent =
    angle !== null && !isNaN(angle) ? angle.toFixed(2) : "-";
  solution1V0.textContent = v0 !== null && !isNaN(v0) ? v0.toFixed(2) : "-";
  solution1Vf.textContent = vf !== null && !isNaN(vf) ? vf.toFixed(2) : "-";
  solution1T.textContent = t !== null && !isNaN(t) ? t.toFixed(2) : "-";
  solution1D.textContent = d !== null && !isNaN(d) ? d.toFixed(2) : "-";

  // Show projectile-specific rows
  solution1HRow.classList.remove("hidden");
  solution1AngleRow.classList.remove("hidden");

  solution2Container.style.display = "none"; // Ensure second solution panel is hidden
  // Clear second solution panel outputs just in case
  solution2V0.textContent = "-";
  solution2Vf.textContent = "-";
  solution2A.textContent = "-";
  solution2T.textContent = "-";
  solution2D.textContent = "-";
  solution2H.textContent = "-";
  solution2Angle.textContent = "-";
}

/**
 * Handles the calculation of projectile motion parameters based on user inputs.
 */
function handleProjectileCalculation() {
  const v0 = parseFloat(initialVelocityInput.value);
  const g_magnitude = parseFloat(accelerationInput.value); // Gravity
  const h0 = parseFloat(initialHeightInput.value);
  const angleDeg = parseFloat(launchAngleInput.value);

  // Input validation for projectile mode
  if (
    isNaN(v0) ||
    isNaN(g_magnitude) ||
    isNaN(h0) ||
    isNaN(angleDeg) ||
    v0 < 0 ||
    g_magnitude <= 0 ||
    h0 < 0 ||
    angleDeg < 0 ||
    angleDeg > 90
  ) {
    errorMessageDiv.textContent =
      "Please enter valid positive numbers for Initial Velocity, Gravity, Initial Height, and a Launch Angle between 0-90 degrees.";
    errorMessageDiv.classList.remove("hidden");
    clearOutputFields();
    return;
  } else {
    errorMessageDiv.classList.add("hidden");
  }

  const g_effective = -g_magnitude; // Gravity acts downwards

  const angleRad = (angleDeg * Math.PI) / 180;

  const v0x = v0 * Math.cos(angleRad);
  const v0y = v0 * Math.sin(angleRad);

  // Calculate time of flight using quadratic formula for vertical motion
  // d = v0y*t + 0.5*g*t^2 => 0.5*g*t^2 + v0y*t - h0 = 0
  const roots = quadraticRoots(0.5 * g_effective, v0y, h0); // quadraticRoots is globally available from kinematics.js

  const flightTimes = roots.filter((time) => time > 0); // Only positive time is valid

  if (flightTimes.length === 0) {
    errorMessageDiv.textContent =
      "No valid flight time found for given parameters. Projectile might not hit the ground or inputs are invalid.";
    errorMessageDiv.classList.remove("hidden");
    clearOutputFields();
    return;
  }

  const t_flight = flightTimes[0]; // Take the first valid positive time

  const range = v0x * t_flight; // Horizontal distance

  finalRange = range;
  finalTimeOfFlight = t_flight;

  const vf_y = v0y + g_effective * t_flight; // Final vertical velocity
  const vf = Math.sqrt(vf_y * vf_y + v0x * v0x); // Final total velocity

  // Calculate maximum height for scaling the canvas
  let max_y_value;
  if (v0y > 0) {
    const time_to_peak_from_launch = v0y / g_magnitude;
    const peak_height_above_launch =
      v0y * time_to_peak_from_launch -
      0.5 * g_magnitude * time_to_peak_from_launch * time_to_peak_from_launch;
    max_y_value = h0 + peak_height_above_launch;
  } else {
    max_y_value = h0; // If initial vertical velocity is zero or negative, max height is initial height
  }

  max_y_value = Math.max(0.1, max_y_value); // Ensure a minimum height for scaling

  const paddingFactor = 1.1; // Add some padding to the view
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  // Determine scale based on required width and height
  const requiredScaleX = canvasWidth / (range * paddingFactor);
  const requiredScaleY = canvasHeight / (max_y_value * paddingFactor);

  currentScale = Math.min(requiredScaleX, requiredScaleY); // Use the smaller scale to fit both dimensions
  currentScale = Math.max(1, Math.min(100, currentScale)); // Clamp scale to reasonable values

  // Adjust animation speed based on total flight time
  const targetSimulationDuration = 4; // seconds
  animationTimeScale = t_flight > 0 ? targetSimulationDuration / t_flight : 1;
  animationTimeScale = Math.max(0.1, Math.min(10, animationTimeScale)); // Clamp animation speed

  displayProjectileResults(v0, vf, g_effective, t_flight, range, h0, angleDeg);
}

/**
 * Simulates projectile motion, updating the object's position on the canvas over time.
 * @param {DOMHighResTimeStamp} currentTime - The current time provided by requestAnimationFrame.
 */
function simulateProjectile(currentTime) {
  if (!simulationStartTime.current) {
    simulationStartTime.current = currentTime;
    handleProjectileCalculation(); // Ensure projectile values are calculated before starting
  }
  let elapsedTime = (currentTime - simulationStartTime.current) / 1000;
  elapsedTime *= animationTimeScale; // Adjust animation speed

  const v0 = parseFloat(initialVelocityInput.value);
  const g_magnitude = parseFloat(accelerationInput.value);
  const h0 = parseFloat(initialHeightInput.value);
  const angleDeg = parseFloat(launchAngleInput.value);

  const g_effective = -g_magnitude;
  const angleRad = (angleDeg * Math.PI) / 180;
  const v0x = v0 * Math.cos(angleRad);
  const v0y = v0 * Math.sin(angleRad);

  const currentX = v0x * elapsedTime;
  const currentY =
    h0 + v0y * elapsedTime + 0.5 * g_effective * elapsedTime * elapsedTime;

  // Stop conditions:
  // 1. If elapsed time exceeds total flight time.
  // 2. If object goes significantly below ground level (y < 0).
  const tolerance = 0.01;
  if (elapsedTime >= finalTimeOfFlight - tolerance || currentY < -tolerance) {
    drawObject(finalRange, 0); // Ensure object lands at the calculated range
    cancelAnimationFrame(animationFrameId.current);
    simulationStartTime.current = null; // Reset simulation start time
    return;
  }

  drawObject(currentX, currentY); // Draw object at current position

  animationFrameId.current = requestAnimationFrame(simulateProjectile); // Continue animation
}

// --- Main DOM Content Loaded Event Listener ---
document.addEventListener("DOMContentLoaded", function () {
  // Create an object to pass all necessary elements and functions
  // to the modular initialization functions.
  const appContext = {
    // DOM Elements
    projectileModeCheckbox,
    projectileInputsContainer,
    constantVelocityCheckbox,
    initialVelocityInput,
    finalVelocityInput,
    accelerationInput,
    timeInput,
    displacementInput,
    initialHeightInput,
    launchAngleInput,
    calculateButton,
    startButton,
    resetButton,
    errorMessageDiv,
    accelerationLabel,
    constantVelocityControlRow,
    resultsGrid,
    solution2Container,
    displacementLabel,
    solution1V0,
    solution1Vf,
    solution1A,
    solution1T,
    solution1D,
    solution1H,
    solution1HRow,
    solution1Angle,
    solution1AngleRow,
    solution2V0,
    solution2Vf,
    solution2A,
    solution2T,
    solution2D,
    solution2H,
    solution2HRow,
    solution2Angle,
    solution2AngleRow,
    allInputElements,

    // Canvas and Animation State
    canvas,
    ctx,
    objectRadius,
    animationFrameIdRef: animationFrameId,
    simulationStartTimeRef: simulationStartTime,
    setSimulationStartTime,
    currentScale,
    animationTimeScale,
    finalRange,
    finalTimeOfFlight,

    // Core Functions (defined in script.js)
    clearCanvas,
    drawAxes,
    drawObject,
    clearOutputFields,

    // Projectile Functions (defined in script.js)
    displayProjectileResults,
    handleProjectileCalculation,
    simulateProjectile,
    // These functions are now exposed by initializeControls, but we need to pass them
    // to buttons.js.
    updateCalculateButtonState: null, // Will be set after initializeControls
    updateUIForMode: null, // Will be set after initializeControls
    applyConstantVelocityState: null, // Will be set after initializeControls
    updateProjectilePanelVisibility: null, // Will be set after initializeControls

    // Kinematics Functions (globally available from kinematics.js)
    handleKinematicCalculation,
    simulateKinematic,
    quadraticRoots, // Also globally available for projectile calculations
  };

  // Initialize controls (which will set up input listeners and return core UI functions)
  const controlsApi = initializeControls(appContext);
  appContext.updateCalculateButtonState =
    controlsApi.updateCalculateButtonState;
  appContext.updateUIForMode = controlsApi.updateUIForMode;
  appContext.applyConstantVelocityState =
    controlsApi.applyConstantVelocityState;
  appContext.updateProjectilePanelVisibility =
    controlsApi.updateProjectilePanelVisibility;

  // Initialize button listeners
  initializeButtonListeners(appContext);

  // Initial UI setup when the page loads
  appContext.updateUIForMode();
});
