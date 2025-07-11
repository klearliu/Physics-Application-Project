document.addEventListener("DOMContentLoaded", function () {
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

  // Change displacement label text dynamically
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
   * Solves a quadratic equation $ax^2 + bx + c = 0$ for its roots.
   * @param {number} a - Coefficient a.
   * @param {number} b - Coefficient b.
   * @param {number} c - Coefficient c.
   * @returns {number[]} An array of real roots.
   */
  function quadraticRoots(a, b, c) {
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return []; // no real roots
    if (discriminant === 0) return [-b / (2 * a)];
    const sqrtDisc = Math.sqrt(discriminant);
    return [(-b + sqrtDisc) / (2 * a), (-b - sqrtDisc) / (2 * a)];
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

    let solvedCount = 0;
    let maxIterations = 10; // Prevent infinite loops

    for (let i = 0; i < maxIterations; i++) {
      let initialSolvedCount = [v0, vf, a, t, d].filter(
        (val) => val !== null
      ).length;

      // Equation 1: vf = v0 + a*t
      if (v0 !== null && a !== null && t !== null && vf === null)
        vf = v0 + a * t;
      else if (vf !== null && a !== null && t !== null && v0 === null)
        v0 = vf - a * t;
      else if (vf !== null && v0 !== null && t !== null && a === null)
        a = (vf - v0) / t;
      else if (
        vf !== null &&
        v0 !== null &&
        a !== null &&
        t === null &&
        a !== 0
      )
        t = (vf - v0) / a;

      // Equation 2: d = v0*t + 0.5*a*t^2
      if (v0 !== null && a !== null && t !== null && d === null)
        d = v0 * t + 0.5 * a * t * t;
      else if (d !== null && a !== null && t !== null && v0 === null) {
        if (t !== 0) v0 = (d - 0.5 * a * t * t) / t;
      } else if (
        d !== null &&
        v0 !== null &&
        t !== null &&
        a === null &&
        t !== 0
      )
        a = (2 * (d - v0 * t)) / (t * t);
      else if (d !== null && v0 !== null && a !== null && t === null) {
        const roots = quadraticRoots(0.5 * a, v0, -d);
        if (roots.length === 1 && roots[0] >= 0) t = roots[0];
        else if (roots.length === 2) {
          // Prefer positive time or the smaller positive time
          const positiveRoots = roots.filter((root) => root >= 0);
          if (positiveRoots.length > 0) t = Math.min(...positiveRoots);
        }
      }

      // Equation 3: vf^2 = v0^2 + 2*a*d
      if (v0 !== null && a !== null && d !== null && vf === null) {
        const vf_squared = v0 * v0 + 2 * a * d;
        if (vf_squared >= 0) vf = Math.sqrt(vf_squared);
      } else if (vf !== null && a !== null && d !== null && v0 === null) {
        const v0_squared = vf * vf - 2 * a * d;
        if (v0_squared >= 0) v0 = Math.sqrt(v0_squared);
      } else if (
        vf !== null &&
        v0 !== null &&
        d !== null &&
        a === null &&
        d !== 0
      )
        a = (vf * vf - v0 * v0) / (2 * d);
      else if (
        vf !== null &&
        v0 !== null &&
        a !== null &&
        d === null &&
        a !== 0
      )
        d = (vf * vf - v0 * v0) / (2 * a);

      // Equation 4: d = 0.5 * (v0 + vf) * t
      if (v0 !== null && vf !== null && t !== null && d === null)
        d = 0.5 * (v0 + vf) * t;
      else if (d !== null && vf !== null && t !== null && v0 === null) {
        if (t !== 0) v0 = (2 * d) / t - vf;
      } else if (d !== null && v0 !== null && t !== null && vf === null) {
        if (t !== 0) vf = (2 * d) / t - v0;
      } else if (
        d !== null &&
        v0 !== null &&
        vf !== null &&
        t === null &&
        v0 + vf !== 0
      )
        t = (2 * d) / (v0 + vf);

      let currentSolvedCount = [v0, vf, a, t, d].filter(
        (val) => val !== null
      ).length;

      if (currentSolvedCount === initialSolvedCount) {
        // No more variables were solved in this iteration
        break;
      }
      solvedCount = currentSolvedCount;
    }

    if (solvedCount < 5) {
      errorMessageDiv.textContent =
        "Could not solve for all unknowns with the given inputs. Check your values.";
      errorMessageDiv.classList.remove("hidden");
    } else {
      errorMessageDiv.classList.add("hidden");
    }

    displayKinematicResults(v0, vf, a, t, d);
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
   * Note: This function currently requires a value for launch angle. If it's blank,
   * validation will prevent calculation and show an error. To find two solutions when
   * the angle is blank would require a more complex "inverse" projectile solver.
   */
  function handleProjectileCalculation() {
    const v0 = parseFloat(initialVelocityInput.value);
    // Standard gravity (positive value, direction handled in equations)
    const g_magnitude = parseFloat(accelerationInput.value);
    const h0 = parseFloat(initialHeightInput.value);
    const angleDeg = parseFloat(launchAngleInput.value); // This must have a value for current calculations

    // Input validation for projectile motion
    if (
      isNaN(v0) ||
      isNaN(g_magnitude) ||
      isNaN(h0) ||
      isNaN(angleDeg) || // This check is crucial: if angle is blank, it's NaN
      v0 < 0 ||
      g_magnitude <= 0 || // Gravity must be positive for magnitude
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

    const g_effective = -g_magnitude; // Apply negative for downward acceleration in equations

    // Convert angle to radians for calculations
    const angleRad = (angleDeg * Math.PI) / 180;

    // Compute horizontal and vertical components of initial velocity
    const v0x = v0 * Math.cos(angleRad);
    const v0y = v0 * Math.sin(angleRad);

    // Calculate time of flight (t) using quadratic formula for vertical motion:
    // y = h0 + v0y*t + 0.5*g_effective*t^2 = 0 (when projectile hits the ground)
    // => (0.5*g_effective)*t^2 + v0y*t + h0 = 0
    const roots = quadraticRoots(0.5 * g_effective, v0y, h0);

    // Filter for valid flight times (t > 0)
    // For h0 >= 0 and angle 0-90, there will typically be only one positive flight time to ground.
    const flightTimes = roots.filter((time) => time > 0);

    if (flightTimes.length === 0) {
      errorMessageDiv.textContent =
        "No valid flight time found for given parameters. Projectile might not hit the ground or inputs are invalid.";
      errorMessageDiv.classList.remove("hidden");
      clearOutputFields();
      return;
    }

    const t_flight = flightTimes[0]; // Take the first positive flight time

    // Calculate range (horizontal distance)
    const range = v0x * t_flight;

    // Calculate final vertical velocity component (vf_y) at impact
    const vf_y = v0y + g_effective * t_flight;
    // Calculate total final velocity magnitude
    const vf = Math.sqrt(vf_y * vf_y + v0x * v0x);

    displayProjectileResults(
      v0,
      vf,
      g_effective, // Display g with its sign for the equation
      t_flight,
      range,
      h0,
      angleDeg
    );
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
});
