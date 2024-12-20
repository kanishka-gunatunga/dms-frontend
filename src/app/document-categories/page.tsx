/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Heading from "@/components/common/Heading";
import LoadingSpinner from "@/components/common/LoadingSpinner";
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
import { CategoryDropdownItem } from "@/types/types";
import { AiOutlineDelete } from "react-icons/ai";
import { FaPlus } from "react-icons/fa6";
import ToastMessage from "@/components/common/Toast";
import {
  MdOutlineEdit,
  MdOutlineKeyboardDoubleArrowDown,
  MdOutlineKeyboardDoubleArrowRight,
} from "react-icons/md";
import { IoCheckmark, IoClose, IoFolder, IoSaveOutline } from "react-icons/io5";
import { MdOutlineCancel } from "react-icons/md";
import {
  fetchCategoryChildrenData,
  fetchCategoryData,
} from "@/utils/dataFetchFunctions";
import { deleteWithAuth, getWithAuth, postWithAuth } from "@/utils/apiClient";
import { usePermissions } from "@/context/userPermissions";
import { hasPermission } from "@/utils/permission";

interface Category {
  id: number;
  parent_category: string;
  category_name: string;
  children?: Category[];
}

export default function AllDocTable() {
  const permissions = usePermissions();
  const [category_name, setCategoryName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [dummyData, setDummyData] = useState<Category[]>([]);
  const [categoryDropDownData, setCategoryDropDownData] = useState<
    CategoryDropdownItem[]
  >([]);
  // const [collapsedRows, setCollapsedRows] = useState<{
  //   [key: number]: boolean;
  // }>({});
  const [collapsedRows, setCollapsedRows] = useState<Record<number, boolean>>(
    {}
  );
  const [selectedParentId, setSelectedParentId] = useState<number>();
  const [selectedItemId, setSelectedItemId] = useState<number>();
  const isAuthenticated = useAuth();
  const [editData, setEditData] = useState({
    parent_category: "",
    category_name: "",
    description: "",
  });

  const [modalStates, setModalStates] = useState({
    addCategory: false,
    addChildCategory: false,
    editModel: false,
    deleteModel: false,
  });

  useEffect(() => {
    fetchCategoryChildrenData(setDummyData);
    fetchCategoryData(setCategoryDropDownData);
  }, []);

  useEffect(() => {
    // console.log("se:: id::", selectedItemId);
    if (modalStates.editModel && selectedItemId !== null) {
      fetchCategoryDetails();
    }
  }, [modalStates.editModel, selectedItemId]);

  const toggleCollapse = (id: number) => {
    setCollapsedRows((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };

  const handleEditCategorySelect = (value: string) => {
    if (value === "none") {
      setEditData((prevData) => ({
        ...prevData,
        parent_category: "none",
        category_name: "",
      }));
    } else {
      const selectedCategory = categoryDropDownData.find(
        (item) => item.id.toString() === value
      );
      setEditData((prevData) => ({
        ...prevData,
        parent_category: selectedCategory?.id.toString() || "",
        category_name: selectedCategory?.category_name || "",
      }));
    }
  };

  const handleOpenModal = (modalName: keyof typeof modalStates) => {
    setModalStates((prev) => ({ ...prev, [modalName]: true }));
  };

  const handleCloseModal = (modalName: keyof typeof modalStates) => {
    setModalStates((prev) => ({ ...prev, [modalName]: false }));
  };

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

  const handleAddCategory = async () => {
    try {
      const formData = new FormData();
      formData.append("parent_category", selectedCategoryId);
      formData.append("category_name", category_name || "");
      formData.append("description", description);
      const response = await postWithAuth(`add-category`, formData);
      if (response.status === "success") {
        handleCloseModal("addCategory");
        setToastType("success");
        setToastMessage("Category added successfully!");
        setToastMessage("Category added successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        fetchCategoryChildrenData(setDummyData);
        fetchCategoryData(setCategoryDropDownData);
      } else {
        handleCloseModal("addCategory");
        setToastType("error");
        setToastMessage("Category Add failed!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      setToastType("error");
      setToastMessage("Error occurred while new version updating!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
      console.error("Error new version updating:", error);
    }
  };

  const handleAddChildCategory = async () => {
    try {
      const formData = new FormData();
      formData.append("parent_category", selectedParentId?.toString() || "");
      formData.append("category_name", category_name || "");
      formData.append("description", description);
      const response = await postWithAuth(`add-category`, formData);
      if (response.status === "success") {
        handleCloseModal("addChildCategory");
        setToastType("success");
        setToastMessage("Chiled category added successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        fetchCategoryChildrenData(setDummyData);
        fetchCategoryData(setCategoryDropDownData);
      } else {
        handleCloseModal("addChildCategory");
        setToastType("error");
        setToastMessage("Chiled category add failed!");
        setToastMessage("Category add failed!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      setToastType("error");
      setToastMessage("Error occurred while new version updating!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
      console.error("Error new version updating:", error);
    }
  };

  const fetchCategoryDetails = async () => {
    // console.log("edit", selectedItemId);
    try {
      const response = await getWithAuth(`category-details/${selectedItemId}`);
      if (response.status === "fail") {
        // console.log("category data fail::: ",response)
      } else {
        setEditData(response);
        // console.log("category data::: ", response);
      }
    } catch (error) {
      console.error("Error new version updating:", error);
    }
  };

  const handleEditCategory = async () => {
    try {
      const formData = new FormData();
      formData.append("parent_category", editData.parent_category || "");
      formData.append("category_name", editData.category_name || "");
      formData.append("description", editData.description);
      const response = await postWithAuth(
        `category-details/${selectedItemId}`,
        formData
      );
      if (response.status === "success") {
        handleCloseModal("editModel");
        setToastType("success");
        setToastMessage("Category updated successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);

        fetchCategoryChildrenData(setDummyData);
        fetchCategoryData(setCategoryDropDownData);
      } else {
        handleCloseModal("editModel");
        setToastType("error");
        setToastMessage("Category update failed!");
        setToastMessage("Category save failed!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      setToastType("error");
      setToastMessage("Error occurred while new version updating!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
      console.error("Error new version updating:", error);
    }
  };

  const handleDeleteCategory = async () => {
    // console.log("delete", selectedItemId);
    try {
      const response = await deleteWithAuth(
        `delete-category/${selectedItemId}`
      );
      if (response.status === "success") {
        handleCloseModal("deleteModel");
        setToastType("success");
        setToastMessage("Category deleted successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        fetchCategoryChildrenData(setDummyData);
        fetchCategoryData(setCategoryDropDownData);
      } else {
        handleCloseModal("deleteModel");
        setToastType("error");
        setToastMessage("Category delete failed!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      handleCloseModal("deleteModel");
      setToastType("error");
      setToastMessage("Error occurred while new version updating!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
      console.error("Error new version updating:", error);
    }
  };
  return (
    <>
      <DashboardLayout>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <Heading text="Document Categories" color="#444" />
          {hasPermission(
            permissions,
            "Document Categories",
            "Manage Document Category"
          ) && (
              <button
                onClick={() => handleOpenModal("addCategory")}
                className="addButton bg-white text-dark border border-success rounded px-3 py-1"
              >
                <FaPlus className="me-1" /> Add Document Category
              </button>
            )}
        </div>
        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
          <div>
            <div
              style={{ maxHeight: "380px", overflowY: "auto" }}
              className="custom-scroll"
            >
              <Table hover responsive>
                <thead className="sticky-header">
                  <tr>
                    <th className="text-center" style={{ width: "10%" }}></th>
                    <th className="text-start" style={{ width: "20%" }}>
                      Action
                    </th>
                    <th className="text-start" style={{ width: "70%" }}>
                      Name
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <React.Fragment key={item.id}>
                        <tr>
                          <td>
                            <button
                              onClick={() => toggleCollapse(item.id)}
                              className="custom-icon-button text-secondary"
                            >
                              {collapsedRows[item.id] ? (
                                <MdOutlineKeyboardDoubleArrowDown
                                  fontSize={20}
                                />
                              ) : (
                                <MdOutlineKeyboardDoubleArrowRight
                                  fontSize={20}
                                />
                              )}
                            </button>
                          </td>
                          <td className="d-flex flex-row">
                            {hasPermission(
                              permissions,
                              "Document Categories",
                              "Manage Document Category"
                            ) && (
                                <button
                                  onClick={() => {
                                    handleOpenModal("editModel");
                                    setSelectedItemId(item.id);
                                  }}
                                  className="custom-icon-button button-success px-3 py-1 rounded me-2"
                                >
                                  <MdOutlineEdit fontSize={16} className="me-1" />{" "}
                                  Edit
                                </button>
                              )}

                            {hasPermission(
                              permissions,
                              "Document Categories",
                              "Manage Document Category"
                            ) && (
                                <button
                                  onClick={() => {
                                    handleOpenModal("deleteModel");
                                    setSelectedItemId(item.id);
                                  }}
                                  className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
                                >
                                  <AiOutlineDelete
                                    fontSize={16}
                                    className="me-1"
                                  />{" "}
                                  Delete
                                </button>
                              )}
                          </td>
                          <td>{item.category_name}</td>
                        </tr>

                        {collapsedRows[item.id] && (
                          <tr>
                            <td
                              colSpan={3}
                              style={{
                                paddingLeft: "10%",
                                paddingRight: "10%",
                              }}
                            >
                              <table className="table rounded">
                                <thead>
                                  <tr>
                                    <td colSpan={2}>
                                      <div className="d-flex flex-row justify-content-between align-items-center">
                                        <div className="col-6">
                                          <Paragraph
                                            color="#333"
                                            text="Child Categories"
                                          />
                                        </div>
                                        <div className="col-6 text-end">
                                          {hasPermission(
                                            permissions,
                                            "Document Categories",
                                            "Manage Document Category"
                                          ) && (
                                              <button
                                                onClick={() => {
                                                  handleOpenModal(
                                                    "addChildCategory"
                                                  );
                                                  setSelectedParentId(item.id);
                                                }}
                                                className="addButton bg-success text-white border border-success rounded px-3 py-1"
                                              >
                                                <FaPlus className="me-1" /> Add
                                                Child Category
                                              </button>
                                            )}
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                  <tr>
                                    <th className="text-start">Actions</th>
                                    <th className="text-start">Name</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {item.children && item.children.length > 0 ? (
                                    item.children.map((child) => (
                                      <tr key={child.id}>
                                        <td className="d-flex flex-row">
                                          {hasPermission(
                                            permissions,
                                            "Document Categories",
                                            "Manage Document Category"
                                          ) && (
                                              <button
                                                onClick={() => {
                                                  handleOpenModal("editModel");
                                                  setSelectedItemId(child.id);
                                                }}
                                                className="custom-icon-button button-success px-3 py-1 rounded me-2"
                                              >
                                                <MdOutlineEdit
                                                  fontSize={16}
                                                  className="me-1"
                                                />{" "}
                                                Edit
                                              </button>
                                            )}
                                          {hasPermission(
                                            permissions,
                                            "Document Categories",
                                            "Manage Document Category"
                                          ) && (
                                              <button
                                                onClick={() => {
                                                  handleOpenModal("deleteModel");
                                                  setSelectedItemId(child.id);
                                                }}
                                                className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
                                              >
                                                <AiOutlineDelete
                                                  fontSize={16}
                                                  className="me-1"
                                                />{" "}
                                                Delete
                                              </button>
                                            )}
                                        </td>
                                        <td>{child.category_name}</td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td
                                        colSpan={2}
                                        className="text-center py-3"
                                      >
                                        No child categories available.
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-start w-100 py-3">
                        <Paragraph text="No data available" color="#333" />
                      </td>
                    </tr>
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
        <ToastMessage
          message={toastMessage}
          show={showToast}
          onClose={() => setShowToast(false)}
          type={toastType}
        />
      </DashboardLayout>

      {/* add parent */}
      <Modal
        centered
        show={modalStates.addCategory}
        onHide={() => {
          handleCloseModal("addCategory");
        }}
      >
        <Modal.Header>
          <div className="d-flex w-100 justify-content-end">
            <div className="col-11 d-flex flex-row">
              <IoFolder fontSize={20} className="me-2" />
              <p className="mb-0" style={{ fontSize: "16px", color: "#333" }}>
                Add New Category
              </p>
            </div>
            <div className="col-1 d-flex justify-content-end">
              <IoClose
                fontSize={20}
                style={{ cursor: "pointer" }}
                onClick={() => handleCloseModal("addCategory")}
              />
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className="py-3">
          <div
            className="d-flex flex-column custom-scroll mb-3"
            style={{ maxHeight: "200px", overflowY: "auto" }}
          >
            <div className="col-12 col-lg-12 d-flex flex-column mb-2">
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                Parent Category
              </p>
              <DropdownButton
                id="dropdown-category-button"
                title={
                  selectedCategoryId === "none"
                    ? "None"
                    : categoryDropDownData.find(
                      (item) => item.id.toString() === selectedCategoryId
                    )?.category_name || "Select Category"
                }
                className="custom-dropdown-text-start text-start w-100"
                onSelect={(value) => handleCategorySelect(value || "")}
              >
                <Dropdown.Item
                  key="none"
                  eventKey="none"
                  style={{
                    fontWeight: "bold",
                    marginLeft: "0px",
                  }}
                >
                  None
                </Dropdown.Item>
                {categoryDropDownData
                  .filter((category) => category.parent_category === "none")
                  .map((category) => (
                    <Dropdown.Item
                      key={category.id}
                      eventKey={category.id.toString()}
                      style={{
                        fontWeight: "bold",
                        marginLeft: "0px",
                      }}
                    >
                      {category.category_name}
                    </Dropdown.Item>
                  ))}
              </DropdownButton>
            </div>
            <div className="col-12 col-lg-12 d-flex flex-column mb-2">
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                Category Name
              </p>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  value={category_name}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-lg-12 d-flex flex-column mb-2">
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                Description
              </p>
              <textarea
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex flex-row">
            <button
              onClick={() => handleAddCategory()}
              className="custom-icon-button button-success px-3 py-1 rounded me-2"
            >
              <IoSaveOutline fontSize={16} className="me-1" /> Save
            </button>
            <button
              onClick={() => {
                handleCloseModal("addCategory");
              }}
              className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
            >
              <MdOutlineCancel fontSize={16} className="me-1" /> Cancel
            </button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* add child */}
      <Modal
        centered
        show={modalStates.addChildCategory}
        onHide={() => {
          handleCloseModal("addChildCategory");
        }}
      >
        <Modal.Header>
          <div className="d-flex w-100 justify-content-end">
            <div className="col-11 d-flex flex-row">
              <IoFolder fontSize={20} className="me-2" />
              <p className="mb-0" style={{ fontSize: "16px", color: "#333" }}>
                Add New Category
              </p>
            </div>
            <div className="col-1 d-flex justify-content-end">
              <IoClose
                fontSize={20}
                style={{ cursor: "pointer" }}
                onClick={() => handleCloseModal("addChildCategory")}
              />
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className="py-3">
          <div
            className="d-flex flex-column custom-scroll mb-3"
            style={{ maxHeight: "200px", overflowY: "auto" }}
          >
            <div className="col-12 col-lg-12 d-flex flex-column mb-2">
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                Parent Category
              </p>
              <DropdownButton
                id="dropdown-category-button"
                title={
                  selectedCategoryId.toString() === "none"
                    ? "None"
                    : selectedCategoryId
                      ? categoryDropDownData.find(
                        (item) => item.id.toString() === selectedCategoryId
                      )?.category_name || "Select Category"
                      : "Select Category"
                }
                className="custom-dropdown-text-start text-start w-100"
                onSelect={(value) => handleCategorySelect(value || "none")}
              >
                <Dropdown.Item
                  key="none"
                  eventKey="none"
                  style={{
                    fontWeight: "bold",
                    marginLeft: "0px",
                  }}
                >
                  None
                </Dropdown.Item>
                {categoryDropDownData
                  .filter((category) => category.parent_category === "none")
                  .map((category) => (
                    <Dropdown.Item
                      key={category.id}
                      eventKey={category.id.toString()}
                      style={{
                        fontWeight: "bold",
                        marginLeft: "0px",
                      }}
                    >
                      {category.category_name}
                    </Dropdown.Item>
                  ))}
              </DropdownButton>
            </div>
            <div className="col-12 col-lg-12 d-flex flex-column mb-2">
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                Category Name
              </p>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  value={category_name}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-lg-12 d-flex flex-column mb-2">
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                Description
              </p>
              <textarea
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex flex-row">
            <button
              onClick={() => handleAddChildCategory()}
              className="custom-icon-button button-success px-3 py-1 rounded me-2"
            >
              <IoSaveOutline fontSize={16} className="me-1" /> Save
            </button>
            <button
              onClick={() => {
                handleCloseModal("addChildCategory");
              }}
              className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
            >
              <MdOutlineCancel fontSize={16} className="me-1" /> Cancel
            </button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* edit */}
      <Modal
        centered
        show={modalStates.editModel}
        onHide={() => {
          handleCloseModal("editModel");
        }}
      >
        <Modal.Header>
          <div className="d-flex w-100 justify-content-end">
            <div className="col-11 d-flex flex-row">
              <IoFolder fontSize={20} className="me-2" />
              <p className="mb-0" style={{ fontSize: "16px", color: "#333" }}>
                Edit Category
              </p>
            </div>
            <div className="col-1 d-flex justify-content-end">
              <IoClose
                fontSize={20}
                style={{ cursor: "pointer" }}
                onClick={() => handleCloseModal("editModel")}
              />
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className="py-3">
          <div
            className="d-flex flex-column custom-scroll mb-3"
            style={{ maxHeight: "200px", overflowY: "auto" }}
          >
            <div className="col-12 col-lg-12 d-flex flex-column mb-2">
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                Parent Category
              </p>
              <DropdownButton
                id="dropdown-category-button"
                title={
                  editData.parent_category === "none"
                    ? "None"
                    : categoryDropDownData.find(
                      (item) =>
                        item.id.toString() === editData.parent_category
                    )?.category_name || "Select Category"
                }
                className="custom-dropdown-text-start text-start w-100"
                onSelect={(value) => handleEditCategorySelect(value || "")}
              >
                <Dropdown.Item
                  key="none"
                  eventKey="none"
                  style={{
                    fontWeight: "bold",
                    marginLeft: "0px",
                  }}
                >
                  None
                </Dropdown.Item>

                {categoryDropDownData
                  .filter((category) => category.parent_category === "none")
                  .map((category) => (
                    <Dropdown.Item
                      key={category.id}
                      eventKey={category.id.toString()}
                      style={{
                        fontWeight: "bold",
                        marginLeft: "0px",
                      }}
                    >
                      {category.category_name}
                    </Dropdown.Item>
                  ))}
              </DropdownButton>
            </div>
            <div className="col-12 col-lg-12 d-flex flex-column mb-2">
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                Category Name
              </p>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  value={editData.category_name}
                  onChange={(e) =>
                    setEditData((prevData) => ({
                      ...prevData,
                      category_name: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="col-12 col-lg-12 d-flex flex-column mb-2">
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                Description
              </p>
              <textarea
                className="form-control"
                value={editData.description}
                onChange={(e) =>
                  setEditData((prevData) => ({
                    ...prevData,
                    description: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex flex-row">
            <button
              onClick={() => handleEditCategory()}
              className="custom-icon-button button-success px-3 py-1 rounded me-2"
            >
              <IoSaveOutline fontSize={16} className="me-1" /> Save
            </button>
            <button
              onClick={() => {
                handleCloseModal("editModel");
              }}
              className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
            >
              <MdOutlineCancel fontSize={16} className="me-1" /> Cancel
            </button>
          </div>
        </Modal.Footer>
      </Modal>

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
                onClick={() => handleDeleteCategory()}
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
    </>
  );
}
