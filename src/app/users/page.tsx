"use client";

import Heading from "@/components/common/Heading";
import Paragraph from "@/components/common/Paragraph";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import React, { useEffect, useState } from "react";
import { Dropdown, DropdownButton, Table } from "react-bootstrap";
import { AiFillDelete } from "react-icons/ai";
import { FaEllipsisV } from "react-icons/fa";
import { FaKey, FaPlus } from "react-icons/fa6";
import { MdModeEditOutline, MdPeople } from "react-icons/md";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { getWithAuth } from "@/utils/apiClient";
import { useRouter } from "next/navigation";

interface TableItem {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
}

export default function AllDocTable() {
  const isAuthenticated = useAuth();
  const [tableData, setTableData] = useState<TableItem[]>([]);
  const router = useRouter();
  // const [currentPage, setCurrentPage] = useState(1);
  // const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await getWithAuth("users");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedData: TableItem[] = response.map((item: any) => ({
          id: item.id,
          email: item.email,
          firstName: item.user_details.first_name,
          lastName: item.user_details.last_name,
          mobileNumber: item.user_details.mobile_no.toString(),
        }));
        setTableData(mappedData);
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      }
    };

    fetchProfileData();
  }, []);

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  // const totalItems = tableData.length;
  // const totalPages = Math.ceil(tableData.length / itemsPerPage);

  // const startIndex = (currentPage - 1) * itemsPerPage + 1;
  // const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  // const handlePrev = () => {
  //   if (currentPage > 1) setCurrentPage(currentPage - 1);
  // };

  // const handleNext = () => {
  //   if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  // };

  // const handleItemsPerPageChange = (
  //   e: React.ChangeEvent<HTMLSelectElement>
  // ) => {
  //   setItemsPerPage(Number(e.target.value));
  //   setCurrentPage(1);
  // };

  // const paginatedData = tableData.slice(
  //   (currentPage - 1) * itemsPerPage,
  //   currentPage * itemsPerPage
  // );

  const handleAddUser = () => {
    router.push("/users/add-user");
  };

  return (
    <>
      <DashboardLayout>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <Heading text="Users" color="#444" />
          <button
            onClick={handleAddUser}
            className="addButton bg-white text-dark border border-success rounded px-3 py-1"
          >
            <FaPlus /> Add User
          </button>
        </div>

        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
          <div>
            <div
              style={{ maxHeight: "380px", overflowY: "auto" }}
              className="custom-scroll"
            >
              <Table hover>
                <thead className="sticky-header">
                  <tr>
                    <th>Actions</th>
                    <th className="text-start">Email</th>
                    <th className="text-start">First Name</th>
                    <th className="text-start">Last Name</th>
                    <th className="text-start">Mobile Number</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.length > 0 ? (
                    tableData.map((item) => (
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
                            <Dropdown.Item href="#" className="py-2">
                              <MdPeople className="me-2" />
                              Permission
                            </Dropdown.Item>
                            <Dropdown.Item href="#" className="py-2">
                              <FaKey className="me-2" />
                              Reset Password
                            </Dropdown.Item>
                          </DropdownButton>
                        </td>
                        <td>{item.email}</td>
                        <td>{item.firstName}</td>
                        <td>{item.lastName}</td>
                        <td>{item.mobileNumber}</td>
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

            {/* <div className="d-flex flex-column flex-lg-row paginationFooter">
              <div className="d-flex justify-content-between align-items-center">
                <p className="pagintionText mb-0 me-2">Items per page:</p>
                <Form.Select
                  onChange={handleItemsPerPageChange}
                  value={itemsPerPage}
                  style={{
                    width: "100px",
                    padding: "5px 10px",
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
            </div> */}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
