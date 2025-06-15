export function animateValue(id, start, end, duration) {
  const obj = document.getElementById(id);
  if (!obj) {
    console.error(`Element with id "${id}" not found.`);
    return; // Exit the function if the element doesn't exist
  }
  const range = end - start;
  let startTime = null;

  function step(timestamp) {
    if (!startTime) {
      startTime = timestamp;
      obj.classList.add("fade-in"); // Add fade-in class when animation starts
    }
    const progress = Math.min((timestamp - startTime) / duration, 1);
    obj.innerText = Math.floor(progress * range + start) + " +";
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  }
  window.requestAnimationFrame(step);
}
