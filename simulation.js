/**
 * Initializes simulation-related functions and state.
 * @param {object} params - An object containing all necessary DOM elements and shared state.
 * @param {HTMLCanvasElement} params.canvas - The HTML canvas element.
 * @param {CanvasRenderingContext2D} params.ctx - The canvas 2D rendering context.
 * @param {number} params.objectRadius - Radius of the simulated object.
 * @param {HTMLElement} params.projectileModeCheckbox - The checkbox for projectile mode.
 * @param {HTMLElement} params.errorMessageDiv - The error message display div.
 * @param {HTMLElement} params.initialVelocityInput - Input for initial velocity.
 * @param {HTMLElement} params.accelerationInput - Input for acceleration/gravity.
 * @param {HTMLElement} params.initialHeightInput - Input for initial height (projectile).
 * @param {HTMLElement} params.launchAngleInput - Input for launch angle (projectile).
 * @param {HTMLElement} params.solution1A - Output span for acceleration.
 * @param {HTMLElement} params.solution1H - Output span for initial height.
 * @param {HTMLElement} params.solution1Angle - Output span for launch angle.
 * @param {HTMLElement} params.solution1V0 - Output span for initial velocity.
 * @param {HTMLElement} params.solution1Vf - Output span for final velocity.
 * @param {HTMLElement} params.solution1T - Output span for time.
 * @param {HTMLElement} params.solution1D - Output span for displacement.
 * @param {HTMLElement} params.solution1HRow - Output row for initial height.
 * @param {HTMLElement} params.solution1AngleRow - Output row for launch angle.
 * @param {HTMLElement} params.solution2Container - Container for solution 2.
 * @param {HTMLElement} params.solution2V0 - Output span for initial velocity (solution 2).
 * @param {HTMLElement} params.solution2Vf - Output span for final velocity (solution 2).
 * @param {HTMLElement} params.solution2A - Output span for acceleration (solution 2).
 * @param {HTMLElement} params.solution2T - Output span for time (solution 2).
 * @param {HTMLElement} params.solution2D - Output span for displacement (solution 2).
 * @param {HTMLElement} params.solution2H - Output span for initial height (solution 2).
 * @param {HTMLElement} params.solution2Angle - Output span for launch angle (solution 2).
 * @param {function} params.clearOutputFields - Function to clear output fields.
 * @param {function} params.quadraticRoots - Function to solve quadratic equations (from kinematics.js).
 * @param {{current: number|null}} params.animationFrameIdRef - Reference to the animation frame ID.
 * @param {{current: number|null}} params.simulationStartTimeRef - Reference to the simulation start time.
 * @param {function} params.setSimulationStartTime - Helper to set simulation start time.
 * @param {{current: number}} params.currentScaleRef - Reference to the current canvas scale.
 * @param {{current: number}} params.animationTimeScaleRef - Reference to the animation speed scale.
 * @param {{current: number}} params.finalRangeRef - Reference to the calculated final range.
 * @param {{current: number}} params.finalTimeOfFlightRef - Reference to the calculated final time of flight.
 */
function initializeSimulation(params) {
  const {
    canvas,
    ctx,
    objectRadius,
    projectileModeCheckbox,
    errorMessageDiv,
    initialVelocityInput,
    accelerationInput,
    initialHeightInput,
    launchAngleInput,
    solution1A,
    solution1H,
    solution1Angle,
    solution1V0,
    solution1Vf,
    solution1T,
    solution1D,
    solution1HRow,
    solution1AngleRow,
    solution2Container,
    solution2V0,
    solution2Vf,
    solution2A,
    solution2T,
    solution2D,
    solution2H,
    solution2Angle,
    clearOutputFields,
    quadraticRoots,
    animationFrameIdRef,
    simulationStartTimeRef,
    setSimulationStartTime,
    currentScaleRef,
    animationTimeScaleRef,
    finalRangeRef,
    finalTimeOfFlightRef,
  } = params;

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
    if (finalRangeRef.current > 500) xStep = 100;
    else if (finalRangeRef.current > 100) xStep = 50;
    else if (finalRangeRef.current > 50) xStep = 20;
    else if (finalRangeRef.current > 20) xStep = 10;
    else if (finalRangeRef.current > 5) xStep = 5;
    else xStep = 1;

    for (
      let xMeters = 0;
      xMeters <= finalRangeRef.current * 1.1 + xStep;
      xMeters += xStep
    ) {
      const drawX = xMeters * currentScaleRef.current;
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
    let maxDisplayedHeight = canvas.height / currentScaleRef.current;
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
      const drawY = canvas.height - yMeters * currentScaleRef.current;
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

    const drawX = x * currentScaleRef.current;
    let drawY;

    if (projectileModeCheckbox.checked) {
      drawY = canvas.height - y * currentScaleRef.current; // Invert Y for canvas coordinates
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

    finalRangeRef.current = range;
    finalTimeOfFlightRef.current = t_flight;

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

    currentScaleRef.current = Math.min(requiredScaleX, requiredScaleY); // Use the smaller scale to fit both dimensions
    currentScaleRef.current = Math.max(
      1,
      Math.min(100, currentScaleRef.current)
    ); // Clamp scale to reasonable values

    // Adjust animation speed based on total flight time
    const targetSimulationDuration = 4; // seconds
    animationTimeScaleRef.current =
      t_flight > 0 ? targetSimulationDuration / t_flight : 1;
    animationTimeScaleRef.current = Math.max(
      0.1,
      Math.min(10, animationTimeScaleRef.current)
    ); // Clamp animation speed

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
   * Simulates projectile motion, updating the object's position on the canvas over time.
   * @param {DOMHighResTimeStamp} currentTime - The current time provided by requestAnimationFrame.
   */
  function simulateProjectile(currentTime) {
    if (!simulationStartTimeRef.current) {
      setSimulationStartTime(currentTime);
      handleProjectileCalculation(); // Ensure projectile values are calculated before starting
    }
    let elapsedTime = (currentTime - simulationStartTimeRef.current) / 1000;
    elapsedTime *= animationTimeScaleRef.current; // Adjust animation speed

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
    if (
      elapsedTime >= finalTimeOfFlightRef.current - tolerance ||
      currentY < -tolerance
    ) {
      drawObject(finalRangeRef.current, 0); // Ensure object lands at the calculated range
      cancelAnimationFrame(animationFrameIdRef.current);
      setSimulationStartTime(null); // Reset simulation start time
      return;
    }

    drawObject(currentX, currentY); // Draw object at current position

    animationFrameIdRef.current = requestAnimationFrame(simulateProjectile); // Continue animation
  }

  // Expose functions for other modules to use
  return {
    clearCanvas,
    drawObject,
    handleProjectileCalculation,
    simulateProjectile,
  };
}
