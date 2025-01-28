"use client";

import Heading from "@/components/common/Heading";
import Paragraph from "@/components/common/Paragraph";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import React, { useEffect, useState } from "react";
import { Form, Modal, Pagination, Table } from "react-bootstrap";
import { FaPlus } from "react-icons/fa6";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { fetchRoleData } from "@/utils/dataFetchFunctions";
import { TiEdit } from "react-icons/ti";
import { FiTrash } from "react-icons/fi";
import Link from "next/link";
import { deleteWithAuth } from "@/utils/apiClient";
import ToastMessage from "@/components/common/Toast";
import { MdOutlineCancel } from "react-icons/md";
import { IoCheckmark, IoClose } from "react-icons/io5";
import { usePermissions } from "@/context/userPermissions";
import { hasPermission } from "@/utils/permission";

interface TableItem {
  id: number;
  role_name: string;
  permissions: string;
}

export default function AllDocTable() {
  const permissions = usePermissions();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [dummyData, setDummyData] = useState<TableItem[]>([]);
  const isAuthenticated = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");
  const [modalStates, setModalStates] = useState({
    deleteRoleModel: false,
  });
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(
    null
  );
  const [selectedRoleName, setSelectedRoleName] = useState<string | null>(
    null
  );


  useEffect(() => {
    fetchRoleData(setDummyData);
  }, []);

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  const totalItems = dummyData.length;
  const totalPages = Math.ceil(dummyData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const paginatedData = dummyData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  const handleOpenModal = (
    modalName: keyof typeof modalStates,
    roleTd?: number,
    roleName?: string
  ) => {
    if (roleTd) setSelectedRoleId(roleTd);
    if (roleName) setSelectedRoleName(roleName);
    setModalStates((prev) => ({ ...prev, [modalName]: true }));
  };

  const handleCloseModal = (modalName: keyof typeof modalStates) => {
    setModalStates((prev) => ({ ...prev, [modalName]: false }));
  };
  const handleAddRole = () => {
    window.location.href = "/roles/add"
  };

  const handleDeleteRole = async (id: number) => {
    try {
      const response = await deleteWithAuth(`delete-role/${id}`);
      if (response.status === "success") {
        setToastType("success");
        fetchRoleData(setDummyData);
        handleCloseModal("deleteRoleModel");
        setToastMessage("Role deleted successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      } else {
        setToastType("error");
        setToastMessage("Failed to delete role!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      setToastType("error");
      setToastMessage("Failed to delete role!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    }
  };

  return (
    <>
      <DashboardLayout>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <Heading text="Roles" color="#444" />
          {hasPermission(permissions, "Role", "Create Role") && (
            <button
              onClick={handleAddRole}
              className="addButton bg-white text-dark border border-success rounded px-3 py-1"
            >
              <FaPlus className="me-1" /> Add Role
            </button>
          )}

        </div>
        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
          <div>
            <div
              style={{ maxHeight: "380px", overflowY: "auto" }}
              className="custom-scroll"
            >
              {/* {hasPermission(permissions, "Reminder", "View Roles") && ( */}
                <Table hover responsive>
                  <thead className="sticky-header">
                    <tr>
                      <th className="text-start" style={{ width: "25%" }}>
                        Actions
                      </th>
                      <th className="text-start">Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((item) => (
                        <tr key={item.id} className="border-bottom">
                          <td className="d-flex flex-row border-0">
                            {hasPermission(permissions, "Role", "Edit Role") && (
                              <Link href={`/roles/${item.id}`} className="custom-icon-button button-success px-2 py-1 rounded me-2">
                                <TiEdit fontSize={16} className="me-1" />{" "}
                                Edit
                              </Link>
                            )}
                            {hasPermission(permissions, "Role", "Delete Role") && (
                              <button onClick={() => handleOpenModal("deleteRoleModel", item.id, item.role_name)} className="custom-icon-button button-danger text-white bg-danger px-2 py-1 rounded">
                                <FiTrash fontSize={16} className="me-1" />{" "}
                                Delete
                              </button>
                           )}
                          </td>
                          <td className="border-0">{item.role_name}</td>
                        </tr>
                      ))
                    ) : (
                      <div className="text-start w-100 py-3">
                        <Paragraph text="No data available" color="#333" />
                      </div>
                    )}
                  </tbody>
                </Table>
              {/* )} */}
            </div>

            <div className="d-flex flex-column flex-lg-row paginationFooter">
              <div className="d-flex justify-content-between align-items-center">
                <p className="pagintionText mb-0 me-2">Items per page:</p>
                <Form.Select
                  onChange={handleItemsPerPageChange}
                  value={itemsPerPage}
                  style={{
                    width: "100px",
                    padding: "5px 10px !important",
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
            </div>
          </div>
        </div>
      </DashboardLayout>
      {/* delete share document model */}
      <Modal
        centered
        show={modalStates.deleteRoleModel}
        onHide={() => handleCloseModal("deleteRoleModel")}
      >
        <Modal.Body>
          <div className="d-flex flex-column">
            <div className="d-flex w-100 justify-content-end">
              <div className="col-11 d-flex flex-row">
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
                  onClick={() => handleCloseModal("deleteRoleModel")}
                />
              </div>
            </div>
            <div className="d-flex py-3">
              {selectedRoleName || ""}
            </div>
            <div className="d-flex flex-row">
              <button
                onClick={() => handleDeleteRole(selectedRoleId!)}
                className="custom-icon-button button-success px-3 py-1 rounded me-2"
              >
                <IoCheckmark fontSize={16} className="me-1" /> Yes
              </button>
              <button
                onClick={() => {
                  handleCloseModal("deleteRoleModel");
                  setSelectedRoleId(null);
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
