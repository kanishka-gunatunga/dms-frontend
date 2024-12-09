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
import { IoSaveOutline } from "react-icons/io5";
import Link from "next/link";
import { TableItem } from "@/types/types";
import { fetchAndMapUserTableData } from "@/utils/dataFetchFunctions";

export default function AllDocTable() {
  const isAuthenticated = useAuth();
  const [tableData, setTableData] = useState<TableItem[]>([]);
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    email: string;
  } | null>(null);

  const handleShow = (id: string, email: string) => {
    setSelectedItem({ id, email });
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    setSelectedItem(null);
  };

  useEffect(() => {
    fetchAndMapUserTableData(setTableData);
  }, []);

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  const validateForm = () => {
    if (!password || !confirmPassword) {
      setError("All fields are required.");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    const passwordRegex = /^.{8,}$/;
    if (!passwordRegex.test(password)) {
      setError(
        "Password must be at least 8 characters long and contain at least one capital letter, one number, and one special character."
      );
      return false;
    }

    setError("");
    return true;
  };

  const handleResetPassword = async () => {
    if (validateForm()) {
      const formData = new FormData();
      formData.append("email", selectedItem?.email || "");
      formData.append("current_password", currentPassword);
      formData.append("password", password);
      formData.append("password_confirmation", confirmPassword);

      try {
        const response = await postWithAuth("update-password", formData);
        console.log("Form submitted successfully:", response);
        handleClose();
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    }
  };

  const handleDeleteUser = async (id: string, email: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the user with email: ${email}?`
    );

    if (confirmDelete) {
      try {
        const response = await deleteWithAuth(`delete-user/${id}`);
        console.log("User deleted successfully:", response);
        fetchAndMapUserTableData(setTableData);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  return (
    <>
      <DashboardLayout>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <Heading text="Users" color="#444" />
          <Link
            href="/users/add-user"
            className="addButton bg-white text-dark border border-success rounded px-3 py-1"
          >
            <FaPlus /> Add User
          </Link>
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
                    <th className="text-start">Email</th>
                    <th className="text-start">First Name</th>
                    <th className="text-start">Last Name</th>
                    <th className="text-start">Mobile Number</th>
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
                              href={`/users/${item.id}`}
                              className="py-2"
                            >
                              <MdModeEditOutline className="me-2" />
                              Edit
                            </Dropdown.Item>
                            <Dropdown.Item
                              href="#"
                              className="py-2"
                              onClick={() =>
                                handleDeleteUser(item.id, item.email)
                              }
                            >
                              <AiFillDelete className="me-2" />
                              Delete
                            </Dropdown.Item>
                            <Dropdown.Item href="/users/permissions" className="py-2">
                              <MdPeople className="me-2" />
                              Permission
                            </Dropdown.Item>
                            <Dropdown.Item
                              href="#"
                              className="py-2"
                              onClick={() => handleShow(item.id, item.email)}
                            >
                              <FaKey className="me-2" />
                              Reset Password
                            </Dropdown.Item>
                          </DropdownButton>
                        </td>
                        <td>{item.email}</td>
                        <td>{item.firstName}</td>
                        <td>{item.lastName}</td>
                        <td>{item.mobileNumber}</td>
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

            <Modal
              show={show}
              onHide={handleClose}
              centered
              className="smallModel"
            >
              <Modal.Header closeButton>
                <Modal.Title>
                  <div className="d-flex flex-row align-items-center">
                    <Heading text="Reset Password" color="#444" />{" "}
                  </div>
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div
                  className="custom-scroll"
                  style={{ maxHeight: "70vh", overflowY: "scroll" }}
                >
                  <div className="d-flex flex-column w-100">
                    <div className="d-flex flex-column">
                      <p className="mb-1" style={{ fontSize: "14px" }}>
                        Email
                      </p>
                      <div className="input-group mb-3">
                        <input
                          type="email"
                          className="form-control"
                          value={selectedItem?.email || ""}
                          // onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="d-flex flex-column">
                      <p className="mb-1" style={{ fontSize: "14px" }}>
                        Current Password
                      </p>
                      <div className="input-group mb-3">
                        <input
                          type="password"
                          className="form-control"
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="d-flex flex-column">
                      <p className="mb-1" style={{ fontSize: "14px" }}>
                        Password
                      </p>
                      <div className="input-group mb-3">
                        <input
                          type="password"
                          className="form-control"
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="d-flex flex-column">
                      <p className="mb-1" style={{ fontSize: "14px" }}>
                        Confirm Password
                      </p>
                      <div className="input-group mb-3">
                        <input
                          type="password"
                          className="form-control"
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  {error && <p className="text-danger">{error}</p>}
                  <div className="d-flex flex-row mt-2">
                    <button
                      onClick={handleResetPassword}
                      className="custom-icon-button button-success px-3 py-1 rounded me-2"
                    >
                      <IoSaveOutline fontSize={16} className="me-1" /> Save
                    </button>
                    <button
                      onClick={handleClose}
                      className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
                    >
                      <MdOutlineCancel fontSize={16} className="me-1" /> Cancel
                    </button>
                  </div>
                </div>
              </Modal.Body>
            </Modal>

            {/* <div className="d-flex flex-column flex-lg-row paginationFooter">
              <div className="d-flex justify-content-between align-items-center">
                <p className="pagintionText mb-0 me-2">Items per page:</p>
                <Form.Select
                  onChange={handleItemsPerPageChange}
                  value={itemsPerPage}
                  style={{
                    width: "100px",
                    padding: "5px 10px",
                    fontSize: "12px",
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                </Form.Select>
              </div>
              <div className="d-flex flex-row align-items-center px-lg-5">
                <div className="pagination-info" style={{ fontSize: "14px" }}>
                  {startIndex} – {endIndex} of {totalItems}
                </div>

                <Pagination className="ms-3">
                  <Pagination.Prev
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                  />
                  <Pagination.Next
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </div>
            </div> */}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
