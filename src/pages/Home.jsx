import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "../App.css";

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    document.querySelectorAll(".play-btn").forEach(button => {
      const img = button.querySelector("img");

      const start = button.dataset.start;
      const forward = button.dataset.forward;
      const end = button.dataset.end;
      const backward = button.dataset.backward;
      const duration = parseInt(button.dataset.duration) || 600;
      
      // Preload images
      [start, forward, backward, end].forEach(src => {
        const preloadImg = new Image();
        preloadImg.src = src;
      });

      let timeout;

      button.addEventListener("mouseenter", () => {
        clearTimeout(timeout);
        img.src = forward;

        timeout = setTimeout(() => {
          img.src = end;
        }, duration);
        console.log("Mouse entered, starting animation");
      });

      button.addEventListener("mouseleave", () => {
        clearTimeout(timeout);
        img.src = backward;

        timeout = setTimeout(() => {
          img.src = start;
        }, duration);
      });
    });
  }, []);

  return (
    <div className="container">
      <div className="divImg">
        <h1 className="title">Scotland Yard Leeds</h1>
        <h3 className="subtitle">
          Hunt down Dr X and recover your assessment feedback.
        </h3>
        <div className="button-container">
          <button className="play-btn" onClick={() => navigate("/create")} id="play-btn" data-start="red/Start.png" data-forward="red/Forward.gif" data-end="red/End.png" data-backward="red/Backward.gif" data-duration="600">
            <img src="red/Start.png" alt="Play Button"/>
          </button>
          <button className="play-btn" onClick={() => navigate("/join")} id="play-btn" data-start="yellow/Start.png" data-forward="yellow/Forward.gif" data-end="yellow/End.png" data-backward="yellow/Backward.gif" data-duration="600">
            <img src="yellow/Start.png" alt="Play Button"/>
          </button>
        </div>
      </div>
      <script src="button.js"></script>
    </div>
  );
}

export default Home;


