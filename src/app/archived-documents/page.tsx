"use client";

import Heading from "@/components/common/Heading";
import Paragraph from "@/components/common/Paragraph";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import React, { useState } from "react";
import {
  Dropdown,
  DropdownButton,
  Form,
  Pagination,
  Table,
} from "react-bootstrap";
import { AiOutlineZoomOut, AiFillDelete } from "react-icons/ai";
import { BiSolidCommentDetail } from "react-icons/bi";
import { BsBellFill } from "react-icons/bs";
import { FaArchive, FaEllipsisV } from "react-icons/fa";
import { GoHistory } from "react-icons/go";
import { IoEye, IoShareSocial } from "react-icons/io5";
import { MdArrowDropDown, MdArrowDropUp, MdEmail, MdFileDownload, MdModeEditOutline, MdOutlineInsertLink, MdUpload } from "react-icons/md";

interface TableItem {
  id: number;
  name: string;
  documentCategory: string;
  storage: string;
  createdDate: string;
  createdBy: string;
}
const dummyData: TableItem[] = Array.from({ length: 1 }, (_, index) => ({
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
        <div className="d-flex justify-content-between align-items-center pt-2">
          <Heading text="Archived Documents" color="#444" />
        </div>
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
                    className="w-100 custom-dropdown"
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
                    className="w-100 custom-dropdown"
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
                    <th className="text-start">Name</th>
                    <th className="text-start">Document Category</th>
                    <th className="text-start">Storage</th>
                    <th className="text-start" onClick={handleSort} style={{ cursor: "pointer" }}>
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
                      <tr key={item.id}>
                        <td>
                        <DropdownButton
                            id="dropdown-basic-button"
                            drop="end"
                            title={<FaEllipsisV />}
                            className="no-caret"
                          >
                            <Dropdown.Item href="#" className="py-2">
                              <IoEye className="me-2" />
                              View
                            </Dropdown.Item>
                            <Dropdown.Item href="#" className="py-2">
                              <MdModeEditOutline className="me-2" />
                              Edit
                            </Dropdown.Item>
                            <Dropdown.Item href="#" className="py-2">
                              <IoShareSocial className="me-2" />
                              Share
                            </Dropdown.Item>
                            <Dropdown.Item href="#" className="py-2">
                              <MdOutlineInsertLink className="me-2" />
                              Get Shareable Link
                            </Dropdown.Item>
                            <Dropdown.Item href="#" className="py-2">
                              <MdFileDownload className="me-2" />
                              Download
                            </Dropdown.Item>
                            <Dropdown.Item href="#" className="py-2">
                              <MdUpload className="me-2" />
                              Upload New Version file
                            </Dropdown.Item>
                            <Dropdown.Item href="#" className="py-2">
                              <GoHistory className="me-2" />
                              Version History
                            </Dropdown.Item>
                            <Dropdown.Item href="#" className="py-2">
                              <BiSolidCommentDetail className="me-2" />
                              Comment
                            </Dropdown.Item>
                            <Dropdown.Item href="#" className="py-2">
                              <BsBellFill className="me-2" />
                              Add Reminder
                            </Dropdown.Item>
                            <Dropdown.Item href="#" className="py-2">
                              <MdEmail className="me-2" />
                              Send Email
                            </Dropdown.Item>
                            <Dropdown.Item href="#" className="py-2">
                              <AiOutlineZoomOut className="me-2" />
                              Remove Indexing
                            </Dropdown.Item>
                            <Dropdown.Item href="#" className="py-2">
                              <FaArchive className="me-2" />
                              Archive
                            </Dropdown.Item>
                            <Dropdown.Item href="#" className="py-2">
                              <AiFillDelete className="me-2" />
                              Delete
                            </Dropdown.Item>
                          </DropdownButton>
                        </td>
                        <td><Link href="#">{item.name}</Link></td>
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

            <div className="d-flex flex-column flex-lg-row paginationFooter">
              <div className="d-flex justify-content-between align-items-center">
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
