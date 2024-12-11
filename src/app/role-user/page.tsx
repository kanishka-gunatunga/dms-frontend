"use client";

import Heading from "@/components/common/Heading";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import React, { useEffect, useState } from "react";
import { DropdownButton, Dropdown } from "react-bootstrap";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { RoleDropdownItem, TableItem } from "@/types/types";
import { fetchAndMapUserTableData, fetchRoleData } from "@/utils/dataFetchFunctions";

export default function AllDocTable() {
  const isAuthenticated = useAuth();

  const [roleDropDownData, setRoleDropDownData] = useState<RoleDropdownItem[]>(
    []
  );
  const [selectedRole, setSelectedRole] = useState<{ id: number | null; name: string }>({
    id: null,
    name: "Select Role",
  });
  const [allUsers, setAllUsers] = useState<TableItem[]>([]);

  useEffect(() => {
    fetchRoleData(setRoleDropDownData);
    fetchAndMapUserTableData(setAllUsers);
  }, []);

  console.log("roles...", roleDropDownData)
  console.log("allusers...", allUsers)

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }


  const handleRoleSelect = (roleId: number, roleName: string) => {
    setSelectedRole({ id: roleId, name: roleName });
    console.log("Selected role ID:", roleId);
    console.log("Selected role name:", roleName);
  };


  return (
    <>
      <DashboardLayout>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <Heading text="Role User" color="#444" />
        </div>
        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
          <div>
            <div>
              <p className="mb-1" style={{ fontSize: "14px" }}>
                Select Role
              </p>
              <DropdownButton
                id="dropdown-category-button"
                title={selectedRole.name}
                className="custom-dropdown-secondary"
              >
                {roleDropDownData.length > 0 ? (
                  roleDropDownData.map((role) => (
                    <Dropdown.Item
                      key={role.id}
                      onClick={() => handleRoleSelect(role.id, role.role_name)}
                    >
                      {role.role_name}
                    </Dropdown.Item>
                  ))
                ) : (
                  <Dropdown.Item disabled>No roles available</Dropdown.Item>
                )}
              </DropdownButton>
              <p className="mb-1 text-danger mt-2" style={{ fontSize: "14px" }}>
                Note: In order to add user to role. Please Drag it from All
                Users to Role Users
              </p>
            </div>
            <div className="d-flex flex-column flex-lg-row w-100">
              {/* <DndProvider backend={HTML5Backend}>
                <div className="d-flex flex-column flex-lg-row w-100">
                  <div className="col-12 col-lg-6 py-3 px-2">
                    <UserDropZone
                      label="All Users"
                      users={allUsers}
                      onDropUser={handleDropToAll}
                    />
                  </div>
                  <div className="col-12 col-lg-6 py-3 px-2">
                    <UserDropZone
                      label="Role Users"
                      users={roleUsers}
                      onDropUser={handleDropToRole}
                    />
                  </div>
                </div>
              </DndProvider> */}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
