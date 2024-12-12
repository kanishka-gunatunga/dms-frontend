"use client";

import Heading from "@/components/common/Heading";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Paragraph from "@/components/common/Paragraph";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import { deleteWithAuth } from "@/utils/apiClient";
// import AddCategories from "./add/page";
import React, { useState } from "react";
import { Form, Pagination, Table, Button, Modal } from "react-bootstrap";
import { AiOutlineDelete } from "react-icons/ai";
import { FaPlus } from "react-icons/fa6";
import {
  MdOutlineEdit,
  MdOutlineKeyboardDoubleArrowDown,
  MdOutlineKeyboardDoubleArrowRight,
} from "react-icons/md";

interface TableItem {
  id: number;
  name: string;
  children?: TableItem[];
}

const dummyData: TableItem[] = Array.from({ length: 3 }, (_, index) => ({
  id: index + 1,
  name: `Item ${index + 1}`,
  children: Array.from({ length: 2 }, (_, childIndex) => ({
    id: (index + 1) * 10 + childIndex + 1,
    name: `Child ${index + 1}-${childIndex + 1}`,
  })),
}));

export default function AllDocTable() {
  // const [show, setShow] = useState<boolean>(false);
  // const [parentId, setParentId] = useState<number>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [collapsedRows, setCollapsedRows] = useState<{
    [key: number]: boolean;
  }>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const isAuthenticated = useAuth();

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

  const handleAddCategory = () => {
    // setShow(true);
  };

  const deleteCategory = async (categoryId: number) => {
    setIsDeleting(true);
    try {
      const endpoint = `delete-category/${categoryId}`;
      const data = await deleteWithAuth(endpoint);

      console.log("Category deleted successfully:", data);
    } catch (error) {
      console.error("Error deleting the category:", error);
    } finally {
      setIsDeleting(false);
      setSelectedId(null);
    }
  };

  // const handleAddChildCategory = (id: number) => {
  //   setShow(true);
  //   setParentId(id);
  // };

  return (
    <>
      <DashboardLayout>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <Heading text="Document Categories" color="#444" />
          <button
            onClick={handleAddCategory}
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
              {/* {show && (
                <AddCategories
                  id={parentId ?? 0}
                  isOpen={show}
                  onClose={() => setShow(false)}
                />
              )} */}

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
                            <div className="d-flex">
                            <button className="custom-icon-button button-success px-3 py-1 rounded me-2">
                              <MdOutlineEdit fontSize={16} className="me-1" />{" "}
                              Edit
                            </button>
                            <button
                              onClick={() => setSelectedId(item.id)}
                              className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
                            >
                              <AiOutlineDelete fontSize={16} className="me-1" />{" "}
                              Delete
                            </button>
                            </div>
                          </td>
                          <td>{item.name}</td>
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
                                              // onClick={() =>
                                              //   handleAddChildCategory(item.id)
                                              // }
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
                                        <div className="d-flex">
                                          <button className="custom-icon-button button-success text-black px-3 py-1 rounded me-2">
                                            <MdOutlineEdit
                                              fontSize={16}
                                              className="me-1"
                                            />{" "}
                                            Edit
                                          </button>
                                          <button
                                            onClick={() =>
                                              setSelectedId(child.id)
                                            }
                                            className="custom-icon-button button-danger text-black bg-danger px-3 py-1 rounded"
                                          >
                                            <AiOutlineDelete
                                              fontSize={16}
                                              className="me-1"
                                            />{" "}
                                            Delete
                                          </button>
                                          </div>
                                        </td>
                                        <td>{child.name}</td>
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
                    width: "60px",
                    marginLeft: "0",
                    background: "#f3f3f3",
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </Form.Select>
              </div>
              <div className="paginationRight d-flex justify-content-end align-items-center">
                <p className="pagintionText mb-0 me-2">
                  {startIndex} - {endIndex} of {totalItems}
                </p>
                <Pagination>
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

      {/* Confirmation Modal */}
      <Modal
        show={selectedId !== null}
        onHide={() => setSelectedId(null)}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this category? This action cannot be
          undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedId(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => deleteCategory(selectedId!)}
            disabled={isDeleting}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
