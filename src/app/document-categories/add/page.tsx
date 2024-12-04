"use client";

import { useState } from "react";
import { API_BASE_URL } from "@/utils/apiClient";
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
      const response = await fetch(`${API_BASE_URL}add-category`, {
        method: "POST",
        headers: {
          Authorization:
            "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiZWQxYTU2MWYzYmI5YzJhMmRhZjc5M2RkZGQzMGI4ZTY1NTE4MGFhM2ZmNDVmZGNkZmYzM2ZiYWQ3YjRlNTJlM2NmZGM0NmQwNTI5ZjQ0MDciLCJpYXQiOjE3MzEzMTU0NTQuNzc2NjA0LCJuYmYiOjE3MzEzMTU0NTQuNzc2NjA3LCJleHAiOjE3NjI4NTE0NTQuNzcyNTkxLCJzdWIiOiIxIiwic2NvcGVzIjpbXX0.OTZIzCQ3TQ6H7AKYh13A5IHpPyNuhr5R_Wxjn8BBzjmm2JeMwPWU4VCx7sdnckrqD_rtx0zYE3pRbTBrj_pSiuQv1Q5lxp9CT_1IUx05f9eLpS-T9irI8QnlgsJh3j3J26JxGsZRTikTO3bIJEixAHQzAexy280ykoRJt2CweQH9zmcyuTSWcaksze5HqGuqAzqGhIFP64X_y7vwv5of44Ryr9BK92BBHHklXJ99WQpLfbUU7guQGctRl34pibm-JPst-M7askz2aoLCIKheI6VzfHt9doWcxwzMTnBUZzAgkFPE5qO0VQ4gtceEJFZBj8IDWxi8bn46-xJv1-cgMfXeU1Low-MEfDwzpErob6sIrFK8W9rz2t05U4TTGN17tziFNC4qwZKFwSVzk5MJIqzRIrMHfRUBt_zZF8Q_v_uP5GZT0tS5fitiH3cZ2Wr4y4c7lhdqP2WlV-3UrmqmHa2cnIpA-2dUFqXpklz4tfXwTfWt9qNbEy_pIueqwZ0w31li7aXoxyQpbv-MDkC0c5LfwB-C3GtvluwxIv7E0Lk3kQTpdR69hZvwmMdMxQ4WTFdvE3KM5TnAiEEsVF2TTyVGb_aWSeq7OQUTvzfm09m5fqZfl8a4aHLJaeSET2N1fyBgZu1MKes5wkDAeyaa9xOJ60TgZO0jIXwwaEQsmIk", // Ensure this token is stored securely
          "Content-Type": "application/json",
        },
        body: JSON.stringify(details),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Category added successfully!");
      } else {
        toast.error(
          `Failed to add category: ${data.message || "Unknown error"}`
        );
      }

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
