// script.js

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
const solution1ARow = document.getElementById("output-a-1-row");
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
const solution2ARow = document.getElementById("output-a-2-row");
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

// These are now references to allow other modules to modify them
let animationFrameId = { current: null };
let simulationStartTime = { current: null };
let currentScale = { current: 10 };
let animationTimeScale = { current: 1 };
let finalRange = { current: 0 };
let finalTimeOfFlight = { current: 0 };

// Helper to set simulation start time (used by kinematics.js and simulation.js)
const setSimulationStartTime = (time) => {
  simulationStartTime.current = time;
};

// --- Core Utility Functions (shared but defined here for context) ---

/**
 * Clears all output fields in the solution panels and hides/shows specific rows.
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
  solution1ARow.classList.remove("hidden"); // Ensure acceleration output is shown by default
  solution2ARow.classList.remove("hidden"); // Ensure acceleration output is shown by default
  errorMessageDiv.classList.add("hidden");
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
    solution1ARow,
    solution1T,
    solution1D,
    solution1H,
    solution1HRow,
    solution1Angle,
    solution1AngleRow,
    solution2V0,
    solution2Vf,
    solution2A,
    solution2ARow,
    solution2T,
    solution2D,
    solution2H,
    solution2HRow,
    solution2Angle,
    solution2AngleRow,
    allInputElements,

    // Canvas and Animation State (passed as references)
    canvas,
    ctx,
    objectRadius,
    animationFrameIdRef: animationFrameId,
    simulationStartTimeRef: simulationStartTime,
    setSimulationStartTime,
    currentScaleRef: currentScale,
    animationTimeScaleRef: animationTimeScale,
    finalRangeRef: finalRange,
    finalTimeOfFlightRef: finalTimeOfFlight,

    // Core Utility Functions (defined in script.js)
    clearOutputFields,

    // Kinematics Functions (globally available from kinematics.js)
    handleKinematicCalculation,
    simulateKinematic,
    quadraticRoots, // Also globally available for projectile calculations
  };

  // Initialize modules
  const controlsApi = initializeControls(appContext);
  const simulationApi = initializeSimulation(appContext);

  // Update appContext with functions exposed by modules
  appContext.updateCalculateButtonState =
    controlsApi.updateCalculateButtonState;
  appContext.updateUIForMode = controlsApi.updateUIForMode;
  appContext.applyConstantVelocityState =
    controlsApi.applyConstantVelocityState;
  appContext.updateProjectilePanelVisibility =
    controlsApi.updateProjectilePanelVisibility;

  appContext.clearCanvas = simulationApi.clearCanvas;
  appContext.drawObject = simulationApi.drawObject;
  appContext.handleProjectileCalculation =
    simulationApi.handleProjectileCalculation;
  appContext.simulateProjectile = simulationApi.simulateProjectile;

  // Initialize button listeners (needs access to all functions via appContext)
  initializeButtonListeners(appContext);

  // Initial UI setup when the page loads
  appContext.updateUIForMode();
});
