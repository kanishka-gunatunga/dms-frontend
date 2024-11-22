"use client";

import Heading from "@/components/common/Heading";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import React, { useState } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { DropdownButton, Dropdown } from "react-bootstrap";
import { postWithAuth } from "@/utils/apiClient";
// import { useRouter } from "next/navigation";
import { IoAdd, IoSaveOutline, IoTrashOutline } from "react-icons/io5";
import { MdOutlineCancel } from "react-icons/md";

export default function AllDocTable() {
  const isAuthenticated = useAuth();

  const [name, setName] = useState<string>("");
  const [document, setDocument] = useState<File | null>(null);
  const [category, setCategory] = useState<string>("Hr");
  const [storage, setStorage] = useState<string>("Local Disk (Default)");
  const [assignRoles, setAssignRoles] = useState<string>("DocViewer");
  const [assignUsers, setAssignUsers] = useState<string>("Admin Account");
  const [description, setDescription] = useState<string>("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [metaTags, setMetaTags] = useState<string[]>([]);
  const [currentMeta, setCurrentMeta] = useState<string>("");
  // const router = useRouter();

  const addMetaTag = () => {
    if (currentMeta.trim() !== "") {
      setMetaTags([...metaTags, currentMeta.trim()]);
      setCurrentMeta("");
    }
  };

  const updateMetaTag = (index: number, value: string) => {
    const updatedTags = [...metaTags];
    updatedTags[index] = value;
    setMetaTags(updatedTags);
  };

  const removeMetaTag = (index: number) => {
    const updatedTags = metaTags.filter((_, i) => i !== index);
    setMetaTags(updatedTags);
  };

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !document) {
      setError("Both name and document are required.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("document", document);
    formData.append("category", category);
    formData.append("storage", storage);
    formData.append("description", description);
    formData.append("assigned_roles", assignRoles);
    formData.append("assigned_users", assignUsers);

    setLoading(true);
    setError("");

    try {
      const response = await postWithAuth("add-document", formData);
      console.log("Form submitted successfully:", response);
      setSuccess("Form submitted successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Failed to submit the form.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setDocument(e.target.files[0]);
    }
  };

  return (
    <>
      <DashboardLayout>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <Heading text="Add Document" color="#444" />
        </div>

        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
          <div
            style={{
              maxHeight: "380px",
              overflowY: "auto",
              overflowX: "hidden",
            }}
            className="custom-scroll"
          >
            <div className="d-flex flex-column">
              <div className="row row-cols-1 row-cols-lg-4 d-flex justify-content-around px-lg-3 mb-lg-3">
                <div className="col d-flex flex-column  justify-content-center align-items-center p-0">
                  <p
                    className="mb-1 text-start w-100"
                    style={{ fontSize: "14px" }}
                  >
                    Document
                  </p>
                  <input
                    type="file"
                    id="document"
                    accept=".pdf,.doc,.docx,.png,.jpg"
                    onChange={handleFileChange}
                    required
                  />
                </div>
                <div className="col d-flex flex-column justify-content-center align-items-center p-0 ps-lg-2">
                  <p
                    className="mb-1 text-start w-100"
                    style={{ fontSize: "14px" }}
                  >
                    Name
                  </p>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="col d-flex flex-column justify-content-center align-items-center p-0 ps-lg-2">
                  <p
                    className="mb-1 text-start w-100"
                    style={{ fontSize: "14px" }}
                  >
                    Category
                  </p>
                  <DropdownButton
                    id="dropdown-category-button"
                    title={category}
                    className="custom-dropdown-text-start text-start w-100"
                    onSelect={(value) => setCategory(value || "")}
                  >
                    <Dropdown.Item eventKey="Hr">Hr</Dropdown.Item>
                    <Dropdown.Item eventKey="Employee">Employee</Dropdown.Item>
                  </DropdownButton>
                </div>
                <div className="col d-flex flex-column justify-content-center align-items-center p-0 ps-lg-2">
                  <p
                    className="mb-1 text-start w-100"
                    style={{ fontSize: "14px" }}
                  >
                    Storage
                  </p>
                  <DropdownButton
                    id="dropdown-category-button"
                    title={storage}
                    className="custom-dropdown-text-start text-start w-100"
                    onSelect={(value) => setStorage(value || "")}
                  >
                    <Dropdown.Item eventKey="Local Disk (Default)">
                      Local Disk (Default)
                    </Dropdown.Item>
                  </DropdownButton>
                </div>
              </div>
              <div className="d-flex flex-column flex-lg-row mb-3">
                <div className="col-12 col-lg-6 d-flex flex-column">
                  <p
                    className="mb-1 text-start w-100"
                    style={{ fontSize: "14px" }}
                  >
                    Description
                  </p>
                  <textarea
                    className="form-control"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="col-12 col-lg-6 d-flex flex-column ps-lg-2">
                  <p
                    className="mb-1 text-start w-100"
                    style={{ fontSize: "14px" }}
                  >
                    Meta tags
                  </p>
                  <div className="col-12">
                    <div
                      style={{ marginBottom: "10px" }}
                      className="w-100 d-flex"
                    >
                      <input
                        type="text"
                        value={currentMeta}
                        onChange={(e) => setCurrentMeta(e.target.value)}
                        placeholder="Enter a meta tag"
                        style={{
                          flex: 1,
                          padding: "10px",
                          border: "1px solid #ccc",
                          borderTopRightRadius: "0",
                          borderBottomRightRadius: "0",
                        }}
                      />
                      <button
                        onClick={addMetaTag}
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
                      {metaTags.map((tag, index) => (
                        <div
                          key={index}
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
                              updateMetaTag(index, e.target.value)
                            }
                            style={{
                              flex: 1,
                              padding: "10px",
                              borderRadius: "0px",
                            }}
                          />
                          <button
                            onClick={() => removeMetaTag(index)}
                            className="dangerButton"
                            style={{
                              padding: "10px",
                              backgroundColor: "#f44336",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
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
              <div className="d-flex flex-column flex-lg-row">
                <div className="col-12 col-lg-6 d-flex flex-column">
                  <p
                    className="mb-1 text-start w-100"
                    style={{ fontSize: "14px" }}
                  >
                    Assign/share with roles
                  </p>
                  <DropdownButton
                    id="dropdown-category-button"
                    title={assignRoles}
                    className="custom-dropdown-text-start text-start w-100"
                    onSelect={(value) => setAssignRoles(value || "")}
                  >
                    <Dropdown.Item eventKey="DocViewer">
                      DocViewer
                    </Dropdown.Item>
                    <Dropdown.Item eventKey="Manager">Manager</Dropdown.Item>
                    <Dropdown.Item eventKey="Excecutive">
                      Excecutive
                    </Dropdown.Item>
                    <Dropdown.Item eventKey="Super Admin">
                      Super Admin
                    </Dropdown.Item>
                    <Dropdown.Item eventKey="Employee">Employee</Dropdown.Item>
                  </DropdownButton>
                </div>
                <div className="col-12 col-lg-6 d-flex flex-column ps-lg-2">
                  <p
                    className="mb-1 text-start w-100"
                    style={{ fontSize: "14px" }}
                  >
                    Assign/share with users
                  </p>
                  <DropdownButton
                    id="dropdown-category-button"
                    title={assignUsers}
                    className="custom-dropdown-text-start text-start w-100"
                    onSelect={(value) => setAssignUsers(value || "")}
                  >
                    <Dropdown.Item eventKey="Admin Account">
                      Admin Account
                    </Dropdown.Item>
                    <Dropdown.Item eventKey="Super Admin Account">
                      Super Admin Account
                    </Dropdown.Item>
                  </DropdownButton>
                </div>
              </div>
            </div>
          </div>
          {error && <p className="text-danger">{error}</p>}
          {success && <p className="text-success">{success}</p>}

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
            <a
              href="/all-documents"
              className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
            >
              <MdOutlineCancel fontSize={16} className="me-1" /> Cancel
            </a>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
