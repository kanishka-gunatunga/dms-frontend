/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Heading from "@/components/common/Heading";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import React, { useEffect, useState } from "react";
import { DropdownButton, Dropdown } from "react-bootstrap";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { RoleDropdownItem, RoleUserItem } from "@/types/types";
import { fetchAndMapRoleUserData, fetchRoleData } from "@/utils/dataFetchFunctions";
import { getWithAuth, postWithAuth } from "@/utils/apiClient";
import { usePermissions } from "@/context/userPermissions";
import { hasPermission } from "@/utils/permission";


export default function AllDocTable() {
  const isAuthenticated = useAuth();
  const permissions = usePermissions();
  const [roleDropDownData, setRoleDropDownData] = useState<RoleDropdownItem[]>([]);
  const [selectedRole, setSelectedRole] = useState<{ id: number | null; name: string }>({
    id: null,
    name: 'Select Role',
  });
  const [allUsers, setAllUsers] = useState<RoleUserItem[]>([]);
  const [roleUsers, setRoleUsers] = useState<RoleUserItem[]>([]);

  const fetchUserByRoleData = async (roleId: number) => {
    try {
      const response = await getWithAuth(`users-by-role/${roleId}`);

      const mapUserData = (users: any[]): RoleUserItem[] => {
        return users.map((user: any) => ({
          id: user.id,
          email: user.email,
          firstName: user.user_details?.first_name || "N/A",
          lastName: user.user_details?.last_name || "N/A",
          mobileNumber: user.user_details?.mobile_no?.toString() || "N/A",
        }));
      };

      const mappedUsersWithoutRole = mapUserData(response.users_without_role);
      const mappedUsersWithRole = mapUserData(response.users_with_role);

      setAllUsers(mappedUsersWithoutRole);
      setRoleUsers(mappedUsersWithRole);

    } catch (error) {
      console.error("Failed to fetch role user data:", error);
    }
  };


  const handleAddRoleUser = async (userId: number, roleId: string) => {
    try {
      const formData = new FormData();
      formData.append('user', userId.toString());
      formData.append('role', JSON.stringify([roleId]));
      
      const response = await postWithAuth(`role-user`, formData);
    } catch (error) {
      console.error(error);
    }
  };


  const handleRemoveRoleUser = async (userId: number, roleId: string) => {
    try {
      const formData = new FormData();
      formData.append('user', userId.toString());
      formData.append('role', JSON.stringify([roleId]));
      const response = await postWithAuth(`remove-role-user`, formData);
    } catch (error) {
      console.error(error);
    }
  };


  useEffect(() => {
    fetchRoleData(setRoleDropDownData);
    fetchAndMapRoleUserData(setAllUsers);
  }, []);

  const handleRoleSelect = (roleId: number, roleName: string) => {
    setSelectedRole({ id: roleId, name: roleName });
    fetchUserByRoleData(roleId);
  };

  const moveUserToRole = (user: RoleUserItem) => {
    if (selectedRole.id !== null) {
      setRoleUsers((prev) => [...prev, user]);
      setAllUsers((prev) => prev.filter((u) => u.id !== user.id));
      handleAddRoleUser(user.id, selectedRole.id.toString());
    } else {
    }
  };

  const moveUserToAll = (user: RoleUserItem) => {
    if (selectedRole.id !== null) {
      setAllUsers((prev) => [...prev, user]);
      setRoleUsers((prev) => prev.filter((u) => u.id !== user.id));
      handleRemoveRoleUser(user.id, selectedRole.id.toString());
    } else {
    }
  };



  const handleDragStart = (e: React.DragEvent, user: RoleUserItem) => {
    e.dataTransfer.setData('user', JSON.stringify(user));
  };

  const handleDrop = (e: React.DragEvent, target: 'role' | 'all') => {
    const draggedUser: RoleUserItem = JSON.parse(e.dataTransfer.getData('user'));

    if (target === 'role') {
      moveUserToRole(draggedUser);
    } else {
      moveUserToAll(draggedUser);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center pt-2">
        <Heading text="Role User" color="#444" />
      </div>
      <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
        <div>
          <p className="mb-1" style={{ fontSize: '14px' }}>Select Role</p>
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
          <p className="mb-1 text-danger mt-2" style={{ fontSize: '14px' }}>
            Note: In order to add user to role. Please Drag it from All Users to Role Users
          </p>
        </div>
        {hasPermission(permissions, "User", "Assign User Role") && (
          <div className="d-flex flex-column flex-lg-row w-100">
            {/* All Users Column */}
            <div
              className="col bg-light p-3 rounded"
              onDrop={(e) => handleDrop(e, 'all')}
              onDragOver={handleDragOver}
            >
              <h5>All Users</h5>
              {allUsers.length > 0 ? (
                allUsers.map((user) => (
                  <div
                    key={user.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, user)}
                    className="card p-2 mb-2"
                  >
                    {`${user.firstName} ${user.lastName} (${user.email})`}
                  </div>
                ))
              ) : (
                <div>No users available</div>
              )}
            </div>

            {/* Role Users Column */}
            <div
              className="col bg-light p-3 rounded"
              onDrop={(e) => handleDrop(e, 'role')}
              onDragOver={handleDragOver}
            >
              <h5>Role Users</h5>
              {roleUsers.length > 0 ? (
                roleUsers.map((user) => (
                  <div
                    key={user.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, user)}
                    className="card p-2 mb-2"
                  >
                    {`${user.firstName} ${user.lastName} (${user.email})`}
                  </div>
                ))
              ) : (
                <div>No role users assigned</div>
              )}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
