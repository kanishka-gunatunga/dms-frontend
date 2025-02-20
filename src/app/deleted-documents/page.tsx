/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Heading from "@/components/common/Heading";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Paragraph from "@/components/common/Paragraph";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import { deleteWithAuth, getWithAuth, postWithAuth } from "@/utils/apiClient";
import {
  fetchDeletedDocuments,
} from "@/utils/dataFetchFunctions";
import React, { useEffect, useState } from "react";
import {
  Dropdown,
  DropdownButton,
  Form,
  Modal,
  Pagination,
  Table,
} from "react-bootstrap";
import { FaEllipsisV } from "react-icons/fa";
import { IoCheckmark, IoClose, IoTrash } from "react-icons/io5";
import {
  MdArrowDropDown,
  MdArrowDropUp,
  MdOutlineCancel,
  MdRestore,
} from "react-icons/md";
// import { useUserContext } from "@/context/userContext";
import { usePermissions } from "@/context/userPermissions";
import { hasPermission } from "@/utils/permission";
import { IoMdTrash } from "react-icons/io";
import { Checkbox } from "antd";
import { AiFillDelete } from "react-icons/ai";
interface Category {
  category_name: string;
}

interface TableItem {
  id: number;
  name: string;
  category: Category;
  storage: string;
  created_date: string;
  created_by: string;
  archived_by: string;
  archived_date: string;
}



export default function AllDocTable() {
  // const { userId } = useUserContext();
  const permissions = usePermissions();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [dummyData, setDummyData] = useState<TableItem[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(
    null
  );
  const [modalStates, setModalStates] = useState({
    modelRestore: false,
    modelDeletePermenent: false,
    deleteBulkFileModel: false
  });
  const [, setShowToast] = useState(false);
  const [, setToastType] = useState<"success" | "error">("success");
  const [, setToastMessage] = useState("");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedItemsNames, setSelectedItemsNames] = useState<string[]>([]);

  const isAuthenticated = useAuth();

  useEffect(() => {
    fetchDeletedDocuments(setDummyData);
  }, []);



  // const handleCategorySelect = (categoryId: string) => {
  //   setSelectedCategoryId(categoryId);
  // };

  // const handleStorageSelect = (selected: string) => {
  //   setSelectedStorage(selected);
  // };

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

  const handleSort = () => setSortAsc(!sortAsc);

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const sortedData = [...dummyData].sort((a, b) =>
    sortAsc
      ? new Date(a.created_date).getTime() - new Date(b.created_date).getTime()
      : new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
  );
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


  const handleRestore = async () => {
    if (!selectedDocumentId) {
      console.error("Invalid document ID");
      return;
    }
    // https://sites.techvoice.lk/dms-backend-v2/api/restore-deleted-document/151
    try {
      const response = await getWithAuth(`restore-deleted-document/${selectedDocumentId}`);
      // console.log("document deleted successfully:", response);

      if (response.status === "success") {
        handleCloseModal("modelRestore");
        fetchDeletedDocuments(setDummyData);
        setToastType("success");
        setToastMessage("Document restored from trash successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      } else {
        setToastType("error");
        setToastMessage("An error occurred while restoring the trashed document!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        handleCloseModal("modelRestore");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      setToastType("error");
      setToastMessage("An error occurred while restoring the trashed document!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    }
  };
  const handleDeletePermenemt = async () => {
    if (!selectedDocumentId) {
      console.error("Invalid document ID");
      return;
    }

    try {
      const response = await deleteWithAuth(`delete-document-permanently/${selectedDocumentId}`);
      // console.log("document deleted successfully:", response);

      if (response.status === "success") {
        handleCloseModal("modelDeletePermenent");
        fetchDeletedDocuments(setDummyData);
        setToastType("success");
        setToastMessage("Document deleted successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      } else {
        setToastType("error");
        setToastMessage("An error occurred while deleting the document!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        handleCloseModal("modelDeletePermenent");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      setToastType("error");
      setToastMessage("An error occurred while deleting the document!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = paginatedData.map((item) => item.id);
      const allNames = paginatedData.map((item) => item.name);
      setSelectedItems(allIds);
      setSelectedItemsNames(allNames);
    } else {
      setSelectedItems([]);
      setSelectedItemsNames([]);
    }
  };

  const handleCheckboxChange = (id: number, name: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );

    setSelectedItemsNames((prev) => {
      const updatedNames = prev.filter((item, index) => {
        return paginatedData[index].id !== id;
      });

      if (updatedNames.length === prev.length) {
        return [...updatedNames, name];
      }

      return updatedNames;
    });
  };

  const handleDeleteSelectedDoc = async () => {
    try {

      console.log("JSON.stringify(selectedItems) : ", JSON.stringify(selectedItems))
      const formData = new FormData();
      formData.append("documents", JSON.stringify(selectedItems));

      const response = await postWithAuth(
        `bulk-permanently-delete-documents`, formData
      );

      if (response.status === "success") {
        setToastType("success");
        setToastMessage("Document bulk deleted successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        handleCloseModal("deleteBulkFileModel");
        fetchDeletedDocuments(setDummyData);
      } else if (response.status === "fail") {
        setToastType("error");
        setToastMessage("An error occurred while deleting the document bulk!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        fetchDeletedDocuments(setDummyData);
      } else {
        setToastType("error");
        setToastMessage("An error occurred while deleting the document bulk!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        fetchDeletedDocuments(setDummyData);
      }
    } catch (error) {
      setToastType("error");
      setToastMessage("An error occurred while sharing the document bulk!");
      setShowToast(true);
      fetchDeletedDocuments(setDummyData);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
      // console.error("Error new version updating:", error);
    }
  };

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <DashboardLayout>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <Heading text="Deleted Documents" color="#444" />
        </div>
        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
          {/* <div>
            {isLoadingTable && <LoadingBar />}
          </div> */}
          <div>
            <div
              style={{ maxHeight: "380px", overflowY: "auto" }}
              className="custom-scroll"
            >
              <Table hover responsive>
                <thead className="sticky-header">
                  <tr>
                    <th className="position-relative">
                      {/* {selectedItems.length > 0 ? (
                        <Button shape="circle" icon={<FaShareAlt />} onClick={() => handleOpenModal("allDocShareModel")} style={{ position: "absolute", top: "5px", left: "14px", backgroundColor: "#6777ef", color: "#fff" }} />
                      ) : (
                        <Checkbox
                          checked={
                            selectedItems.length === paginatedData.length && paginatedData.length > 0
                          }
                          indeterminate={
                            selectedItems.length > 0 && selectedItems.length < paginatedData.length
                          }
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          style={{
                            display: "flex",
                            alignSelf: "center",
                            justifySelf: "center",
                          }} 
                        />
                      )} */}
                      {selectedItems.length > 0 ? (
                        <DropdownButton
                          id="dropdown-basic-button"
                          drop="end"
                          title={<FaEllipsisV />}
                          className="no-caret position-static dropdown-toggle-bulk"
                          style={{ zIndex: "99999", padding: '0px !important', backgroundColor: "transparent", color: "#000" }}
                        >
                          <Dropdown.Item
                            onClick={() => handleOpenModal("deleteBulkFileModel")}
                            className="py-2"
                          >
                            <AiFillDelete className="me-2" />
                            Delete Permanently
                          </Dropdown.Item>

                        </DropdownButton>
                      ) : (
                        <Checkbox
                          checked={selectedItems.length === paginatedData.length && paginatedData.length > 0}
                          indeterminate={selectedItems.length > 0 && selectedItems.length < paginatedData.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          style={{
                            display: "flex",
                            alignSelf: "center",
                            justifySelf: "center",
                          }}
                        />
                      )}
                    </th>
                    <th>Actions</th>
                    <th className="text-start">Name</th>
                    <th className="text-start">Document Category</th>
                    <th className="text-start">Storage</th>
                    <th
                      className="text-start"
                      onClick={handleSort}
                      style={{ cursor: "pointer" }}
                    >
                      Created Date{" "}
                      {sortAsc ? (
                        <MdArrowDropUp fontSize={20} />
                      ) : (
                        <MdArrowDropDown fontSize={20} />
                      )}
                    </th>
                    <th className="text-start">Created By</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <tr key={item.id}
                      >
                        <td>
                          <Checkbox
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleCheckboxChange(item.id, item.name)}
                            style={{
                              display: "flex",
                              alignSelf: "center",
                              justifySelf: "center",
                            }}
                          />

                        </td>
                        <td>
                          <DropdownButton
                            id="dropdown-basic-button"
                            drop="end"
                            title={<FaEllipsisV />}
                            className="no-caret position-static"
                          >

                            {/* {hasPermission(permissions, "Archived Documents", "Restore Document") && ( */}
                              <Dropdown.Item onClick={() =>
                                handleOpenModal("modelRestore", item.id)
                              } className="py-2">
                                <MdRestore className="me-2" />
                                Restore
                              </Dropdown.Item>
                            {/* )} */}

                            {/* {hasPermission(permissions, "Archived Documents", "Delete Document") && ( */}
                              <Dropdown.Item onClick={() =>
                                handleOpenModal("modelDeletePermenent", item.id)
                              } className="py-2">
                                <IoMdTrash className="me-2" />
                                Delete Permanently
                              </Dropdown.Item>
                            {/* )} */}
                          </DropdownButton>
                        </td>

                        <td>
                          {item.name}
                        </td>
                        <td>{item.category?.category_name || ""}</td>
                        <td>{item.storage}</td>
                        <td>
                          {new Date(item.created_date).toLocaleDateString(
                            "en-GB"
                          )}
                        </td>
                        <td>{item.created_by}</td>
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
        show={modalStates.modelRestore}
        onHide={() => handleCloseModal("modelRestore")}
      >
        <Modal.Body>
          <div className="d-flex flex-column">
            <div className="d-flex w-100 justify-content-end">
              <div className="col-11 d-flex flex-row py-3">
                <p
                  className="mb-0 text-danger"
                  style={{ fontSize: "18px", color: "#333" }}
                >
                  Are you sure you want to restore?
                </p>
              </div>
              <div className="col-1 d-flex justify-content-end">
                <IoClose
                  fontSize={20}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleCloseModal("modelRestore")}
                />
              </div>
            </div>
            <div className="d-flex flex-row">
              <button
                onClick={() => handleRestore()}
                className="custom-icon-button button-success px-3 py-1 rounded me-2"
              >
                <IoCheckmark fontSize={16} className="me-1" /> Yes
              </button>
              <button
                onClick={() => {
                  handleCloseModal("modelRestore");
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

      <Modal
        centered
        show={modalStates.modelDeletePermenent}
        onHide={() => handleCloseModal("modelDeletePermenent")}
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
                  onClick={() => handleCloseModal("modelDeletePermenent")}
                />
              </div>
            </div>
            <div className="mt-1">
              <p
                className="mb-1 text-start w-100 text-danger"
                style={{ fontSize: "14px" }}
              >
                By deleting the document, it will no longer be accessible in the
                future, and the following data will be deleted from the system:
              </p>
              <ul>
                <li>Version History</li>
                <li>Meta Tags</li>
                <li>Comment</li>
                <li>Notifications</li>
                <li>Reminders</li>
                <li>Permissions</li>
              </ul>
            </div>
            <div className="d-flex flex-row">
              <button
                onClick={() => handleDeletePermenemt()}
                className="custom-icon-button button-success px-3 py-1 rounded me-2"
              >
                <IoCheckmark fontSize={16} className="me-1" /> Yes
              </button>
              <button
                onClick={() => {
                  handleCloseModal("modelDeletePermenent");
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

      {/* delete all doc model */}
      <Modal
        centered
        show={modalStates.deleteBulkFileModel}
        className="large-model"
        onHide={() => {
          handleCloseModal("deleteBulkFileModel");
          setSelectedItems([])
          setSelectedItemsNames([])
        }}
      >
        <Modal.Header>
          <div className="d-flex w-100 justify-content-end">
            <div className="col-11 d-flex flex-row">
              <p className="mb-0" style={{ fontSize: "16px", color: "#333" }}>
                Delete Selected Documents
              </p>
            </div>
            <div className="col-1 d-flex justify-content-end">
              <IoClose
                fontSize={20}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  handleCloseModal("deleteBulkFileModel")
                  setSelectedItems([])
                  setSelectedItemsNames([])
                }}
              />
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className="py-3 ">
          <div
            className="d-flex flex-column custom-scroll mb-3"
          >
            <p
              className="mb-3 text-danger"
              style={{ fontSize: "18px", color: "#333" }}
            >
              Are you sure you want to delete?
            </p>
            <div className="d-flex flex-wrap">
              {
                selectedItemsNames.map((item, index) => (
                  <span key={index} className="px-3 py-2 me-2 mb-2 rounded-pill" style={{ backgroundColor: "#eee" }}>{item}</span>
                ))
              }
            </div>

          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex flex-row">
            <button
              onClick={() => handleDeleteSelectedDoc()}
              className="custom-icon-button button-success px-3 py-1 rounded me-2"
            >
              <IoTrash fontSize={16} className="me-1" /> Delete
            </button>
            <button
              onClick={() => {
                handleCloseModal("deleteBulkFileModel")
                setSelectedItems([])
                setSelectedItemsNames([])
              }}
              className="custom-icon-button button-danger px-3 py-1 rounded me-2"
            >
              <IoClose fontSize={16} className="me-1" /> Cancel
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}
