"use client";

import Heading from "@/components/common/Heading";
import Paragraph from "@/components/common/Paragraph";
import DashboardLayout from "@/components/DashboardLayout";
import React, { useState } from "react";
import { Form, Pagination, Table } from "react-bootstrap";
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [collapsedRows, setCollapsedRows] = useState<{
    [key: number]: boolean;
  }>({});

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
    console.log("category clicked");
  };

  const handleAddChildCategory = () => {
    console.log("child category clicked");
  };

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
              <Table>
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
    </>
  );
}
