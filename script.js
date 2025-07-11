import { calculateKinematics, calculateProjectile } from "./LinearMotion.js";
import { initializeControls } from "./Controls.js";

document.addEventListener("DOMContentLoaded", function () {
  // DOM element selections
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
  const resetButton = document.getElementById("reset-btn");
  const errorMessageDiv = document.getElementById("error-message");

  const accelerationLabel = document.getElementById("acceleration-label");
  const constantVelocityControlRow = document.getElementById(
    "constant-velocity-control-row"
  );
  const resultsGrid = document.getElementById("results-grid");
  const solution2Container = document.getElementById("solution2-container");

  const displacementLabel = document.querySelector('label[for="displacement"]');

  // Solution 1 output spans and rows
  const solution1V0 = document.getElementById("output-v0-1");
  const solution1Vf = document.getElementById("output-vf-1");
  const solution1A = document.getElementById("output-a-1");
  const solution1T = document.getElementById("output-t-1");
  const solution1D = document.getElementById("output-d-1");
  const solution1H = document.getElementById("output-h-1");
  const solution1HRow = document.getElementById("output-h-1-row");
  const solution1Angle = document.getElementById("output-angle-1");
  const solution1AngleRow = document.getElementById("output-angle-1-row");

  // Solution 2 output spans and rows
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

  /**
   * Clears all output fields and hides projectile-specific rows.
   */
  function clearOutputFields() {
    const outputSpans = document.querySelectorAll(
      '#results-grid span[id^="output-"]'
    );
    outputSpans.forEach((span) => (span.textContent = "-"));
    solution1HRow.classList.add("hidden");
    solution1AngleRow.classList.add("hidden");
    solution2HRow.classList.add("hidden"); // Ensure this is hidden
    solution2AngleRow.classList.add("hidden"); // Ensure this is hidden
    errorMessageDiv.classList.add("hidden");
  }

  /**
   * Displays the calculated kinematic results in the solution panel.
   * @param {number|null} v0 - Initial velocity.
   * @param {number|null} vf - Final velocity.
   * @param {number|null} a - Acceleration.
   * @param {number|null} t - Time.
   * @param {number|null} d - Displacement.
   */
  function displayKinematicResults(v0, vf, a, t, d) {
    solution1V0.textContent = v0 !== null && !isNaN(v0) ? v0.toFixed(2) : "-";
    solution1Vf.textContent = vf !== null && !isNaN(vf) ? vf.toFixed(2) : "-";
    solution1A.textContent = a !== null && !isNaN(a) ? a.toFixed(2) : "-";
    solution1T.textContent = t !== null && !isNaN(t) ? t.toFixed(2) : "-";
    solution1D.textContent = d !== null && !isNaN(d) ? d.toFixed(2) : "-";

    // Hide projectile specific rows in kinematic mode
    solution1HRow.classList.add("hidden");
    solution1AngleRow.classList.add("hidden");
    solution2Container.style.display = "none"; // Ensure solution 2 is hidden
  }

  /**
   * Handles the calculation for kinematic motion based on user inputs.
   */
  function handleKinematicCalculation() {
    let v0 = parseFloat(initialVelocityInput.value);
    let vf = parseFloat(finalVelocityInput.value);
    let a = parseFloat(accelerationInput.value);
    let t = parseFloat(timeInput.value);
    let d = parseFloat(displacementInput.value);

    // Use null for missing values to distinguish from 0
    v0 = isNaN(v0) ? null : v0;
    vf = isNaN(vf) ? null : vf;
    a = isNaN(a) ? null : a;
    t = isNaN(t) ? null : t;
    d = isNaN(d) ? null : d;

    // Call the calculation function from LinearMotion.js
    const result = calculateKinematics(v0, vf, a, t, d);

    if (result.errorMessage) {
      errorMessageDiv.textContent = result.errorMessage;
      errorMessageDiv.classList.remove("hidden");
    } else {
      errorMessageDiv.classList.add("hidden");
    }

    displayKinematicResults(result.v0, result.vf, result.a, result.t, result.d);
  }

  /**
   * Displays the calculated projectile motion results in the solution panel(s).
   * If launch angle is provided, only one solution is displayed. If blank, two solutions are shown (if available from calculation).
   * @param {number} v0 - Initial velocity.
   * @param {number} vf - Final velocity at impact.
   * @param {number} a - Gravity (effective, e.g., -9.81).
   * @param {number} t - Time of flight.
   * @param {number} d - Horizontal distance (range).
   * @param {number} h0 - Initial height.
   * @param {number} angle - Launch angle in degrees.
   */
  function displayProjectileResults(v0, vf, a, t, d, h0, angle) {
    // Populate Solution 1
    solution1A.textContent = a !== null && !isNaN(a) ? a.toFixed(2) : "-";
    solution1H.textContent = h0 !== null && !isNaN(h0) ? h0.toFixed(2) : "-";
    solution1Angle.textContent =
      angle !== null && !isNaN(angle) ? angle.toFixed(2) : "-";
    solution1V0.textContent = v0 !== null && !isNaN(v0) ? v0.toFixed(2) : "-";
    solution1Vf.textContent = vf !== null && !isNaN(vf) ? vf.toFixed(2) : "-";
    solution1T.textContent = t !== null && !isNaN(t) ? t.toFixed(2) : "-";
    solution1D.textContent = d !== null && !isNaN(d) ? d.toFixed(2) : "-";

    solution1HRow.classList.remove("hidden");
    solution1AngleRow.classList.remove("hidden");

    // Check if Solution 2 should be shown based on launchAngleInput state
    // It will be shown if launchAngleInput is BLANK
    const showTwoPanels =
      projectileModeCheckbox.checked && launchAngleInput.value === "";

    if (showTwoPanels) {
      // For now, populate Solution 2 with the same results as Solution 1
      // as the current calculation only produces one solution for given inputs.
      // A more advanced solver would be needed to find two distinct angles/trajectories.
      solution2A.textContent = a !== null && !isNaN(a) ? a.toFixed(2) : "-";
      solution2H.textContent = h0 !== null && !isNaN(h0) ? h0.toFixed(2) : "-";
      solution2Angle.textContent =
        angle !== null && !isNaN(angle) ? angle.toFixed(2) : "-";
      solution2V0.textContent = v0 !== null && !isNaN(v0) ? v0.toFixed(2) : "-";
      solution2Vf.textContent = vf !== null && !isNaN(vf) ? vf.toFixed(2) : "-";
      solution2T.textContent = t !== null && !isNaN(t) ? t.toFixed(2) : "-";
      solution2D.textContent = d !== null && !isNaN(d) ? d.toFixed(2) : "-";

      solution2HRow.classList.remove("hidden");
      solution2AngleRow.classList.remove("hidden");
      solution2Container.style.display = "block";
    } else {
      // Hide Solution 2 container and clear its outputs
      solution2Container.style.display = "none";
      solution2V0.textContent = "-";
      solution2Vf.textContent = "-";
      solution2A.textContent = "-";
      solution2T.textContent = "-";
      solution2D.textContent = "-";
      solution2H.textContent = "-";
      solution2Angle.textContent = "-";
    }
  }

  /**
   * Handles the calculation for projectile motion based on user inputs.
   */
  function handleProjectileCalculation() {
    const v0 = parseFloat(initialVelocityInput.value);
    const g_magnitude = parseFloat(accelerationInput.value);
    const h0 = parseFloat(initialHeightInput.value);
    const angleDeg = parseFloat(launchAngleInput.value);

    // Call the calculation function from LinearMotion.js
    const result = calculateProjectile(v0, g_magnitude, h0, angleDeg);

    if (result.errorMessage) {
      errorMessageDiv.textContent = result.errorMessage;
      errorMessageDiv.classList.remove("hidden");
      clearOutputFields();
      return;
    } else {
      errorMessageDiv.classList.add("hidden");
    }

    displayProjectileResults(
      result.v0,
      result.vf,
      result.a,
      result.t,
      result.d,
      result.h0,
      result.angle
    );
  }

  // Initialize controls by passing all necessary elements and functions
  initializeControls({
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
    resetButton,
    errorMessageDiv,
    accelerationLabel,
    constantVelocityControlRow,
    resultsGrid,
    solution2Container,
    displacementLabel,
    solution1HRow,
    solution1AngleRow,
    solution2HRow,
    solution2AngleRow,
    allInputElements,
    handleKinematicCalculation,
    handleProjectileCalculation,
    clearOutputFields,
  });
});
