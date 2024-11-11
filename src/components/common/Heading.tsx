import React from "react";

type HeadingProps = {
  text: string;
  color: string;
};

const Heading: React.FC<HeadingProps> = ({ text, color }) => {
  return (
    <h3
      className="p-0 m-0"
      style={{ color: color, fontWeight: 500 }}
    >
      <span className="d-block d-sm-none" style={{fontSize: '20px'}}>{text}</span>
      <span className="d-none d-sm-block" style={{fontSize: '18px'}}>{text}</span>
    </h3>
  );
};

export default Heading;
