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

  const solution1V0 = document.getElementById("output-v0-1");
  const solution1Vf = document.getElementById("output-vf-1");
  const solution1A = document.getElementById("output-a-1");
  const solution1T = document.getElementById("output-t-1");
  const solution1D = document.getElementById("output-d-1");
  const solution1H = document.getElementById("output-h-1");
  const solution1HRow = document.getElementById("output-h-1-row");
  const solution1Angle = document.getElementById("output-angle-1");
  const solution1AngleRow = document.getElementById("output-angle-1-row");

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

  const canvas = document.getElementById("simulation-canvas");
  const ctx = canvas.getContext("2d");
  const objectRadius = 5;

  let animationFrameId;
  let simulationStartTime;

  let currentScale = 10;
  let animationTimeScale = 1;

  let finalRange = 0;
  let finalTimeOfFlight = 0;

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

    for (
      let xMeters = 0;
      xMeters <= finalRange * 1.1 + xStep;
      xMeters += xStep
    ) {
      const drawX = xMeters * currentScale;
      if (drawX > canvas.width) break;

      ctx.beginPath();
      ctx.moveTo(drawX, canvas.height);
      ctx.lineTo(drawX, canvas.height - 5);
      ctx.stroke();
      ctx.fillText(xMeters.toFixed(0), drawX, canvas.height - 8);
    }
    ctx.fillText(
      "Horizontal Distance (m)",
      canvas.width / 2,
      canvas.height - 25
    );

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

  /**
   * Updates the disabled state of the Calculate and Start Simulation buttons
   * based on the number of valid inputs and the current mode (kinematic/projectile).
   */
  function updateCalculateButtonState() {
    let count = 0;
    const isProjectile = projectileModeCheckbox.checked;

    // Count valid inputs for kinematic mode
    allInputElements.forEach((input) => {
      if (input.value !== "" && !input.closest(".hidden")) {
        // Exclude acceleration/final velocity if constant velocity is checked and not in projectile mode
        if (
          !(
            constantVelocityCheckbox.checked &&
            !isProjectile &&
            (input.id === "acceleration" || input.id === "final-velocity")
          )
        ) {
          count++;
        }
      }
    });

    // Adjust count for constant velocity mode specifically
    if (!isProjectile && constantVelocityCheckbox.checked) {
      // If constant velocity, acceleration and final velocity are derived,
      // so we need initial velocity and one other (time or displacement)
      if (initialVelocityInput.value !== "") {
        count++; // Initial velocity counts as a known
      }
      // No need to increment for acceleration/final velocity as they are fixed
    }

    let canCalculate = false;
    if (!isProjectile) {
      // Kinematic mode: need at least 3 values to calculate all 5
      canCalculate = count >= 3;
    } else {
      // Projectile mode: need all 4 specific inputs (v0, h0, angle, gravity)
      const v0_proj = parseFloat(initialVelocityInput.value);
      const h0_proj = parseFloat(initialHeightInput.value);
      const angleDeg_proj = parseFloat(launchAngleInput.value);
      const g_magnitude_proj = parseFloat(accelerationInput.value); // Gravity input

      canCalculate =
        !isNaN(v0_proj) &&
        !isNaN(h0_proj) &&
        !isNaN(angleDeg_proj) &&
        !isNaN(g_magnitude_proj) &&
        v0_proj >= 0 &&
        g_magnitude_proj > 0 &&
        h0_proj >= 0 &&
        angleDeg_proj >= 0 &&
        angleDeg_proj <= 90;
    }
    calculateButton.disabled = !canCalculate;

    let startButtonEnabled = false;
    if (isProjectile) {
      // Projectile simulation requires all 4 inputs to be valid
      startButtonEnabled = canCalculate;
    } else {
      // Kinematic simulation: need enough info to determine V0 and either A, T, or D
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
        // For constant velocity, need v0 AND (t OR d)
        if (v0 !== null && (t !== null || d !== null)) {
          startButtonEnabled = true;
        }
      } else {
        // For general kinematic, if V0 is known, need at least one other (A, T, or D)
        if (v0 !== null && (a !== null || t !== null || d !== null)) {
          startButtonEnabled = true;
        }
        // If V0 is not known, but VF is, need at least two more to derive V0
        else if (vf !== null) {
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
   * Solves a quadratic equation for its roots.
   * @param {number} a - Coefficient of the squared term.
   * @param {number} b - Coefficient of the linear term.
   * @param {number} c - Constant term.
   * @returns {number[]} An array containing the real roots.
   */
  function quadraticRoots(a, b, c) {
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return []; // No real roots
    if (discriminant === 0) return [-b / (2 * a)]; // One real root
    const sqrtDisc = Math.sqrt(discriminant);
    return [(-b + sqrtDisc) / (2 * a), (-b - sqrtDisc) / (2 * a)]; // Two real roots
  }

  /**
   * Displays the calculated kinematic results in the solution panel.
   * @param {number} v0 - Initial velocity.
   * @param {number} vf - Final velocity.
   * @param {number} a - Acceleration.
   * @param {number} t - Time.
   * @param {number} d - Displacement.
   */
  function displayKinematicResults(v0, vf, a, t, d) {
    solution1V0.textContent = v0 !== null && !isNaN(v0) ? v0.toFixed(2) : "-";
    solution1Vf.textContent = vf !== null && !isNaN(vf) ? vf.toFixed(2) : "-";
    solution1A.textContent = a !== null && !isNaN(a) ? a.toFixed(2) : "-";
    solution1T.textContent = t !== null && !isNaN(t) ? t.toFixed(2) : "-";
    solution1D.textContent = d !== null && !isNaN(d) ? d.toFixed(2) : "-";

    // Hide projectile-specific rows for kinematic mode
    solution1HRow.classList.add("hidden");
    solution1AngleRow.classList.add("hidden");
    solution2Container.style.display = "none"; // Ensure second solution panel is hidden
  }

  /**
   * Handles the calculation of unknown kinematic variables based on user inputs.
   * It iteratively applies kinematic equations until all solvable variables are found.
   */
  function handleKinematicCalculation() {
    let v0 = parseFloat(initialVelocityInput.value);
    let vf = parseFloat(finalVelocityInput.value);
    let a = parseFloat(accelerationInput.value);
    let t = parseFloat(timeInput.value);
    let d = parseFloat(displacementInput.value);

    // If constant velocity is checked, force acceleration to 0
    if (constantVelocityCheckbox.checked) {
      a = 0;
    } else {
      a = isNaN(a) ? null : a;
    }

    // Convert NaN inputs to null for consistent checking
    v0 = isNaN(v0) ? null : v0;
    vf = isNaN(vf) ? null : vf;
    t = isNaN(t) ? null : t;
    d = isNaN(d) ? null : d;

    let solvedCount = 0;
    const maxIterations = 10; // Prevent infinite loops in case of unsolvable inputs

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
        // Take the positive root for time
        if (roots.length === 1 && roots[0] >= 0) t = roots[0];
        else if (roots.length === 2) {
          const positiveRoots = roots.filter((root) => root >= 0);
          if (positiveRoots.length > 0) t = Math.min(...positiveRoots);
        }
      }

      // Equation 3: vf^2 = v0^2 + 2*a*d
      if (v0 !== null && a !== null && d !== null && vf === null) {
        const vf_squared = v0 * v0 + 2 * a * d;
        if (vf_squared >= 0) vf = Math.sqrt(vf_squared); // Take positive square root for speed
      } else if (vf !== null && a !== null && d !== null && v0 === null) {
        const v0_squared = vf * vf - 2 * a * d;
        if (v0_squared >= 0) v0 = Math.sqrt(v0_squared); // Take positive square root for speed
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

      // If no new variables were solved in this iteration, break the loop
      if (currentSolvedCount === initialSolvedCount) {
        break;
      }
      solvedCount = currentSolvedCount;
    }

    // Display error if not all 5 variables could be solved
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
    const roots = quadraticRoots(0.5 * g_effective, v0y, h0);

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

    displayProjectileResults(
      v0,
      vf,
      g_effective,
      t_flight,
      range,
      h0,
      angleDeg
    );
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
    } else {
      solution2Container.style.display = "none"; // Hide second solution panel
      resultsGrid.classList.remove("md:grid-cols-2"); // Ensure single column layout
      resultsGrid.classList.add("md:grid-cols-1");
      solution1HRow.classList.add("hidden"); // Hide projectile-specific output rows
      solution1AngleRow.classList.add("hidden");
      solution2HRow.classList.add("hidden");
      solution2AngleRow.classList.add("hidden");
    }
  }

  /**
   * Updates the UI elements based on whether projectile mode is active or not.
   * This includes clearing inputs, setting defaults, and managing required attributes.
   */
  function updateUIForMode() {
    const isProjectile = projectileModeCheckbox.checked;

    clearOutputFields(); // Clears output spans and hides projectile-specific rows

    // Clear ALL input fields first
    allInputElements.forEach((input) => {
      input.value = "";
      input.disabled = false; // Ensure they are re-enabled before specific disabling
      input.classList.remove("bg-gray-200");
    });
    constantVelocityCheckbox.checked = false; // Always uncheck constant velocity when mode changes

    // Update label for displacement input
    displacementLabel.textContent = isProjectile
      ? "Horizontal Distance [m]"
      : "Displacement [m]";

    // Toggle visibility of projectile-specific input container
    projectileInputsContainer.classList.toggle("hidden", !isProjectile);

    // Toggle visibility of constant velocity control row
    constantVelocityControlRow.classList.toggle("hidden", isProjectile);

    // Update label for acceleration input
    accelerationLabel.textContent = isProjectile
      ? "Gravity [m/s²]"
      : "Acceleration [m/s²]";

    if (isProjectile) {
      accelerationInput.value = "9.81"; // Set gravity default for projectile mode
      // Set required attributes for projectile mode inputs
      accelerationInput.setAttribute("required", "true");
      initialHeightInput.setAttribute("required", "true");
      launchAngleInput.setAttribute("required", "true");
    } else {
      // Remove required attributes when not in projectile mode
      accelerationInput.removeAttribute("required");
      initialHeightInput.removeAttribute("required");
      launchAngleInput.removeAttribute("required");
      // Apply constant velocity state if it was checked (though it's unchecked above, this ensures correct state)
      applyConstantVelocityState();
    }

    updateCalculateButtonState(); // Re-evaluate button states
    updateProjectilePanelVisibility(); // Adjust panel visibility
  }

  /**
   * Simulates kinematic motion, updating the object's position on the canvas over time.
   * @param {DOMHighResTimeStamp} currentTime - The current time provided by requestAnimationFrame.
   */
  function simulateKinematic(currentTime) {
    if (!simulationStartTime) {
      simulationStartTime = currentTime;
      // Ensure all kinematic values are calculated before starting simulation
      handleKinematicCalculation();
    }
    const elapsedTime = (currentTime - simulationStartTime) / 1000; // Time in seconds

    // Use the *calculated* values for simulation
    const v0 = parseFloat(solution1V0.textContent);
    const a = parseFloat(solution1A.textContent);
    const t_solved = parseFloat(solution1T.textContent); // Solved total time
    const d_solved = parseFloat(solution1D.textContent); // Solved total displacement

    // Calculate current displacement
    let currentDisplacement =
      v0 * elapsedTime + 0.5 * a * elapsedTime * elapsedTime;

    // Stop conditions:
    // 1. If a total time (t_solved) was calculated, stop when elapsed time reaches it.
    // 2. If a total displacement (d_solved) was calculated, stop when current displacement reaches it.
    // Use a small tolerance for floating point comparisons
    const tolerance = 0.01;
    if (
      (t_solved && elapsedTime >= t_solved - tolerance) ||
      (d_solved &&
        Math.abs(currentDisplacement) >= Math.abs(d_solved) - tolerance &&
        Math.sign(currentDisplacement) === Math.sign(d_solved))
    ) {
      // Ensure the object ends exactly at the calculated final displacement
      drawObject(d_solved, 0);
      cancelAnimationFrame(animationFrameId);
      simulationStartTime = null; // Reset simulation start time
      return;
    }

    drawObject(currentDisplacement, 0); // Draw object at current position

    animationFrameId = requestAnimationFrame(simulateKinematic); // Continue animation
  }

  /**
   * Simulates projectile motion, updating the object's position on the canvas over time.
   * @param {DOMHighResTimeStamp} currentTime - The current time provided by requestAnimationFrame.
   */
  function simulateProjectile(currentTime) {
    if (!simulationStartTime) {
      simulationStartTime = currentTime;
      handleProjectileCalculation(); // Ensure projectile values are calculated before starting
    }
    let elapsedTime = (currentTime - simulationStartTime) / 1000;
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
      cancelAnimationFrame(animationFrameId);
      simulationStartTime = null; // Reset simulation start time
      return;
    }

    drawObject(currentX, currentY); // Draw object at current position

    animationFrameId = requestAnimationFrame(simulateProjectile); // Continue animation
  }

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
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId); // Cancel any ongoing animation
    }
    simulationStartTime = null; // Reset simulation time

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
      animationFrameId = requestAnimationFrame(simulateProjectile); // Start projectile simulation
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
      animationFrameId = requestAnimationFrame(simulateKinematic); // Start kinematic simulation
    }
  });

  // Reset button click handler
  resetButton.addEventListener("click", function () {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId); // Cancel any ongoing animation
    }
    simulationStartTime = null; // Reset simulation time
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

  // Initial UI setup when the page loads
  updateUIForMode();
});
