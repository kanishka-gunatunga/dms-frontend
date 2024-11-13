"use client";

import Heading from "@/components/common/Heading";
import Paragraph from "@/components/common/Paragraph";
import DashboardLayout from "@/components/DashboardLayout";
import Image from "next/image";
import React from "react";
import { Table } from "react-bootstrap";
import { AiOutlineDelete } from "react-icons/ai";
import { FaPlus } from "react-icons/fa6";
import { MdOutlineEdit } from "react-icons/md";

interface TableItem {
  id: number;
  image: string;
  name: string;
  code: string;
  order: number;
  isRtl: string;
}
const dummyData: TableItem[] = Array.from({ length: 8 }, (_, index) => ({
  id: index + 1,
  image: "/united-states.svg",
  name: `Item ${index + 1}`,
  code: "en",
  order: index + 1,
  isRtl: "Yes"
}));

const handleAddLanguage = () => {
  console.log("reminders clicked");
};

export default function AllDocTable() {
  return (
    <>
      <DashboardLayout>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <Heading text="Languages" color="#444" />
          <div className="d-flex flex-row">
            <button
              onClick={handleAddLanguage}
              className="addButton me-2 bg-white text-dark border border-success rounded px-3 py-1"
            >
              <FaPlus className="me-1" /> Add Language
            </button>
          </div>
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
                    <th className="text-start">Image</th>
                    <th className="text-start">Name</th>
                    <th className="text-start">Code</th>
                    <th className="text-start">Order</th>
                    <th className="text-start">Is Rtl</th>
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
                          <button className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded">
                            <AiOutlineDelete fontSize={16} className="me-1" />{" "}
                            Delete
                          </button>
                        </td>
                        <td>
                          <Image
                            src={item.image}
                            alt=""
                            width={25}
                            height={25}
                            objectFit="responsive"
                            className="img-fluid rounded"
                          />
                        </td>
                        <td>{item.name}</td>
                        <td>{item.code}</td>
                        <td>{item.order}</td>
                        <td>{item.isRtl}</td>
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
