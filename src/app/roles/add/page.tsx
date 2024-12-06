"use client";

import Heading from "@/components/common/Heading";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import React, { useState } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { postWithAuth } from "@/utils/apiClient";
import { IoSave } from "react-icons/io5";
import { MdOutlineCancel } from "react-icons/md";
import Link from "next/link";
import { Checkbox, Divider } from "antd";


export default function AllDocTable() {
    const [roleName, setRoleName] = useState("");
    const [, setShowToast] = useState(false);
    const [, setToastType] = useState<"success" | "error">("success");
    const [, setToastMessage] = useState("");
    const [error, setError] = useState("");
    const [selectedValues, setSelectedValues] = useState<string[]>([]);

    const allOptions = ["Option 1", "Option 2", "Option 3", "Option 4"];
    const group1 = ["Option 1", "Option 2"];
    const group2 = ["Option 3", "Option 4"];


    const isAuthenticated = useAuth();

    if (!isAuthenticated) {
        return <LoadingSpinner />;
    }

    const handleSelectAll = (checked: boolean) => {
        setSelectedValues(checked ? allOptions : []);
    };

    const handleGroupSelect = (checked: boolean, group: string[]) => {
        setSelectedValues((prev) =>
            checked
                ? Array.from(new Set([...prev, ...group]))
                : prev.filter((item) => !group.includes(item))
        );
    };

    const handleIndividualSelect = (value: string, checked: boolean) => {
        setSelectedValues((prev) =>
            checked ? [...prev, value] : prev.filter((item) => item !== value)
        );
    };

    const isAllSelected = selectedValues.length === allOptions.length;
    const isGroup1Selected = group1.every((item) => selectedValues.includes(item));
    const isGroup2Selected = group2.every((item) => selectedValues.includes(item));

    const handleAddRolePermission = async () => {
        if (!roleName.trim()) {
            setError("Role name is required.");
            return;
        }

        setError("");

        try {
            const formData = new FormData();
            formData.append("role_name", roleName);
            formData.append("permissions[]", "");

            const response = await postWithAuth(`add-role`, formData);

            if (response.status === "success") {
                console.log("Role added successfully:");
                setToastType("success");
                setToastMessage("Role added successfully!");
                setShowToast(true);
                setTimeout(() => setShowToast(false), 5000);
            } else {
                setToastType("error");
                setToastMessage("Error occurred while adding role!");
                setShowToast(true);
                setTimeout(() => setShowToast(false), 5000);
            }
        } catch (error) {
            setToastType("error");
            setToastMessage("Error occurred while adding role!");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 5000);
            console.error("Error adding role:", error);
        }
    };


    return (
        <>
            <DashboardLayout>
                <div className="d-flex justify-content-between align-items-center pt-2">
                    <Heading text="Manage Role" color="#444" />
                </div>
                <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
                    <div className="d-flex flex-column mb-3">
                        <p className="mb-1" style={{ fontSize: "14px" }}>
                            Role Name
                        </p>
                        <div className="input-group mb-1 pe-lg-4">
                            <input
                                type="text"
                                className={`form-control ${error ? "is-invalid" : ""}`}
                                value={roleName}
                                onChange={(e) => setRoleName(e.target.value)}
                            />
                        </div>
                        {error && (
                            <div className="text-danger" style={{ fontSize: "12px" }}>
                                {error}
                            </div>
                        )}
                    </div>
                    <div className="d-flex flex-column  custom-scroll" style={{ maxHeight: "380px", overflowY: "auto" }}>
                        <h2>Permission</h2>
                        <div>
                            <h3>Checkbox Section</h3>
                            <Checkbox
                                checked={isAllSelected}
                                indeterminate={selectedValues.length > 0 && !isAllSelected}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                            >
                                Select All
                            </Checkbox>
                            <Divider />

                            <div>
                                <Checkbox
                                    checked={isGroup1Selected}
                                    indeterminate={
                                        group1.some((item) => selectedValues.includes(item)) && !isGroup1Selected
                                    }
                                    onChange={(e) => handleGroupSelect(e.target.checked, group1)}
                                >
                                    Select Group 1
                                </Checkbox>
                                <div style={{ marginLeft: "20px" }}>
                                    {group1.map((item) => (
                                        <Checkbox
                                            key={item}
                                            checked={selectedValues.includes(item)}
                                            onChange={(e) => handleIndividualSelect(item, e.target.checked)}
                                        >
                                            {item}
                                        </Checkbox>
                                    ))}
                                </div>
                            </div>

                            <Divider />

                            <div>
                                <Checkbox
                                    checked={isGroup2Selected}
                                    indeterminate={
                                        group2.some((item) => selectedValues.includes(item)) && !isGroup2Selected
                                    }
                                    onChange={(e) => handleGroupSelect(e.target.checked, group2)}
                                >
                                    Select Group 2
                                </Checkbox>
                                <div style={{ marginLeft: "20px" }}>
                                    {group2.map((item) => (
                                        <Checkbox
                                            key={item}
                                            checked={selectedValues.includes(item)}
                                            onChange={(e) => handleIndividualSelect(item, e.target.checked)}
                                        >
                                            {item}
                                        </Checkbox>
                                    ))}
                                </div>
                            </div>

                            <Divider />

                            <h4>Selected Values</h4>
                            <pre>{JSON.stringify(selectedValues, null, 2)}</pre>
                        </div>
                    </div>
                    <div className="d-flex flex-row" 
                    >
                        <button
                            onClick={() => handleAddRolePermission()}
                            className="custom-icon-button button-success px-3 py-1 rounded me-2"
                        >
                            <IoSave fontSize={16} className="me-1" /> Yes
                        </button>
                        <Link
                            href={"/roles"}
                            className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
                        >
                            <MdOutlineCancel fontSize={16} className="me-1" /> No
                        </Link>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
