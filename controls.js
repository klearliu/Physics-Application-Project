/**
 * Initializes all input-related logic and event listeners.
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
 * @param {HTMLElement} params.maxHeightInput - Input for max height.
 * @param {HTMLElement} params.maxHeightTimeInput - Input for max height time.
 * @param {HTMLElement} params.initialHeightLabel - Label for initial height input.
 * @param {HTMLElement} params.launchAngleLabel - Label for launch angle input.
 * @param {HTMLElement} params.maxHeightLabel - Label for max height input.
 * @param {HTMLElement} params.maxHeightTimeLabel - Label for max height time input.
 * @param {HTMLElement} params.calculateButton - The calculate button.
 * @param {HTMLElement} params.startButton - The start simulation button.
 * @param {HTMLElement} params.errorMessageDiv - The error message display div.
 * @param {HTMLElement} params.displacementLabel - Label for displacement input.
 * @param {HTMLElement} params.projectileInputsContainer - Container for projectile-specific inputs.
 * @param {HTMLElement} params.constantVelocityControlRow - Row for constant velocity checkbox.
 * @param {HTMLElement} params.accelerationLabel - Label for acceleration input.
 * @param {HTMLElement} params.resultsGrid - The results grid container.
 * @param {HTMLElement} params.solution1HRow - Output row for initial height (solution 1).
 * @param {HTMLElement} params.solution1AngleRow - Output row for launch angle (solution 1).
 * @param {HTMLElement} params.solution1ARow - Output row for acceleration (solution 1).
 * @param {HTMLElement} params.solution1MaxHeightRow - Output row for max height.
 * @param {HTMLElement} params.solution1MaxHeightTimeRow - Output row for max height time.
 * @param {HTMLElement} params.solution2HRow - Output row for initial height (solution 2).
 * @param {HTMLElement} params.solution2AngleRow - Output row for launch angle (solution 2).
 * @param {HTMLElement} params.solution2ARow - Output row for acceleration (solution 2).
 * @param {HTMLElement} params.solution2Container - Container for solution 2.
 * @param {HTMLElement} params.solution1DLabel - Output label for displacement in solution 1.
 * @param {HTMLElement} params.solution2DLabel - Output label for displacement in solution 2.
 * @param {function} params.clearOutputFields - Function to clear all output fields.
 * @param {Array<HTMLElement>} params.allInputElements - Array of all input elements.
 */
function initializeControls(params) {
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
    maxHeightInput,
    maxHeightTimeInput,
    initialHeightLabel,
    launchAngleLabel,
    maxHeightLabel,
    maxHeightTimeLabel,
    calculateButton,
    startButton,
    errorMessageDiv,
    displacementLabel,
    projectileInputsContainer,
    constantVelocityControlRow,
    accelerationLabel,
    resultsGrid,
    solution1HRow,
    solution1AngleRow,
    solution1ARow,
    solution1MaxHeightRow,
    solution1MaxHeightTimeRow,
    solution2HRow,
    solution2AngleRow,
    solution2ARow,
    solution2Container,
    solution1DLabel, // New parameter
    solution2DLabel, // New parameter
    clearOutputFields,
    allInputElements,
  } = params;

  // Store original label texts to restore them when mode changes
  const originalInitialHeightLabelText = initialHeightLabel.textContent;
  const originalLaunchAngleLabelText = launchAngleLabel.textContent;
  const originalMaxHeightLabelText = maxHeightLabel.textContent;
  const originalMaxHeightTimeLabelText = maxHeightTimeLabel.textContent;
  // Store original displacement output label texts
  const originalSolution1DLabelText = solution1DLabel.textContent;
  const originalSolution2DLabelText = solution2DLabel.textContent;

  /**
   * Updates the disabled state of the Calculate and Start Simulation buttons
   * based on the number of valid inputs and the current mode (kinematic/projectile).
   */
  function updateCalculateButtonState() {
    let count = 0;
    const isProjectile = projectileModeCheckbox.checked;

    // These are the inputs relevant for projectile motion calculations, including the new ones
    const projectileRelevantInputs = [
      initialVelocityInput,
      initialHeightInput,
      launchAngleInput,
      accelerationInput, // Gravity
      maxHeightInput,
      maxHeightTimeInput,
    ];

    if (!isProjectile) {
      // Kinematic mode: need at least 3 values to calculate all 5
      allInputElements.forEach((input) => {
        if (input.value !== "" && !input.closest(".hidden")) {
          // Exclude acceleration/final velocity if constant velocity is checked
          if (
            !(
              constantVelocityCheckbox.checked &&
              (input.id === "acceleration" || input.id === "final-velocity")
            )
          ) {
            count++;
          }
        }
      });
      // Adjust count for constant velocity mode specifically (initial velocity + one other counts as 3 effectively)
      if (
        constantVelocityCheckbox.checked &&
        initialVelocityInput.value !== ""
      ) {
        if (timeInput.value !== "" || displacementInput.value !== "") {
          count = Math.max(count, 3); // Ensure it's at least 3 if constant velocity conditions are met
        }
      }
    } else {
      // Projectile mode: need at least 4 values to calculate all unknowns
      projectileRelevantInputs.forEach((input) => {
        if (input.value !== "") {
          count++;
        }
      });
    }

    let canCalculate = false;
    if (!isProjectile) {
      canCalculate = count >= 3;
    } else {
      canCalculate = count >= 4; // Require at least 4 inputs for projectile mode
    }
    calculateButton.disabled = !canCalculate;

    let startButtonEnabled = false;
    if (isProjectile) {
      // For projectile simulation, we must have initial velocity, initial height, launch angle, and gravity
      const v0_proj = parseFloat(initialVelocityInput.value);
      const h0_proj = parseFloat(initialHeightInput.value);
      const angleDeg_proj = parseFloat(launchAngleInput.value);
      const g_magnitude_proj = parseFloat(accelerationInput.value); // Gravity input

      startButtonEnabled =
        !isNaN(v0_proj) &&
        !isNaN(h0_proj) &&
        !isNaN(angleDeg_proj) &&
        !isNaN(g_magnitude_proj) &&
        v0_proj >= 0 &&
        g_magnitude_proj > 0 &&
        h0_proj >= 0 &&
        angleDeg_proj >= 0 &&
        angleDeg_proj <= 90;
    } else {
      // For kinematic simulation, general rule applies for starting animation
      let v0 = parseFloat(initialVelocityInput.value);
      let vf = parseFloat(finalVelocityInput.value);
      let a = parseFloat(accelerationInput.value);
      let t = parseFloat(timeInput.value);
      let d = parseFloat(displacementInput.value);

      v0 = isNaN(v0) ? null : v0;
      vf = isNaN(vf) ? null : vf;
      a = isNaN(a) ? null : a;
      t = isNaN(t) ? null : t;
      d = isNaN(d) ? null : d;

      if (constantVelocityCheckbox.checked) {
        if (v0 !== null && (t !== null || d !== null)) {
          startButtonEnabled = true;
        }
      } else {
        if (v0 !== null && (a !== null || t !== null || d !== null)) {
          startButtonEnabled = true;
        } else if (vf !== null) {
          const knownCountForVfStart = [vf, a, t, d].filter(
            (val) => val !== null
          ).length;
          if (knownCountForVfStart >= 3) {
            startButtonEnabled = true;
          }
        }
      }
    }
    startButton.disabled = !startButtonEnabled;

    // Update button styling
    calculateButton.classList.toggle("bg-blue-600", !calculateButton.disabled);
    calculateButton.classList.toggle(
      "hover:bg-blue-700",
      !calculateButton.disabled
    );
    calculateButton.classList.toggle("bg-gray-400", calculateButton.disabled);

    startButton.classList.toggle("bg-blue-600", !startButton.disabled);
    startButton.classList.toggle("hover:bg-blue-700", !startButton.disabled);
    startButton.classList.toggle("bg-gray-400", startButton.disabled);

    // Display error message if neither button is enabled
    if (calculateButton.disabled && startButton.disabled) {
      errorMessageDiv.textContent =
        "Enter sufficient values to calculate or start simulation.";
      errorMessageDiv.classList.remove("hidden");
    } else {
      errorMessageDiv.classList.add("hidden");
    }
  }

  /**
   * Applies the constant velocity state, disabling acceleration and final velocity
   * inputs and setting acceleration to 0.
   */
  function applyConstantVelocityState() {
    if (constantVelocityCheckbox.checked) {
      accelerationInput.value = "0";
      accelerationInput.disabled = true;
      accelerationInput.classList.add("bg-gray-200");
      finalVelocityInput.value = initialVelocityInput.value; // Final velocity equals initial
      finalVelocityInput.disabled = true;
      finalVelocityInput.classList.add("bg-gray-200");
    } else {
      accelerationInput.value = "";
      accelerationInput.disabled = false;
      accelerationInput.classList.remove("bg-gray-200");
      finalVelocityInput.value = "";
      finalVelocityInput.disabled = false;
      finalVelocityInput.classList.remove("bg-gray-200");
    }
    updateCalculateButtonState();
  }

  /**
   * Updates the visibility of projectile-specific panels and output rows.
   * This ensures the correct layout for kinematic vs. projectile results.
   */
  function updateProjectilePanelVisibility() {
    const isProjectile = projectileModeCheckbox.checked;

    if (isProjectile) {
      solution2Container.style.display = "none"; // Hide second solution panel
      resultsGrid.classList.add("md:grid-cols-1"); // Ensure single column layout
      resultsGrid.classList.remove("md:grid-cols-2");

      solution1HRow.classList.remove("hidden"); // Show projectile-specific output rows
      solution1AngleRow.classList.remove("hidden");
      solution1MaxHeightRow.classList.remove("hidden");
      solution1MaxHeightTimeRow.classList.remove("hidden");
      solution1ARow.classList.add("hidden"); // Hide acceleration output for solution 1
      solution2ARow.classList.add("hidden"); // Hide acceleration output for solution 2
    } else {
      solution2Container.style.display = "none"; // Hide second solution panel
      resultsGrid.classList.remove("md:grid-cols-2"); // Ensure single column layout
      resultsGrid.classList.add("md:grid-cols-1");
      solution1HRow.classList.add("hidden"); // Hide projectile-specific output rows
      solution1AngleRow.classList.add("hidden");
      solution1MaxHeightRow.classList.add("hidden");
      solution1MaxHeightTimeRow.classList.add("hidden");
      solution2HRow.classList.add("hidden");
      solution2AngleRow.classList.add("hidden");
      solution1ARow.classList.remove("hidden"); // Show acceleration output for solution 1
      solution2ARow.classList.remove("hidden"); // Show acceleration output for solution 2
    }
  }

  /**
   * Updates the UI elements based on whether projectile mode is active or not.
   * This includes clearing inputs, setting defaults, and managing required attributes.
   */
  function updateUIForMode() {
    const isProjectile = projectileModeCheckbox.checked;

    clearOutputFields(); // Clears output spans and hides projectile-specific rows

    // Clear ALL input fields first and ensure they are enabled for editing
    allInputElements.forEach((input) => {
      input.value = "";
      input.disabled = false;
      input.classList.remove("bg-gray-200");
    });
    constantVelocityCheckbox.checked = false; // Always uncheck constant velocity when mode changes

    // Update label for displacement input
    displacementLabel.textContent = isProjectile
      ? "Horizontal Distance [m]"
      : "Displacement [m]";

    // Update label for displacement output in Solution panels
    if (solution1DLabel) {
      solution1DLabel.textContent = isProjectile
        ? "Horizontal Distance"
        : originalSolution1DLabelText;
    }
    if (solution2DLabel) {
      solution2DLabel.textContent = isProjectile
        ? "Horizontal Distance"
        : originalSolution2DLabelText;
    }

    // Toggle visibility of projectile-specific input container
    projectileInputsContainer.classList.toggle("hidden", !isProjectile);

    // Toggle visibility of constant velocity control row
    constantVelocityControlRow.classList.toggle("hidden", isProjectile);

    // Update label for acceleration input
    accelerationLabel.textContent = isProjectile
      ? "Gravity [m/s²]"
      : "Acceleration [m/s²]";

    // Handle mandatory field indicators and required attributes
    if (isProjectile) {
      // Set gravity default for projectile mode
      if (isNaN(parseFloat(accelerationInput.value))) {
        accelerationInput.value = "9.81";
      }

      // No 'required' attribute for Max Height/Time as they are alternative inputs
      initialHeightInput.setAttribute("required", "true");
      launchAngleInput.setAttribute("required", "true");
      accelerationInput.setAttribute("required", "true");

      // Add asterisk to labels for mandatory initial conditions
      initialHeightLabel.innerHTML = `${originalInitialHeightLabelText} <span class="text-red-500">*</span>`;
      launchAngleLabel.innerHTML = `${originalLaunchAngleLabelText} <span class="text-red-500">*</span>`;
      accelerationLabel.innerHTML = `${accelerationLabel.textContent} <span class="text-red-500">*</span>`;

      // Restore original label texts for optional inputs (Max Height/Time)
      maxHeightLabel.innerHTML = originalMaxHeightLabelText;
      maxHeightTimeLabel.innerHTML = originalMaxHeightTimeLabelText;

      // Ensure Max Height and Max Height Time inputs are editable
      maxHeightInput.disabled = false;
      maxHeightInput.classList.remove("bg-gray-200");
      maxHeightTimeInput.disabled = false;
      maxHeightTimeInput.classList.remove("bg-gray-200");
    } else {
      // Remove required attributes when not in projectile mode
      accelerationInput.removeAttribute("required");
      initialHeightInput.removeAttribute("required");
      launchAngleInput.removeAttribute("required");

      // Restore original label texts
      initialHeightLabel.innerHTML = originalInitialHeightLabelText;
      launchAngleLabel.innerHTML = originalLaunchAngleLabelText;
      accelerationLabel.innerHTML = originalAccelerationLabelText; // Revert gravity label to acceleration

      // Revert Max Height/Time labels if they were modified (though they shouldn't be in kinematic)
      maxHeightLabel.innerHTML = originalMaxHeightLabelText;
      maxHeightTimeLabel.innerHTML = originalMaxHeightTimeLabelText;

      // Apply constant velocity state if it was checked (though it's unchecked above, this ensures correct state)
      applyConstantVelocityState();
    }

    updateCalculateButtonState(); // Re-evaluate button states
    updateProjectilePanelVisibility(); // Adjust panel visibility
  }

  // Store original Acceleration Label Text separately, as it changes dynamically
  const originalAccelerationLabelText = accelerationLabel.textContent;

  // --- Event Listeners for Controls ---
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
  maxHeightInput.addEventListener("input", updateCalculateButtonState);
  maxHeightTimeInput.addEventListener("input", updateCalculateButtonState);

  // Expose functions that might be needed by other modules (e.g., buttons.js)
  return {
    updateCalculateButtonState,
    updateUIForMode,
    applyConstantVelocityState,
    updateProjectilePanelVisibility,
  };
}
