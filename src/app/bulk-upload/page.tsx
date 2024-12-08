/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Heading from "@/components/common/Heading";
import Paragraph from "@/components/common/Paragraph";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import React, { useEffect, useState } from "react";
import { Dropdown, DropdownButton, Modal, Table } from "react-bootstrap";
import { AiFillDelete } from "react-icons/ai";
import { FaEllipsisV } from "react-icons/fa";
import { FaKey, FaPlus } from "react-icons/fa6";
import { MdModeEditOutline, MdOutlineCancel, MdPeople } from "react-icons/md";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { deleteWithAuth, postWithAuth } from "@/utils/apiClient";
import { IoSaveOutline } from "react-icons/io5";
import Link from "next/link";
import { BulkUploadItem } from "@/types/types";
import { fetchAndMapBulkUploadTableData } from "@/utils/dataFetchFunctions";

export default function AllDocTable() {
  const isAuthenticated = useAuth();
  const [tableData, setTableData] = useState<BulkUploadItem[]>([]);


  useEffect(() => {
    fetchAndMapBulkUploadTableData(setTableData);
  }, []);

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  

  const handleDeleteUser = async (id: string, name: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the user with name: ${name}?`
    );

    if (confirmDelete) {
      try {
        const response = await deleteWithAuth(`delete-user/${id}`);
        console.log("User deleted successfully:", response);
        fetchAndMapBulkUploadTableData(setTableData);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  return (
    <>
      <DashboardLayout>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <Heading text="Bulk Uploads" color="#444" />
          <Link
            href="/bulk-upload/add"
            className="addButton bg-white text-dark border border-success rounded px-3 py-1"
          >
            <FaPlus /> Add Documents
          </Link>
        </div>

        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
          <div>
            <div
              style={{
                maxHeight: "380px",
                overflowY: "auto",
                overflow: "visible",
              }}
              className="custom-scroll"
            >
              <Table hover responsive>
                <thead className="sticky-header">
                  <tr>
                    <th>Actions</th>
                    <th className="text-start">File Type</th>
                    <th className="text-start">File Name</th>
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
                            className="no-caret position-static"
                          >
                            <Dropdown.Item
                              href={`/bulk-upload/${item.id}`}
                              className="py-2"
                            >
                              <MdModeEditOutline className="me-2" />
                              Edit
                            </Dropdown.Item>
                            <Dropdown.Item
                              href="#"
                              className="py-2"
                              onClick={() =>
                                handleDeleteUser(item.id, item.name)
                              }
                            >
                              <AiFillDelete className="me-2" />
                              Delete
                            </Dropdown.Item>
                          </DropdownButton>
                        </td>
                        <td>{item.type}</td>
                        <td>{item.name}</td>
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

           
            {}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
