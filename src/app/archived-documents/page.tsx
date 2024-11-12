"use client";

import Heading from "@/components/common/Heading";
import Paragraph from "@/components/common/Paragraph";
import DashboardLayout from "@/components/DashboardLayout";
import React, { useState } from "react";
import {
  Dropdown,
  DropdownButton,
  Form,
  Pagination,
  Table,
} from "react-bootstrap";
import { FaEllipsisV } from "react-icons/fa";
import { MdArrowDropDown, MdArrowDropUp } from "react-icons/md";

interface TableItem {
  id: number;
  name: string;
  documentCategory: string;
  storage: string;
  createdDate: string;
  createdBy: string;
}
const dummyData: TableItem[] = Array.from({ length: 50 }, (_, index) => ({
  id: index + 1,
  name: `Item ${index + 1}`,
  documentCategory: "Test",
  storage: "Local Disk (Default)",
  createdDate: new Date(Date.now() - index * 1000000000).toLocaleDateString(),
  createdBy: "Admin Account",
}));

export default function AllDocTable() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] =
    useState<string>("Select category");
  const [selectedStorage, setSelectedStorage] = useState<string>("Storage");

  const handleCategorySelect = (selected: string) => {
    setSelectedCategory(selected);
  };

  const handleStorageSelect = (selected: string) => {
    setSelectedStorage(selected);
  };

  const totalItems = dummyData.length;
  const totalPages = Math.ceil(dummyData.length / itemsPerPage);

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);
  //   const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber);
  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Sorting
  const handleSort = () => setSortAsc(!sortAsc);

  // Change items per page
  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Paginate and sort data
  const sortedData = [...dummyData].sort((a, b) =>
    sortAsc
      ? new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime()
      : new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
  );
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <DashboardLayout>
        <Heading text="All Documents" color="#444" />
        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
          <div className="d-flex flex-column flex-lg-row">
            <div className="col-12 col-lg-6 d-flex flex-column flex-lg-row">
              <div className="input-group mb-3 pe-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name or description"
                ></input>
              </div>
              <div className="input-group mb-3 pe-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by meta tags"
                ></input>
              </div>
            </div>
            <div className="col-12 col-lg-6 d-flex flex-column flex-lg-row">
              <div className="col-12 col-lg-6">
                <div className="input-group mb-3">
                  <DropdownButton
                    id="dropdown-category-button"
                    title={selectedCategory}
                    className="w-100"
                  >
                    <Dropdown.Item onClick={() => handleCategorySelect("View")}>
                      View
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleCategorySelect("Edit")}>
                      Edit
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => handleCategorySelect("Share")}
                    >
                      Share
                    </Dropdown.Item>
                  </DropdownButton>
                </div>
              </div>
              <div className="col-12 col-lg-6 px-2">
                <div className="input-group mb-3">
                  <DropdownButton
                    id="dropdown-storage-button"
                    title={selectedStorage}
                    className="w-100"
                  >
                    <Dropdown.Item onClick={() => handleStorageSelect("View")}>
                      View
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleStorageSelect("Edit")}>
                      Edit
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleStorageSelect("Share")}>
                      Share
                    </Dropdown.Item>
                  </DropdownButton>
                </div>
              </div>
            </div>
          </div>
          <div>
            {/* Scrollable Table Container */}
            <div
              style={{ maxHeight: "380px", overflowY: "auto" }}
              className="custom-scroll"
            >
              <Table hover>
                <thead>
                  <tr>
                    <th>Actions</th>
                    <th>Name</th>
                    <th>Document Category</th>
                    <th>Storage</th>
                    <th onClick={handleSort} style={{ cursor: "pointer" }}>
                      Created Date{" "}
                      {sortAsc ? (
                        <MdArrowDropUp fontSize={20} />
                      ) : (
                        <MdArrowDropDown fontSize={20} />
                      )}
                    </th>
                    <th>Created By</th>
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
                            <Dropdown.Item href="#">View</Dropdown.Item>
                            <Dropdown.Item href="#">Edit</Dropdown.Item>
                            <Dropdown.Item href="#">Share</Dropdown.Item>
                            <Dropdown.Item href="#">
                              Get Shareable Link
                            </Dropdown.Item>
                            <Dropdown.Item href="#">Download</Dropdown.Item>
                            <Dropdown.Item href="#">
                              Upload New Version file
                            </Dropdown.Item>
                            <Dropdown.Item href="#">
                              Version History
                            </Dropdown.Item>
                            <Dropdown.Item href="#">Comment</Dropdown.Item>
                            <Dropdown.Item href="#">Add Reminder</Dropdown.Item>
                            <Dropdown.Item href="#">Send Email</Dropdown.Item>
                            <Dropdown.Item href="#">
                              Remove Indexing
                            </Dropdown.Item>
                            <Dropdown.Item href="#">Archive</Dropdown.Item>
                            <Dropdown.Item href="#">Delete</Dropdown.Item>
                          </DropdownButton>
                        </td>
                        <td>{item.name}</td>
                        <td>{item.documentCategory}</td>
                        <td>{item.storage}</td>
                        <td>{item.createdDate}</td>
                        <td>{item.createdBy}</td>
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

            <div className="d-flex flex-column flex-lg-row">
              {/* Items per page selector */}
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Paragraph text="Items per page:" color="#333" />
                <Form.Select
                  onChange={handleItemsPerPageChange}
                  value={itemsPerPage}
                  style={{ width: "150px" }}
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
