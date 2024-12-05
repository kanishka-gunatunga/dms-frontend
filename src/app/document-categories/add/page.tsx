"use client";

import { useState } from "react";
import { postWithAuth } from "@/utils/apiClient";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";

type Details = {
  category_name: string;
  description: string;
};

const initialDetails: Details = {
  category_name: "",
  description: "",
};

export default function AddCategories({
  isOpen,
  onClose,
  id,
}: {
  isOpen: boolean;
  onClose: () => void;
  id: number;
}) {
  const [details, setDetails] = useState(initialDetails);

  const handleAddCategory = async () => {
    try {
      const formData = new FormData();
      formData.append("parent_category", id.toString());
      formData.append("category_name", details.category_name);
      formData.append("description", details.description);

      const data = await postWithAuth("add-category", formData);

      toast.success("Category added successfully!");
      console.log(data);
      onClose();
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("An error occurred while adding the category.");
    }
  };

  return (
    <div
      className={`fixed-top d-flex justify-content-center align-items-center bg-dark bg-opacity-50 ${
        isOpen ? "d-block" : "d-none"
      }`}
      style={{ height: "100vh" }}
    >
      <div className="bg-white rounded shadow p-4 w-50">
        <ToastContainer />
        <h2 className="h5 mb-4 d-flex align-items-center">
          Manage Document Category
          <button
            className="btn btn-link text-decoration-none ms-2"
            aria-label="Help"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </h2>
        <div className="mb-3">
          <input
            type="text"
            placeholder="Category Name"
            value={details.category_name}
            onChange={(e) =>
              setDetails({ ...details, category_name: e.target.value })
            }
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <textarea
            placeholder="Description"
            value={details.description}
            onChange={(e) =>
              setDetails({ ...details, description: e.target.value })
            }
            className="form-control"
          ></textarea>
        </div>
        <div className="d-flex justify-content-end">
          <button onClick={handleAddCategory} className="btn btn-success me-2">
            Save
          </button>
          <button onClick={onClose} className="btn btn-danger">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
