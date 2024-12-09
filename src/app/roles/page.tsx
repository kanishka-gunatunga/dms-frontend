"use client";

import Heading from "@/components/common/Heading";
import Paragraph from "@/components/common/Paragraph";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import React, { useEffect, useState } from "react";
import { Form, Pagination, Table } from "react-bootstrap";
import { FaPlus } from "react-icons/fa6";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { fetchRoleData } from "@/utils/dataFetchFunctions";
import { TiEdit } from "react-icons/ti";
import { FiTrash } from "react-icons/fi";
import Link from "next/link";

interface TableItem {
  id: number;
  role_name: string;
  permissions: string;
}

export default function AllDocTable() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [dummyData, setDummyData] = useState<TableItem[]>([]);
  const isAuthenticated = useAuth();


  useEffect(() => {
    fetchRoleData(setDummyData);
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

  const handleAddRole = () => {
    window.location.href="/roles/add"
  };

  return (
    <>
      <DashboardLayout>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <Heading text="Roles" color="#444" />
          <button
            onClick={handleAddRole}
            className="addButton bg-white text-dark border border-success rounded px-3 py-1"
          >
            <FaPlus className="me-1" /> Add Role
          </button>
        </div>
        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
          <div>
            <div
              style={{ maxHeight: "380px", overflowY: "auto" }}
              className="custom-scroll"
            >
              <Table hover responsive>
                <thead className="sticky-header">
                  <tr>
                    <th className="text-start" style={{ width: "25%" }}>
                      Actions
                    </th>
                    <th className="text-start">Name</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <tr key={item.id}>
                        <td className="d-flex flex-row">
                          <Link href={`/roles/${item.id}`} className="custom-icon-button button-success px-2 py-1 rounded me-2">
                            <TiEdit fontSize={16} className="me-1" />{" "}
                            Edit
                          </Link>
                          <button className="custom-icon-button button-danger text-white bg-danger px-2 py-1 rounded">
                            <FiTrash fontSize={16} className="me-1" />{" "}
                            Delete
                          </button>
                        </td>
                        <td>{item.role_name}</td>
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
