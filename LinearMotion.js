/**
 * Solves a quadratic equation $ax^2 + bx + c = 0$ for its roots.
 * @param {number} a - Coefficient a.
 * @param {number} b - Coefficient b.
 * @param {number} c - Coefficient c.
 * @returns {number[]} An array of real roots.
 */
export function quadraticRoots(a, b, c) {
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return []; // no real roots
  if (discriminant === 0) return [-b / (2 * a)];
  const sqrtDisc = Math.sqrt(discriminant);
  return [(-b + sqrtDisc) / (2 * a), (-b - sqrtDisc) / (2 * a)];
}

/**
 * Calculates kinematic motion parameters based on provided inputs.
 * @param {number|null} v0_in - Initial velocity.
 * @param {number|null} vf_in - Final velocity.
 * @param {number|null} a_in - Acceleration.
 * @param {number|null} t_in - Time.
 * @param {number|null} d_in - Displacement.
 * @returns {{v0: number|null, vf: number|null, a: number|null, t: number|null, d: number|null, solvedCount: number, errorMessage: string|null}}
 */
export function calculateKinematics(v0_in, vf_in, a_in, t_in, d_in) {
  let v0 = v0_in;
  let vf = vf_in;
  let a = a_in;
  let t = t_in;
  let d = d_in;

  let solvedCount = 0;
  let maxIterations = 10; // Prevent infinite loops

  for (let i = 0; i < maxIterations; i++) {
    let initialSolvedCount = [v0, vf, a, t, d].filter(
      (val) => val !== null
    ).length;

    // Equation 1: vf = v0 + a*t
    if (v0 !== null && a !== null && t !== null && vf === null) vf = v0 + a * t;
    else if (vf !== null && a !== null && t !== null && v0 === null)
      v0 = vf - a * t;
    else if (vf !== null && v0 !== null && t !== null && a === null && t !== 0)
      // Added t !== 0 check
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
      // Added (v0 + vf) !== 0 check
      t = (2 * d) / (v0 + vf);

    let currentSolvedCount = [v0, vf, a, t, d].filter(
      (val) => val !== null
    ).length;

    if (currentSolvedCount === initialSolvedCount) {
      break;
    }
    solvedCount = currentSolvedCount;
  }

  let errorMessage = null;
  if (solvedCount < 5) {
    errorMessage =
      "Could not solve for all unknowns with the given inputs. Check your values.";
  }

  return { v0, vf, a, t, d, solvedCount, errorMessage };
}

/**
 * Calculates projectile motion parameters.
 * @param {number} v0_in - Initial velocity.
 * @param {number} g_magnitude_in - Gravity magnitude (positive value).
 * @param {number} h0_in - Initial height.
 * @param {number|null} angleDeg_in - Launch angle in degrees.
 * @returns {{v0: number, vf: number, a: number, t: number, d: number, h0: number, angle: number, errorMessage: string|null}}
 */
export function calculateProjectile(v0_in, g_magnitude_in, h0_in, angleDeg_in) {
  // Input validation for projectile motion
  if (
    isNaN(v0_in) ||
    isNaN(g_magnitude_in) ||
    isNaN(h0_in) ||
    v0_in < 0 ||
    g_magnitude_in <= 0 || // Gravity must be positive for magnitude
    h0_in < 0
  ) {
    return {
      errorMessage:
        "Please enter valid positive numbers for Initial Velocity, Gravity, and Initial Height.",
    };
  }

  let angleDeg = angleDeg_in;
  let errorMessage = null;

  // The current logic assumes angle is given.
  if (isNaN(angleDeg) || angleDeg < 0 || angleDeg > 90) {
    errorMessage =
      "Please enter a Launch Angle between 0-90 degrees for calculation.";
    return { errorMessage };
  }

  const g_effective = -g_magnitude_in; // Apply negative for downward acceleration in equations

  // Convert angle to radians for calculations
  const angleRad = (angleDeg * Math.PI) / 180;

  // Compute horizontal and vertical components of initial velocity
  const v0x = v0_in * Math.cos(angleRad);
  const v0y = v0_in * Math.sin(angleRad);

  // Calculate time of flight (t) using quadratic formula for vertical motion:
  // y = h0 + v0y*t + 0.5*g_effective*t^2 = 0 (when projectile hits the ground)
  // => (0.5*g_effective)*t^2 + v0y*t + h0 = 0
  const roots = quadraticRoots(0.5 * g_effective, v0y, h0_in);

  // Filter for valid flight times (t > 0)
  const flightTimes = roots.filter((time) => time > 0);

  if (flightTimes.length === 0) {
    errorMessage =
      "No valid flight time found for given parameters. Projectile might not hit the ground or inputs are invalid.";
    return { errorMessage };
  }

  const t_flight = flightTimes[0]; // Take the first positive flight time

  // Calculate range (horizontal distance)
  const range = v0x * t_flight;

  // Calculate final vertical velocity component (vf_y) at impact
  const vf_y = v0y + g_effective * t_flight;
  // Calculate total final velocity magnitude
  const vf = Math.sqrt(vf_y * vf_y + v0x * v0x);

  return {
    v0: v0_in,
    vf,
    a: g_effective, // Display g with its sign for the equation
    t: t_flight,
    d: range,
    h0: h0_in,
    angle: angleDeg,
    errorMessage: null,
  };
}
