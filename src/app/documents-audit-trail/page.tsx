"use client";

import Heading from "@/components/common/Heading";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Paragraph from "@/components/common/Paragraph";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import { CategoryDropdownItem, UserDropdownItem } from "@/types/types";
import { fetchAndMapUserData, fetchCategoryData, fetchDocumentAuditTrail } from "@/utils/dataFetchFunctions";
import React, { useEffect, useState } from "react";
import {
  Dropdown,
  DropdownButton,
  Form,
  Pagination,
  Table,
} from "react-bootstrap";
import { MdArrowDropDown, MdArrowDropUp } from "react-icons/md";

// interface Category {
//   category_name: string;
// }

interface TableItem {
  id: number;
  operation: string;
  category: string;
  user: string;
  document: string;
  date_time: string;
  document_name: string;
}


export default function AllDocTable() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
    const [selectedUserId, setSelectedUserId] = useState<string>("");
  // const [selectedStorage, setSelectedStorage] =
  //   useState<string>("Selected User");
    const [dummyData, setDummyData] = useState<TableItem[]>([]);
  const [categoryDropDownData, setCategoryDropDownData] = useState<
    CategoryDropdownItem[]
  >([]);
  const [userDropDownData, setUserDropDownData] = useState<UserDropdownItem[]>(
    []
  );
  const isAuthenticated = useAuth();


  useEffect(() => {
    fetchCategoryData(setCategoryDropDownData);
    fetchDocumentAuditTrail(setDummyData);
    fetchAndMapUserData(setUserDropDownData);
  }, []);

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };

  // const handleStorageSelect = (selected: string) => {
  //   setSelectedStorage(selected);
  // }

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
  };

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

  return (
    <>
      <DashboardLayout>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <Heading text="Documents Audit Trail" color="#444" />
        </div>
        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
          <div className="d-flex flex-column flex-lg-row">
            <div className="col-12 col-lg-4 d-flex flex-column flex-lg-row">
              <div className="input-group mb-3 pe-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name"
                ></input>
              </div>
            </div>
            <div className="col-12 col-lg-8 d-flex flex-column flex-lg-row">
              <div className="col-12 col-lg-6">
                <div className="input-group mb-3 pe-2">
                <DropdownButton
                    id="dropdown-category-button"
                    title={
                      selectedCategoryId
                        ? categoryDropDownData.find(
                            (item) => item.id.toString() === selectedCategoryId
                          )?.category_name
                        : "Select Category"
                    }
                    className="custom-dropdown-text-start text-start w-100"
                    onSelect={(value) => handleCategorySelect(value || "")}
                  >
                    {categoryDropDownData.map((category) => (
                      <Dropdown.Item
                        key={category.id}
                        eventKey={category.id.toString()}
                        style={{
                          fontWeight:
                            category.parent_category === "none"
                              ? "bold"
                              : "normal",
                          marginLeft:
                            category.parent_category === "none"
                              ? "0px"
                              : "20px",
                        }}
                      >
                        {category.category_name}
                      </Dropdown.Item>
                    ))}
                  </DropdownButton>
                </div>
              </div>
              <div className="col-12 col-lg-6">
                <div className="input-group mb-3">
                <DropdownButton
                    id="dropdown-category-button"
                    title={
                      selectedUserId
                        ? userDropDownData.find(
                            (item) => item.id.toString() === selectedUserId
                          )?.user_name
                        : "Select User"
                    }
                    className="custom-dropdown-text-start text-start w-100"
                    onSelect={(value) => handleUserSelect(value || "")}
                  >
                    {userDropDownData.map((user) => (
                      <Dropdown.Item
                        key={user.id}
                        eventKey={user.id.toString()}
                      >
                        {user.user_name}
                      </Dropdown.Item>
                    ))}
                  </DropdownButton>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div
              style={{ maxHeight: "380px", overflowY: "auto" }}
              className="custom-scroll"
            >
              <Table hover responsive>
                <thead className="sticky-header">
                  <tr>
                    <th className="text-start" onClick={handleSort} style={{ cursor: "pointer" }}>
                      Action Date{" "}
                      {sortAsc ? (
                        <MdArrowDropUp fontSize={20} />
                      ) : (
                        <MdArrowDropDown fontSize={20} />
                      )}
                    </th>
                    <th className="text-start">Name</th>
                    <th className="text-start">Category Name</th>
                    <th className="text-start">Operation</th>
                    <th className="text-start">By Whome</th>
                    <th className="text-start">To whom User</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <tr key={item.id}>
                        <td className="text-start">{item.date_time}</td>
                        <td className="text-start">
                         {item.document_name}
                        </td>
                        <td className="text-start">{item.category}</td>
                        <td className="text-start">{item.operation}</td>
                        <td className="text-start">{item.user}</td>
                        <td className="text-start">{item.document}</td>
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
