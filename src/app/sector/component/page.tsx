"use client";

import { useState } from "react";

interface ChildCategory {
  id: number;
  name: string;
}

interface SectorCategory {
  id: number;
  name: string;
  children: {
    invoice: ChildCategory[];
    attendance: ChildCategory[];
  };
  color: string;
}

const generateRandomColor = (): string => {
  // Generate a completely random color in hex format
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
};

const SectorCategories: React.FC = () => {
  const [sectorCategories, setSectorCategories] = useState<SectorCategory[]>(
    []
  );

  const handleAddSectorCategory = () => {
    const newCategory: SectorCategory = {
      id: Date.now(),
      name: "Invoice",
      children: { invoice: [], attendance: [] },
      color: generateRandomColor(),
    };
    setSectorCategories([...sectorCategories, newCategory]);
  };

  const handleAddChildCategory = (
    sectorId: number,
    type: "invoice" | "attendance"
  ) => {
    const childName = prompt(`Enter name for new child category under ${type}`);
    if (!childName) return;

    setSectorCategories((prev) =>
      prev.map((category) =>
        category.id === sectorId
          ? {
              ...category,
              children: {
                ...category.children,
                [type]: [
                  ...category.children[type],
                  { id: Date.now(), name: childName },
                ],
              },
            }
          : category
      )
    );
  };

  const handleEditChildCategory = (
    sectorId: number,
    type: "invoice" | "attendance",
    childId: number
  ) => {
    const newName = prompt("Enter new name for the child category");
    if (!newName) return;

    setSectorCategories((prev) =>
      prev.map((category) =>
        category.id === sectorId
          ? {
              ...category,
              children: {
                ...category.children,
                [type]: category.children[type].map((child) =>
                  child.id === childId ? { ...child, name: newName } : child
                ),
              },
            }
          : category
      )
    );
  };

  const handleDeleteChildCategory = (
    sectorId: number,
    type: "invoice" | "attendance",
    childId: number
  ) => {
    setSectorCategories((prev) =>
      prev.map((category) =>
        category.id === sectorId
          ? {
              ...category,
              children: {
                ...category.children,
                [type]: category.children[type].filter(
                  (child) => child.id !== childId
                ),
              },
            }
          : category
      )
    );
  };

  return (
    <div className="container my-4">
      <button
        onClick={handleAddSectorCategory}
        className="btn btn-primary mb-3"
      >
        + Add Sector Category
      </button>

      <div>
        {sectorCategories.map((category) => (
          <div
            key={category.id}
            className="card mb-4"
            style={{ backgroundColor: `${category.color}33` }}
          >
            <div
              className="card-header text-white"
              style={{ backgroundColor: category.color }}
            >
              {category.name}
            </div>
            <div className="card-body">
              <div>
                <h5>Sub Category - Invoice</h5>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.children.invoice.map((child) => (
                      <tr key={child.id}>
                        <td>{child.name}</td>
                        <td>
                          <button
                            onClick={() =>
                              handleEditChildCategory(
                                category.id,
                                "invoice",
                                child.id
                              )
                            }
                            className="btn btn-link text-primary"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteChildCategory(
                                category.id,
                                "invoice",
                                child.id
                              )
                            }
                            className="btn btn-link text-danger"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  onClick={() => handleAddChildCategory(category.id, "invoice")}
                  className="btn btn-success btn-sm"
                >
                  + Add Child Category
                </button>
              </div>

              <div className="mt-4">
                <h5>Sub Category - Attendance</h5>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.children.attendance.map((child) => (
                      <tr key={child.id}>
                        <td>{child.name}</td>
                        <td>
                          <button
                            onClick={() =>
                              handleEditChildCategory(
                                category.id,
                                "attendance",
                                child.id
                              )
                            }
                            className="btn btn-link text-primary"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteChildCategory(
                                category.id,
                                "attendance",
                                child.id
                              )
                            }
                            className="btn btn-link text-danger"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  onClick={() =>
                    handleAddChildCategory(category.id, "attendance")
                  }
                  className="btn btn-success btn-sm"
                >
                  + Add Child Category
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectorCategories;
