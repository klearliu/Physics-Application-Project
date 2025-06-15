function simulate() {
  const u = parseFloat(document.getElementById('velocity').value);
  const a = parseFloat(document.getElementById('acceleration').value);
  const t = parseFloat(document.getElementById('time').value);

  const v = u + a * t;
  const s = u * t + 0.5 * a * t * t;

  document.getElementById('finalVelocity').innerText = v.toFixed(2);
  document.getElementById('displacement').innerText = s.toFixed(2);

  const object = document.getElementById('object');
  const container = document.querySelector('.animation');
  const containerWidth = container.clientWidth;
  const objectWidth = object.clientWidth;

  const maxPosition = containerWidth - objectWidth;

  // Reset position instantly
  object.style.transition = 'none';
  object.style.left = '0px';

  // Animate from left 0px to maxPosition over t seconds
  setTimeout(() => {
    object.style.transition = `${t}s linear`;
    object.style.left = `${maxPosition}px`;
  }, 50);
}
