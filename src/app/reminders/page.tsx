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
import { AiFillDelete } from "react-icons/ai";
import { FaEllipsisV } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import {
  MdArrowDropDown,
  MdArrowDropUp,
  MdModeEditOutline,
} from "react-icons/md";

interface TableItem {
  id: number;
  startDate: string;
  endDate: string;
  subject: string;
  message: string;
  frequency: string;
  document: string;
}

const dummyData: TableItem[] = Array.from({ length: 50 }, (_, index) => ({
  id: index + 1,
  startDate: new Date(Date.now() - index * 1000000000).toLocaleDateString(),
  endDate: new Date(Date.now() - index * 1200000000).toLocaleDateString(),
  subject: "Local Disk (Default)",
  message: "test message",
  frequency: "Daily",
  document: "Admin Account",
}));

export default function AllDocTable() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [searchSubject, setSearchSubject] = useState<string>("");
  const [searchMessage, setSearchMessage] = useState<string>("");
  const [filterFrequency, setFilterFrequency] = useState<string>("");

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

  const handleSearchBySubjectChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchSubject(e.target.value);
    setCurrentPage(1);
  };
  const handleSearchByMessageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchMessage(e.target.value);
    setCurrentPage(1);
  };

  const handleFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterFrequency(e.target.value);
    setCurrentPage(1);
  };

  const filteredData = dummyData
    .filter((item) =>
      item.subject.toLowerCase().includes(searchSubject.toLowerCase())
    )
    .filter((item) =>
      item.message.toLowerCase().includes(searchMessage.toLowerCase())
    )
    .filter((item) =>
      filterFrequency ? item.frequency === filterFrequency : true
    );

  const sortedData = [...filteredData].sort((a, b) =>
    sortAsc
      ? new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      : new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddDocument = () => {
    console.log("reminders clicked");
  };
  return (
    <>
      <DashboardLayout>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <Heading text="Reminders " color="#444" />
          <div className="d-flex flex-row">
            <button
              onClick={handleAddDocument}
              className="addButton me-2 bg-white text-dark border border-success rounded px-3 py-1"
            >
              <FaPlus className="me-1" /> Add Reminder
            </button>
          </div>
        </div>
        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
          <div>
            <div
              style={{ maxHeight: "350px", overflowY: "auto" }}
              className="custom-scroll"
            >
              <Table hover>
                <thead className="sticky-header">
                  <tr>
                    <th></th>
                    <th
                      className="text-start"
                      onClick={handleSort}
                      style={{ cursor: "pointer" }}
                    >
                      Start Date{" "}
                      {sortAsc ? (
                        <MdArrowDropUp fontSize={20} />
                      ) : (
                        <MdArrowDropDown fontSize={20} />
                      )}
                    </th>
                    <th
                      className="text-start"
                      onClick={handleSort}
                      style={{ cursor: "pointer" }}
                    >
                      End Date{" "}
                      {sortAsc ? (
                        <MdArrowDropUp fontSize={20} />
                      ) : (
                        <MdArrowDropDown fontSize={20} />
                      )}
                    </th>
                    <th className="text-start">Subject</th>
                    <th className="text-start">Message</th>
                    <th className="text-start">Frequency</th>
                    <th className="text-start">Document</th>
                  </tr>
                  <tr>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th>
                      <Form.Control
                        type="text"
                        placeholder="Subject"
                        value={searchSubject}
                        onChange={handleSearchBySubjectChange}
                        style={{ width: "200px" }}
                      />
                    </th>
                    <th>
                      <Form.Control
                        type="text"
                        placeholder="Message"
                        value={searchMessage}
                        onChange={handleSearchByMessageChange}
                        style={{ width: "200px" }}
                      />
                    </th>
                    <th>
                      <Form.Select
                        value={filterFrequency}
                        onChange={handleFrequencyChange}
                        style={{ width: "150px" }}
                      >
                        <option value="">All Frequencies</option>
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                      </Form.Select>
                    </th>
                    <th></th>
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
                              <MdModeEditOutline className="me-2" />
                              Edit
                            </Dropdown.Item>
                            <Dropdown.Item href="#" className="py-2">
                              <AiFillDelete className="me-2" />
                              Delete
                            </Dropdown.Item>
                          </DropdownButton>
                        </td>

                        <td>{item.startDate}</td>
                        <td>{item.endDate}</td>
                        <td>{item.subject}</td>
                        <td>{item.message}</td>
                        <td>{item.frequency}</td>
                        <td>{item.document}</td>
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
