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
 * @param {number} v0 - Initial velocity.
 * @param {number} vf - Final velocity.
 * @param {number} a - Acceleration.
 * @param {number} t - Time.
 * @param {number} d - Displacement.
 * @param {HTMLElement} solution1V0 - Output span for initial velocity.
 * @param {HTMLElement} solution1Vf - Output span for final velocity.
 * @param {HTMLElement} solution1A - Output span for acceleration.
 * @param {HTMLElement} solution1T - Output span for time.
 * @param {HTMLElement} solution1D - Output span for displacement.
 * @param {HTMLElement} solution1HRow - Output row for initial height.
 * @param {HTMLElement} solution1AngleRow - Output row for launch angle.
 * @param {HTMLElement} solution2Container - Container for solution 2.
 */
function displayKinematicResults(
  v0,
  vf,
  a,
  t,
  d,
  solution1V0,
  solution1Vf,
  solution1A,
  solution1T,
  solution1D,
  solution1HRow,
  solution1AngleRow,
  solution2Container
) {
  solution1V0.textContent = v0 !== null && !isNaN(v0) ? v0.toFixed(2) : "-";
  solution1Vf.textContent = vf !== null && !isNaN(vf) ? vf.toFixed(2) : "-";
  solution1A.textContent = a !== null && !isNaN(a) ? a.toFixed(2) : "-";
  solution1T.textContent = t !== null && !isNaN(t) ? t.toFixed(2) : "-";
  solution1D.textContent = d !== null && !isNaN(d) ? d.toFixed(2) : "-";

  if (solution1HRow) solution1HRow.classList.add("hidden");
  if (solution1AngleRow) solution1AngleRow.classList.add("hidden");
  if (solution2Container) solution2Container.style.display = "none";
}

/**
 * Handles the calculation of unknown kinematic variables based on user inputs.
 * It iteratively applies kinematic equations until all solvable variables are found.
 * @param {HTMLElement} initialVelocityInput - Input for initial velocity.
 * @param {HTMLElement} finalVelocityInput - Input for final velocity.
 * @param {HTMLElement} accelerationInput - Input for acceleration.
 * @param {HTMLElement} timeInput - Input for time.
 * @param {HTMLElement} displacementInput - Input for displacement.
 * @param {HTMLElement} constantVelocityCheckbox - Checkbox for constant velocity.
 * @param {HTMLElement} errorMessageDiv - The error message display div.
 */
function handleKinematicCalculation(
  initialVelocityInput,
  finalVelocityInput,
  accelerationInput,
  timeInput,
  displacementInput,
  constantVelocityCheckbox,
  errorMessageDiv
) {
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
  const maxIterations = 10;

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

    if (currentSolvedCount === initialSolvedCount) {
      break;
    }
    solvedCount = currentSolvedCount;
  }

  if (solvedCount < 5) {
    if (errorMessageDiv) {
      errorMessageDiv.textContent =
        "Could not solve for all unknowns with the given inputs. Check your values.";
      errorMessageDiv.classList.remove("hidden");
    }
  } else {
    if (errorMessageDiv) errorMessageDiv.classList.add("hidden");
  }

  // Pass output elements to display function
  displayKinematicResults(
    v0,
    vf,
    a,
    t,
    d,
    document.getElementById("output-v0-1"),
    document.getElementById("output-vf-1"),
    document.getElementById("output-a-1"),
    document.getElementById("output-t-1"),
    document.getElementById("output-d-1"),
    document.getElementById("output-h-1-row"),
    document.getElementById("output-angle-1-row"),
    document.getElementById("solution2-container")
  );
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
    // handleKinematicCalculation is called by buttons.js before starting simulation
  }
  const elapsedTime = (currentTime - simulationStartTimeRef.current) / 1000;

  const solution1V0 = document.getElementById("output-v0-1");
  const solution1A = document.getElementById("output-a-1");
  const solution1T = document.getElementById("output-t-1");
  const solution1D = document.getElementById("output-d-1");

  const v0 = parseFloat(solution1V0.textContent);
  const a = parseFloat(solution1A.textContent);
  const t_solved = parseFloat(solution1T.textContent);
  const d_solved = parseFloat(solution1D.textContent);

  let currentDisplacement =
    v0 * elapsedTime + 0.5 * a * elapsedTime * elapsedTime;

  const tolerance = 0.01;
  if (
    (t_solved && elapsedTime >= t_solved - tolerance) ||
    (d_solved &&
      Math.abs(currentDisplacement) >= Math.abs(d_solved) - tolerance &&
      Math.sign(currentDisplacement) === Math.sign(d_solved))
  ) {
    drawObject(d_solved, 0);
    cancelAnimationFrame(animationFrameIdRef.current);
    setSimulationStartTime(null);
    return;
  }

  drawObject(currentDisplacement, 0);

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
  );
}
