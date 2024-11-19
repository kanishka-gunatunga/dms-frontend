import React from "react";

function LoadingSpinner() {
  return (
    <>
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100svh", overflow: "hidden" }}
      >
        <div
          className="spinner-border"
          role="status"
          style={{
            width: "60px",
            height: "60px",
            borderWidth: "6px",
            borderColor: "rgba(0, 0, 0, 0.1)",
            borderTopColor: "#6777ef",
            borderRightColor: "#6777ef",
            borderBottomColor: "#6777ef",
          }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </>
  );
}

export default LoadingSpinner;
