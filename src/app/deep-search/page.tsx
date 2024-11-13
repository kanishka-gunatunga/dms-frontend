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
import { FiSearch } from "react-icons/fi";
import { GoHistory } from "react-icons/go";
import { IoEye, IoShareSocial } from "react-icons/io5";
import {
  MdArrowDropDown,
  MdArrowDropUp,
  MdEmail,
  MdFileDownload,
  MdModeEditOutline,
  MdOutlineInsertLink,
  MdUpload,
} from "react-icons/md";

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

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(dummyData.map((item) => item.id));
    }
    setSelectAll(!selectAll);
  };

  const handleCheckboxChange = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    if (!selectedItems.includes(id)) {
      console.log(id);
    }
  };

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
          <Heading text="Deep Search" color="#444" />
        </div>
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
                  style={{
                    borderTopRightRadius: "0px !important",
                    borderBottomRightRadius: "0px !important",
                  }}
                ></input>
                <span
                  className="input-group-text text-white"
                  id="basic-addon2"
                  style={{
                    backgroundColor: "#683ab7",
                    border: "solid 1px #683ab7 !important",
                    borderTopLeftRadius: "0px !important",
                    borderBottomLeftRadius: "0px !important",
                    fontSize: "14px",
                  }}
                >
                  <FiSearch className="me-2" /> Search
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
