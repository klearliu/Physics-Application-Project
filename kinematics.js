// kinematics.js

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
 * Assumes access to global DOM elements for output spans.
 * @param {number} v0 - Initial velocity.
 * @param {number} vf - Final velocity.
 * @param {number} a - Acceleration.
 * @param {number} t - Time.
 * @param {number} d - Displacement.
 */
function displayKinematicResults(v0, vf, a, t, d) {
  // These elements are assumed to be accessible in the global scope
  // or passed down from the main script if preferred. For simplicity
  // in this refactor, we'll assume they're accessible.
  // In a larger app, you might pass them as parameters or use a state management pattern.
  const solution1V0 = document.getElementById("output-v0-1");
  const solution1Vf = document.getElementById("output-vf-1");
  const solution1A = document.getElementById("output-a-1");
  const solution1T = document.getElementById("output-t-1");
  const solution1D = document.getElementById("output-d-1");
  const solution1HRow = document.getElementById("output-h-1-row");
  const solution1AngleRow = document.getElementById("output-angle-1-row");
  const solution2Container = document.getElementById("solution2-container"); // Assuming this is defined in index.html and accessible globally

  solution1V0.textContent = v0 !== null && !isNaN(v0) ? v0.toFixed(2) : "-";
  solution1Vf.textContent = vf !== null && !isNaN(vf) ? vf.toFixed(2) : "-";
  solution1A.textContent = a !== null && !isNaN(a) ? a.toFixed(2) : "-";
  solution1T.textContent = t !== null && !isNaN(t) ? t.toFixed(2) : "-";
  solution1D.textContent = d !== null && !isNaN(d) ? d.toFixed(2) : "-";

  // Hide projectile-specific rows for kinematic mode
  if (solution1HRow) solution1HRow.classList.add("hidden");
  if (solution1AngleRow) solution1AngleRow.classList.add("hidden");
  if (solution2Container) solution2Container.style.display = "none"; // Ensure second solution panel is hidden
}

/**
 * Handles the calculation of unknown kinematic variables based on user inputs.
 * It iteratively applies kinematic equations until all solvable variables are found.
 * Assumes access to input elements and errorMessageDiv.
 */
function handleKinematicCalculation() {
  const initialVelocityInput = document.getElementById("initial-velocity");
  const finalVelocityInput = document.getElementById("final-velocity");
  const accelerationInput = document.getElementById("acceleration");
  const timeInput = document.getElementById("time");
  const displacementInput = document.getElementById("displacement");
  const constantVelocityCheckbox = document.getElementById("constant-velocity");
  const errorMessageDiv = document.getElementById("error-message");

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
    if (v0 !== null && a !== null && t !== null && vf === null) vf = v0 + a * t;
    else if (vf !== null && a !== null && t !== null && v0 === null)
      v0 = vf - a * t;
    else if (vf !== null && v0 !== null && t !== null && a === null)
      a = (vf - v0) / t;
    else if (vf !== null && v0 !== null && a !== null && t === null && a !== 0)
      t = (vf - v0) / a;

    // Equation 2: d = v0*t + 0.5*a*t^2
    if (v0 !== null && a !== null && t !== null && d === null)
      d = v0 * t + 0.5 * a * t * t;
    else if (d !== null && a !== null && t !== null && v0 === null) {
      if (t !== 0) v0 = (d - 0.5 * a * t * t) / t;
    } else if (d !== null && v0 !== null && t !== null && a === null && t !== 0)
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
    else if (vf !== null && v0 !== null && a !== null && d === null && a !== 0)
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
    if (errorMessageDiv) {
      // Ensure errorMessageDiv exists before using
      errorMessageDiv.textContent =
        "Could not solve for all unknowns with the given inputs. Check your values.";
      errorMessageDiv.classList.remove("hidden");
    }
  } else {
    if (errorMessageDiv) errorMessageDiv.classList.add("hidden");
  }

  displayKinematicResults(v0, vf, a, t, d);
}

/**
 * Simulates kinematic motion, updating the object's position on the canvas over time.
 * @param {DOMHighResTimeStamp} currentTime - The current time provided by requestAnimationFrame.
 * @param {CanvasRenderingContext2D} ctx - The canvas 2D rendering context.
 * @param {HTMLCanvasElement} canvas - The HTML canvas element.
 * @param {function} drawObject - Function to draw the object.
 * @param {function} cancelAnimationFrame - Function to cancel animation frame.
 * @param {{current: number|null}} animationFrameIdRef - Reference to the animation frame ID.
 * @param {{current: number|null}} simulationStartTimeRef - Reference to the simulation start time.
 * @param {function} setSimulationStartTime - Function to set simulation start time.
 */
function simulateKinematic(
  currentTime,
  ctx,
  canvas,
  drawObject,
  cancelAnimationFrame,
  animationFrameIdRef,
  simulationStartTimeRef,
  setSimulationStartTime
) {
  if (!simulationStartTimeRef.current) {
    setSimulationStartTime(currentTime);
    // Ensure all kinematic values are calculated before starting simulation
    handleKinematicCalculation();
  }
  const elapsedTime = (currentTime - simulationStartTimeRef.current) / 1000; // Time in seconds

  // These elements are assumed to be accessible in the global scope.
  const solution1V0 = document.getElementById("output-v0-1");
  const solution1A = document.getElementById("output-a-1");
  const solution1T = document.getElementById("output-t-1");
  const solution1D = document.getElementById("output-d-1");

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
    cancelAnimationFrame(animationFrameIdRef.current);
    setSimulationStartTime(null); // Reset simulation start time
    return;
  }

  drawObject(currentDisplacement, 0); // Draw object at current position

  animationFrameIdRef.current = requestAnimationFrame((time) =>
    simulateKinematic(
      time,
      ctx,
      canvas,
      drawObject,
      cancelAnimationFrame,
      animationFrameIdRef,
      simulationStartTimeRef,
      setSimulationStartTime
    )
  ); // Continue animation
}
