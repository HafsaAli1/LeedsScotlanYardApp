import { useNavigate } from "react-router-dom";
import "../App.css"; // optional, for global styles

function Home() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h1 className="title">Scotland Yard Leeds</h1>
      <p className="subtitle">
        Hunt down Dr X and recover your assessment feedback.
      </p>
      <div className="button-container">
        <button className="nav-btn" onClick={() => navigate("/create")}>
          Create Game
        </button>
        <button className="nav-btn" onClick={() => navigate("/join")}>
          Join Game
        </button>
      </div>
    </div>
  );
}

export default Home;


// function Home() {
//   const navigate = useNavigate(); // React Router navigation

//   return (
//     <div className="container">
//       <h1>Scotland Yard Leeds</h1>

//       <nav>
//         <button
//           className="nav-btn"
//           onClick={() => navigate("/create")}
//         >
//           Create Game
//         </button>

//         <button
//           className="nav-btn"
//           onClick={() => navigate("/join")}
//         >
//           Join Game
//         </button>
//       </nav>
//     </div>
//   );
// }

// export default Home;