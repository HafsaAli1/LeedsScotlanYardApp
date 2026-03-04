document.querySelectorAll(".play-button").forEach(button => {
const img = button.querySelector("img");

const start = button.dataset.start;
const forward = button.dataset.forward;
const end = button.dataset.end;
const backward = button.dataset.backward;
const duration = parseInt(button.dataset.duration) || 600;

let timeout;

button.addEventListener("mouseenter", () => {
    clearTimeout(timeout);
    img.src = forward;

    timeout = setTimeout(() => {
    img.src = end;
    }, duration);
});

button.addEventListener("mouseleave", () => {
    clearTimeout(timeout);
    img.src = backward;

    timeout = setTimeout(() => {
    img.src = start;
    }, duration);
});
});
function preload(src) {
const img = new Image();
img.src = src;
}
[forward, backward, end].forEach(preload);
preload();