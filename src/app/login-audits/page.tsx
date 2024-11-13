"use client";

import Heading from "@/components/common/Heading";
import Paragraph from "@/components/common/Paragraph";
import DashboardLayout from "@/components/DashboardLayout";
import React, { useState } from "react";
import { Form, Pagination, Table } from "react-bootstrap";
import { MdArrowDropDown, MdArrowDropUp } from "react-icons/md";

interface TableItem {
  id: number;
  email: string;
  dateTime: string;
  ipAddress: string;
  status: string;
  latitude: string;
  longitude: string;
}
const statuses = ["Success", "Pending", "Failed"];
const dummyData: TableItem[] = Array.from({ length: 50 }, (_, index) => ({
  id: index + 1,
  email: `user${index + 1}@gmail.com`,
  dateTime: new Date(Date.now() - index * 1000000000).toLocaleDateString(),
  status: statuses[Math.floor(Math.random() * statuses.length)],
  ipAddress: "45.121.88.1",
  latitude: "162",
  longitude: "180",
}));

export default function AllDocTable() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [sortAsc, setSortAsc] = useState<boolean>(true);

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

  const sortedData = [...dummyData].sort((a, b) =>
    sortAsc
      ? new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
      : new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
  );
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <DashboardLayout>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <Heading text="Login Audit Logs" color="#444" />
        </div>
        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
          <div className="d-flex flex-column flex-lg-row">
            <div className="col-12 col-lg-5 d-flex flex-column flex-lg-row">
              <div className="input-group mb-3 pe-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name"
                ></input>
              </div>
            </div>
          </div>
          <div>
            <div
              style={{ maxHeight: "350px", overflowY: "auto" }}
              className="custom-scroll"
            >
              <Table hover>
                <thead>
                  <tr>
                    <th
                      className="text-start"
                      onClick={handleSort}
                      style={{ cursor: "pointer" }}
                    >
                      Date & Time{" "}
                      {sortAsc ? (
                        <MdArrowDropUp fontSize={20} />
                      ) : (
                        <MdArrowDropDown fontSize={20} />
                      )}
                    </th>
                    <th className="text-start">Email</th>
                    <th className="text-start">IP Address</th>
                    <th className="text-start">Status</th>
                    <th className="text-start">Latitude</th>
                    <th className="text-start">Longitude</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <tr key={item.id}>
                        <td className="text-start">{item.dateTime}</td>
                        <td className="text-start">{item.email}</td>
                        <td className="text-start">{item.ipAddress}</td>
                        <td className="text-start">
                          <span
                            style={{
                              minWidth: "80px",
                              padding: "5px 10px",
                              fontSize: "14px",
                              fontWeight: 400,
                            }}
                            className={`badge ${
                              item.status === "Success"
                                ? "bg-success"
                                : item.status === "Pending"
                                ? "bg-warning"
                                : item.status === "Failed"
                                ? "bg-danger"
                                : "bg-secondary"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="text-start">{item.latitude}</td>
                        <td className="text-start">{item.longitude}</td>
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
