/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Heading from "@/components/common/Heading";
import Paragraph from "@/components/common/Paragraph";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import React, { useEffect, useState } from "react";
import { Dropdown, DropdownButton, Modal, Table } from "react-bootstrap";
import { AiFillDelete } from "react-icons/ai";
import { FaEllipsisV } from "react-icons/fa";
import { FaKey, FaPlus } from "react-icons/fa6";
import { MdModeEditOutline, MdOutlineCancel, MdPeople } from "react-icons/md";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { deleteWithAuth, postWithAuth } from "@/utils/apiClient";
import { IoCheckmark, IoClose, IoSaveOutline } from "react-icons/io5";
import Link from "next/link";
import { SMTPUploadItem } from "@/types/types";
import { fetchAndMapSMTPUploadTableData } from "@/utils/dataFetchFunctions";
import ToastMessage from "@/components/common/Toast";

export default function AllDocTable() {
  const isAuthenticated = useAuth();
  const [tableData, setTableData] = useState<SMTPUploadItem[]>([]);
 const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [modalStates, setModalStates] = useState({
    deleteModel: false,
  });


  const handleOpenModal = (modalName: keyof typeof modalStates) => {
    setModalStates((prev) => ({ ...prev, [modalName]: true }));
  };

  const handleCloseModal = (modalName: keyof typeof modalStates) => {
    setModalStates((prev) => ({ ...prev, [modalName]: false }));
  };

  useEffect(() => {
    fetchAndMapSMTPUploadTableData(setTableData);
  }, []);

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  

  const handleDeleteSMTP = async () => {
    // const confirmDelete = window.confirm(
    //   `Are you sure you want to delete the SMTP with host: ${name}?`
    // );

    // if (confirmDelete) {
      try {
        const response = await deleteWithAuth(`delete-smtp/${selectedItemId}`);
        if (response.status === "success") {
          handleCloseModal("deleteModel");
          setToastType("success");
          setToastMessage("Attribute deleted successfully!");
          setShowToast(true);
          setTimeout(() => {
            setShowToast(false);
          }, 5000);
          fetchAndMapSMTPUploadTableData(setTableData);
        } else {
          handleCloseModal("deleteModel");
          setToastType("error");
          setToastMessage("Attribute delete failed!");
          setShowToast(true);
          setTimeout(() => {
            setShowToast(false);
          }, 5000);
        }

      } catch (error) {
        console.error("Error deleting user:", error);
      }
    // }
  };

  return (
    <>
      <DashboardLayout>
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center pt-2">
          <Heading text="Email Smtp Settings" color="#444" />
          <div className="d-flex mt-2 mt-lg-0">
          <Link
            href="/email-smtp/add"
            className="addButton bg-white text-dark border border-success rounded px-3 py-1"
          >
            <FaPlus /> Add SMTP Details
          </Link>
          </div>
        </div>

        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
          <div>
            <div
              style={{
                maxHeight: "380px",
                overflowY: "auto",
                overflow: "visible",
              }}
              className="custom-scroll"
            >
              <Table hover responsive>
                <thead className="sticky-header">
                  <tr>
                    <th>Actions</th>
                    <th className="text-start">User Name</th>
                    <th className="text-start">Host</th>
                    <th className="text-start">Port</th>
                    <th className="text-start">Is Default</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.length > 0 ? (
                    tableData.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <DropdownButton
                            id="dropdown-basic-button"
                            drop="end"
                            title={<FaEllipsisV />}
                            className="no-caret position-static"
                          >
                            <Dropdown.Item
                              href={`/email-smtp/${item.id}`}
                              className="py-2"
                            >
                              <MdModeEditOutline className="me-2" />
                              Edit
                            </Dropdown.Item>
                            <Dropdown.Item
                              href="#"
                              className="py-2"
                              onClick={() => {
                                handleOpenModal("deleteModel");
                                setSelectedItemId(item.id);
                                setSelectedCategoryId(item.host)
                              }}
                            >
                              <AiFillDelete className="me-2" />
                              Delete
                            </Dropdown.Item>
                          </DropdownButton>
                        </td>
                        <td>{item.user_name}</td>
                        <td>{item.host}</td>
                        <td>{item.port}</td>
                        <td>{item.is_default}</td>
                      </tr>
                    ))
                  ) : (
                    <div className="text-start w-100 py-3">
                      <Paragraph text="No data available" color="#333" />
                    </div>
                  )}
                </tbody>
              </Table>
            </div>

           
            {}
          </div>
        </div>
      </DashboardLayout>
      {/* delete */}
      <Modal
        centered
        show={modalStates.deleteModel}
        onHide={() => handleCloseModal("deleteModel")}
      >
        <Modal.Body>
          <div className="d-flex flex-column">
            <div className="d-flex w-100 justify-content-end">
              <div className="col-11 d-flex flex-row py-3">
                <p
                  className="mb-0 text-danger"
                  style={{ fontSize: "18px", color: "#333" }}
                >
                  Are you sure you want to delete?
                </p>
              </div>
              <div className="col-1 d-flex justify-content-end">
                <IoClose
                  fontSize={20}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleCloseModal("deleteModel")}
                />
              </div>
            </div>
            <div className="d-flex flex-row">
              <button
                onClick={handleDeleteSMTP}
                className="custom-icon-button button-success px-3 py-1 rounded me-2"
              >
                <IoCheckmark fontSize={16} className="me-1" /> Yes
              </button>
              <button
                onClick={() => {
                  handleCloseModal("deleteModel");
                }}
                className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
              >
                <MdOutlineCancel fontSize={16} className="me-1" /> No
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <ToastMessage
        message={toastMessage}
        show={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
      />
    </>
  );
}
