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

  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function drawAxes() {
    ctx.save();

    ctx.strokeStyle = "#888";
    ctx.lineWidth = 1;
    ctx.font = "10px Arial";
    ctx.fillStyle = "#333";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, canvas.height);
    ctx.stroke();

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

  function drawObject(x, y) {
    clearCanvas();
    if (projectileModeCheckbox.checked) {
      drawAxes();
    }

    const drawX = x * currentScale;
    let drawY;

    if (projectileModeCheckbox.checked) {
      drawY = canvas.height - y * currentScale;
    } else {
      drawY = canvas.height / 2;
    }

    ctx.beginPath();
    ctx.arc(drawX, drawY, objectRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#FF5733";
    ctx.fill();
    ctx.closePath();
  }

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

  function updateCalculateButtonState() {
    let count = 0;
    const isProjectile = projectileModeCheckbox.checked;

    allInputElements.forEach((input) => {
      if (input.value !== "" && !input.closest(".hidden")) {
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

    if (!isProjectile && constantVelocityCheckbox.checked) {
      count++;
      if (initialVelocityInput.value !== "") {
        count++;
      }
    }

    if (!isProjectile) {
      calculateButton.disabled = count < 3;
    } else {
      const v0_proj = parseFloat(initialVelocityInput.value);
      const h0_proj = parseFloat(initialHeightInput.value);
      const angleDeg_proj = parseFloat(launchAngleInput.value);
      const g_magnitude_proj = parseFloat(accelerationInput.value);

      const canCalculateProjectile =
        !isNaN(v0_proj) &&
        !isNaN(h0_proj) &&
        !isNaN(angleDeg_proj) &&
        !isNaN(g_magnitude_proj) &&
        v0_proj >= 0 &&
        g_magnitude_proj > 0 &&
        h0_proj >= 0 &&
        angleDeg_proj >= 0 &&
        angleDeg_proj <= 90;

      calculateButton.disabled = !canCalculateProjectile;
    }

    let startButtonEnabled = false;
    if (isProjectile) {
      startButtonEnabled = !calculateButton.disabled;
    } else {
      let v0 = parseFloat(initialVelocityInput.value);
      let vf = parseFloat(finalVelocityInput.value); // Added for simulation check
      let a = parseFloat(accelerationInput.value);
      let t = parseFloat(timeInput.value);
      let d = parseFloat(displacementInput.value);

      // Convert to null if NaN for consistent checking
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
        // For general kinematic, need v0 AND (a OR t OR d)
        // OR (vf AND a AND t) OR (v0 AND vf AND (a OR t OR d)) etc.
        // Simplified: at least one known velocity (v0 or vf)
        // and at least two other known variables (a, t, d) or derivable.

        // This revised logic for startButtonEnabled in kinematic mode is more robust
        // It should enable if enough values are present to fully solve, or if v0 + (a or t or d) are present.
        const knownCount = [v0, vf, a, t, d].filter(
          (val) => val !== null
        ).length;

        // At least 2 values given and if acceleration is missing, either time or displacement is needed to start.
        // If v0 is known, then (a or t or d) are needed.
        // If vf is known, then (v0 or a or t or d) are needed.
        // Minimum for simulation is generally V0 and A/T/D, or VF and V0/A/T/D.
        // Let's simplify: if we can calculate, we can simulate.
        // The kinematic calculation function needs 3 values to derive all 5.
        // For simulation, we primarily need:
        // 1. V0 and A (or implicitly A=0 for constant velocity)
        // 2. V0 and T
        // 3. V0 and D (can derive A, T)
        // 4. VF and A (can derive V0, T, D) -- but this would typically also imply a V0 or other start condition.

        // A simple rule for starting simulation:
        // If initial velocity is known AND (time is known OR displacement is known OR acceleration is known)
        // This allows V0,VF,T to work, as from them A can be calculated.
        if (v0 !== null) {
          // We need a starting point
          if (a !== null || t !== null || d !== null) {
            startButtonEnabled = true;
          } else if (vf !== null && t !== null) {
            // v0, vf, t provided implies 'a' can be calculated
            startButtonEnabled = true;
          } else if (vf !== null && a !== null) {
            // v0, vf, a provided implies 't' and 'd' can be calculated
            startButtonEnabled = true;
          }
        } else if (vf !== null) {
          // If final velocity is given but not initial, need at least 2 more
          if (a !== null && t !== null) {
            // vf, a, t implies v0 and d can be calculated
            startButtonEnabled = true;
          } else if (a !== null && d !== null) {
            // vf, a, d implies v0 and t can be calculated
            startButtonEnabled = true;
          } else if (t !== null && d !== null) {
            // vf, t, d implies v0 and a can be calculated
            startButtonEnabled = true;
          }
        }
      }
    }
    startButton.disabled = !startButtonEnabled;

    calculateButton.classList.toggle("bg-blue-600", !calculateButton.disabled);
    calculateButton.classList.toggle(
      "hover:bg-blue-700",
      !calculateButton.disabled
    );
    calculateButton.classList.toggle("bg-gray-400", calculateButton.disabled);

    startButton.classList.toggle("bg-blue-600", !startButton.disabled);
    startButton.classList.toggle("hover:bg-blue-700", !startButton.disabled);
    startButton.classList.toggle("bg-gray-400", startButton.disabled);

    if (calculateButton.disabled && startButton.disabled) {
      errorMessageDiv.textContent =
        "Enter at least three values to calculate, or sufficient values to start simulation.";
      errorMessageDiv.classList.remove("hidden");
    } else {
      errorMessageDiv.classList.add("hidden");
    }
  }

  function applyConstantVelocityState() {
    if (constantVelocityCheckbox.checked) {
      accelerationInput.value = "0";
      accelerationInput.disabled = true;
      accelerationInput.classList.add("bg-gray-200");
      finalVelocityInput.value = initialVelocityInput.value;
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

  function quadraticRoots(a, b, c) {
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return [];
    if (discriminant === 0) return [-b / (2 * a)];
    const sqrtDisc = Math.sqrt(discriminant);
    return [(-b + sqrtDisc) / (2 * a), (-b - sqrtDisc) / (2 * a)];
  }

  function displayKinematicResults(v0, vf, a, t, d) {
    solution1V0.textContent = v0 !== null && !isNaN(v0) ? v0.toFixed(2) : "-";
    solution1Vf.textContent = vf !== null && !isNaN(vf) ? vf.toFixed(2) : "-";
    solution1A.textContent = a !== null && !isNaN(a) ? a.toFixed(2) : "-";
    solution1T.textContent = t !== null && !isNaN(t) ? t.toFixed(2) : "-";
    solution1D.textContent = d !== null && !isNaN(d) ? d.toFixed(2) : "-";

    solution1HRow.classList.add("hidden");
    solution1AngleRow.classList.add("hidden");
    solution2Container.style.display = "none";
  }

  function handleKinematicCalculation() {
    let v0 = parseFloat(initialVelocityInput.value);
    let vf = parseFloat(finalVelocityInput.value);
    let a = parseFloat(accelerationInput.value);
    let t = parseFloat(timeInput.value);
    let d = parseFloat(displacementInput.value);

    if (constantVelocityCheckbox.checked) {
      a = 0;
    } else {
      a = isNaN(a) ? null : a;
    }

    v0 = isNaN(v0) ? null : v0;
    vf = isNaN(vf) ? null : vf;
    t = isNaN(t) ? null : t;
    d = isNaN(d) ? null : d;

    let solvedCount = 0;
    let maxIterations = 10;

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

  function displayProjectileResults(v0, vf, a, t, d, h0, angle) {
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

    solution2Container.style.display = "none";
    solution2V0.textContent = "-";
    solution2Vf.textContent = "-";
    solution2A.textContent = "-";
    solution2T.textContent = "-";
    solution2D.textContent = "-";
    solution2H.textContent = "-";
    solution2Angle.textContent = "-";
  }

  function handleProjectileCalculation() {
    const v0 = parseFloat(initialVelocityInput.value);
    const g_magnitude = parseFloat(accelerationInput.value);
    const h0 = parseFloat(initialHeightInput.value);
    const angleDeg = parseFloat(launchAngleInput.value);

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

    const g_effective = -g_magnitude;

    const angleRad = (angleDeg * Math.PI) / 180;

    const v0x = v0 * Math.cos(angleRad);
    const v0y = v0 * Math.sin(angleRad);

    const roots = quadraticRoots(0.5 * g_effective, v0y, h0);

    const flightTimes = roots.filter((time) => time > 0);

    if (flightTimes.length === 0) {
      errorMessageDiv.textContent =
        "No valid flight time found for given parameters. Projectile might not hit the ground or inputs are invalid.";
      errorMessageDiv.classList.remove("hidden");
      clearOutputFields();
      return;
    }

    const t_flight = flightTimes[0];

    const range = v0x * t_flight;

    finalRange = range;
    finalTimeOfFlight = t_flight;

    const vf_y = v0y + g_effective * t_flight;
    const vf = Math.sqrt(vf_y * vf_y + v0x * v0x);

    let max_y_value;
    if (v0y > 0) {
      const time_to_peak_from_launch = v0y / g_magnitude;
      const peak_height_above_launch =
        v0y * time_to_peak_from_launch -
        0.5 * g_magnitude * time_to_peak_from_launch * time_to_peak_from_launch;
      max_y_value = h0 + peak_height_above_launch;
    } else {
      max_y_value = h0;
    }

    max_y_value = Math.max(0.1, max_y_value);

    const paddingFactor = 1.1;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const requiredScaleX = canvasWidth / (range * paddingFactor);
    const requiredScaleY = canvasHeight / (max_y_value * paddingFactor);

    currentScale = Math.min(requiredScaleX, requiredScaleY);
    currentScale = Math.max(1, Math.min(100, currentScale));

    const targetSimulationDuration = 4;
    animationTimeScale = t_flight > 0 ? targetSimulationDuration / t_flight : 1;
    animationTimeScale = Math.max(0.1, Math.min(10, animationTimeScale));

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

  function updateProjectilePanelVisibility() {
    const isProjectile = projectileModeCheckbox.checked;

    if (isProjectile) {
      solution2Container.style.display = "none";
      resultsGrid.classList.add("md:grid-cols-1");
      resultsGrid.classList.remove("md:grid-cols-2");

      solution1HRow.classList.remove("hidden");
      solution1AngleRow.classList.remove("hidden");
    } else {
      solution2Container.style.display = "none";
      resultsGrid.classList.remove("md:grid-cols-2");
      resultsGrid.classList.add("md:grid-cols-1");
      solution1HRow.classList.add("hidden");
      solution1AngleRow.classList.add("hidden");
      solution2HRow.classList.add("hidden");
      solution2AngleRow.classList.add("hidden");
    }
  }

  function updateUIForMode() {
    const isProjectile = projectileModeCheckbox.checked;

    clearOutputFields();
    clearCanvas();

    displacementLabel.textContent = isProjectile
      ? "Horizontal Distance [m]"
      : "Displacement [m]";

    projectileInputsContainer.classList.toggle("hidden", !isProjectile);

    constantVelocityControlRow.classList.toggle("hidden", isProjectile);

    accelerationLabel.textContent = isProjectile
      ? "Gravity [m/s²]"
      : "Acceleration [m/s²]";

    if (isProjectile) {
      accelerationInput.value = "9.81";
      accelerationInput.disabled = false;
      accelerationInput.classList.remove("bg-gray-200");
      constantVelocityCheckbox.checked = false;
      finalVelocityInput.disabled = false;
      finalVelocityInput.classList.remove("bg-gray-200");
    } else {
      accelerationInput.value = "";
      accelerationInput.disabled = false;
      accelerationInput.classList.remove("bg-gray-200");
      applyConstantVelocityState();
    }

    updateCalculateButtonState();
    updateProjectilePanelVisibility();
  }

  function simulateKinematic(currentTime) {
    if (!simulationStartTime) {
      simulationStartTime = currentTime;
      // Re-calculate all kinematic variables here before simulation starts
      // This ensures we have 'a' and 'd' if they were missing but derivable.
      handleKinematicCalculation();
    }
    const elapsedTime = (currentTime - simulationStartTime) / 1000;

    // Use the *calculated* values for simulation, not just raw input values
    const v0 = parseFloat(solution1V0.textContent);
    const a = parseFloat(solution1A.textContent);
    const t_solved = parseFloat(solution1T.textContent); // Solved time
    const d_solved = parseFloat(solution1D.textContent); // Solved displacement

    let currentDisplacement =
      v0 * elapsedTime + 0.5 * a * elapsedTime * elapsedTime;

    // Stop conditions:
    // 1. If a total time (t_solved) was calculated, stop at that time.
    // 2. If a total displacement (d_solved) was calculated, stop when displacement reaches it.
    // Use Math.abs for displacement to handle negative displacement scenarios
    if (
      (t_solved && elapsedTime >= t_solved) ||
      (d_solved && Math.abs(currentDisplacement) >= Math.abs(d_solved))
    ) {
      // Ensure the object ends at the calculated final displacement
      drawObject(d_solved, 0);
      cancelAnimationFrame(animationFrameId);
      simulationStartTime = null;
      return;
    }

    drawObject(currentDisplacement, 0);

    animationFrameId = requestAnimationFrame(simulateKinematic);
  }

  function simulateProjectile(currentTime) {
    if (!simulationStartTime) {
      simulationStartTime = currentTime;
      handleProjectileCalculation();
    }
    let elapsedTime = (currentTime - simulationStartTime) / 1000;
    elapsedTime *= animationTimeScale;

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

    if (elapsedTime >= finalTimeOfFlight || currentY < -0.01) {
      drawObject(finalRange, 0);
      cancelAnimationFrame(animationFrameId);
      simulationStartTime = null;
      return;
    }

    drawObject(currentX, currentY);

    animationFrameId = requestAnimationFrame(simulateProjectile);
  }

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
  });

  calculateButton.addEventListener("click", function () {
    if (projectileModeCheckbox.checked) {
      handleProjectileCalculation();
    } else {
      handleKinematicCalculation();
    }
  });

  startButton.addEventListener("click", function () {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    simulationStartTime = null;

    if (projectileModeCheckbox.checked) {
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
      animationFrameId = requestAnimationFrame(simulateProjectile);
    } else {
      // Kinematic mode simulation start logic revised
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

      // Rule 1: Constant Velocity - need V0 and (T or D)
      if (constantVelocityCheckbox.checked) {
        if (v0 !== null && (t !== null || d !== null)) {
          canStartKinematicSimulation = true;
        }
      } else {
        // Rule 2: General Kinematic - need at least one known velocity (v0 or vf) AND two other known variables
        // We can leverage the `handleKinematicCalculation` to derive missing values,
        // so the actual start condition just needs to ensure *enough* information is present
        // to allow that calculation to succeed and provide needed values for simulation.
        // A simpler check: If the 'Calculate' button is enabled, then we have enough info to simulate.
        // Or if v0 is present, and at least one other parameter (a, t, d) is present.
        // Or if vf is present, and at least two other parameters are present to derive v0, a, t, d.

        // More explicit checks for simulation start:
        // We primarily need V0, and then A or T or D.
        if (v0 !== null && (a !== null || t !== null || d !== null)) {
          canStartKinematicSimulation = true;
        } else if (vf !== null) {
          // If starting with Vf but no V0, need more info to derive V0 for simulation start
          // E.g., Vf, A, T -> can get V0. Vf, A, D -> can get V0. Vf, T, D -> can get V0.
          const knownCountForVfStart = [vf, a, t, d].filter(
            (val) => val !== null
          ).length;
          if (knownCountForVfStart >= 3) {
            // Minimum three knowns to derive all others
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
      // Call handleKinematicCalculation here to ensure all solvable values are computed
      // and available in the output spans before simulation starts.
      handleKinematicCalculation();
      animationFrameId = requestAnimationFrame(simulateKinematic);
    }
  });

  resetButton.addEventListener("click", function () {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    simulationStartTime = null;
    clearCanvas();

    allInputElements.forEach((input) => {
      input.value = "";
      input.disabled = false;
      input.classList.remove("bg-gray-200");
    });
    constantVelocityCheckbox.checked = false;
    projectileModeCheckbox.checked = false;
    updateUIForMode();
    clearOutputFields();
  });

  updateUIForMode();
});
