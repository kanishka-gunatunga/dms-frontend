import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { InfoCircleOutlined } from "@ant-design/icons";
import Heading from "./Heading";
import { FaRegEdit } from "react-icons/fa";

interface BlogModalProps {
  title: string;
  content: string;
  onEditPath?: string;
  queryParams?: Record<string, string>;
  onEditClick?: () => void;
  buttonLabel?: string;
}

const InfoModal: React.FC<BlogModalProps> = ({
  title,
  content,
  onEditPath = "/page-helpers/1",
  queryParams = {},
  onEditClick,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buttonLabel,
}) => {
  const [show, setShow] = useState(false);
  const router = useRouter();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleEdit = () => {
    if (onEditClick) {
      onEditClick();
    } else {
      const query = new URLSearchParams({
        ...queryParams,
        title,
        content,
      }).toString();

      router.push(`${onEditPath}?${query}`);
    }
  };

  return (
    <>
      <Button
        onClick={handleShow}
        className="p-0 m-0 ms-2 "
        style={{
          fontSize: "18px",
          backgroundColor: "transparent",
          color: "rgb(13,110,253)",
          border: "none",
        }}
      >
        <InfoCircleOutlined />
      </Button>

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <div className="d-flex flex-row align-items-center">
              <Heading text={title} color="#444" />{" "}
              <Button
                onClick={handleEdit}
                style={{
                  fontSize: "18px",
                  backgroundColor: "transparent",
                  color: "rgb(13,110,253)",
                  border: "none",
                }}
              >
                <FaRegEdit />
              </Button>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            className="custom-scroll"
            style={{ maxHeight: "70vh", overflowY: "scroll" }}
          >
            <div
              dangerouslySetInnerHTML={{ __html: content }}
              style={{ fontSize: "16px", lineHeight: "1.5" }}
            />
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default InfoModal;
