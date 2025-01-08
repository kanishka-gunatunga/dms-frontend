/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Heading from "@/components/common/Heading";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Paragraph from "@/components/common/Paragraph";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import { CategoryDropdownItem } from "@/types/types";
import { deleteWithAuth, getWithAuth, postWithAuth } from "@/utils/apiClient";
import {
  fetchArchivedDocuments,
  fetchCategoryData,
} from "@/utils/dataFetchFunctions";
import Link from "next/link";
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
import { IoMdTrash } from "react-icons/io";
import { IoCheckmark, IoClose } from "react-icons/io5";
import {
  MdArrowDropDown,
  MdArrowDropUp,
  MdOutlineCancel,
  MdRestore,
} from "react-icons/md";
import { useUserContext } from "@/context/userContext";
import LoadingBar from "@/components/common/LoadingBar";
import { usePermissions } from "@/context/userPermissions";
import { hasPermission } from "@/utils/permission";
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
  const { userId } = useUserContext();
  const permissions = usePermissions();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  // const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  // const [selectedStorage, setSelectedStorage] = useState<string>("Storage");
  const [dummyData, setDummyData] = useState<TableItem[]>([]);
  const [categoryDropDownData, setCategoryDropDownData] = useState<
    CategoryDropdownItem[]
  >([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(
    null
  );
  const [modalStates, setModalStates] = useState({
    modelRestore: false,
    modelDeletePermenent: false,
  });
  const [, setShowToast] = useState(false);
  const [, setToastType] = useState<"success" | "error">("success");
  const [, setToastMessage] = useState("");
  const isAuthenticated = useAuth();
  const [filterData, setFilterData] = useState({
    term: "",
    meta_tags: "",
    category: "",
    storage: "",
  });
  const [isLoadingTable, setIsLoadingTable] = useState(false);

  useEffect(() => {
    fetchCategoryData(setCategoryDropDownData);
    fetchArchivedDocuments(setDummyData);
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

    try {
      const response = await getWithAuth(`restore-archived-document/${selectedDocumentId}/${userId}`);
      // console.log("document deleted successfully:", response);

      if (response.status === "success") {
        handleCloseModal("modelRestore");
        fetchArchivedDocuments(setDummyData);
        setToastType("success");
        setToastMessage("Restore archived Document successfull!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      } else {
        setToastType("error");
        setToastMessage("Error occurred while delete restore archived document!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        handleCloseModal("modelRestore");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      setToastType("error");
      setToastMessage("Error occurred while delete restore archived document!");
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
      const response = await deleteWithAuth(`delete-document/${selectedDocumentId}/${userId}`);
      // console.log("document deleted successfully:", response);

      if (response.status === "success") {
        handleCloseModal("modelDeletePermenent");
        fetchArchivedDocuments(setDummyData);
        setToastType("success");
        setToastMessage("Delete Document successfull!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      } else {
        setToastType("error");
        setToastMessage("Error occurred while delete document!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        handleCloseModal("modelDeletePermenent");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      setToastType("error");
      setToastMessage("Error occurred while delete document!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    }
  };




  const handleTermSearch = async (value: string) => {
    setFilterData((prevState) => ({
      ...prevState,
      term: value,
    }));
  };

  const handleMetaSearch = async (value: string) => {
    setFilterData((prevState) => ({
      ...prevState,
      meta_tags: value,
    }));
  };

  const handleCategorySelect = (categoryId: string) => {
    setFilterData((prevState) => ({
      ...prevState,
      category: categoryId,
    }));
  };

  const handleStorageSelect = (storage: string) => {
    setFilterData((prevState) => ({
      ...prevState,
      storage: storage,
    }));
  };

  const handleSearch = async () => {
    const formData = new FormData();
    // console.log("Fil-ter Data: ", filterData);

    if (filterData.term) {
      formData.append("term", filterData.term);
    } else if (filterData.meta_tags) {
      formData.append("meta_tags", filterData.meta_tags);
    } else if (filterData.category) {
      formData.append("category", filterData.category);
    } else if (filterData.storage) {
      formData.append("storage", filterData.storage);
    }
    // else {
    //   console.log("No filter data, fetching all documents...");
    //   fetchArchivedDocuments(setDummyData);
    //   return;
    // }

    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    if (formData.entries().next().done) {
      fetchArchivedDocuments(setDummyData);
      return;
    }

    // for (const [key, value] of formData.entries()) {
    //   console.log(`${key}: ${value}`);
    // }
    setIsLoadingTable(true)
    try {
      const response = await postWithAuth("filter-archived-documents", formData);
      // console.log("filter-archived-documents response:", response);
      setDummyData(response);
      setIsLoadingTable(false)
    } catch (error) {
      console.error("Failed to fetch filtered data", error);
    }
  };


  // console.log("DUMMY:", dummyData)

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
          <Heading text="Archived Documents" color="#444" />
        </div>
        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
          <div className="d-flex flex-column flex-lg-row">
            <div className="col-12 col-lg-6 d-flex flex-column flex-lg-row">
              <div className="input-group mb-3 pe-lg-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name or description"
                  onChange={(e) => handleTermSearch(e.target.value)}
                ></input>
              </div>
              <div className="input-group mb-3 pe-lg-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by meta tags"
                  onChange={(e) => handleMetaSearch(e.target.value)}
                ></input>
              </div>
            </div>
            <div className="col-12 col-lg-6 d-flex flex-column flex-lg-row">
              <div className="col-12 col-lg-6">
                <div className="input-group mb-3">
                  <DropdownButton
                    id="dropdown-category-button"
                    title={
                      filterData.category
                        ? categoryDropDownData.find(
                          (item) => item.id.toString() === filterData.category
                        )?.category_name
                        : "Select Category"
                    }
                    className="custom-dropdown-text-start text-start w-100"
                    onSelect={(value) => handleCategorySelect(value || "")}
                  >
                    <Dropdown.Item eventKey="" style={{ fontStyle: "italic", color: "gray" }}>
                      None
                    </Dropdown.Item>

                    {categoryDropDownData.map((category) => (
                      <Dropdown.Item
                        key={category.id}
                        eventKey={category.id.toString()}
                        style={{
                          fontWeight:
                            category.parent_category === "none" ? "bold" : "normal",
                          marginLeft: category.parent_category === "none" ? "0px" : "20px",
                        }}
                      >
                        {category.category_name}
                      </Dropdown.Item>
                    ))}
                  </DropdownButton>
                </div>
              </div>
              <div className="col-12 col-lg-6 px-0 px-lg-2">
                <div className="input-group mb-3">
                  <DropdownButton
                    id="dropdown-storage-button"
                    title={filterData.storage || "Select Storage"}
                    className="w-100 custom-dropdown-text-start"
                  >
                    <Dropdown.Item
                      onClick={() =>
                        handleStorageSelect("")
                      }
                    >
                      --None--
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleStorageSelect("Local Disk (Default)")}>
                      Local Disk (Default)
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleStorageSelect("Amazon S3")}>
                      Amazon S3
                    </Dropdown.Item>
                  </DropdownButton>
                </div>
              </div>
            </div>
          </div>
          <div>
            {isLoadingTable && <LoadingBar />}
          </div>
          <div>
            <div
              style={{ maxHeight: "380px", overflowY: "auto" }}
              className="custom-scroll"
            >
              <Table hover responsive>
                <thead className="sticky-header">
                  <tr>
                    <th>Actions</th>
                    <th className="text-start">Name</th>
                    <th className="text-start">Document Category</th>
                    <th className="text-start">Storage</th>
                    <th
                      className="text-start"
                      onClick={handleSort}
                      style={{ cursor: "pointer" }}
                    >
                      Archived Date{" "}
                      {sortAsc ? (
                        <MdArrowDropUp fontSize={20} />
                      ) : (
                        <MdArrowDropDown fontSize={20} />
                      )}
                    </th>
                    <th className="text-start">Archived By</th>
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
                            className="no-caret position-static"
                          >

                            {hasPermission(permissions, "Archived Documents", "Restore Document") && (
                              <Dropdown.Item onClick={() =>
                                handleOpenModal("modelRestore", item.id)
                              } className="py-2">
                                <MdRestore className="me-2" />
                                Restore
                              </Dropdown.Item>
                            )}

                            {hasPermission(permissions, "Archived Documents", "Delete Document") && (
                              <Dropdown.Item onClick={() =>
                                handleOpenModal("modelDeletePermenent", item.id)
                              } className="py-2">
                                <IoMdTrash className="me-2" />
                                Delete Permenently
                              </Dropdown.Item>
                            )}
                          </DropdownButton>
                        </td>
                        <td>
                          <Link href="#">{item.name}</Link>
                        </td>
                        <td>{item.category.category_name}</td>
                        <td>{item.storage}</td>
                        <td>{item.archived_date}</td>
                        <td>{item.archived_by}</td>
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
                <li>Permisssions</li>
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
    </>
  );
}
