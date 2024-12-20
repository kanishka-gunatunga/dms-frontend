"use client";

import Heading from "@/components/common/Heading";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Paragraph from "@/components/common/Paragraph";
import DashboardLayout from "@/components/DashboardLayout";
import { usePermissions } from "@/context/userPermissions";
import useAuth from "@/hooks/useAuth";
import { fetchLoginAudits } from "@/utils/dataFetchFunctions";
import { hasPermission } from "@/utils/permission";
import React, { useEffect, useState } from "react";
import { Form, Pagination, Table } from "react-bootstrap";
import { MdArrowDropDown, MdArrowDropUp } from "react-icons/md";

interface TableItem {
  id: number;
  email: string;
  date_time: string;
  ip_address: string;
  status: string;
  latitude: string;
  longitude: string;
}
export default function AllDocTable() {
  const permissions = usePermissions();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [dummyData, setDummyData] = useState<TableItem[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const isAuthenticated = useAuth();


  useEffect(() => {
    fetchLoginAudits(setDummyData);
  }, []);


  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

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

  const filteredData = dummyData.filter((item) =>
    item.email?.toLowerCase().includes(searchValue.toLowerCase())
  );


  const sortedData = [...filteredData].sort((a, b) =>
    sortAsc
      ? new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
      : new Date(b.date_time).getTime() - new Date(a.date_time).getTime()
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
                  placeholder="Search by email"
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          </div>
          <div>
            <div
              style={{ maxHeight: "350px", overflowY: "auto" }}
              className="custom-scroll"
            >
              {hasPermission(permissions, "Login Audits", "View Login Audit Logs") && (
                <Table hover responsive>
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
                          <td className="text-start">{item.date_time}</td>
                          <td className="text-start">{item.email}</td>
                          <td className="text-start">{item.ip_address}</td>
                          <td className="text-start">
                            <span
                              style={{
                                minWidth: "80px",
                                padding: "5px 10px",
                                fontSize: "14px",
                                textDecoration: "capitalize",
                                fontWeight: 400,
                              }}
                              className={`badge ${item.status === "success"
                                ? "bg-success"
                                : item.status === "fail"
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
              )}

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
