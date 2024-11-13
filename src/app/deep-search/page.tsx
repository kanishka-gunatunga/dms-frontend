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
import { FaEllipsisV } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { MdArrowDropDown, MdArrowDropUp } from "react-icons/md";

interface TableItem {
  id: number;
  name: string;
  documentCategory: string;
  storage: string;
  createdDate: string;
  createdBy: string;
}
const dummyData: TableItem[] = Array.from({ length: 2 }, (_, index) => ({
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
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);

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

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]); // Deselect all
    } else {
      setSelectedItems(dummyData.map((item) => item.id)); // Select all
    }
    setSelectAll(!selectAll);
  };

  // Handle checkbox selection
  const handleCheckboxChange = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    if (!selectedItems.includes(id)) {
      console.log(id);
    }
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
        <Heading text="Deep Search" color="#444" />
        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
          <div className="d-flex flex-column flex-lg-row">
            <div className="col-12">
              <div className="input-group mb-3">
                <input
                  type="search"
                  className="form-control"
                  placeholder="Type here to search within PDFs, Word, and more..."
                  aria-label="Type here to search within PDFs, Word, and more..."
                  aria-describedby="basic-addon2"
                ></input>
                <span className="input-group-text" id="basic-addon2">
                  <FiSearch />
                </span>
              </div>
              <p
                className="text-danger"
                style={{ fontSize: "14px", fontWeight: "400" }}
              >
                You will receive up to 10 results for each search. The search is
                not case-sensitive, so searching for &quot;Report&quot; and
                &quot;report&quot; will return the same results. Common words
                like &quot;and,&quot; &quot;the,&quot; and &quot;is&quot; are
                ignored to improve search efficiency. The search also matches
                variations of words, so searching for &quot;run&quot; will
                include results for &quot;running&quot; and &quot;runs.&quot;
                Supported file types include Word documents, PDFs, Notepad
                files, and Excel spreadsheets.
              </p>
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
                    <th>
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="custom-checkbox"
                        style={{
                          display: "flex",
                          alignSelf: "center",
                          justifySelf: "center",
                        }}
                      />
                    </th>
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
                          <input
                            type="checkbox"
                            className="custom-checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleCheckboxChange(item.id)}
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
                        <td>
                          <Link href="#">{item.name}</Link>
                        </td>
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
