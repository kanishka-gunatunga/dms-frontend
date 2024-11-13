import React from "react";

type ParagraphProps = {
  text: string;
  color: string;
};

const Paragraph: React.FC<ParagraphProps> = ({ text, color }) => {
  return (
    <h3 className="p-0 m-0" style={{ color: color, fontWeight: 500 }}>
      <span className="d-block" style={{ fontSize: "14px" }}>
        {text}
      </span>
    </h3>
  );
};

export default Paragraph;
