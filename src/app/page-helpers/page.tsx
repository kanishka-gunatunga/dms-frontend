"use client";

import Heading from "@/components/common/Heading";
import Paragraph from "@/components/common/Paragraph";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import React from "react";
import { Table } from "react-bootstrap";
import { IoEye } from "react-icons/io5";
import { MdOutlineEdit } from "react-icons/md";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface TableItem {
  id: number;
  name: string;
  code: string;
}
const dummyData: TableItem[] = Array.from({ length: 18 }, (_, index) => ({
  id: index + 1,
  name: `Item ${index + 1}`,
  code: "STORAGE_SETTINGS",
}));

export default function AllDocTable() {
  const isAuthenticated = useAuth();

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }
  return (
    <>
      <DashboardLayout>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <Heading text="Page Helpers" color="#444" />
        </div>
        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
          <div>
            <div
              style={{ maxHeight: "450px", overflowY: "auto" }}
              className="custom-scroll"
            >
              <Table hover>
                <thead className="sticky-header">
                  <tr>
                    <th className="text-start" style={{ width: "25%" }}>
                      Action
                    </th>
                    <th className="text-start">Name</th>
                    <th className="text-start">Code</th>
                  </tr>
                </thead>
                <tbody>
                  {dummyData.length > 0 ? (
                    dummyData.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <button className="custom-icon-button button-success px-3 py-1 rounded me-2">
                            <MdOutlineEdit fontSize={16} className="me-1" />{" "}
                            Edit
                          </button>
                          <button className="custom-icon-button button-view text-white px-3 py-1 rounded">
                            <IoEye fontSize={16} className="me-1" /> View
                          </button>
                        </td>

                        <td>{item.name}</td>
                        <td>{item.code}</td>
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
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
