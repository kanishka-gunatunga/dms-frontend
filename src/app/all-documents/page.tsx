import Heading from "@/components/common/Heading";
import DashboardLayout from "@/components/DashboardLayout";
import React from "react";
import { Table } from "react-bootstrap";

export default function AllDocTable() {
    return (
        <>
            <DashboardLayout>
                <Heading text="All Documents" color="#444" />
                <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
                    <div className="d-flex flex-column flex-lg-row">
                        <div className="input-group mb-3">
                            <input type="text" className="form-control" placeholder="Username" aria-label="Username" aria-describedby="basic-addon1"></input>
                        </div>
                    </div>
                    <Table responsive>
                        <thead>
                            <tr>
                                <th>#</th>
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <th key={index}>Table heading</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <td key={index}>Table cell {index}</td>
                                ))}
                            </tr>
                            <tr>
                                <td>2</td>
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <td key={index}>Table cell {index}</td>
                                ))}
                            </tr>
                            <tr>
                                <td>3</td>
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <td key={index}>Table cell {index}</td>
                                ))}
                            </tr>
                        </tbody>
                    </Table>
                </div>

            </DashboardLayout></>


    );
};

