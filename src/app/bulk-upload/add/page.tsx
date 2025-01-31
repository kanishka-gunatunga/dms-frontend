/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Heading from "@/components/common/Heading";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import React, { useEffect, useState } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { IoCheckmark, IoClose, IoSaveOutline } from "react-icons/io5";
import { MdModeEditOutline, MdOutlineCancel, MdUpload } from "react-icons/md";
import { deleteWithAuth, getWithAuth, postAxiosWithAuth, postWithAuth, postWithAuthXML } from "@/utils/apiClient";
import { useUserContext } from "@/context/userContext";
import ToastMessage from "@/components/common/Toast";
import Link from "next/link";
import { Dropdown, DropdownButton, Form, Modal, Pagination, Tab, Table, Tabs } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { CategoryDropdownItem, DocumentData, FtpAccDropdownItem, SectorDropdownItem } from "@/types/types";
import { fetchCategoryData, fetchFtpAccounts, fetchSectors } from "@/utils/dataFetchFunctions";
import { Button, Checkbox, Progress } from "antd";
import { FaEllipsisV, FaShareAlt } from "react-icons/fa";
import Paragraph from "@/components/common/Paragraph";
import { IoMdCloudDownload } from "react-icons/io";
import { AxiosProgressEvent } from "axios";
import withPermission from "@/components/common/withPermission";


type ErrorsLocal = {
  document?: string;
};


function AllDocTable() {
  const isAuthenticated = useAuth();
  const { userId } = useUserContext();
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [excelFiles, setExcelFiles] = useState<FileList | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedSectorId, setSelectedSectorId] = useState<string>("");
  const [documentData, setDocumentData] = useState<DocumentData[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [categoryDropDownData, setCategoryDropDownData] = useState<
    CategoryDropdownItem[]
  >([]);
  const [sectorDropDownData, setSectorDropDownData] = useState<
    SectorDropdownItem[]
  >([]);
  const [excelData, setExcelData] = useState({
    category: "",
    sector_category: "",
    extension: "",
  });
  const [templateUrl, setTemplateUrl] = useState<string>("");

  const [categoryDropDownDataLocal, setCategoryDropDownDataLocal] = useState<
    CategoryDropdownItem[]
  >([]);
  const [sectorDropDownDataLocal, setSectorDropDownDataLocal] = useState<
    SectorDropdownItem[]
  >([]);
  const [selectedCategoryIdLocal, setSelectedCategoryIdLocal] = useState<string>("");
  const [selectedSectorIdLocal, setSelectedSectorIdLocal] = useState<string>("");
  const [excelDataLocal, setExcelDataLocal] = useState({
    category: "",
    sector_category: "",
    extension: "",
  });
  const [templateUrlLocal, setTemplateUrlLocal] = useState<string>("");
  const [excelFilesLocal, setExcelFilesLocal] = useState<FileList | null>(null);
  const [documentLocal, setDocumentLocal] = useState<FileList | null>(null);
  const [errorsLocal, setErrorsLocal] = useState<{ [key: string]: string }>({});
  const [localFiles, setLocalFiles] = useState<FileList | null>(null);
  // const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [currentUploadingFile, setCurrentUploadingFile] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  // const [uploadProgress, setUploadProgress] = useState([
  //   { percentage: 0, fileName: '' },
  // ]);
  const [uploadProgress, setUploadProgress] = useState([
    { fileName: "example-file1.txt", status: "pending" },
    { fileName: "example-file2.txt", status: "pending" },
  ]);
  const [uploadStarted, setUploadStarted] = useState(false);



  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setExcelFiles(e.target.files);
    }
  };

  const handleCategorySelect = async (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setExcelData((prevData) => ({
      ...prevData,
      category: categoryId,
    }));

    try {
      const response = await getWithAuth(`category-details/${categoryId}`);
      console.log("category res: ", response)
      console.log("template : ", response.template)
      setTemplateUrl(response.template);
    } catch (error) {
      console.error("API call failed", error);
    }
  };
  const handleSectorSelect = (sectorId: string) => {
    setSelectedSectorId(sectorId);
    setExcelData((prevData) => ({
      ...prevData,
      sector_category: sectorId,
    }));
  };

  const handleInputChange = (e: { target: { id: any; value: any; }; }) => {
    const { id, value } = e.target;
    setExcelData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };






  const handleExcelFileChangeLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setExcelFilesLocal(e.target.files);
    }
  };
  const handleDocumentChangeLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setDocumentLocal(files);
      setErrorsLocal((prevErrors) => ({ ...prevErrors, document: "" }));
    } else {
      setDocumentLocal(null);
      setErrorsLocal({ document: "Please select at least one document." });
    }
  };



  const handleCategorySelectLocal = async (categoryId: string) => {
    setSelectedCategoryIdLocal(categoryId);
    setExcelDataLocal((prevData) => ({
      ...prevData,
      category: categoryId,
    }));

    try {
      const response = await getWithAuth(`category-details/${categoryId}`);
      console.log("category res: ", response)
      console.log("template : ", response.template)
      setTemplateUrlLocal(response.template);
    } catch (error) {
      console.error("API call failed", error);
    }
  };

  const handleSectorSelectLocal = (sectorId: string) => {
    setSelectedSectorIdLocal(sectorId);
    setExcelDataLocal((prevData) => ({
      ...prevData,
      sector_category: sectorId,
    }));
  };

  const handleInputChangeLocal = (e: { target: { id: any; value: any; }; }) => {
    const { id, value } = e.target;
    setExcelDataLocal((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setLocalFiles(e.target.files);
      setUploadProgress(new Array(e.target.files.length).fill(0));
    }
  };



  useEffect(() => {
    fetchCategoryData(setCategoryDropDownData);
    fetchSectors(setSectorDropDownData)
    fetchCategoryData(setCategoryDropDownDataLocal);
    fetchSectors(setSectorDropDownDataLocal)
  }, []);

  useEffect(() => {
  }, [categoryDropDownData]);


  // excel file upload
  const validate = () => {
    const validationErrors: any = {};

    if (!excelData.category) {
      validationErrors.category = "Category is required.";
    }
    if (!excelData.sector_category) {
      validationErrors.sector_category = "Sector category is required.";
    }
    if (!excelData.extension) {
      validationErrors.extension = "Extension is required.";
    }

    return validationErrors;
  };
  const handleExcelFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (!excelFiles || excelFiles.length === 0) {
      setErrors({ document: "Please select at least one document." });
      return;
    }

    const formData = new FormData();
    Array.from(excelFiles).forEach((file, index) => {
      formData.append("upload_file", file, file.name);
    });
    formData.append("category", excelData.category);
    formData.append("sector_category", excelData.sector_category);
    formData.append("extension", excelData.extension);
    formData.append("user", userId || "");

    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
    setLoading(true);
    setError("");

    try {
      console.log("bulk start ")
      const response = await postWithAuth("excel-bulk-upload", formData);
      if (response.status === "success") {
        setToastType("success");
        setToastMessage("Documents uploaded successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 2000);
      } else {
        setToastType("error");
        setToastMessage("Failed to upload the documents!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      setError("Failed to upload the documents!");
      setToastType("error");
      setToastMessage("Failed to upload the documents!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  // local file submit
  const validateLocal = () => {
    const validationErrors: any = {};

    if (!excelDataLocal.category) {
      validationErrors.category = "Category is required.";
    }
    if (!excelDataLocal.sector_category) {
      validationErrors.sector_category = "Sector category is required.";
    }
    if (!excelDataLocal.extension) {
      validationErrors.extension = "Extension is required.";
    }

    return validationErrors;
  };


  const handleExcelFileSubmitLocal = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateLocal();
    if (Object.keys(validationErrors).length > 0) {
      setErrorsLocal(validationErrors);
      return;
    }

    if (!excelFilesLocal || excelFilesLocal.length === 0) {
      setErrorsLocal({ document: "Please select at least one document." });
      return;
    }

    if (!documentLocal || documentLocal.length === 0) {
      setErrorsLocal({ document: "Please select at least one document." });
      return;
    }

    setLoading(true);
    setError("");

    const initialProgress = Array.from(documentLocal).map((doc) => ({
      fileName: doc.name,
      status: "pending",
    }));
    setUploadProgress(initialProgress);

    setUploadStarted(true);

    try {
      console.log("bulk start");

      for (let i = 0; i < documentLocal.length; i++) {
        const formData = new FormData();

        Array.from(excelFilesLocal).forEach((file) => {
          formData.append("upload_file", file, file.name);
        });

        formData.append("document", documentLocal[i], documentLocal[i].name);

        formData.append("category", excelDataLocal.category);
        formData.append("sector_category", excelDataLocal.sector_category);
        formData.append("extension", excelDataLocal.extension);
        formData.append("user", userId || "");
        formData.append("copy_files_from_computer", "1");

        for (const [key, value] of formData.entries()) {
          console.log(`${key}: ${value}`);
        }

        setUploadProgress((prevProgress) =>
          prevProgress.map((fileProgress) =>
            fileProgress.fileName === documentLocal[i].name
              ? { ...fileProgress, status: "ongoing" }
              : fileProgress
          )
        );

        const response = await postWithAuth("excel-bulk-upload", formData);

        if (response.status === "success") {
          setUploadProgress((prevProgress) =>
            prevProgress.map((fileProgress) =>
              fileProgress.fileName === documentLocal[i].name
                ? { ...fileProgress, status: "completed" }
                : fileProgress
            )
          );
          setToastType("success");
          setToastMessage("Documents uploaded successfully!");
          setShowToast(true);
          setTimeout(() => {
            setShowToast(false);
          }, 2000);
        } else {
          setUploadProgress((prevProgress) =>
            prevProgress.map((fileProgress) =>
              fileProgress.fileName === documentLocal[i].name
                ? { ...fileProgress, status: "failed" }
                : fileProgress
            )
          );
          setToastType("error");
          setToastMessage("Failed to upload the documents.");
          setShowToast(true);
          setTimeout(() => {
            setShowToast(false);
          }, 5000);
        }
      }
    } catch (error) {
      setError("Failed to upload the documents.");
      setToastType("error");
      setToastMessage("Failed to upload the documents!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  // const handleExcelFileSubmitLocal = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   const validationErrors = validateLocal();
  //   if (Object.keys(validationErrors).length > 0) {
  //     setErrorsLocal(validationErrors);
  //     return;
  //   }

  //   if (!excelFilesLocal || excelFilesLocal.length === 0) {
  //     setErrorsLocal({ document: "Please select at least one document." });
  //     return;
  //   }

  //   if (!documentLocal || documentLocal.length === 0) {
  //     setErrorsLocal({ document: "Please select at least one document." });
  //     return;
  //   }

  //   setLoading(true);
  //   setError("");

  //   try {
  //     console.log("bulk start");

  //     const progressData = Array.from(documentLocal).map((doc) => ({
  //       fileName: doc.name,
  //       percentage: 0,
  //     }));
  //     setUploadProgress(progressData);


  //     for (let i = 0; i < documentLocal.length; i++) {
  //       const formData = new FormData();

  //       Array.from(excelFilesLocal).forEach((file) => {
  //         formData.append("upload_file", file, file.name);
  //       });

  //       formData.append("document", documentLocal[i], documentLocal[i].name);
  //       formData.append("category", excelDataLocal.category);
  //       formData.append("sector_category", excelDataLocal.sector_category);
  //       formData.append("extension", excelDataLocal.extension);
  //       formData.append("user", userId || "");
  //       formData.append("copy_files_from_computer", "1");

  //       for (const [key, value] of formData.entries()) {
  //         console.log(`${key}: ${value}`);
  //       }

  //       const onProgress = (progress: number, fileName: string) => {
  //         setUploadProgress((prevProgress) =>
  //           prevProgress.map((fileProgress) =>
  //             fileProgress.fileName === fileName
  //               ? { ...fileProgress, percentage: progress }
  //               : fileProgress
  //           )
  //         );
  //       };

  //       const onFileUploadSuccess = (fileName: string) => {
  //         setUploadProgress((prevProgress) =>
  //           prevProgress.map((fileProgress) =>
  //             fileProgress.fileName === fileName
  //               ? { ...fileProgress, percentage: 100 }
  //               : fileProgress
  //           )
  //         );
  //       };



  //       const response = await postWithAuthXML("excel-bulk-upload", formData, onProgress);

  //       if (response.status === "success") {
  //         onFileUploadSuccess(formData.get("upload_file")?.toString() || "Unknown");

  //         setToastType("success");
  //         setToastMessage("Document uploaded successfully!");
  //         setShowToast(true);
  //         setTimeout(() => {
  //           setShowToast(false);
  //         }, 2000);
  //       } else {
  //         setToastType("error");
  //         setToastMessage("Failed to upload document.");
  //         setShowToast(true);
  //         setTimeout(() => {
  //           setShowToast(false);
  //         }, 5000);
  //       }
  //     }
  //   } catch (error) {
  //     setError("Failed to submit the form.");
  //     setToastType("error");
  //     setToastMessage("Error submitting the form.");
  //     setShowToast(true);
  //     setTimeout(() => {
  //       setShowToast(false);
  //     }, 5000);
  //   } finally {
  //     setLoading(false);
  //   }
  // };








  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }


  const totalItems = Array.isArray(documentData) ? documentData.length : 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);
  const paginatedData = Array.isArray(documentData) ? documentData.slice(startIndex, endIndex) : [];


  return (
    <>
      <DashboardLayout>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <Heading text="Upload Documents" color="#444" />
        </div>

        <div className="companyProfileTabs mt-4">
          <Tabs
            defaultActiveKey="excel"
            id="uncontrolled-tab-example"
            className="mb-3"
          >
            <Tab eventKey="excel" title="Excel file upload">
              <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
                <div
                  style={{
                    maxHeight: "380px",
                    minHeight: "320px",
                    overflowY: "auto",
                    overflowX: "hidden",
                  }}
                  className="custom-scroll"
                >
                  <div className="d-flex flex-column">
                    <div className="row row-cols-1 row-cols-lg-2 d-flex justify-content-around px-lg-3 mb-lg-3">
                      <div className="col justify-content-center align-items-center p-0 px-3 px-lg-0 mb-2">
                        <div className="d-flex flex-column w-100">
                          <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                            Select excel document
                          </p>
                          <input
                            type="file"
                            style={{ border: "solid 1px #eee" }}
                            id="document"
                            accept=".xlsx"
                            onChange={handleExcelFileChange}
                          />
                        </div>
                        {errors.document && <div style={{ color: "red", fontSize: "12px" }}>{errors.document}</div>}
                      </div>
                      <div className="col d-flex flex-column justify-content-center align-items-center p-0 px-3 px-lg-0 ps-lg-2 mb-2">
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
                                paddingLeft:
                                  category.parent_category === "none"
                                    ? "0px"
                                    : "20px",
                              }}
                            >
                              {category.category_name}
                            </Dropdown.Item>
                          ))}
                        </DropdownButton>
                        {errors.category && <div style={{ color: "red", fontSize: "12px" }}>{errors.category}</div>}
                        <div className="d-flex justify-content-start w-100">
                          {templateUrl && (
                            <a href={templateUrl} download style={{ color: "#333" }} className="d-flex flex-row mt-2 align-items-center ms-0">
                              <div className="d-flex flex-row align-items-center custom-icon-button button-success px-3 py-1 rounded">
                                <IoMdCloudDownload />
                                <p className="ms-3 mb-0">Download Template</p>
                              </div>
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="col d-flex flex-column justify-content-center align-items-center p-0 px-3 px-lg-0 mb-2">
                        <p
                          className="mb-1 text-start w-100"
                          style={{ fontSize: "14px" }}
                        >
                          Sectors
                        </p>
                        <DropdownButton
                          id="dropdown-category-button"
                          title={
                            selectedSectorId
                              ? sectorDropDownData.find(
                                (item) => item.id.toString() === selectedSectorId
                              )?.sector_name
                              : "Select Sector"
                          }
                          className="custom-dropdown-text-start text-start w-100"
                          onSelect={(value) => handleSectorSelect(value || "")}
                        >
                          {sectorDropDownData.map((sector) => (
                            <Dropdown.Item
                              key={sector.id}
                              eventKey={sector.id.toString()}
                              style={{
                                fontWeight:
                                  sector.parent_sector === "none"
                                    ? "bold"
                                    : "normal",
                                paddingLeft:
                                  sector.parent_sector === "none"
                                    ? "10px"
                                    : "20px",
                              }}
                            >
                              {sector.sector_name}
                            </Dropdown.Item>
                          ))}
                        </DropdownButton>
                        {errors.sector_category && <div style={{ color: "red", fontSize: "12px" }}>{errors.sector_category}</div>}
                      </div>
                      <div className="col d-flex flex-column justify-content-center align-items-center p-0 px-3 px-lg-0 ps-lg-2 mb-2">
                        <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                          Extension <span style={{ fontSize: "12px" }}>(Do not use &apos;.&apos; in front)</span>
                        </p>
                        <input
                          type="text"
                          className="form-control"
                          style={{ border: "solid 1px #eee" }}
                          id="extension"
                          value={excelData.extension}
                          onChange={handleInputChange}
                        />
                        {errors.extension && <div style={{ color: "red", fontSize: "12px" }}>{errors.extension}</div>}
                      </div>
                    </div>

                  </div>
                </div>





                <div className="d-flex flex-row mt-5">
                  <button
                    disabled={loading}
                    onClick={handleExcelFileSubmit}
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
                    href="/bulk-upload/add"
                    className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
                  >
                    <MdOutlineCancel fontSize={16} className="me-1" /> Cancel
                  </Link>
                </div>
              </div>
            </Tab>
            <Tab eventKey="local" title="Local computer file upload">
              <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
                <div
                  style={{
                    maxHeight: "380px",
                    minHeight: "320px",
                    overflowY: "auto",
                    overflowX: "hidden",
                  }}
                  className="custom-scroll"
                >
                  <div className="d-flex flex-column">
                    <div className="row row-cols-1 row-cols-lg-2 d-flex justify-content-around px-lg-3 mb-lg-3">
                      <div className="col justify-content-center align-items-center p-0 px-3 px-lg-0 mb-2">
                        <div className="d-flex flex-column w-100">
                          <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                            Select excel document
                          </p>
                          <input
                            type="file"
                            style={{ border: "solid 1px #eee" }}
                            id="document"
                            accept=".xlsx"
                            onChange={handleExcelFileChangeLocal}
                          />
                        </div>
                        {errorsLocal.document && <div style={{ color: "red", fontSize: "12px" }}>{errorsLocal.document}</div>}
                      </div>
                      <div className="col d-flex flex-column justify-content-center align-items-center p-0 px-3 px-lg-0 ps-lg-2 mb-2">
                        <p
                          className="mb-1 text-start w-100"
                          style={{ fontSize: "14px" }}
                        >
                          Category
                        </p>
                        <DropdownButton
                          id="dropdown-category-button"
                          title={
                            selectedCategoryIdLocal
                              ? categoryDropDownDataLocal.find(
                                (item) => item.id.toString() === selectedCategoryIdLocal
                              )?.category_name
                              : "Select Category"
                          }
                          className="custom-dropdown-text-start text-start w-100"
                          onSelect={(value) => handleCategorySelectLocal(value || "")}
                        >
                          {categoryDropDownDataLocal.map((category) => (
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
                        {errorsLocal.category && <div style={{ color: "red", fontSize: "12px" }}>{errorsLocal.category}</div>}
                        <div className="d-flex justify-content-start w-100">
                          {templateUrlLocal && (
                            <a href={templateUrlLocal} download style={{ color: "#333" }} className="d-flex flex-row mt-2 align-items-center ms-0">
                              <div className="d-flex flex-row align-items-center custom-icon-button button-success px-3 py-1 rounded">
                                <IoMdCloudDownload />
                                <p className="ms-3 mb-0">Download Template</p>
                              </div>
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="col d-flex flex-column justify-content-center align-items-center p-0 px-3 px-lg-0 mb-2">
                        <p
                          className="mb-1 text-start w-100"
                          style={{ fontSize: "14px" }}
                        >
                          Sectors
                        </p>
                        <DropdownButton
                          id="dropdown-category-button"
                          title={
                            selectedSectorIdLocal
                              ? sectorDropDownDataLocal.find(
                                (item) => item.id.toString() === selectedSectorIdLocal
                              )?.sector_name
                              : "Select Sector"
                          }
                          className="custom-dropdown-text-start text-start w-100"
                          onSelect={(value) => handleSectorSelectLocal(value || "")}
                        >
                          {sectorDropDownDataLocal.map((sector) => (
                            <Dropdown.Item
                              key={sector.id}
                              eventKey={sector.id.toString()}
                              style={{
                                fontWeight:
                                  sector.parent_sector === "none"
                                    ? "bold"
                                    : "normal",
                              }}
                            >
                              {sector.sector_name}
                            </Dropdown.Item>
                          ))}
                        </DropdownButton>
                        {errorsLocal.sector_category && <div style={{ color: "red", fontSize: "12px" }}>{errorsLocal.sector_category}</div>}
                      </div>
                      <div className="col d-flex flex-column justify-content-center align-items-center p-0 px-3 px-lg-0 ps-lg-2 mb-2">
                        <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                          Extension <span style={{ fontSize: "12px" }}>(Do not use &apos;.&apos; in front)</span>
                        </p>
                        <input
                          type="text"
                          className="form-control"
                          style={{ border: "solid 1px #eee" }}
                          id="extension"
                          value={excelDataLocal.extension}
                          onChange={handleInputChangeLocal}
                        />
                        {errorsLocal.extension && <div style={{ color: "red", fontSize: "12px" }}>{errorsLocal.extension}</div>}
                      </div>
                    </div>
                    {/* <div className="col-12 col-lg-6 d-flex flex-column justify-content-center align-items-center p-0 px-3 px-lg-0 ps-lg-2 mb-2">
                      <div className="d-flex flex-column w-100">
                        <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                          Select local documents
                        </p>
                        <input
                          type="file"
                          style={{ border: "solid 1px #eee" }}
                          id="document"
                          multiple
                          onChange={handleDocumentChangeLocal}
                        />
                        {errorsLocal.document && (
                          <div style={{ color: "red", fontSize: "12px" }}>{errorsLocal.document}</div>
                        )}
                        {uploadProgress.map((fileProgress, index) => (
                          <div key={index} style={{ width: '100%', marginTop: '10px' }}>
                            <p>{fileProgress.fileName}</p>
                            <Progress percent={fileProgress.percentage} />
                          </div>
                        ))}
                      </div>
                    </div> */}
                    <div className="col-12 col-lg-6 d-flex flex-column justify-content-center align-items-center p-0 px-3 px-lg-0 ps-lg-2 mb-2">
                      <div className="d-flex flex-column w-100">
                        <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                          Select local documents
                        </p>
                        <input
                          type="file"
                          style={{ border: "solid 1px #eee" }}
                          id="document"
                          multiple
                          onChange={handleDocumentChangeLocal}
                        />
                        {errorsLocal.document && (
                          <div style={{ color: "red", fontSize: "12px" }}>{errorsLocal.document}</div>
                        )}

                        <div className="d-flex flex-column mt-3">
                          {uploadStarted && (
                            <div className="d-flex flex-column mt-3">
                              {uploadProgress.map((fileProgress, index) => (
                                <div key={index} className="d-flex flex-row mb-3" style={{ width: '100%' }}>
                                  <p className="mb-0" style={{ fontSize: "14px" }}>{fileProgress.fileName}</p>
                                  <p
                                    className="ms-5 mb-0"
                                    style={{
                                      fontSize: "14px",
                                      fontWeight: 600,
                                      color:
                                        fileProgress.status === "pending" ? "black" :
                                          fileProgress.status === "ongoing" ? "#683ab7" :
                                            fileProgress.status === "completed" ? "green" :
                                              fileProgress.status === "failed" ? "red" : "black"
                                    }}
                                  >
                                    {fileProgress.status === "pending" && "Pending"}
                                    {fileProgress.status === "ongoing" && "Uploading..."}
                                    {fileProgress.status === "completed" && "Completed"}
                                    {fileProgress.status === "failed" && "Failed"}
                                  </p>
                                </div>
                              ))}
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
                    onClick={handleExcelFileSubmitLocal}
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
                    href="/bulk-upload/add"
                    className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.reload();
                    }}
                  >
                    <MdOutlineCancel fontSize={16} className="me-1" /> Cancel
                  </Link>

                </div>
              </div>
            </Tab>
          </Tabs>
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

export default withPermission(AllDocTable, { group: "Bulk Upload", action: "Create Bulk Upload" });


