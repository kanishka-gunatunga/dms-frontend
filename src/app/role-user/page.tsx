"use client";

import Heading from "@/components/common/Heading";
import DashboardLayout from "@/components/DashboardLayout";
import React, { useState } from "react";
import { DropdownButton, Dropdown } from "react-bootstrap";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

type User = {
  id: number;
  name: string;
};

type UserDropZoneProps = {
  users: User[];
  onDropUser: (userId: number) => void;
  label: string;
};

type DraggableUserCardProps = {
  user: User;
};

const DraggableUserCard: React.FC<DraggableUserCardProps> = ({ user }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "USER_CARD",
    item: { id: user.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        padding: "10px",
        margin: "5px",
        backgroundColor: "#f8f9fa",
        border: "1px solid #ddd",
        cursor: "move",
      }}
    >
      {user.name}
    </div>
  );
};

const UserDropZone: React.FC<UserDropZoneProps> = ({
  users,
  onDropUser,
  label,
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "USER_CARD",
    drop: (item: { id: number }) => onDropUser(item.id),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      style={{
        minHeight: "200px",
        padding: "20px",
        backgroundColor: isOver ? "#e9ecef" : "#f8f9fa",
        border: "1px dashed #ccc",
      }}
    >
      <p style={{ fontSize: "16px", color: "#0d6efd" }}>{label}</p>
      {users.map((user) => (
        <DraggableUserCard key={user.id} user={user} />
      ))}
    </div>
  );
};

export default function AllDocTable() {
  const [selectedCategory, setSelectedCategory] =
    useState<string>("Select category");
  const [allUsers, setAllUsers] = useState<User[]>([
    { id: 1, name: "User 1" },
    { id: 2, name: "User 2" },
  ]);
  const [roleUsers, setRoleUsers] = useState<User[]>([]);

  const handleCategorySelect = (selected: string) => {
    setSelectedCategory(selected);
  };

  const handleDropToRole = (userId: number) => {
    const user = allUsers.find((u) => u.id === userId);
    if (user) {
      setAllUsers((prev) => prev.filter((u) => u.id !== userId));
      setRoleUsers((prev) => [...prev, user]);
    }
  };

  const handleDropToAll = (userId: number) => {
    const user = roleUsers.find((u) => u.id === userId);
    if (user) {
      setRoleUsers((prev) => prev.filter((u) => u.id !== userId));
      setAllUsers((prev) => [...prev, user]);
    }
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
                title={selectedCategory}
                className="custom-dropdown-secondary"
              >
                <Dropdown.Item
                  onClick={() => handleCategorySelect("DocViewer")}
                >
                  DocViewer
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleCategorySelect("Manager")}>
                  Manager
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => handleCategorySelect("Executive")}
                >
                  Executive
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => handleCategorySelect("SuperAdmin")}
                >
                  Super Admin
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleCategorySelect("Employee")}>
                  Employee
                </Dropdown.Item>
              </DropdownButton>
              <p className="mb-1 text-danger mt-2" style={{ fontSize: "14px" }}>
                Note: In order to add user to role. Please Drag it from All
                Users to Role Users
              </p>
            </div>
            <div className="d-flex flex-column flex-lg-row w-100">
              <DndProvider backend={HTML5Backend}>
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
              </DndProvider>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
