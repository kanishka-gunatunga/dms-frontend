/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Heading from "@/components/common/Heading";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Paragraph from "@/components/common/Paragraph";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import { fetchDocumentAuditTrail } from "@/utils/dataFetchFunctions";
import React, { useEffect, useState } from "react";
import {
  Form,
  Pagination,
  Table,
} from "react-bootstrap";
import { MdArrowDropDown, MdArrowDropUp } from "react-icons/md";
import { AuditTrialItem } from "@/types/types";
import { postWithAuth } from "@/utils/apiClient";
import LoadingBar from "@/components/common/LoadingBar";





export default function AllDocTable() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
    const [dummyData, setDummyData] = useState<AuditTrialItem[]>([]);
  const [filterData, setFilterData] = useState({
    name: "",
    user: "",
    category: "",
  });
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const isAuthenticated = useAuth();

  useEffect(() => {
    // fetchDocumentAuditTrail(setDummyData);
  }, []);


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
      ? new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
      : new Date(b.date_time).getTime() - new Date(a.date_time).getTime()
  );
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  

  const handleNameSearch = async (value: string) => {
    setFilterData((prevState) => ({
      ...prevState,
      name: value,
    }));
  };

  const handleSearch = async () => {
    const formData = new FormData();
    console.log("Fil-ter Data: ", filterData);

    if (filterData.name) {
      formData.append("name", filterData.name);
    } else if (filterData.user) {
      formData.append("user", filterData.user);
    } else if (filterData.category) {
      formData.append("category", filterData.category);
    } else {
      console.log("No filter data, fetching all documents...");
      fetchDocumentAuditTrail(setDummyData);
      return;
    }

    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
    setIsLoadingTable(true)
    try {
      const response = await postWithAuth("filter-audit-trial", formData);
      console.log("filter-archived-documents response:", response);
      setDummyData(response);
      setIsLoadingTable(false)
    } catch (error) {
      console.error("Failed to fetch filtered data", error);
    }
  };


  console.log("DUMMY:", dummyData)

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [filterData]);



  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }
  return (
    <>
      <DashboardLayout>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <Heading text="Notifications" color="#444" />
        </div>
        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
          <div className="d-flex flex-column flex-lg-row">
            <div className="col-12 col-lg-4 d-flex flex-column flex-lg-row">
              <div className="input-group mb-3 pe-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search By Document Name or Message"
                  onChange={(e) => handleNameSearch(e.target.value)}
                ></input>
              </div>
            </div>
          </div>
          <div>
            {isLoadingTable && <LoadingBar />}
          </div>
          <div>
            <div
              style={{ maxHeight: "380px", overflowY: "auto" }}
              className="custom-scroll"
            >
              <Table hover responsive>
                <thead className="sticky-header">
                  <tr>
                  <th className="text-start">Action</th>
                    <th className="text-start" onClick={handleSort} style={{ cursor: "pointer" }}>
                      Date{" "}
                      {sortAsc ? (
                        <MdArrowDropUp fontSize={20} />
                      ) : (
                        <MdArrowDropDown fontSize={20} />
                      )}
                    </th>
                    
                    <th className="text-start">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <tr key={item.id}>
                        <td className="text-start">
                         {item.document_name}
                        </td>
                        <td className="text-start">{item.date_time}</td>
                        <td className="text-start">{item.category}</td>
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
