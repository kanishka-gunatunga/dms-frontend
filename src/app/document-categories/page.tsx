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
import {
  CategoryDropdownItem,
} from "@/types/types";
import { AiOutlineDelete } from "react-icons/ai";
import { FaPlus } from "react-icons/fa6";
import ToastMessage from "@/components/common/Toast";
import {
  MdOutlineEdit,
  MdOutlineKeyboardDoubleArrowDown,
  MdOutlineKeyboardDoubleArrowRight,
} from "react-icons/md";
import {
  IoAdd,
  IoCheckmark,
  IoClose,
  IoEye,
  IoFolder,
  IoSaveOutline,
  IoSettings,
  IoShareSocial,
  IoTrash,
  IoTrashOutline,
} from "react-icons/io5";
import {
  MdArrowDropDown,
  MdArrowDropUp,
  MdEmail,
  MdFileDownload,
  MdModeEditOutline,
  MdOutlineCancel,
  MdOutlineInsertLink,
  MdUpload,
} from "react-icons/md";
import {
  fetchCategoryData,
} from "@/utils/dataFetchFunctions"
import { deleteWithAuth, getWithAuth, postWithAuth } from "@/utils/apiClient";

interface Category {
  id: number;
  parent_category: string;
  category_name: string;
  children?: Category[];
}


export default function AllDocTable() {
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
  const [collapsedRows, setCollapsedRows] = useState<{
    [key: number]: boolean;
  }>({});
  const isAuthenticated = useAuth();

const [modalStates, setModalStates] = useState({
    addCategory: false,
  });

  useEffect(() => {
      fetchCategoryData(setDummyData);
      fetchCategoryData(setCategoryDropDownData);
    }, []);



  const fetchChildren = async () => {
    try {
      const response = await getWithAuth("categories");
      console.log("categories data:", response);
      return response
    } catch (error) {
      console.error("Failed to fetch categories data:", error);
    }
  };
  const handleOpenModal = (
    modalName: keyof typeof modalStates,
  ) => {
    setModalStates((prev) => ({ ...prev, [modalName]: true }));
  };
  const handleCloseModal = (modalName: keyof typeof modalStates) => {
    setModalStates((prev) => ({ ...prev, [modalName]: false }));
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedData = await fetchChildren(); 
        if (fetchedData) {
          setDummyData(transformData(fetchedData)); 
        }
      } catch (error) {
        console.error("Failed to fetch categories data:", error);
      }
    };
  
    fetchData(); 
  }, []);
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };
const handleAddCategory = async () => {
    try {
      const formData = new FormData();
      formData.append("parent_category", selectedCategoryId);
      formData.append("category_name", category_name || "");
      formData.append("description", description);
      const response = await postWithAuth(
        `add-category`,
        formData
      );
      if (response.status === "success") {
        handleCloseModal("addCategory");
        setToastType("success");
        setToastMessage("Document save successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      } else {
        setToastType("error");
        setToastMessage("Document save failed!");
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

  const transformData = (categories: Category[]): Category[] => {
    const categoryMap = new Map<number, Category>();
  
    categories.forEach((category) => {
      categoryMap.set(category.id, { ...category, children: [] });
    });
  
    const transformedData: Category[] = [];
  
    categories.forEach((category) => {
      if (category.parent_category === "none") {
        transformedData.push(categoryMap.get(category.id)!);
      } else {
        const parentId = parseInt(category.parent_category, 10);
        const parent = categoryMap.get(parentId);
        if (parent) {
          parent.children!.push(categoryMap.get(category.id)!);
        }
      }
    });
  
    return transformedData;
  };
  
  

  console.log("dummyData: ", dummyData);

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  const toggleCollapse = (id: number) => {
    setCollapsedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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


  const handleAddChildCategory = () => {
    console.log("child category clicked");
  };

  return (
    <>
      <DashboardLayout>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <Heading text="Document Categories" color="#444" />
          <button
           onClick={() =>
            handleOpenModal(
              "addCategory"
            )
          }
            className="addButton bg-white text-dark border border-success rounded px-3 py-1"
          >
            <FaPlus className="me-1" /> Add Document Category
          </button>
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
                            {item.children && item.children.length > 0 && (
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
                            )}
                          </td>
                          <td>
                            <button className="custom-icon-button button-success px-3 py-1 rounded me-2">
                              <MdOutlineEdit fontSize={16} className="me-1" />{" "}
                              Edit
                            </button>
                            <button className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded">
                              <AiOutlineDelete fontSize={16} className="me-1" />{" "}
                              Delete
                            </button>
                          </td>
                          <td>{item.category_name}</td>
                        </tr>

                        {item.children &&
                          item.children.length > 0 &&
                          collapsedRows[item.id] && (
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
                                            <button
                                              onClick={handleAddChildCategory}
                                              className="addButton bg-success text-white border border-success rounded px-3 py-1"
                                            >
                                              <FaPlus className="me-1" /> Add
                                              Child Category
                                            </button>
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
                                    {item.children.map((child) => (
                                      <tr key={child.id}>
                                        <td>
                                          <button className="custom-icon-button button-success px-3 py-1 rounded me-2">
                                            <MdOutlineEdit
                                              fontSize={16}
                                              className="me-1"
                                            />{" "}
                                            Edit
                                          </button>
                                          <button className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded">
                                            <AiOutlineDelete
                                              fontSize={16}
                                              className="me-1"
                                            />{" "}
                                            Delete
                                          </button>
                                        </td>
                                        <td>{child.category_name}</td>
                                      </tr>
                                    ))}
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
              <div className="col-12 col-lg-12 d-flex flex-column">
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
              Parent Category
              </p>
              <DropdownButton
                id="dropdown-category-button"
                title={
                  selectedCategoryId
                    ? categoryDropDownData.find(
                        (item) => item.id.toString() === selectedCategoryId
                      )?.category_name
                    : "Select Category"
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
              <div className="col-12 col-lg-12 d-flex flex-column">
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
              <div className="col-12 col-lg-12 d-flex flex-column">
                  <p
                    className="mb-1 text-start w-100"
                    style={{ fontSize: "14px" }}
                  >
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
                onClick={() =>
                  handleAddCategory()
                }
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
    </>
    
  );
}
