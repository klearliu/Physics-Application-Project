
document.addEventListener("DOMContentLoaded", () => {
  const v0Input = document.getElementById("v0") || document.getElementById("velocity");
  const vInput = document.getElementById("v");
  const aInput = document.getElementById("a");
  const constantCheckbox = document.getElementById("constant");

  if (constantCheckbox) {
    constantCheckbox.addEventListener("change", () => {
      if (constantCheckbox.checked && !isNaN(parseFloat(v0Input.value))) {
        vInput.value = v0Input.value;
        vInput.disabled = true;
        aInput.value = 0;
        aInput.disabled = true;
      } else {
        vInput.disabled = false;
        aInput.disabled = false;
      }
    });
  }
});

function solve() {
  const g = parseFloat(document.getElementById("gravity")?.value || 9.81);
  const h0 = parseFloat(document.getElementById("initial-height")?.value || 0);
  const angleInput = parseFloat(document.getElementById("angle")?.value || 0);
  const v0 = parseFloat(document.getElementById("v0")?.value || document.getElementById("velocity")?.value || 0);

  // If we have a launch angle and velocity, solve projectile motion
  if (!isNaN(angleInput) && angleInput > 0 && !isNaN(v0) && v0 > 0) {
    solveProjectile(v0, angleInput, h0, g);
  } else {
    solveKinematics();
  }
}

function solveProjectile(v0, angleDeg, h0, g) {
  const angleRad = angleDeg * (Math.PI / 180);
  const vx = v0 * Math.cos(angleRad);
  const vy = v0 * Math.sin(angleRad);

  const flightTime = (vy + Math.sqrt(vy * vy + 2 * g * h0)) / g;
  const maxHeight = h0 + (vy * vy) / (2 * g);
  const range = vx * flightTime;

  // Output first solution
  document.getElementById("output-v0-1").innerText = v0.toFixed(2);
  document.getElementById("output-h-1").innerText = h0.toFixed(2);
  document.getElementById("output-angle-1").innerText = angleDeg.toFixed(2);
  document.getElementById("output-range-1").innerText = range.toFixed(2);
  document.getElementById("output-max-height-1").innerText = maxHeight.toFixed(2);
  document.getElementById("output-flight-time-1").innerText = flightTime.toFixed(2);

  // Second solution using complementary angle (if within 0-90 range)
  const angleDeg2 = 90 - angleDeg;
  if (angleDeg2 > 0) {
    const angleRad2 = angleDeg2 * (Math.PI / 180);
    const vx2 = v0 * Math.cos(angleRad2);
    const vy2 = v0 * Math.sin(angleRad2);
    const flightTime2 = (vy2 + Math.sqrt(vy2 * vy2 + 2 * g * h0)) / g;
    const maxHeight2 = h0 + (vy2 * vy2) / (2 * g);
    const range2 = vx2 * flightTime2;

    document.getElementById("output-v0-2").innerText = v0.toFixed(2);
    document.getElementById("output-h-2").innerText = h0.toFixed(2);
    document.getElementById("output-angle-2").innerText = angleDeg2.toFixed(2);
    document.getElementById("output-range-2").innerText = range2.toFixed(2);
    document.getElementById("output-max-height-2").innerText = maxHeight2.toFixed(2);
    document.getElementById("output-flight-time-2").innerText = flightTime2.toFixed(2);
  }
}

function solveKinematics() {
  let v0 = parseFloat(document.getElementById("v0")?.value || document.getElementById("velocity")?.value || 0);
  let v = parseFloat(document.getElementById("v")?.value || 0);
  let a = parseFloat(document.getElementById("a")?.value || 0);
  let t = parseFloat(document.getElementById("t")?.value || 0);
  let x = parseFloat(document.getElementById("x")?.value || 0);

  // Count how many values are filled in
  let filled = [!isNaN(v0), !isNaN(v), !isNaN(a), !isNaN(t), !isNaN(x)].filter(Boolean).length;
  if (filled < 3) {
    alert("Please enter at least three known values to calculate the others.");
    return;
  }

  // Solve missing values based on equations of motion
  if (isNaN(v) && !isNaN(v0) && !isNaN(a) && !isNaN(t)) {
    v = v0 + a * t;
  }

  if (isNaN(x) && !isNaN(v0) && !isNaN(t) && !isNaN(a)) {
    x = v0 * t + 0.5 * a * t * t;
  }

  if (isNaN(t) && !isNaN(v) && !isNaN(v0) && !isNaN(a) && a !== 0) {
    t = (v - v0) / a;
  }

  if (isNaN(v0) && !isNaN(v) && !isNaN(a) && !isNaN(t)) {
    v0 = v - a * t;
  }

  if (isNaN(a) && !isNaN(v) && !isNaN(v0) && !isNaN(t) && t !== 0) {
    a = (v - v0) / t;
  }

  // Update UI
  document.getElementById("output-v0")?.innerText = v0.toFixed(2);
  document.getElementById("output-v")?.innerText = v.toFixed(2);
  document.getElementById("output-a")?.innerText = a.toFixed(2);
  document.getElementById("output-t")?.innerText = t.toFixed(2);
  document.getElementById("output-x")?.innerText = x.toFixed(2);
}
