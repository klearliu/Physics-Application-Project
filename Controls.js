/**
 * Initializes all UI controls and attaches event listeners.
 * @param {object} params - Object containing necessary DOM elements and callback functions.
 * @param {HTMLElement} params.projectileModeCheckbox - The checkbox for toggling projectile mode.
 * @param {HTMLElement} params.projectileInputsContainer - Container for projectile-specific inputs.
 * @param {HTMLElement} params.constantVelocityCheckbox - The checkbox for constant velocity mode.
 * @param {HTMLElement} params.initialVelocityInput - Input for initial velocity.
 * @param {HTMLElement} params.finalVelocityInput - Input for final velocity.
 * @param {HTMLElement} params.accelerationInput - Input for acceleration/gravity.
 * @param {HTMLElement} params.timeInput - Input for time.
 * @param {HTMLElement} params.displacementInput - Input for displacement/horizontal distance.
 * @param {HTMLElement} params.initialHeightInput - Input for initial height.
 * @param {HTMLElement} params.launchAngleInput - Input for launch angle.
 * @param {HTMLElement} params.calculateButton - The calculate button.
 * @param {HTMLElement} params.resetButton - The reset button.
 * @param {HTMLElement} params.errorMessageDiv - Div to display error messages.
 * @param {HTMLElement} params.accelerationLabel - Label for acceleration/gravity input.
 * @param {HTMLElement} params.constantVelocityControlRow - Container for constant velocity checkbox.
 * @param {HTMLElement} params.resultsGrid - The grid container for results.
 * @param {HTMLElement} params.solution2Container - Container for the second solution panel.
 * @param {HTMLElement} params.displacementLabel - Label for displacement/horizontal distance input.
 * @param {HTMLElement} params.solution1HRow - Row for initial height in solution 1.
 * @param {HTMLElement} params.solution1AngleRow - Row for launch angle in solution 1.
 * @param {HTMLElement} params.solution2HRow - Row for initial height in solution 2.
 * @param {HTMLElement} params.solution2AngleRow - Row for launch angle in solution 2.
 * @param {Function} params.handleKinematicCalculation - Callback for kinematic calculations.
 * @param {Function} params.handleProjectileCalculation - Callback for projectile calculations.
 * @param {Function} params.clearOutputFields - Callback to clear all output fields.
 */
export function initializeControls({
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
  allInputElements, // Pass this array from script.js
  handleKinematicCalculation,
  handleProjectileCalculation,
  clearOutputFields,
}) {
  /**
   * Updates the state of the calculate button based on the number of filled inputs.
   */
  function updateCalculateButtonState() {
    let count = 0;
    allInputElements.forEach((input) => {
      // Only count inputs that are visible and have a value
      if (!input.closest(".hidden") && input.value !== "" && !input.disabled) {
        count++;
      }
    });

    // Enable calculate button if at least 3 relevant inputs are filled
    calculateButton.disabled = count < 3;
    calculateButton.classList.toggle("bg-blue-600", count >= 3);
    calculateButton.classList.toggle("hover:bg-blue-700", count >= 3);
    calculateButton.classList.toggle("bg-gray-400", count < 3);

    if (count < 3) {
      errorMessageDiv.textContent = "Enter at least three values to calculate.";
      errorMessageDiv.classList.remove("hidden");
    } else {
      errorMessageDiv.classList.add("hidden");
    }
  }

  /**
   * Applies the constant velocity state, disabling acceleration and linking final velocity to initial.
   */
  function applyConstantVelocityState() {
    if (constantVelocityCheckbox.checked) {
      accelerationInput.value = "0";
      accelerationInput.disabled = true;
      accelerationInput.classList.add("bg-gray-200");
      finalVelocityInput.value = initialVelocityInput.value; // Set final velocity to initial
      finalVelocityInput.disabled = true;
      finalVelocityInput.classList.add("bg-gray-200");
    } else {
      accelerationInput.value = "";
      accelerationInput.disabled = false;
      accelerationInput.classList.remove("bg-gray-200");
      finalVelocityInput.value = ""; // Clear final velocity
      finalVelocityInput.disabled = false;
      finalVelocityInput.classList.remove("bg-gray-200");
    }
    updateCalculateButtonState();
  }

  /**
   * Updates the visibility of solution panels and grid layout specifically for projectile mode.
   */
  function updateProjectilePanelVisibility() {
    const isProjectile = projectileModeCheckbox.checked;
    const isLaunchAngleGiven = launchAngleInput.value !== "";

    if (isProjectile) {
      if (isLaunchAngleGiven) {
        // User wants 1 panel if launch angle is given
        solution2Container.style.display = "none";
        resultsGrid.classList.add("md:grid-cols-1");
        resultsGrid.classList.remove("md:grid-cols-2");
      } else {
        // User wants 2 panels if launch angle is blank
        solution2Container.style.display = "block";
        resultsGrid.classList.add("md:grid-cols-2");
        resultsGrid.classList.remove("md:grid-cols-1");
      }
      // Ensure projectile specific rows are visible in solution 1 AND solution 2
      solution1HRow.classList.remove("hidden");
      solution1AngleRow.classList.remove("hidden");
      solution2HRow.classList.remove("hidden");
      solution2AngleRow.classList.remove("hidden");
    } else {
      // In kinematic mode, always hide solution 2 and projectile rows
      solution2Container.style.display = "none";
      resultsGrid.classList.remove("md:grid-cols-2");
      resultsGrid.classList.add("md:grid-cols-1");
      solution1HRow.classList.add("hidden");
      solution1AngleRow.classList.add("hidden");
      solution2HRow.classList.add("hidden"); // Ensure this is hidden
      solution2AngleRow.classList.add("hidden"); // Ensure this is hidden
    }
  }

  /**
   * Updates the UI elements based on the selected motion mode (kinematic or projectile).
   */
  function updateUIForMode() {
    const isProjectile = projectileModeCheckbox.checked;

    clearOutputFields(); // Always clear outputs when switching modes

    // Toggle displacement label text
    displacementLabel.textContent = isProjectile
      ? "Horizontal Distance [m]"
      : "Displacement [m]";

    // Show or hide projectile inputs container
    projectileInputsContainer.classList.toggle("hidden", !isProjectile);

    // Hide/show constant velocity controls only in kinematic mode
    constantVelocityControlRow.classList.toggle("hidden", isProjectile);

    // Change acceleration label to Gravity in projectile mode
    accelerationLabel.textContent = isProjectile
      ? "Gravity [m/s²]"
      : "Acceleration [m/s²]";

    // Set default gravity value in projectile mode and enable/disable inputs
    if (isProjectile) {
      accelerationInput.value = "9.81"; // Suggest positive G, sign handled in calculations
      accelerationInput.disabled = false;
      accelerationInput.classList.remove("bg-gray-200");
      // In projectile mode, constant velocity doesn't apply to the overall motion
      constantVelocityCheckbox.checked = false;
      finalVelocityInput.disabled = false; // Enable final velocity
      finalVelocityInput.classList.remove("bg-gray-200");
    } else {
      accelerationInput.value = "";
      accelerationInput.disabled = false;
      accelerationInput.classList.remove("bg-gray-200");
      // If constant velocity was checked, apply its state
      applyConstantVelocityState();
    }

    // Update the calculate button state based on the new mode's input requirements
    updateCalculateButtonState();
    // Update panel visibility based on the new mode
    updateProjectilePanelVisibility();
  }

  // Event Listeners
  projectileModeCheckbox.addEventListener("change", updateUIForMode);
  constantVelocityCheckbox.addEventListener(
    "change",
    applyConstantVelocityState
  );
  initialVelocityInput.addEventListener("input", () => {
    if (constantVelocityCheckbox.checked) {
      finalVelocityInput.value = initialVelocityInput.value;
    }
    updateCalculateButtonState();
  });
  finalVelocityInput.addEventListener("input", updateCalculateButtonState);
  accelerationInput.addEventListener("input", updateCalculateButtonState);
  timeInput.addEventListener("input", updateCalculateButtonState);
  displacementInput.addEventListener("input", updateCalculateButtonState);
  initialHeightInput.addEventListener("input", updateCalculateButtonState);
  launchAngleInput.addEventListener("input", () => {
    updateCalculateButtonState();
    updateProjectilePanelVisibility(); // Update panel visibility when angle input changes
  });

  calculateButton.addEventListener("click", function () {
    if (projectileModeCheckbox.checked) {
      handleProjectileCalculation();
    } else {
      handleKinematicCalculation();
    }
  });

  resetButton.addEventListener("click", function () {
    allInputElements.forEach((input) => {
      input.value = "";
      input.disabled = false;
      input.classList.remove("bg-gray-200");
    });
    constantVelocityCheckbox.checked = false;
    projectileModeCheckbox.checked = false; // Reset to kinematic mode
    updateUIForMode(); // Re-initialize UI to default kinematic state
    clearOutputFields();
  });

  // Initial UI setup
  updateUIForMode();
}
