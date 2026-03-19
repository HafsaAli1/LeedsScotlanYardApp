import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Instructions() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h1 className="title">How to Play</h1>
      <div className="form-box">
        <p style={{ color: "white", marginBottom: "20px" }}>
          One player is Dr X, all other players are Detectives.<br/>
          Dr X moves secretly and shows the tickets used.<br/>
          Detectives move openly and can see each other's locations.<br/>
          Detectives cannot share spaces or move onto each other.<br/>
          Dr X reveals his location every 3 rounds.<br/>
          Detectives win by landing on Dr X - If not caught by the final round, Dr X wins.
        </p>
        
        <button 
          onClick={() => navigate(-1)} 
          className="nav-btn"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}


export default Instructions;