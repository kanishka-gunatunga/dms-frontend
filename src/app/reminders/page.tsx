/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Heading from "@/components/common/Heading";
import Paragraph from "@/components/common/Paragraph";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import React, { useEffect, useState } from "react";
import {
  Dropdown,
  DropdownButton,
  Form,
  Modal,
  Pagination,
  Table,
} from "react-bootstrap";
import { AiFillDelete } from "react-icons/ai";
import { FaEllipsisV } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import {
  MdArrowDropDown,
  MdArrowDropUp,
  MdModeEditOutline,
  MdOutlineCancel,
} from "react-icons/md";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { IoCheckmark, IoClose } from "react-icons/io5";
import { deleteWithAuth, postWithAuth } from "@/utils/apiClient";
import Link from "next/link";
import ToastMessage from "@/components/common/Toast";
import { ReminderItem } from "@/types/types";
import { fetchRemindersData } from "@/utils/dataFetchFunctions";
import LoadingBar from "@/components/common/LoadingBar";
import { usePermissions } from "@/context/userPermissions";
import { hasPermission } from "@/utils/permission";



export default function AllDocTable() {
  const permissions = usePermissions();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [sortColumn, setSortColumn] = useState<"startDate" | "endDate">(
    "startDate"
  );
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [searchSubject, setSearchSubject] = useState<string>("");
  const [searchMessage, setSearchMessage] = useState<string>("");
  const [filterFrequency, setFilterFrequency] = useState<string>("");
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(
    null
  );
  const [modalStates, setModalStates] = useState({
    shareDeleteModel: false,
  });
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");
  const [tableData, setTableData] = useState<ReminderItem[]>([]);

  const [filterData, setFilterData] = useState({
    subject: "",
    message: "",
    frequency: "",
  });
  const [isLoadingTable, setIsLoadingTable] = useState(false);

  const isAuthenticated = useAuth();


  useEffect(() => {
    fetchRemindersData(setTableData);
  }, []);


  const totalItems = tableData.length;
  const totalPages = Math.ceil(tableData.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleSort = (column: "startDate" | "endDate") => {
    if (sortColumn === column) {
      setSortAsc(!sortAsc);
    } else {
      setSortColumn(column);
      setSortAsc(true);
    }
  };

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };



  const filteredData = tableData
  // .filter((item) =>
  //   item.subject.toLowerCase().includes(searchSubject.toLowerCase())
  // )
  // .filter((item) =>
  //   item.message.toLowerCase().includes(searchMessage.toLowerCase())
  // )
  // .filter((item) =>
  //   filterFrequency ? item.frequency === filterFrequency : true
  // );

  const sortedData = [...filteredData].sort((a, b) => {
    const dateA = new Date(a[sortColumn as keyof ReminderItem] as string).getTime();
    const dateB = new Date(b[sortColumn as keyof ReminderItem] as string).getTime();
    return sortAsc ? dateA - dateB : dateB - dateA;
  });

  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenModal = (
    modalName: keyof typeof modalStates,
    documentId?: number,
  ) => {
    if (documentId) setSelectedDocumentId(documentId);

    setModalStates((prev) => ({ ...prev, [modalName]: true }));
  };

  const handleCloseModal = (modalName: keyof typeof modalStates) => {
    setModalStates((prev) => ({ ...prev, [modalName]: false }));
  };

  const handleDeleteReminder = async (id: any) => {
    if (!selectedDocumentId) {
      console.error("Invalid document ID");
      return;
    }

    try {
      const response = await deleteWithAuth(`delete-reminder/${id}`);

      if (response.status === "success") {
        handleCloseModal("shareDeleteModel");
        setToastType("success");
        setToastMessage("Delete Reminder successfull!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      } else {
        setToastType("error");
        setToastMessage("Error occurred while Delete Reminder!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        handleCloseModal("shareDeleteModel");
      }
      fetchRemindersData(setTableData);
    } catch (error) {
      console.error("Error deleting document:", error);
      setToastType("error");
      setToastMessage("Error occurred while Delete Reminder!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    }
  };



  const handleSearchBySubjectChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchSubject(e.target.value);
    setCurrentPage(1);
    setFilterData((prevState) => ({
      ...prevState,
      subject: e.target.value,
    }));
  };
  const handleSearchByMessageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchMessage(e.target.value);
    setCurrentPage(1);
    setFilterData((prevState) => ({
      ...prevState,
      message: e.target.value,
    }));
  };

  const handleFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterFrequency(e.target.value);
    setCurrentPage(1);
    setFilterData((prevState) => ({
      ...prevState,
      frequency: e.target.value,
    }));
  };

  const handleSearch = async () => {
    const formData = new FormData();

    if (filterData.subject) {
      formData.append("subject", filterData.subject);
    } else if (filterData.frequency) {
      formData.append("frequency", filterData.frequency);
    } else if (filterData.message) {
      formData.append("message", filterData.message);
    } else {
      fetchRemindersData(setTableData);
      return;
    }

    
    setIsLoadingTable(true)
    try {
      const response = await postWithAuth("filter-reminders", formData);
      setTableData(response);
      setIsLoadingTable(false)
    } catch (error) {
      console.error("Failed to fetch filtered data", error);
    }
  };


  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [filterData]);


  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <DashboardLayout>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <Heading text="Reminders " color="#444" />
          <div className="d-flex flex-row">
            {hasPermission(permissions, "Reminder", "Create Reminder") && (
              <Link
                href="/reminders/add"
                className="addButton me-2 bg-white text-dark border border-success rounded px-3 py-1"
              >
                <FaPlus className="me-1" /> Add Reminder
              </Link>
            )}

          </div>
        </div>
        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
          <div>
            {isLoadingTable && <LoadingBar />}
          </div>
          <div>
            <div
              style={{ maxHeight: "350px", overflowY: "auto" }}
              className="custom-scroll"
            >
              {hasPermission(permissions, "Reminder", "View Reminders") && (
                <Table hover responsive>
                <thead className="sticky-header">
                  <tr>
                    <th></th>
                    <th
                      className="text-start"
                      onClick={() => handleSort("startDate")}
                      style={{ cursor: "pointer" }}
                    >
                      Start Date{" "}
                      {sortColumn === "startDate" ? (
                        sortAsc ? (
                          <MdArrowDropUp fontSize={20} />
                        ) : (
                          <MdArrowDropDown fontSize={20} />
                        )
                      ) : null}
                    </th>
                    <th
                      className="text-start"
                      onClick={() => handleSort("endDate")}
                      style={{ cursor: "pointer" }}
                    >
                      End Date{" "}
                      {sortColumn === "endDate" ? (
                        sortAsc ? (
                          <MdArrowDropUp fontSize={20} />
                        ) : (
                          <MdArrowDropDown fontSize={20} />
                        )
                      ) : null}
                    </th>
                    <th className="text-start">Subject</th>
                    <th className="text-start">Message</th>
                    <th className="text-start">Frequency</th>
                    <th className="text-start">Document</th>
                  </tr>
                  <tr>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th>
                      <Form.Control
                        type="text"
                        placeholder="Subject"
                        value={searchSubject}
                        onChange={handleSearchBySubjectChange}
                        style={{ width: "200px" }}
                      />
                    </th>
                    <th>
                      <Form.Control
                        type="text"
                        placeholder="Message"
                        value={searchMessage}
                        onChange={handleSearchByMessageChange}
                        style={{ width: "200px" }}
                      />
                    </th>
                    <th>
                      <Form.Select
                        value={filterFrequency}
                        onChange={handleFrequencyChange}
                        style={{ width: "150px", fontSize: "13px" }}
                      >
                        <option value="">All Frequencies</option>
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Half Yearly">Half Yearly</option>
                        <option value="Yearly">Yearly</option>
                      </Form.Select>
                    </th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <DropdownButton
                            id="dropdown-basic-button"
                            drop="end"
                            title={<FaEllipsisV />}
                            className="no-caret"
                          >
                            {hasPermission(permissions, "Reminder", "Edit Reminder") && (
                              <Dropdown.Item href={`/reminders/${item.id}`} className="py-2">
                                <MdModeEditOutline className="me-2" />
                                Edit
                              </Dropdown.Item>
                            )}
                            {hasPermission(permissions, "Reminder", "Delete Reminder") && (
                              <Dropdown.Item onClick={() =>
                                handleOpenModal("shareDeleteModel", item.id)
                              }
                                className="py-2">
                                <AiFillDelete className="me-2" />
                                Delete
                              </Dropdown.Item>
                            )}
                          </DropdownButton>
                        </td>

                        <td>{item.start_date_time}</td>
                        <td>{item.end_date_time}</td>
                        <td>{item.subject}</td>
                        <td>{item.message}</td>
                        <td>{item.frequency}</td>
                        <td>{item.document?.name}</td>
                      </tr>
                    ))
                  ) : (
                    <div className="text-start w-100 py-3">
                      <Paragraph text="No data available" color="#333" />
                    </div>
                  )}
                </tbody>
              </Table>
              )}
              
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

      <Modal
        centered
        show={modalStates.shareDeleteModel}
        onHide={() => handleCloseModal("shareDeleteModel")}
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
                  onClick={() => handleCloseModal("shareDeleteModel")}
                />
              </div>
            </div>
            <div className="d-flex flex-row">
              <button
                onClick={() => handleDeleteReminder(selectedDocumentId)}
                className="custom-icon-button button-success px-3 py-1 rounded me-2"
              >
                <IoCheckmark fontSize={16} className="me-1" /> Yes
              </button>
              <button
                onClick={() => {
                  handleCloseModal("shareDeleteModel");
                  setSelectedDocumentId(null);
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
