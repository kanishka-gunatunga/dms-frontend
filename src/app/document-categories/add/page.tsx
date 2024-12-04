"use client";

import { useState } from "react";
import { postWithAuth } from "@/utils/apiClient"; // Assuming the `postWithAuth` is in this file
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type Details = {
  parent_category: string;
  category_name: string;
  description: string;
};

const initialDetails: Details = {
  parent_category: "",
  category_name: "",
  description: "",
};

export default function AddCategories({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [details, setDetails] = useState(initialDetails);

  const handleAddCategory = async () => {
    try {
      // Create a FormData instance and append fields
      const formData = new FormData();
      formData.append("parent_category", details.parent_category);
      formData.append("category_name", details.category_name);
      formData.append("description", details.description);

      // Use the team's function for the POST request
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
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${
        isOpen ? "block" : "hidden"
      }`}
    >
      <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-lg">
        <ToastContainer />
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          Manage Document Category
          <button className="ml-2 text-blue-500 text-sm" aria-label="Help">
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
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Category Number"
            value={details.parent_category}
            onChange={(e) =>
              setDetails({ ...details, parent_category: e.target.value })
            }
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            placeholder="Category Name"
            value={details.category_name}
            onChange={(e) =>
              setDetails({ ...details, category_name: e.target.value })
            }
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <textarea
            placeholder="Description"
            value={details.description}
            onChange={(e) =>
              setDetails({ ...details, description: e.target.value })
            }
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          ></textarea>
        </div>
        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={handleAddCategory}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:ring-2 focus:ring-green-400 focus:outline-none"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:ring-2 focus:ring-red-400 focus:outline-none"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
