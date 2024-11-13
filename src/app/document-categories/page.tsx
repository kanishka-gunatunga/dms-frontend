"use client";

import Heading from "@/components/common/Heading";
import Paragraph from "@/components/common/Paragraph";
import DashboardLayout from "@/components/DashboardLayout";
import React, { useState } from "react";
import { Form, Pagination, Table } from "react-bootstrap";
import { AiOutlineDelete } from "react-icons/ai";
import { MdExpandLess, MdExpandMore, MdOutlineEdit } from "react-icons/md";

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

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Change items per page
  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Paginate and sort data
  const paginatedData = dummyData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <DashboardLayout>
        <Heading text="Document Categories" color="#444" />
        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
          <div>
            {/* Scrollable Table Container */}
            <div
              style={{ maxHeight: "380px", overflowY: "auto" }}
              className="custom-scroll"
            >
              <Table hover>
                <thead>
                  <tr>
                    <th></th>
                    <th>Action</th>
                    <th>Name</th>
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
                                  <MdExpandLess />
                                ) : (
                                  <MdExpandMore />
                                )}
                              </button>
                            )}
                          </td>
                          <td>
                            <button className="custom-icon-button text-success me-3">
                              <MdOutlineEdit fontSize={20} />
                            </button>
                            <button className="custom-icon-button text-danger">
                              <AiOutlineDelete fontSize={20} />
                            </button>
                          </td>
                          <td>{item.name}</td>
                        </tr>
                        {item.children &&
                          item.children.length > 0 &&
                          collapsedRows[item.id] && (
                            <>
                              {/* Header row for Child Categories */}
                              <tr className="px-5">
                                <td colSpan={3}>
                                  <div className="d-flex flex-row justify-content-between">
                                    <div className="col-6">
                                      <Paragraph
                                        color="#333"
                                        text="Child Categories"
                                      />
                                    </div>
                                    <div className="col-6 text-end">
                                      <button>Add Child Category</button> 
                                    </div>
                                  </div>
                                </td>
                              </tr>
                              {/* Child category rows */}
                              {item.children.map((child) => (
                                <tr key={child.id}>
                                  <td></td>
                                  <td>
                                    <button className="custom-icon-button text-success me-3">
                                      <MdOutlineEdit fontSize={16} />
                                    </button>
                                    <button className="custom-icon-button text-danger">
                                      <AiOutlineDelete fontSize={16} />
                                    </button>
                                  </td>
                                  <td>{child.name}</td>
                                </tr>
                              ))}
                            </>
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

            <div className="d-flex flex-column flex-lg-row">
              {/* Items per page selector */}
              <div className="d-flex justify-content-between align-items-center mb-2">
              <p className="pagintionText mb-0 me-2">Items per page:</p>
                <Form.Select
                  onChange={handleItemsPerPageChange}
                  value={itemsPerPage}
                  style={{ width: "100px", padding: "5px 10px !important", fontSize: "12px" }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                </Form.Select>
              </div>
              {/* Pagination */}
              <div className="d-flex flex-row align-items-center px-lg-5">
                <div className="pagination-info" style={{ fontSize: "14px" }}>
                  {startIndex} – {endIndex} of {totalItems}
                </div>

                <Pagination className="mt-2 ms-3">
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
