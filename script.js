document.addEventListener('DOMContentLoaded', () => {
  const v0Input = document.getElementById('v0');
  const vInput = document.getElementById('v');
  const aInput = document.getElementById('a');
  const constantCheckbox = document.getElementById('constant');

  // Event listener for the constant checkbox
  constantCheckbox.addEventListener('change', () => {
    if (constantCheckbox.checked && !isNaN(parseFloat(v0Input.value))) {
      vInput.value = v0Input.value; // Set final velocity to initial velocity
      vInput.disabled = true; // Disable final velocity input
      aInput.value = 0; // Set acceleration to 0
      aInput.disabled = true; // Disable acceleration input
    } else {
      vInput.disabled = false; // Enable final velocity input
      aInput.disabled = false; // Enable acceleration input
    }
  });
});

function solve() {
  let v0 = parseFloat(document.getElementById('v0').value);
  let v = parseFloat(document.getElementById('v').value);
  let a = parseFloat(document.getElementById('a').value);
  let t = parseFloat(document.getElementById('t').value);
  let x = parseFloat(document.getElementById('x').value);

  const known = {
    v0: !isNaN(v0),
    v: !isNaN(v),
    a: !isNaN(a),
    t: !isNaN(t),
    x: !isNaN(x)
  };

  // 1. Solve time using quadratic: x = v0*t + 0.5*a*t^2
  if (!known.t && known.v0 && known.a && known.x) {
    const discriminant = v0 * v0 + 2 * a * x;
    if (a === 0) {
      // Linear case
      t = x / v0;
      known.t = true;
    } else if (discriminant >= 0) {
      const root1 = (-v0 + Math.sqrt(discriminant)) / a;
      const root2 = (-v0 - Math.sqrt(discriminant)) / a;
      t = Math.max(root1, root2); // Use the positive time
      known.t = true;
    }
  }

  // 2. Solve final velocity using: v² = v0² + 2ax
  if (!known.v && known.v0 && known.a && known.x) {
    const underRoot = v0 * v0 + 2 * a * x;
    if (underRoot >= 0) {
      v = Math.sqrt(underRoot);
      known.v = true;
    }
  }

  // 3. If v, v0, a → t
  if (!known.t && known.v && known.v0 && known.a) {
    t = (v - v0) / a;
    known.t = true;
  }

  // 4. If x, v0, t → a
  if (!known.a && known.x && known.v0 && known.t) {
    a = (x - v0 * t) * 2 / (t * t);
    known.a = true;
  }

  // 5. If v, v0, a → x
  if (!known.x && known.v && known.v0 && known.a) {
    x = (v * v - v0 * v0) / (2 * a);
    known.x = true;
  }

  // 6. If v0, a, t → v
  if (!known.v && known.v0 && known.a && known.t) {
    v = v0 + a * t;
    known.v = true;
  }

  // 7. If v, a, t → v0
  if (!known.v0 && known.v && known.a && known.t) {
    v0 = v - a * t;
    known.v0 = true;
  }

  // 8. If v0, t, a → x
  if (!known.x && known.v0 && known.t && known.a) {
    x = v0 * t + 0.5 * a * t * t;
    known.x = true;
  }

  // 9. If x, v0, v → t
  if (!known.t && known.x && known.v0 && known.v) {
    t = (2 * x) / (v + v0);
    known.t = true;
  }

  // 10. If x, t, v → v0
  if (!known.v0 && known.x && known.t && known.v) {
    v0 = (2 * x / t) - v;
    known.v0 = true;
  }

  // New calculations for acceleration and displacement if v0, v, and t are known
  if (known.v0 && known.v && known.t) {
    a = (v - v0) / t; // Calculate acceleration
    x = ((v + v0) / 2) * t; // Calculate displacement
    known.a = true;
    known.x = true;
  }

  // Output
  document.getElementById('output-v0').innerText = known.v0 ? v0.toFixed(3) : '-';
  document.getElementById('output-v').innerText = known.v ? v.toFixed(3) : '-';
  document.getElementById('output-a').innerText = known.a ? a.toFixed(3) : '-';
  document.getElementById('output-t').innerText = known.t ? t.toFixed(3) : '-';
  document.getElementById('output-x').innerText = known.x ? x.toFixed(3) : '-';

  // Animation
  const object = document.getElementById('object');
  const container = document.querySelector('.animation');
  const containerWidth = container.clientWidth;
  const objectWidth = object.clientWidth;
  const maxPosition = containerWidth - objectWidth;

  object.style.transition = 'none';
  object.style.left = '0px';

  if (known.t) {
    setTimeout(() => {
      object.style.transition = `${t}s linear`;
      object.style.left = `${maxPosition}px`;
    }, 50);
  }
}