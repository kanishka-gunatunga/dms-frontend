/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Heading from "@/components/common/Heading";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import React, { useEffect, useState } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { IoAdd, IoClose, IoSaveOutline, IoTrashOutline } from "react-icons/io5";
import { MdOutlineCancel } from "react-icons/md";
import { getWithAuth, postWithAuth } from "@/utils/apiClient";
import { DropdownButton, Dropdown } from "react-bootstrap";
import { useUserContext } from "@/context/userContext";
import ToastMessage from "@/components/common/Toast";
import Link from "next/link";
import {
  fetchCategoryData,
} from "@/utils/dataFetchFunctions";
import {
  CategoryDropdownItem
} from "@/types/types";
import { useParams } from "next/navigation";
export default function AllDocTable() {

  const isAuthenticated = useAuth();
  const { userId } = useUserContext();
  const { id } = useParams();

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [attributeData, setattributeData] = useState<string[]>([]);
  const [currentAttribue, setcurrentAttribue] = useState<string>("");
  const [categoryDropDownData, setCategoryDropDownData] = useState<
  CategoryDropdownItem[]
>([]);
const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  
  



const fetchAttributesData = async () => {
  try {
    const response = await getWithAuth(`attribute-details/${id}`);
    
    // console.log("Raw API Response---", response.category.id); 
    // console.log("Raw Attributes---", response.attributes); 

    let attributes: string[] = [];
    if (Array.isArray(response.attributes)) {
      attributes = response.attributes; 
    } else if (typeof response.attributes === "string") {
      try {
        attributes = JSON.parse(response.attributes); 
      } catch (error) {
        console.error("Failed to parse attributes string:", error);
      }
    }

    // console.log("Validated Attributes (Array)---", attributes); 

    const parsedAttributes = attributes
      .map((attr: string) => {
        const cleaned = attr.replace(/,/g, "").trim();
        // console.log("Cleaned Attribute---", cleaned); 
        return cleaned;
      })
      .filter((attr: string) => attr); 

    setattributeData(parsedAttributes);
    setSelectedCategoryId(response.category.id.toString())
    // console.log("Parsed Attributes---", parsedAttributes); 
  } catch (error) {
    // console.error("Failed to fetch Role data:", error);
  }
};


const handleCategorySelect = (categoryId: string) => {
  setSelectedCategoryId(categoryId);
};


useEffect(() => {
  fetchCategoryData(setCategoryDropDownData);
  fetchAttributesData()
}, []);

useEffect(() => {
}, [ categoryDropDownData]);

  
  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

    const addAttribute = () => {
      if (currentAttribue.trim() !== "" && !attributeData.includes(currentAttribue.trim())) {
        setattributeData((prev) => [...prev, currentAttribue.trim()]);
        setcurrentAttribue("");
      }
    };
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        addAttribute();
      }
    };
    const updateAttribute = (index: number, value: string) => {
      setattributeData((prev) => {
        const updated = [...prev];
        updated[index] = value;
        return updated;
      });
    };
    
  const removeAttribute = (index: number) => {
    setattributeData((prev) => prev.filter((_, i) => i !== index));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    const formData = new FormData();
    formData.append("category", selectedCategoryId);
    formData.append("attribute_data", JSON.stringify(attributeData));

    
    setLoading(true);
    setError("");

    try {
      const response = await postWithAuth(`attribute-details/${id}`, formData);
      if (response.status === "success") {
        setToastType("success");
        setToastMessage("Attributes updated successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 2000);
        // window.location.href = "/attributes";
      } else {
        setToastType("error");
        setToastMessage("Failed to update attribute.");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      setError("Failed to submit the form.");
      setToastType("error");
      setToastMessage("Error submitting the form.");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DashboardLayout>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <Heading text="Edit Attributes" color="#444" />
        </div>
        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
          <div
            style={{
              maxHeight: "380px",
              minHeight: "250px",
              overflowY: "auto",
              overflowX: "hidden",
              position: "relative", 
            }}
            className="custom-scroll"
          >
            <div className="d-flex flex-column">
              <div className="row row-cols-1 row-cols-lg-1 d-flex justify-content-around px-lg-3 mb-lg-3">
                <div className="col-12 col-lg-6 d-flex flex-column mb-2 mb-lg-0 ps-lg-2">
                  <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                    Select Category
                  </p>
                  <DropdownButton
                    id="dropdown-category-button"
                    title={
                      selectedCategoryId
                        ? categoryDropDownData.find(
                          (item) => item.id.toString() === selectedCategoryId
                        )?.category_name
                        : "Select Category"
                    }
                    className="custom-dropdown-text-start text-start w-100"
                    onSelect={(value) => handleCategorySelect(value || "")}
                  >
                    {categoryDropDownData.map((category) => (
                      <Dropdown.Item
                        key={category.id}
                        eventKey={category.id.toString()}
                        style={{
                          fontWeight:
                            category.parent_category === "none"
                              ? "bold"
                              : "normal",
                          marginLeft:
                            category.parent_category === "none"
                              ? "0px"
                              : "20px",
                        }}
                      >
                        {category.category_name}
                      </Dropdown.Item>
                    ))}
                  </DropdownButton>
                  {errors.category && <div style={{ color: "red" }}>{errors.category}</div>}
                </div>
                <div className="col-12 col-lg-6 d-flex flex-column ps-lg-2">
                  <p
                    className="mb-1 text-start w-100"
                    style={{ fontSize: "14px" }}
                  >
                   Attributes
                  </p>
                  <div className="col-12">
                    <div
                      style={{ marginBottom: "10px" }}
                      className="w-100 d-flex metaBorder"
                    >
                      <input
                        type="text"
                        value={currentAttribue}
                        onChange={(e) => setcurrentAttribue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter a attribute"
                        style={{
                          flex: 1,
                          padding: "6px 10px",
                          border: "1px solid #ccc",
                          borderTopRightRadius: "0 !important",
                          borderBottomRightRadius: "0 !important",
                          backgroundColor: 'transparent',
                          color: "#333",
                        }}
                      />
                      <button
                        onClick={addAttribute}
                        className="successButton"
                        style={{
                          padding: "10px",
                          backgroundColor: "#4CAF50",
                          color: "white",
                          border: "1px solid #4CAF50",
                          borderLeft: "none",
                          borderTopRightRadius: "4px",
                          borderBottomRightRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        <IoAdd />
                      </button>
                    </div>
                    <div>
                      {attributeData.map((tag, index) => (
                        <div
                          key={index}
                          className="metaBorder"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "5px",
                          }}
                        >
                          <input
                            type="text"
                            value={tag}
                            onChange={(e) =>
                              updateAttribute(index, e.target.value)
                            }
                            style={{
                              flex: 1,
                              borderRadius: "0px",
                              backgroundColor: 'transparent',
                              border: "1px solid #ccc",
                              color: "#333",
                              padding: "6px 10px",
                            }}
                          />
                          <button
                            onClick={() => removeAttribute(index)}
                            className="dangerButton"
                            style={{
                              padding: "10px !important",
                              backgroundColor: "#f44336",
                              color: "white",
                              border: "1px solid #4CAF50",
                              borderLeft: "none",
                              borderTopRightRadius: "4px",
                              borderBottomRightRadius: "4px",
                              cursor: "pointer",
                              height: "34px"
                            }}
                          >
                            <IoTrashOutline />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && <p className="text-danger">{error}</p>}

          <div className="d-flex flex-row mt-5">
            <button
              disabled={loading}
              onClick={handleSubmit}
              className="custom-icon-button button-success px-3 py-1 rounded me-2"
            >
              {loading ? (
                "Submitting..."
              ) : (
                <>
                  <IoSaveOutline fontSize={16} className="me-1" /> Save
                </>
              )}
            </button>
            <Link
              href="/attributes"
              className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
            >
              <MdOutlineCancel fontSize={16} className="me-1" /> Cancel
            </Link>
          </div>
        </div>
        <ToastMessage
          message={toastMessage}
          show={showToast}
          onClose={() => setShowToast(false)}
          type={toastType}
        />
      </DashboardLayout>
    </>
  );
}
