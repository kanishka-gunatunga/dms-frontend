import React from "react";

function LoadingBar() {
  return (
    <>
       <div
      className="loading-bar"
      style={{
        position: "relative",
        width: "100%",
        height: "4px",
        backgroundColor: "#e0e0e0",
        overflow: "hidden",
      }}
    >
      <div
        className="loading-bar-progress"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "0%",
          height: "100%",
          backgroundColor: "#6777ef",
          animation: "loading 2s infinite",
        }}
      />
      <style>
        {`
          @keyframes loading {
            0% {
              width: 0%;
              left: 0;
            }
            50% {
              width: 50%;
              left: 25%;
            }
            100% {
              width: 0%;
              left: 100%;
            }
          }
        `}
      </style>
    </div>
    </>
  );
}

export default LoadingBar;
