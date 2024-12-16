/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Heading from "@/components/common/Heading";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import React, { useEffect, useState } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { DropdownButton, Dropdown } from "react-bootstrap";
import { getWithAuth, postWithAuth } from "@/utils/apiClient";
import { IoAdd, IoClose, IoSaveOutline, IoTrashOutline } from "react-icons/io5";
import { MdOutlineCancel } from "react-icons/md";
import { useUserContext } from "@/context/userContext";
import { formatDateForSQL } from "@/utils/commonFunctions";
import {
  fetchAndMapUserData,
  fetchCategoryData,
  fetchRoleData,
} from "@/utils/dataFetchFunctions";
import {
  CategoryDropdownItem,
  RoleDropdownItem,
  UserDropdownItem,
} from "@/types/types";
import ToastMessage from "@/components/common/Toast";
import Link from "next/link";
import { Checkbox, DatePicker, DatePickerProps } from "antd";

export default function AllDocTable() {
  const isAuthenticated = useAuth();
  const { userId } = useUserContext();

  console.log("user id: ", userId);

  const [name, setName] = useState<string>("");
  const [document, setDocument] = useState<File | null>(null);
  const [storage, setStorage] = useState<string>("");
  const [roleDropDownData, setRoleDropDownData] = useState<RoleDropdownItem[]>(
    []
  );
  const [userDropDownData, setUserDropDownData] = useState<UserDropdownItem[]>(
    []
  );

  const [description, setDescription] = useState<string>("");
  const [errors, setErrors] = useState<any>({});

  const [loading, setLoading] = useState<boolean>(false);

  const [metaTags, setMetaTags] = useState<string[]>([]);
  const [currentMeta, setCurrentMeta] = useState<string>("");

  const [isTimeLimited, setIsTimeLimited] = useState<boolean>(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [downloadable, setDownloadable] = useState<boolean>(false);

  const [isUserTimeLimited, setIsUserTimeLimited] = useState<boolean>(false);
  const [users, setUsers] = useState<string[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userStartDate, setUserStartDate] = useState<string>("");
  const [userEndDate, setUserEndDate] = useState<string>("");
  const [userDownloadable, setUserDownloadable] = useState<boolean>(false);

  const [categoryDropDownData, setCategoryDropDownData] = useState<
    CategoryDropdownItem[] 
  >([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  const [encriptionType, setEncriptionType] = useState<string>("128bit");
  const [isEncripted, setIsEncripted] = useState<boolean>(false);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");
  const [attributes, setAttributes] = useState<string[]>([]);
  const [formAttributeData, setFormAttributeData] = useState<{ attribute: string; value: string }[]>([]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setDocument(file);

    // if (file) {
    //   setName(file.name);
    //   setErrors((prevErrors) => ({ ...prevErrors, document: "" }));
    // }
  };

  useEffect(() => {
    fetchCategoryData(setCategoryDropDownData);
    fetchRoleData(setRoleDropDownData);
    fetchAndMapUserData(setUserDropDownData);
  }, []);

  useEffect(() => {
    // console.log("dropdown updated:", userDropDownData);
  }, [userDropDownData, roleDropDownData, categoryDropDownData]);

  // category select
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    handleGetAttributes(categoryId)
  };

  const handleGetAttributes = async (id: string) => {
    try {
      const response = await getWithAuth(`attribute-by-category/${id}`);
      console.log("Attributes: ", response);
      const parsedAttributes = JSON.parse(response.attributes);
      setAttributes(parsedAttributes);
    } catch (error) {
      console.error("Error getting shareable link:", error);
    }
  };
  const handleInputChange = (attribute: string, value: string) => {
    setFormAttributeData((prevData) => {
      const existingIndex = prevData.findIndex((item) => item.attribute === attribute);
      if (existingIndex !== -1) {
        const updatedData = [...prevData];
        updatedData[existingIndex] = { attribute, value };
        return updatedData;
      }
      return [...prevData, { attribute, value }];
    });
  };



  // meta tag
  const addMetaTag = () => {
    if (currentMeta.trim() !== "" && !metaTags.includes(currentMeta.trim())) {
      setMetaTags((prev) => [...prev, currentMeta.trim()]);
      setCurrentMeta("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addMetaTag();
    }
  };

  const updateMetaTag = (index: number, value: string) => {
    setMetaTags((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const removeMetaTag = (index: number) => {
    setMetaTags((prev) => prev.filter((_, i) => i !== index));
  };

  // role select
  const handleRoleSelect = (roleId: string) => {
    const selectedRole = roleDropDownData.find(
      (role) => role.id.toString() === roleId
    );

    if (selectedRole && !selectedRoleIds.includes(roleId)) {
      setSelectedRoleIds([...selectedRoleIds, roleId]);
      setRoles([...roles, selectedRole.role_name]);
    }
  };

  const handleRemoveRole = (roleName: string) => {
    const roleToRemove = roleDropDownData.find(
      (role) => role.role_name === roleName
    );

    if (roleToRemove) {
      setSelectedRoleIds(
        selectedRoleIds.filter((id) => id !== roleToRemove.id.toString())
      );
      setRoles(roles.filter((r) => r !== roleName));
    }
  };

  // user select
  const handleUserSelect = (userId: string) => {
    const selectedUser = userDropDownData.find(
      (user) => user.id.toString() === userId
    );

    if (selectedUser && !selectedUserIds.includes(userId)) {
      setSelectedUserIds([...selectedUserIds, userId]);
      setUsers([...users, selectedUser.user_name]);
    }
  };

  const handleUserRole = (userName: string) => {
    const userToRemove = userDropDownData.find(
      (user) => user.user_name === userName
    );

    if (userToRemove) {
      setSelectedUserIds(
        selectedUserIds.filter((id) => id !== userToRemove.id.toString())
      );
      setUsers(users.filter((r) => r !== userName));
    }
  };

  const collectedData = {
    isTimeLimited: isTimeLimited ? "1" : "0",
    isEncripted: isEncripted ? "1" : "0",
    startDate: formatDateForSQL(startDate),
    endDate: formatDateForSQL(endDate),
    downloadable: downloadable ? "1" : "0",
    isUserTimeLimited: isUserTimeLimited ? "1" : "0",
    userStartDate: formatDateForSQL(userStartDate),
    userEndDate: formatDateForSQL(userEndDate),
    userDownloadable: userDownloadable ? "1" : "0",
  };

  console.log("Collected Data:", collectedData);

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }
  const validate = () => {
    const validationErrors: any = {};

    if (!name) {
      validationErrors.name = "Name is required.";
    }

    if (!selectedCategoryId) {
      validationErrors.category = "Category is required.";
    }

    if (!storage) {
      validationErrors.storage = "Storage is required.";
    }

    if (!document) {
      validationErrors.document = "Document is required.";
    }

    if (isTimeLimited) {
      if (!startDate) {
        validationErrors.startDate = "Start date is required.";
      }

      if (!endDate) {
        validationErrors.endDate = "End date is required.";
      }
    }

    if (isUserTimeLimited) {
      if (!userStartDate) {
        validationErrors.userStartDate = "Start date is required.";
      }

      if (!userEndDate) {
        validationErrors.userEndDate = "End date is required.";
      }
    }
    return validationErrors;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    const formData = new FormData();
    formData.append("name", name);
    formData.append("document", document || "");
    formData.append("category", selectedCategoryId);
    formData.append("storage", storage);
    formData.append("description", description);
    formData.append("meta_tags", JSON.stringify(metaTags));
    formData.append("assigned_roles", JSON.stringify(selectedRoleIds));
    formData.append("assigned_users", JSON.stringify(selectedUserIds));
    formData.append("role_is_time_limited", collectedData.isTimeLimited);
    formData.append("role_start_date_time", collectedData.startDate);
    formData.append("role_end_date_time", collectedData.endDate);
    formData.append("role_is_downloadable", collectedData.downloadable);
    formData.append("user_is_time_limited", collectedData.isUserTimeLimited);
    formData.append("user_start_date_time", collectedData.userStartDate);
    formData.append("user_end_date_time", collectedData.userEndDate);
    formData.append("user_is_downloadable", collectedData.userDownloadable);
    formData.append("user", userId || "");
    formData.append("is_encrypted", collectedData.isEncripted);
    formData.append("encryption_type", encriptionType);
    formData.append("attribute_data", JSON.stringify(formAttributeData));

    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await postWithAuth("add-document", formData);
      console.log("Form submitted successfully:", response);
      if (response.status === "success") {
        setToastType("success");
        setToastMessage("Form submitted successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 2000);
        window.location.href = "/all-documents";
      } else {
        console.log("Form submitted failed:", response);
        setToastType("error");
        setToastMessage("Failed to submit the form.");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setToastType("error");
      setToastMessage("Failed to submit the form.");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const onStartDateTimeOk = (value: DatePickerProps['value'], dateString: string) => {
    if (value) {
      console.log('onStartDateTimeOk: ', dateString);
      setStartDate(dateString);
    }
  };

  const onEndDateTimeOk = (value: DatePickerProps['value'], dateString: string) => {
    if (value) {
      console.log('onEndDateTimeOk: ', dateString);
      setEndDate(dateString);
    }
  };

  const onUserStartDateTimeOk = (value: DatePickerProps['value'], dateString: string) => {
    if (value) {
      console.log('onStartDateTimeOk: ', dateString);
      setUserStartDate(dateString);
    }
  };

  const onUserEndDateTimeOk = (value: DatePickerProps['value'], dateString: string) => {
    if (value) {
      console.log('onEndDateTimeOk: ', dateString);
      setUserEndDate(dateString);
    }
  };

  console.log("attribute data : ", formAttributeData)
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
                    style={{ border: "solid 1px #eee" }}
                    id="document"
                    accept=".pdf,.doc,.docx,.png,.jpg"
                    onChange={handleFileChange}
                  />
                  {errors.document && <div style={{ color: "red" }}>{errors.document}</div>}
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
                  {errors.name && <div style={{ color: "red" }}>{errors.name}</div>}
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
                <div className="col d-flex flex-column justify-content-center align-items-center p-0 ps-lg-2">
                  <p
                    className="mb-1 text-start w-100"
                    style={{ fontSize: "14px" }}
                  >
                    Storage
                  </p>
                  <DropdownButton
                    id="dropdown-category-button"
                    title={storage || "Select"}
                    className="custom-dropdown-text-start text-start w-100"
                    onSelect={(value) => setStorage(value || "")}
                  >
                    <Dropdown.Item eventKey="Local Disk (Default)">
                      Local Disk (Default)
                    </Dropdown.Item>
                  </DropdownButton>
                  {errors.storage && <div style={{ color: "red" }}>{errors.storage}</div>}
                </div>
              </div>
              {attributes.map((attribute, index) => {
                const existingValue = formAttributeData.find((item) => item.attribute === attribute)?.value || "";
                return (
                  <div key={index} className="form-group">
                    <p
                      className="mb-1 text-start w-100"
                      style={{ fontSize: "14px" }}
                    >
                      {attribute}
                    </p>
                    <input
                      type="text"
                      className="form-control"
                      value={existingValue}
                      onChange={(e) => handleInputChange(attribute, e.target.value)}
                    />
                  </div>
                )
              })}
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
                        onKeyDown={handleKeyDown}
                        placeholder="Enter a meta tag"
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
                              borderRadius: "0px",
                              backgroundColor: 'transparent',
                              border: "1px solid #ccc",
                              color: "#333",
                              padding: "6px 10px",
                            }}
                          />
                          <button
                            onClick={() => removeMetaTag(index)}
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
              <div className="d-flex flex-column flex-lg-row">
                <div className="col-12 col-lg-6 d-flex flex-column">
                  <p
                    className="mb-1 text-start w-100"
                    style={{ fontSize: "14px" }}
                  >
                    Assign/share with roles
                  </p>
                  <div className="d-flex flex-column position-relative">
                    <DropdownButton
                      id="dropdown-category-button"
                      title={
                        roles.length > 0 ? roles.join(", ") : "Select Roles"
                      }
                      className="custom-dropdown-text-start text-start w-100"
                      onSelect={(value) => {
                        if (value) handleRoleSelect(value);
                      }}
                    >
                      {roleDropDownData.length > 0 ? (
                        roleDropDownData.map((role) => (
                          <Dropdown.Item key={role.id} eventKey={role.id}>
                            {role.role_name}
                          </Dropdown.Item>
                        ))
                      ) : (
                        <Dropdown.Item disabled>
                          No Roles available
                        </Dropdown.Item>
                      )}
                    </DropdownButton>

                    <div className="mt-1">
                      {roles.map((role, index) => (
                        <span
                          key={index}
                          className="badge bg-primary text-light me-2 p-2 d-inline-flex align-items-center"
                        >
                          {role}
                          <IoClose
                            className="ms-2"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleRemoveRole(role)}
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                  {roles.length > 0 && (
                    <div className="mt-1">
                      <label className="d-flex flex-row mt-2">
                        <Checkbox
                          checked={isTimeLimited}
                          onChange={() => setIsTimeLimited(!isTimeLimited)}
                          className="me-2"
                        >
                          <p
                            className="mb-0 text-start w-100"
                            style={{ fontSize: "14px" }}
                          >
                            Specify the Period
                          </p>

                        </Checkbox>
                      </label>
                      {isTimeLimited && (
                        <div className="d-flex flex-column flex-lg-row gap-2">
                          <div className="d-flex flex-column">
                            <label className="d-flex flex-column">
                              <DatePicker
                                showTime
                                placeholder="Choose Start Date"
                                onChange={(value, dateString) => {
                                  console.log('Selected Time: ', value);
                                  console.log('Formatted Selected Time: ', dateString);
                                  setStartDate(`${dateString}`)
                                }}
                                onOk={(value) => onStartDateTimeOk(value, value?.format('YYYY-MM-DD HH:mm:ss') ?? '')}
                              />
                              {errors.startDate && (
                                <span className="text-danger">{errors.startDate}</span>
                              )}
                            </label>

                          </div>
                          <div className="d-flex flex-column">
                            <label className="d-flex flex-column">
                              <DatePicker
                                showTime
                                placeholder="Choose End Date"
                                onChange={(value, dateString) => {
                                  console.log('Selected Time: ', value);
                                  console.log('Formatted Selected Time: ', dateString);
                                  setEndDate(`${dateString}`)
                                }}
                                onOk={(value) => onEndDateTimeOk(value, value?.format('YYYY-MM-DD HH:mm:ss') ?? '')}
                              />
                              {errors.endDate && (
                                <span className="text-danger">{errors.endDate}</span>
                              )}
                            </label>
                          </div>
                        </div>
                      )}
                      <label className="d-flex flex-row mt-2">
                        <Checkbox
                          checked={downloadable}
                          onChange={() => setDownloadable(!downloadable)}
                          className="me-2"
                        >
                          <p
                            className="mb-0 text-start w-100"
                            style={{ fontSize: "14px" }}
                          >
                            Downloadable
                          </p>

                        </Checkbox>
                      </label>
                    </div>
                  )}
                </div>

                <div className="col-12 col-lg-6 d-flex flex-column ps-lg-2">
                  <p
                    className="mb-1 text-start w-100"
                    style={{ fontSize: "14px" }}
                  >
                    Assign/share with Users
                  </p>
                  <div className="d-flex flex-column position-relative">
                    <DropdownButton
                      id="dropdown-category-button-2"
                      title={
                        users.length > 0 ? users.join(", ") : "Select Users"
                      }
                      className="custom-dropdown-text-start text-start w-100"
                      onSelect={(value) => {
                        if (value) handleUserSelect(value);
                      }}
                    >
                      {userDropDownData.length > 0 ? (
                        userDropDownData.map((user) => (
                          <Dropdown.Item key={user.id} eventKey={user.id}>
                            {user.user_name}
                          </Dropdown.Item>
                        ))
                      ) : (
                        <Dropdown.Item disabled>
                          No users available
                        </Dropdown.Item>
                      )}
                    </DropdownButton>

                    <div className="mt-1">
                      {users.map((user, index) => (
                        <span
                          key={index}
                          className="badge bg-primary text-light me-2 p-2 d-inline-flex align-items-center"
                        >
                          {user}
                          <IoClose
                            className="ms-2"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleUserRole(user)}
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                  {selectedUserIds.length > 0 && (
                    <div className="mt-1">
                      <label className="d-flex flex-row mt-2">
                        <Checkbox
                          checked={isUserTimeLimited}
                          onChange={() =>
                            setIsUserTimeLimited(!isUserTimeLimited)
                          }
                          className="me-2"
                        >
                          <p
                            className="mb-0 text-start w-100"
                            style={{ fontSize: "14px" }}
                          >
                            Specify the Period
                          </p>
                        </Checkbox>
                      </label>
                      {isUserTimeLimited && (
                        <div className="d-flex flex-column flex-lg-row gap-2">
                          <div className="d-flex flex-column">
                            <label className="d-flex flex-column">
                              <DatePicker
                                showTime
                                placeholder="Choose Start Date"
                                onChange={(value, dateString) => {
                                  console.log('Selected Time: ', value);
                                  console.log('Formatted Selected Time: ', dateString);
                                  setUserStartDate(`${dateString}`)
                                }}
                                onOk={(value) => onUserStartDateTimeOk(value, value?.format('YYYY-MM-DD HH:mm:ss') ?? '')}
                              />
                              {errors.userStartDate && (
                                <span className="text-danger">{errors.userStartDate}</span>
                              )}
                            </label>
                          </div>
                          <div className="d-flex flex-column">
                            <label className="d-flex flex-column">
                              <DatePicker
                                showTime
                                placeholder="Choose End Date"
                                onChange={(value, dateString) => {
                                  console.log('Selected Time: ', value);
                                  console.log('Formatted Selected Time: ', dateString);
                                  setUserEndDate(`${dateString}`)
                                }}
                                onOk={(value) => onUserEndDateTimeOk(value, value?.format('YYYY-MM-DD HH:mm:ss') ?? '')}
                              />
                              {errors.userEndDate && (
                                <span className="text-danger">{errors.userEndDate}</span>
                              )}
                            </label>

                          </div>
                        </div>
                      )}
                      <label className="d-flex flex-row mt-2">
                        <Checkbox
                          checked={userDownloadable}
                          onChange={() =>
                            setUserDownloadable(!userDownloadable)
                          }
                          className="me-2"
                        >
                          <p
                            className="mb-0 text-start w-100"
                            style={{ fontSize: "14px" }}
                          >
                            Downloadable
                          </p>

                        </Checkbox>

                      </label>
                    </div>
                  )}
                </div>
              </div>
              <div className="d-flex flex-column flex-lg-row w-100">
                <div className="col-12 col-lg-6 d-flex flex-column">
                  <div className="d-flex w-100 flex-column justify-content-center align-items-start p-0">
                    <label className="d-flex flex-row mt-3">
                      <Checkbox
                        checked={isEncripted}
                        onChange={() => setIsEncripted(!isEncripted)}
                        className="me-2"
                      >
                        <p
                          className="mb-0 text-start w-100"
                          style={{ fontSize: "14px" }}
                        >
                          Need Encription
                        </p>

                      </Checkbox>
                    </label>
                    {isEncripted && (
                      <div className="d-flex flex-column w-100 pt-2">
                        <p
                          className="mb-1 text-start w-100"
                          style={{ fontSize: "14px" }}
                        >
                          Encription Type
                        </p>
                        <DropdownButton
                          id="dropdown-category-button"
                          title={encriptionType}
                          className="custom-dropdown-text-start text-start w-100"
                          onSelect={(value) => setEncriptionType(value || "")}
                        >
                          <Dropdown.Item eventKey="128bit">
                            128bit
                          </Dropdown.Item>
                          <Dropdown.Item eventKey="256bit">
                            256bit
                          </Dropdown.Item>
                        </DropdownButton>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

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
              href="/all-documents"
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
