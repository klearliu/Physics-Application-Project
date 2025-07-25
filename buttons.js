/**
 * Initializes all button and input event listeners.
 * This function should be called from script.js after the DOM is loaded
 * and all necessary elements/functions are available.
 * @param {object} params - An object containing all necessary DOM elements and functions.
 * @param {HTMLElement} params.projectileModeCheckbox - The checkbox for projectile mode.
 * @param {HTMLElement} params.constantVelocityCheckbox - The checkbox for constant velocity.
 * @param {HTMLElement} params.initialVelocityInput - Input for initial velocity.
 * @param {HTMLElement} params.finalVelocityInput - Input for final velocity.
 * @param {HTMLElement} params.accelerationInput - Input for acceleration/gravity.
 * @param {HTMLElement} params.timeInput - Input for time.
 * @param {HTMLElement} params.displacementInput - Input for displacement/horizontal distance.
 * @param {HTMLElement} params.initialHeightInput - Input for initial height (projectile).
 * @param {HTMLElement} params.launchAngleInput - Input for launch angle (projectile).
 * @param {HTMLElement} params.calculateButton - The calculate button.
 * @param {HTMLElement} params.startButton - The start simulation button.
 * @param {HTMLElement} params.resetButton - The reset button.
 * @param {HTMLElement} params.errorMessageDiv - The error message display div.
 * @param {function} params.updateUIForMode - Function to update UI based on mode.
 * @param {function} params.applyConstantVelocityState - Function to apply constant velocity state.
 * @param {function} params.updateCalculateButtonState - Function to update button states.
 * @param {function} params.handleKinematicCalculation - Function to perform kinematic calculations.
 * @param {function} params.handleProjectileCalculation - Function to perform projectile calculations.
 * @param {function} params.simulateKinematic - Function to start kinematic simulation.
 * @param {function} params.simulateProjectile - Function to start projectile simulation.
 * @param {function} params.clearCanvas - Function to clear the simulation canvas.
 * @param {{current: number|null}} params.animationFrameIdRef - Reference to the animation frame ID.
 * @param {{current: number|null}} params.simulationStartTimeRef - Reference to the simulation start time.
 * @param {function} params.setSimulationStartTime - Helper to set simulation start time.
 * @param {Array<HTMLElement>} params.allInputElements - Array of all input elements.
 */
function initializeButtonListeners(params) {
  const {
    projectileModeCheckbox,
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
    updateUIForMode,
    applyConstantVelocityState,
    updateCalculateButtonState,
    handleKinematicCalculation, // From kinematics.js
    handleProjectileCalculation, // From script.js
    simulateKinematic, // From kinematics.js
    simulateProjectile, // From script.js
    clearCanvas,
    animationFrameIdRef,
    simulationStartTimeRef,
    setSimulationStartTime,
    allInputElements,
  } = params;

  // Event Listeners
  projectileModeCheckbox.addEventListener("change", updateUIForMode);
  constantVelocityCheckbox.addEventListener(
    "change",
    applyConstantVelocityState
  );

  // Input event listeners to update button states dynamically
  initialVelocityInput.addEventListener("input", () => {
    if (constantVelocityCheckbox.checked) {
      finalVelocityInput.value = initialVelocityInput.value; // Keep final velocity synced in constant mode
    }
    updateCalculateButtonState();
  });
  finalVelocityInput.addEventListener("input", updateCalculateButtonState);
  accelerationInput.addEventListener("input", updateCalculateButtonState);
  timeInput.addEventListener("input", updateCalculateButtonState);
  displacementInput.addEventListener("input", updateCalculateButtonState);
  initialHeightInput.addEventListener("input", updateCalculateButtonState);
  launchAngleInput.addEventListener("input", updateCalculateButtonState);

  // Calculate button click handler
  calculateButton.addEventListener("click", function () {
    if (projectileModeCheckbox.checked) {
      handleProjectileCalculation();
    } else {
      handleKinematicCalculation();
    }
  });

  // Start Simulation button click handler
  startButton.addEventListener("click", function () {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current); // Cancel any ongoing animation
    }
    simulationStartTimeRef.current = null; // Reset simulation time

    if (projectileModeCheckbox.checked) {
      // Validate inputs for projectile simulation start
      const v0 = parseFloat(initialVelocityInput.value);
      const h0 = parseFloat(initialHeightInput.value);
      const angleDeg = parseFloat(launchAngleInput.value);
      const g_magnitude = parseFloat(accelerationInput.value);

      if (
        isNaN(v0) ||
        isNaN(h0) ||
        isNaN(angleDeg) ||
        isNaN(g_magnitude) ||
        v0 < 0 ||
        h0 < 0 ||
        angleDeg < 0 ||
        angleDeg > 90 ||
        g_magnitude <= 0
      ) {
        errorMessageDiv.textContent =
          "Please enter valid positive numbers for Initial Velocity, Initial Height, Gravity, and a Launch Angle between 0-90 degrees to start the projectile simulation.";
        errorMessageDiv.classList.remove("hidden");
        clearCanvas();
        return;
      }
      errorMessageDiv.classList.add("hidden");
      animationFrameIdRef.current = requestAnimationFrame(simulateProjectile); // Start projectile simulation
    } else {
      // Kinematic mode simulation start logic
      let v0 = parseFloat(initialVelocityInput.value);
      let vf = parseFloat(finalVelocityInput.value);
      let a = parseFloat(accelerationInput.value);
      let t = parseFloat(timeInput.value);
      let d = parseFloat(displacementInput.value);

      // Convert to null if NaN for consistent checking during validation
      v0 = isNaN(v0) ? null : v0;
      vf = isNaN(vf) ? null : vf;
      a = isNaN(a) ? null : a;
      t = isNaN(t) ? null : t;
      d = isNaN(d) ? null : d;

      let canStartKinematicSimulation = false;

      // Check if enough information is present to start kinematic simulation
      if (constantVelocityCheckbox.checked) {
        if (v0 !== null && (t !== null || d !== null)) {
          canStartKinematicSimulation = true;
        }
      } else {
        if (v0 !== null && (a !== null || t !== null || d !== null)) {
          canStartKinematicSimulation = true;
        } else if (vf !== null) {
          const knownCountForVfStart = [vf, a, t, d].filter(
            (val) => val !== null
          ).length;
          if (knownCountForVfStart >= 3) {
            canStartKinematicSimulation = true;
          }
        }
      }

      if (!canStartKinematicSimulation) {
        errorMessageDiv.textContent =
          "Please enter sufficient values to start the kinematic simulation. Generally, Initial Velocity and at least one of Acceleration, Time, or Displacement are needed.";
        errorMessageDiv.classList.remove("hidden");
        clearCanvas();
        return;
      }

      errorMessageDiv.classList.add("hidden");
      // Call handleKinematicCalculation to ensure all solvable values are computed
      // and available in the output spans before simulation starts.
      handleKinematicCalculation();
      animationFrameIdRef.current = requestAnimationFrame((time) =>
        simulateKinematic(
          time,
          params.ctx, // Pass ctx to simulateKinematic
          params.canvas, // Pass canvas to simulateKinematic
          params.drawObject, // Pass drawObject to simulateKinematic
          cancelAnimationFrame,
          animationFrameIdRef,
          simulationStartTimeRef,
          setSimulationStartTime
        )
      ); // Start kinematic simulation
    }
  });

  // Reset button click handler
  resetButton.addEventListener("click", function () {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current); // Cancel any ongoing animation
    }
    simulationStartTimeRef.current = null; // Reset simulation time
    clearCanvas(); // Clear the simulation canvas

    // Reset all input fields
    allInputElements.forEach((input) => {
      input.value = "";
      input.disabled = false; // Ensure inputs are enabled
      input.classList.remove("bg-gray-200"); // Remove disabled styling
    });
    constantVelocityCheckbox.checked = false; // Uncheck constant velocity
    projectileModeCheckbox.checked = false; // Uncheck projectile mode
    updateUIForMode(); // Update UI to reflect default (kinematic) state
    clearOutputFields(); // Clear output fields
  });
}
