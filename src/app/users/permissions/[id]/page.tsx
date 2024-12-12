"use client";

import Heading from "@/components/common/Heading";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import React, { useEffect, useState } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { getWithAuth, postWithAuth } from "@/utils/apiClient";
import { IoSave } from "react-icons/io5";
import { MdOutlineCancel } from "react-icons/md";
import Link from "next/link";
import { Checkbox, Divider } from "antd";
import { useParams } from 'next/navigation';
import ToastMessage from "@/components/common/Toast";
import { useUserContext } from "@/context/userContext";



export default function AllDocTable() {
    const { id } = useParams();
    const { email } = useUserContext();


    const [mounted, setMounted] = useState(false);
    const [roleName, setRoleName] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [toastType, setToastType] = useState<"success" | "error">("success");
    const [toastMessage, setToastMessage] = useState("");
    const [selectedGroups, setSelectedGroups] = useState<{ [key: string]: string[] }>({});


    const fetchRoleData = async (id: string) => {
        try {
            const response = await getWithAuth(`role-details/${id}`);

            if (response.status === "fail") {
                console.log("Role get data failed:", response);
            } else {
                const roleData = response;
                setRoleName(roleData.role_name);
                console.log("Role get data:", response);
                setRoleName(response.role_name);
                const parsedPermissions = JSON.parse(roleData.permissions || "[]");

                const initialSelectedGroups: { [key: string]: string[] } = {};
                parsedPermissions.forEach((permission: { group: string; items: string[] }) => {
                    initialSelectedGroups[permission.group] = permission.items;
                });

                setSelectedGroups(initialSelectedGroups);

            }
        } catch (error) {
            console.error("Failed to fetch Role data:", error);
        }
    };
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {

        if (id && typeof id === "string") {
            console.log(`Editing Role with id: ${id}`);
            fetchRoleData(id);
        } else {
            console.log("ID is not a string or is missing");
        }
    }, [id]);

    const isAuthenticated = useAuth();


    if (!mounted || !id) {
        return <LoadingSpinner />;

    }

    if (!isAuthenticated) {
        return <LoadingSpinner />;
    }

    const allGroups = [
        { name: "Dashboard", items: ["View Dashboard"] },
        { name: "All Documents", items: ["View Documents", "Create Document", "Edit Document", "Delete Document", "Archive Document", "Add Reminder", "Share Document", "Download Document", "Send Email", "Manage Sharable Link"] },
        { name: "Assigned Documents", items: ["Create Document", "Edit Document", "Share Document", "Upload New Version", "Delete Document", "Send Email", "Manage Sharable Link"] },
        { name: "Archived Documents", items: ["View Dashboard", "Restore Document", "Delete Document"] },
        { name: "Deep Search", items: ["Deep Search", "Add Indexing", "Remove Indexing"] },
        { name: "Document Category", items: ["Manage Document Category"] },
        { name: "Document Audit", items: ["View Document Audit Trail"] },
        { name: "User", items: ["View Users", "Create User", "Edit User", "Delete User", "Reset Password", "Assign User Role", "Assign Permission"] },
        { name: "Role", items: ["View Roles", "Create Role", "Edit Role", "Delete Role"] },
        { name: "Email", items: ["Manage SMTP Settings"] },
        { name: "Settings", items: ["Manage Languages", "Storage Settings", "Manage Company Profile"] },
        { name: "Reminder", items: ["View Reminders", "Create Reminder", "Edit Reminder", "Delete Reminder"] },
        { name: "Login Audit", items: ["View Login Audit Logs"] },
        { name: "Page Helpers", items: ["Manage Page Helper"] },
    ];

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const updatedGroups: { [key: string]: string[] } = {};

            allGroups.forEach((group) => {
                updatedGroups[group.name] = group.items;
            });

            setSelectedGroups(updatedGroups);
        } else {
            setSelectedGroups({});
        }
    };

    const handleGroupSelect = (checked: boolean, groupName: string, groupItems: string[]) => {
        setSelectedGroups((prev) => {
            const updatedGroups: { [key: string]: string[] } = { ...prev };

            if (checked) {
                updatedGroups[groupName] = groupItems;
            } else {
                delete updatedGroups[groupName];
            }

            return updatedGroups;
        });
    };

    const handleIndividualSelect = (groupName: string, value: string, checked: boolean) => {
        setSelectedGroups((prev) => {
            const updatedGroups: { [key: string]: string[] } = { ...prev };
            const groupItems = updatedGroups[groupName] || [];

            if (checked) {
                updatedGroups[groupName] = [...groupItems, value];
            } else {
                updatedGroups[groupName] = groupItems.filter((item) => item !== value);

                if (updatedGroups[groupName].length === 0) {
                    delete updatedGroups[groupName];
                }
            }

            return updatedGroups;
        });
    };


    const selectedArray = Object.entries(selectedGroups).map(([group, items]) => ({
        group,
        items,
    }));

    const handleAddRolePermission = async () => {

        try {
            const formData = new FormData();
            formData.append("role_name", roleName);
            formData.append("permissions", JSON.stringify(selectedArray));

            const response = await postWithAuth(`role-details/${id}`, formData);

            for (const [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }


            if (response.status === "success") {
                console.log("User permission changed successfully:");
                setToastType("success");
                setToastMessage("User permission changed successfully!");
                setShowToast(true);
                setTimeout(() => setShowToast(false), 5000);
            } else {
                setToastType("error");
                setToastMessage("Error occurred while permission change!");
                setShowToast(true);
                setTimeout(() => setShowToast(false), 5000);
            }
        } catch (error) {
            setToastType("error");
            setToastMessage("Error occurred while permission change!");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 5000);
            console.error("Error adding role:", error);
        }
    };


    return (
        <>
            <DashboardLayout>
                <div className="d-flex justify-content-between align-items-center pt-2">
                <Heading text={`User Page Permission To ${email}`} color="#444" />
                </div>
                <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">

                    <div className="d-flex flex-column  custom-scroll" style={{ maxHeight: "80vh", overflowY: "auto" }}>
                        <Heading text="Permission" color="#444" />
                        <div className="mt-2">
                            <Checkbox
                                checked={Object.keys(selectedGroups).length === allGroups.length}
                                indeterminate={
                                    Object.keys(selectedGroups).length > 0 &&
                                    Object.keys(selectedGroups).length < allGroups.length
                                }
                                onChange={(e) => handleSelectAll(e.target.checked)}
                            >
                                Select All
                            </Checkbox>
                            <Divider />

                            {allGroups.map((group, groupIndex) => (
                                <div key={groupIndex} className="mb-4">
                                    <Checkbox
                                        checked={selectedGroups[group.name]?.length === group.items.length}
                                        indeterminate={
                                            selectedGroups[group.name]?.length > 0 &&
                                            selectedGroups[group.name]?.length < group.items.length
                                        }
                                        onChange={(e) => handleGroupSelect(e.target.checked, group.name, group.items)}
                                    >
                                        {group.name}
                                    </Checkbox>
                                    <div style={{ marginLeft: "20px" }}>
                                        {group.items.map((item, itemIndex) => (
                                            <Checkbox
                                                key={itemIndex}
                                                checked={selectedGroups[group.name]?.includes(item)}
                                                onChange={(e) => handleIndividualSelect(group.name, item, e.target.checked)}
                                            >
                                                {item}
                                            </Checkbox>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <Divider />

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
                    </div>
                </div>
            </DashboardLayout>
            <ToastMessage
        message={toastMessage}
        show={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
      />
        </>
    );
}
