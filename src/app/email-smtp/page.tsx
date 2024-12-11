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
import { SMTPUploadItem } from "@/types/types";
import { fetchAndMapSMTPUploadTableData } from "@/utils/dataFetchFunctions";

export default function AllDocTable() {
  const isAuthenticated = useAuth();
  const [tableData, setTableData] = useState<SMTPUploadItem[]>([]);


  useEffect(() => {
    fetchAndMapSMTPUploadTableData(setTableData);
  }, []);

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  

  const handleDeleteSMTP = async (id: string, name: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the SMTP with host: ${name}?`
    );

    if (confirmDelete) {
      try {
        const response = await deleteWithAuth(`delete-smtp/${id}`);
        console.log("Document deleted successfully:", response);
        fetchAndMapSMTPUploadTableData(setTableData);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  return (
    <>
      <DashboardLayout>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <Heading text="Email Smtp Settings" color="#444" />
          <Link
            href="/email-smtp/add"
            className="addButton bg-white text-dark border border-success rounded px-3 py-1"
          >
            <FaPlus /> Add SMTP Details
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
                    <th className="text-start">User Name</th>
                    <th className="text-start">Host</th>
                    <th className="text-start">Port</th>
                    <th className="text-start">Is Default</th>
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
                              href={`/email-smtp/${item.id}`}
                              className="py-2"
                            >
                              <MdModeEditOutline className="me-2" />
                              Edit
                            </Dropdown.Item>
                            <Dropdown.Item
                              href="#"
                              className="py-2"
                              onClick={() =>
                                handleDeleteSMTP(item.id, item.host)
                              }
                            >
                              <AiFillDelete className="me-2" />
                              Delete
                            </Dropdown.Item>
                          </DropdownButton>
                        </td>
                        <td>{item.user_name}</td>
                        <td>{item.host}</td>
                        <td>{item.port}</td>
                        <td>{item.is_default}</td>
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
