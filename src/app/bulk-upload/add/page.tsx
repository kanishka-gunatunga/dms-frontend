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
import { deleteWithAuth, postWithAuth } from "@/utils/apiClient";
import { useUserContext } from "@/context/userContext";
import ToastMessage from "@/components/common/Toast";
import Link from "next/link";
import { Dropdown, DropdownButton, Form, Modal, Pagination, Tab, Table, Tabs } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { CategoryDropdownItem, DocumentData, FtpAccDropdownItem, SectorDropdownItem } from "@/types/types";
import { fetchCategoryData, fetchFtpAccounts, fetchSectors } from "@/utils/dataFetchFunctions";
import { Button, Checkbox } from "antd";
import { FaEllipsisV, FaShareAlt } from "react-icons/fa";
import Paragraph from "@/components/common/Paragraph";



export default function AllDocTable() {
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
  const [selectedFtpId, setSelectedFtpId] = useState<string>("");
  const [documentData, setDocumentData] = useState<DocumentData[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [categoryDropDownData, setCategoryDropDownData] = useState<
    CategoryDropdownItem[]
  >([]);
  const [sectorDropDownData, setSectorDropDownData] = useState<
    SectorDropdownItem[]
  >([]);
  const [ftpAccountData, setFtpAccountData] = useState<
    FtpAccDropdownItem[]
  >([]);
  const [excelData, setExcelData] = useState({
    category: "",
    sector_category: "",
    file_path: "",
    ftp_account: "",
    extension: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setExcelFiles(e.target.files);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setExcelData((prevData) => ({
      ...prevData,
      category: categoryId,
    }));
  };

  const handleSectorSelect = (sectorId: string) => {
    setSelectedSectorId(sectorId);
    setExcelData((prevData) => ({
      ...prevData,
      sector_category: sectorId,
    }));
  };

  const handleFtpAccSelect = (ftpId: string) => {
    setSelectedFtpId(ftpId);
    setExcelData((prevData) => ({
      ...prevData,
      ftp_account: ftpId,
    }));
  };

  const handleInputChange = (e: { target: { id: any; value: any; }; }) => {
    const { id, value } = e.target;
    setExcelData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };


  useEffect(() => {
    fetchCategoryData(setCategoryDropDownData);
    fetchSectors(setSectorDropDownData)
    fetchFtpAccounts(setFtpAccountData)
  }, []);
  useEffect(() => {
  }, [categoryDropDownData]);



  // geleral document upload
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!files || files.length === 0) {
      setErrors({ document: "Please select at least one document." });
      return;
    }

    const formData = new FormData();
    Array.from(files).forEach((file, index) => {
      formData.append("documents[]", file, file.name);
    });

    setLoading(true);
    setError("");

    try {
      const response = await postWithAuth("bulk-upload", formData);
      if (response.status === "success") {
        setToastType("success");
        setToastMessage("Documents uploaded successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 2000);
        router.push("/bulk-upload");
      } else {
        setToastType("error");
        setToastMessage("Failed to upload documents.");
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

  // excel file upload
  const validate = () => {
    const validationErrors: any = {};

    if (!excelData.category) {
      validationErrors.category = "Category is required.";
    }
    if (!excelData.sector_category) {
      validationErrors.sector_category = "Sector category is required.";
    }
    if (!excelData.file_path) {
      validationErrors.file_path = "File path is required.";
    }
    if (!excelData.ftp_account) {
      validationErrors.ftp_account = "FTP Account is required.";
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
    formData.append("file_path", excelData.file_path);
    formData.append("ftp_account", excelData.ftp_account);
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
        console.log("bulk : ",response)
        // setColumnData(response)
        // setColumns(response.columns)
        // try {
        //   const parsedAttributes = JSON.parse(response.attributes);
        //   setAttributes(parsedAttributes);
        // } catch (error) {
        //   console.error("Error parsing attributes:", error);
        // }
        // setAttributes(response.attributes)
        // handleOpenModal("stepOneModel")
        setToastType("success");
        setToastMessage("Documents uploaded successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 2000);
      } else {
        setToastType("error");
        setToastMessage("Failed to upload documents.");
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
            defaultActiveKey="general"
            id="uncontrolled-tab-example"
            className="mb-3"
          >
            <Tab eventKey="general" title="General file upload">
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
                    <div className="row row-cols-1 row-cols-lg-1 d-flex justify-content-around px-lg-3 mb-lg-3">
                      <div className="col justify-content-center align-items-center p-0 px-3 px-lg-0">
                        <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                          Select Documents
                        </p>
                        <input
                          type="file"
                          id="document"
                          accept=".pdf,.doc,.docx,.png,.jpg"
                          multiple
                          onChange={handleFileChange}
                          required
                        />
                        {errors.document && (
                          <span className="text-danger">{errors.document}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {error && <p className="text-danger">{error}</p>}
                <div className="d-flex flex-row mt-5 ">
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
                    href="/bulk-upload"
                    className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
                  >
                    <MdOutlineCancel fontSize={16} className="me-1" /> Cancel
                  </Link>
                </div>
              </div>
            </Tab>
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
                        {errors.category && <div style={{ color: "red", fontSize: "12px" }}>{errors.category}</div>}
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
                          File path  (Do not use &apos;/&apos; in the begining of path)
                        </p>
                        <input
                          type="text"
                          className="form-control"
                          style={{ border: "solid 1px #eee" }}
                          id="file_path"
                          value={excelData.file_path}
                          onChange={handleInputChange}
                        />
                        {errors.file_path && <div style={{ color: "red", fontSize: "12px" }}>{errors.file_path}</div>}
                      </div>
                      <div className="col d-flex flex-column justify-content-center align-items-center p-0 px-3 px-lg-0 mb-2">
                        <p
                          className="mb-1 text-start w-100"
                          style={{ fontSize: "14px" }}
                        >
                          FTP Account
                        </p>
                        <DropdownButton
                          id="dropdown-category-button"
                          title={
                            selectedFtpId
                              ? ftpAccountData.find(
                                (item) => item.id.toString() === selectedFtpId
                              )?.name
                              : "Select FTP Acount"
                          }
                          className="custom-dropdown-text-start text-start w-100"
                          onSelect={(value) => handleFtpAccSelect(value || "")}
                        >
                          {ftpAccountData.map((ftp) => (
                            <Dropdown.Item
                              key={ftp.id}
                              eventKey={ftp.id.toString()}
                            >
                              {ftp.name}
                            </Dropdown.Item>
                          ))}
                        </DropdownButton>
                        {errors.ftp_account && <div style={{ color: "red", fontSize: "12px" }}>{errors.ftp_account}</div>}
                      </div>
                      <div className="col d-flex flex-column justify-content-center align-items-center p-0 px-3 px-lg-0 ps-lg-2 mb-2">
                        <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                          Extension (Do not use &apos;.&apos; infront)
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
                    href="/bulk-upload"
                    className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
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





































// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// "use client";

// import Heading from "@/components/common/Heading";
// import DashboardLayout from "@/components/DashboardLayout";
// import useAuth from "@/hooks/useAuth";
// import React, { useEffect, useState } from "react";
// import LoadingSpinner from "@/components/common/LoadingSpinner";
// import { IoCheckmark, IoClose, IoSaveOutline } from "react-icons/io5";
// import { MdModeEditOutline, MdOutlineCancel, MdUpload } from "react-icons/md";
// import { deleteWithAuth, postWithAuth } from "@/utils/apiClient";
// import { useUserContext } from "@/context/userContext";
// import ToastMessage from "@/components/common/Toast";
// import Link from "next/link";
// import { Dropdown, DropdownButton, Form, Modal, Pagination, Tab, Table, Tabs } from "react-bootstrap";
// import { useRouter } from "next/navigation";
// import { CategoryDropdownItem, DocumentData, FtpAccDropdownItem, SectorDropdownItem } from "@/types/types";
// import { fetchCategoryData, fetchFtpAccounts, fetchSectors } from "@/utils/dataFetchFunctions";
// import { Button, Checkbox } from "antd";
// import { FaEllipsisV, FaShareAlt } from "react-icons/fa";
// import Paragraph from "@/components/common/Paragraph";



// export default function AllDocTable() {
//   const isAuthenticated = useAuth();
//   const { userId } = useUserContext();
//   const router = useRouter();
//   const [selectedItems, setSelectedItems] = useState<number[]>([]);
//   const [error, setError] = useState<string>("");
//   const [loading, setLoading] = useState<boolean>(false);
//   const [errors, setErrors] = useState<{ [key: string]: string }>({});
//   const [showToast, setShowToast] = useState(false);
//   const [toastType, setToastType] = useState<"success" | "error">("success");
//   const [toastMessage, setToastMessage] = useState("");
//   const [files, setFiles] = useState<FileList | null>(null);
//   const [excelFiles, setExcelFiles] = useState<FileList | null>(null);
//   const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
//   const [selectedSectorId, setSelectedSectorId] = useState<string>("");
//   const [selectedFtpId, setSelectedFtpId] = useState<string>("");
//   const [selectedColumnForName, setSelectedColumnForName] = useState("");
//   const [selectedColumnForDescription, setSelectedColumnForDescription] = useState("");
//   const [selectedColumnForMetaTags, setSelectedColumnForMetaTags] = useState("");
//   const [columns, setColumns] = useState<string[]>([])
//   const [attributes, setAttributes] = useState<string[]>([]);
//   const [selectedColumns, setSelectedColumns] = useState<{ [key: string]: string }>({});
//   const [documentData, setDocumentData] = useState<DocumentData[]>([]);
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [itemsPerPage, setItemsPerPage] = useState<number>(10);
//   const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(
//     null
//   );
//   const [categoryDropDownData, setCategoryDropDownData] = useState<
//     CategoryDropdownItem[]
//   >([]);
//   const [sectorDropDownData, setSectorDropDownData] = useState<
//     SectorDropdownItem[]
//   >([]);
//   const [ftpAccountData, setFtpAccountData] = useState<
//     FtpAccDropdownItem[]
//   >([]);
//   const [excelData, setExcelData] = useState({
//     category: "",
//     sector_category: "",
//     file_path: "",
//     ftp_account: "",
//     extension: "",
//     row_from: "",
//     row_to: "",
//   });
//   const [columnData, setColumnData] = useState({
//     excel_id: "",
//     attributes: "",
//     columns: "",
//   });
//   const [modalStates, setModalStates] = useState({
//     stepOneModel: false,
//     stepTwoModel: false,
//     deleteRecordModel: false,
//     deleteFileModel: false
//   });

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       setFiles(e.target.files);
//     }
//   };

//   const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       setExcelFiles(e.target.files);
//     }
//   };

//   const handleCategorySelect = (categoryId: string) => {
//     setSelectedCategoryId(categoryId);
//     setExcelData((prevData) => ({
//       ...prevData,
//       category: categoryId,
//     }));
//   };

//   const handleSectorSelect = (sectorId: string) => {
//     setSelectedSectorId(sectorId);
//     setExcelData((prevData) => ({
//       ...prevData,
//       sector_category: sectorId,
//     }));
//   };

//   const handleFtpAccSelect = (ftpId: string) => {
//     setSelectedFtpId(ftpId);
//     setExcelData((prevData) => ({
//       ...prevData,
//       ftp_account: ftpId,
//     }));
//   };

//   const handleInputChange = (e: { target: { id: any; value: any; }; }) => {
//     const { id, value } = e.target;
//     setExcelData((prevData) => ({
//       ...prevData,
//       [id]: value,
//     }));
//   };

//   const handleColumnSelect = (column: string | null, category: string) => {
//     if (column) {
//       switch (category) {
//         case "name":
//           setSelectedColumnForName(column);
//           break;
//         case "description":
//           setSelectedColumnForDescription(column);
//           break;
//         case "metaTags":
//           setSelectedColumnForMetaTags(column);
//           break;
//         default:
//           break;
//       }
//     }
//   };

//   const handleAttributeColumnSelect = (column: string | null, attribute: string) => {
//     if (column) {
//       setSelectedColumns((prevSelected) => ({
//         ...prevSelected,
//         [attribute]: column,
//       }));
//     }
//   };

//   const getSelectedData = () => {
//     const data: { column: string; attribute: string; }[] = [];
//     attributes.forEach((attribute) => {
//       if (selectedColumns[attribute]) {
//         data.push({
//           column: selectedColumns[attribute],
//           attribute: attribute,
//         });
//       }
//     });
//     return data;
//   };

//   const handleOpenModal = (
//     modalName: keyof typeof modalStates,
//     documentId?: number,
//     documentName?: string
//   ) => {
//     if (documentId) setSelectedDocumentId(documentId);
//     // if (documentName) setSelectedDocumentName(documentName);

//     setModalStates((prev) => ({ ...prev, [modalName]: true }));
//   };

//   const handleCloseModal = (modalName: keyof typeof modalStates) => {
//     setModalStates((prev) => ({ ...prev, [modalName]: false }));
//   };



//   useEffect(() => {
//     fetchCategoryData(setCategoryDropDownData);
//     fetchSectors(setSectorDropDownData)
//     fetchFtpAccounts(setFtpAccountData)
//   }, []);
//   useEffect(() => {
//   }, [categoryDropDownData]);



//   // geleral document upload
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!files || files.length === 0) {
//       setErrors({ document: "Please select at least one document." });
//       return;
//     }

//     const formData = new FormData();
//     Array.from(files).forEach((file, index) => {
//       formData.append("documents[]", file, file.name);
//     });

//     setLoading(true);
//     setError("");

//     try {
//       const response = await postWithAuth("bulk-upload", formData);
//       if (response.status === "success") {
//         setToastType("success");
//         setToastMessage("Documents uploaded successfully!");
//         setShowToast(true);
//         setTimeout(() => {
//           setShowToast(false);
//         }, 2000);
//         router.push("/bulk-upload");
//       } else {
//         setToastType("error");
//         setToastMessage("Failed to upload documents.");
//         setShowToast(true);
//         setTimeout(() => {
//           setShowToast(false);
//         }, 5000);
//       }
//     } catch (error) {
//       setError("Failed to submit the form.");
//       setToastType("error");
//       setToastMessage("Error submitting the form.");
//       setShowToast(true);
//       setTimeout(() => {
//         setShowToast(false);
//       }, 5000);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // excel file upload
//   const validate = () => {
//     const validationErrors: any = {};

//     if (!excelData.category) {
//       validationErrors.category = "Category is required.";
//     }
//     if (!excelData.sector_category) {
//       validationErrors.sector_category = "Sector category is required.";
//     }
//     if (!excelData.file_path) {
//       validationErrors.file_path = "File path is required.";
//     }
//     if (!excelData.ftp_account) {
//       validationErrors.ftp_account = "FTP Account is required.";
//     }
//     if (!excelData.extension) {
//       validationErrors.extension = "Extention is required.";
//     }
//     if (!excelData.row_from) {
//       validationErrors.row_from = "Row from is required.";
//     }
//     if (!excelData.row_to) {
//       validationErrors.row_to = "Row to is required.";
//     }

//     return validationErrors;
//   };
//   const handleExcelFileSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const validationErrors = validate();
//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       return;
//     }
//     if (!excelFiles || excelFiles.length === 0) {
//       setErrors({ document: "Please select at least one document." });
//       return;
//     }

//     const formData = new FormData();
//     Array.from(excelFiles).forEach((file, index) => {
//       formData.append("upload_file", file, file.name);
//     });
//     formData.append("category", excelData.category);
//     formData.append("sector_category", excelData.sector_category);
//     formData.append("file_path", excelData.file_path);
//     formData.append("ftp_account", excelData.ftp_account);
//     formData.append("extension", excelData.extension);
//     formData.append("row_from", excelData.row_from);
//     formData.append("row_to", excelData.row_to);

//     // for (const [key, value] of formData.entries()) {
//     //   console.log(`${key}: ${value}`);
//     // }
//     setLoading(true);
//     setError("");

//     try {
//       const response = await postWithAuth("excel-bulk-upload", formData);
//       if (response.status === "success") {
//         console.log(response)
//         setColumnData(response)
//         setColumns(response.columns)
//         try {
//           const parsedAttributes = JSON.parse(response.attributes);
//           setAttributes(parsedAttributes);
//         } catch (error) {
//           console.error("Error parsing attributes:", error);
//         }
//         // setAttributes(response.attributes)
//         handleOpenModal("stepOneModel")
//         setToastType("success");
//         setToastMessage("Documents uploaded successfully!");
//         setShowToast(true);
//         setTimeout(() => {
//           setShowToast(false);
//         }, 2000);
//       } else {
//         setToastType("error");
//         setToastMessage("Failed to upload documents.");
//         setShowToast(true);
//         setTimeout(() => {
//           setShowToast(false);
//         }, 5000);
//       }
//     } catch (error) {
//       setError("Failed to submit the form.");
//       setToastType("error");
//       setToastMessage("Error submitting the form.");
//       setShowToast(true);
//       setTimeout(() => {
//         setShowToast(false);
//       }, 5000);
//     } finally {
//       setLoading(false);
//     }
//   };



//   const validateConfirm = () => {
//     const validationErrorsConfirm: any = {};

//     if (!selectedColumnForName) {
//       validationErrorsConfirm.column_for_name = "Category is required.";
//     }
//     if (!selectedColumnForDescription) {
//       validationErrorsConfirm.column_for_description = "Sector category is required.";
//     }
//     if (!selectedColumnForMetaTags) {
//       validationErrorsConfirm.column_for_meta_tags = "File path is required.";
//     }

//     return validationErrorsConfirm;
//   };
//   const handleExcelFileConfirmSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const validationErrorsConfirm = validateConfirm();
//     if (Object.keys(validationErrorsConfirm).length > 0) {
//       setErrors(validationErrorsConfirm);
//       return;
//     }
//     if (!excelFiles || excelFiles.length === 0) {
//       setErrors({ document: "Please select at least one document." });
//       return;
//     }

//     const formData = new FormData();
//     formData.append("column_for_name", selectedColumnForName);
//     formData.append("column_for_description", selectedColumnForDescription);
//     formData.append("column_for_meta_tags", selectedColumnForMetaTags);
//     formData.append("column_for_attributes", JSON.stringify(getSelectedData(), null, 2));
//     formData.append("excel_id", columnData.excel_id);

//     for (const [key, value] of formData.entries()) {
//       console.log(`${key}: ${value}`);
//     }
//     setLoading(true);
//     setError("");

//     try {
//       const response = await postWithAuth("excel-bulk-upload-confirm", formData);
//       if (response.status === "success") {
//         console.log(response)
//         handleCloseModal("stepOneModel")
//         setDocumentData(response.documents)
//         handleOpenModal("stepTwoModel")
//         setToastType("success");
//         setToastMessage("Successfully submitted!");
//         setShowToast(true);
//         setTimeout(() => {
//           setShowToast(false);
//         }, 2000);
//       } else {
//         setToastType("error");
//         handleCloseModal("stepOneModel")
//         setToastMessage("Failed to submit.");
//         setShowToast(true);
//         setTimeout(() => {
//           setShowToast(false);
//         }, 5000);
//       }
//     } catch (error) {
//     } finally {
//       setLoading(false);
//     }
//   };


//   const handleSaveBulkSubmit = async () => {

//     const formData = new FormData();
//     formData.append("user", userId || "");
//     formData.append("excel_id", columnData.excel_id);

//     // for (const [key, value] of formData.entries()) {
//     //   console.log(`${key}: ${value}`);
//     // }
//     setLoading(true);
//     setError("");

//     try {
//       const response = await postWithAuth("save-bulk-document-excel-bulk", formData);
//       if (response.status === "success") {
//         console.log(response)
//         handleCloseModal("stepTwoModel")
//         setToastType("success");
//         setToastMessage("Successfully submitted!");
//         setShowToast(true);
//         setTimeout(() => {
//           setShowToast(false);
//         }, 2000);
//       } else {
//         setToastType("error");
//         handleCloseModal("stepTwoModel")
//         setToastMessage("Failed to submit.");
//         setShowToast(true);
//         setTimeout(() => {
//           setShowToast(false);
//         }, 5000);
//       }
//     } catch (error) {
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isAuthenticated) {
//     return <LoadingSpinner />;
//   }


//   const totalItems = Array.isArray(documentData) ? documentData.length : 0;
//   const totalPages = Math.ceil(totalItems / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const endIndex = Math.min(currentPage * itemsPerPage, totalItems);
//   const paginatedData = Array.isArray(documentData) ? documentData.slice(startIndex, endIndex) : [];

//   const handleSelectAll = (checked: boolean) => {
//     if (checked) {
//       const allIds = paginatedData.map((item) => item.id);
//       setSelectedItems(allIds);
//     } else {
//       setSelectedItems([]);
//     }
//   };

//   const handleCheckboxChange = (id: number, name: string) => {
//     setSelectedItems((prev) =>
//       prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
//     );
//   };

//   const handlePrev = () => {
//     if (currentPage > 1) setCurrentPage(currentPage - 1);
//   };

//   const handleNext = () => {
//     if (currentPage < totalPages) setCurrentPage(currentPage + 1);
//   };

//   const handleItemsPerPageChange = (
//     e: React.ChangeEvent<HTMLSelectElement>
//   ) => {
//     setItemsPerPage(Number(e.target.value));
//     setCurrentPage(1);
//   };

//   const handleDeleteBulk = async (id: number) => {
//     try {
//       const response = await deleteWithAuth(`bulk-upload-excel-delete-record/${id}`);
//       if (response.status === "success") {
//         setToastType("success");
//         setToastMessage("Record deleted successfully!");
//         setShowToast(true);
//         setTimeout(() => {
//           setShowToast(false);
//         }, 5000);
//       } else {
//         setToastType("error");
//         setToastMessage("Error occurred while deleting record!");
//         setShowToast(true);
//         setTimeout(() => {
//           setShowToast(false);
//         }, 5000);
//       }
//     } catch (error) {
//       console.error("Error deleting shareable link:", error);
//     };
//   }


//   const handleDeleteBulkDocument = async () => {
//     try {
//       const response = await deleteWithAuth(`bulk-upload-excel-delete-file/${columnData.excel_id}`);
//       if (response.status === "success") {
//         setToastType("success");
//         setToastMessage("Bulk deleted successfully!");
//         setShowToast(true);
//         setTimeout(() => {
//           setShowToast(false);
//         }, 5000);
//         handleCloseModal("stepOneModel");
//       } else {
//         setToastType("error");
//         setToastMessage("Error occurred while deleting bulk!");
//         setShowToast(true);
//         setTimeout(() => {
//           setShowToast(false);
//         }, 5000);
//       }
//     } catch (error) {
//       console.error("Error deleting shareable link:", error);
//     };
//   }

//   return (
//     <>
//       <DashboardLayout>
//         <div className="d-flex justify-content-between align-items-center pt-2">
//           <Heading text="Upload Documents" color="#444" />
//         </div>

//         <div className="companyProfileTabs mt-4">
//           <Tabs
//             defaultActiveKey="general"
//             id="uncontrolled-tab-example"
//             className="mb-3"
//           >
//             <Tab eventKey="general" title="General file upload">
//               <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
//                 <div
//                   style={{
//                     maxHeight: "380px",
//                     overflowY: "auto",
//                     overflowX: "hidden",
//                   }}
//                   className="custom-scroll"
//                 >
//                   <div className="d-flex flex-column">
//                     <div className="row row-cols-1 row-cols-lg-1 d-flex justify-content-around px-lg-3 mb-lg-3">
//                       <div className="col justify-content-center align-items-center p-0 px-3 px-lg-0">
//                         <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
//                           Select Documents
//                         </p>
//                         <input
//                           type="file"
//                           id="document"
//                           accept=".pdf,.doc,.docx,.png,.jpg"
//                           multiple
//                           onChange={handleFileChange}
//                           required
//                         />
//                         {errors.document && (
//                           <span className="text-danger">{errors.document}</span>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//                 {error && <p className="text-danger">{error}</p>}
//                 <div className="d-flex flex-row mt-5 ">
//                   <button
//                     disabled={loading}
//                     onClick={handleSubmit}
//                     className="custom-icon-button button-success px-3 py-1 rounded me-2"
//                   >
//                     {loading ? (
//                       "Submitting..."
//                     ) : (
//                       <>
//                         <IoSaveOutline fontSize={16} className="me-1" /> Save
//                       </>
//                     )}
//                   </button>
//                   <Link
//                     href="/bulk-upload"
//                     className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
//                   >
//                     <MdOutlineCancel fontSize={16} className="me-1" /> Cancel
//                   </Link>
//                 </div>
//               </div>
//             </Tab>
//             <Tab eventKey="excel" title="Excel file upload">
//               <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
//                 <div
//                   style={{
//                     maxHeight: "380px",
//                     minHeight: "320px",
//                     overflowY: "auto",
//                     overflowX: "hidden",
//                   }}
//                   className="custom-scroll"
//                 >
//                   <div className="d-flex flex-column">
//                     <div className="row row-cols-1 row-cols-lg-2 d-flex justify-content-around px-lg-3 mb-lg-3">
//                       <div className="col justify-content-center align-items-center p-0 px-3 px-lg-0 mb-2">
//                         <div className="d-flex flex-column w-100">
//                           <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
//                             Select excel document
//                           </p>
//                           <input
//                             type="file"
//                             style={{ border: "solid 1px #eee" }}
//                             id="document"
//                             accept=".xlsx"
//                             onChange={handleExcelFileChange}
//                           />
//                         </div>
//                         {errors.document && <div style={{ color: "red", fontSize: "12px" }}>{errors.document}</div>}
//                       </div>
//                       <div className="col d-flex flex-column justify-content-center align-items-center p-0 px-3 px-lg-0 ps-lg-2 mb-2">
//                         <p
//                           className="mb-1 text-start w-100"
//                           style={{ fontSize: "14px" }}
//                         >
//                           Category
//                         </p>
//                         <DropdownButton
//                           id="dropdown-category-button"
//                           title={
//                             selectedCategoryId
//                               ? categoryDropDownData.find(
//                                 (item) => item.id.toString() === selectedCategoryId
//                               )?.category_name
//                               : "Select Category"
//                           }
//                           className="custom-dropdown-text-start text-start w-100"
//                           onSelect={(value) => handleCategorySelect(value || "")}
//                         >
//                           {categoryDropDownData.map((category) => (
//                             <Dropdown.Item
//                               key={category.id}
//                               eventKey={category.id.toString()}
//                               style={{
//                                 fontWeight:
//                                   category.parent_category === "none"
//                                     ? "bold"
//                                     : "normal",
//                                 marginLeft:
//                                   category.parent_category === "none"
//                                     ? "0px"
//                                     : "20px",
//                               }}
//                             >
//                               {category.category_name}
//                             </Dropdown.Item>
//                           ))}
//                         </DropdownButton>
//                         {errors.category && <div style={{ color: "red", fontSize: "12px" }}>{errors.category}</div>}
//                       </div>
//                       <div className="col d-flex flex-column justify-content-center align-items-center p-0 px-3 px-lg-0 mb-2">
//                         <p
//                           className="mb-1 text-start w-100"
//                           style={{ fontSize: "14px" }}
//                         >
//                           Sectors
//                         </p>
//                         <DropdownButton
//                           id="dropdown-category-button"
//                           title={
//                             selectedSectorId
//                               ? sectorDropDownData.find(
//                                 (item) => item.id.toString() === selectedSectorId
//                               )?.sector_name
//                               : "Select Sector"
//                           }
//                           className="custom-dropdown-text-start text-start w-100"
//                           onSelect={(value) => handleSectorSelect(value || "")}
//                         >
//                           {sectorDropDownData.map((sector) => (
//                             <Dropdown.Item
//                               key={sector.id}
//                               eventKey={sector.id.toString()}
//                               style={{
//                                 fontWeight:
//                                   sector.parent_sector === "none"
//                                     ? "bold"
//                                     : "normal",
//                               }}
//                             >
//                               {sector.sector_name}
//                             </Dropdown.Item>
//                           ))}
//                         </DropdownButton>
//                         {errors.sector_category && <div style={{ color: "red", fontSize: "12px" }}>{errors.sector_category}</div>}
//                       </div>
//                       <div className="col d-flex flex-column justify-content-center align-items-center p-0 px-3 px-lg-0 ps-lg-2 mb-2">
//                         <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
//                           File path  (Do not use &apos;/&apos; in the begining of path)
//                         </p>
//                         <input
//                           type="text"
//                           className="form-control"
//                           style={{ border: "solid 1px #eee" }}
//                           id="file_path"
//                           value={excelData.file_path}
//                           onChange={handleInputChange}
//                         />
//                         {errors.file_path && <div style={{ color: "red", fontSize: "12px" }}>{errors.file_path}</div>}
//                       </div>
//                       <div className="col d-flex flex-column justify-content-center align-items-center p-0 px-3 px-lg-0 mb-2">
//                         <p
//                           className="mb-1 text-start w-100"
//                           style={{ fontSize: "14px" }}
//                         >
//                           FTP Account
//                         </p>
//                         <DropdownButton
//                           id="dropdown-category-button"
//                           title={
//                             selectedFtpId
//                               ? ftpAccountData.find(
//                                 (item) => item.id.toString() === selectedFtpId
//                               )?.name
//                               : "Select FTP Acount"
//                           }
//                           className="custom-dropdown-text-start text-start w-100"
//                           onSelect={(value) => handleFtpAccSelect(value || "")}
//                         >
//                           {ftpAccountData.map((ftp) => (
//                             <Dropdown.Item
//                               key={ftp.id}
//                               eventKey={ftp.id.toString()}
//                             >
//                               {ftp.name}
//                             </Dropdown.Item>
//                           ))}
//                         </DropdownButton>
//                         {errors.ftp_account && <div style={{ color: "red", fontSize: "12px" }}>{errors.ftp_account}</div>}
//                       </div>
//                       <div className="col d-flex flex-column justify-content-center align-items-center p-0 px-3 px-lg-0 ps-lg-2 mb-2">
//                         <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
//                           Extension (Do not use &apos;.&apos; infront)
//                         </p>
//                         <input
//                           type="text"
//                           className="form-control"
//                           style={{ border: "solid 1px #eee" }}
//                           id="extension"
//                           value={excelData.extension}
//                           onChange={handleInputChange}
//                         />
//                         {errors.extension && <div style={{ color: "red", fontSize: "12px" }}>{errors.extension}</div>}
//                       </div>
//                       <div className="col d-flex flex-column justify-content-center align-items-center p-0 px-3 px-lg-0 mb-2">
//                         <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
//                           Row from
//                         </p>
//                         <input
//                           type="number"
//                           className="form-control"
//                           style={{ border: "solid 1px #eee" }}
//                           id="row_from"
//                           value={excelData.row_from}
//                           onChange={handleInputChange}
//                         />
//                         {errors.row_from && <div style={{ color: "red", fontSize: "12px" }}>{errors.row_from}</div>}
//                       </div>
//                       <div className="col d-flex flex-column justify-content-center align-items-center p-0 px-3 px-lg-0 ps-lg-2 mb-2">
//                         <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
//                           Row to
//                         </p>
//                         <input
//                           type="number"
//                           className="form-control"
//                           style={{ border: "solid 1px #eee" }}
//                           id="row_to"
//                           value={excelData.row_to}
//                           onChange={handleInputChange}
//                         />
//                         {errors.row_to && <div style={{ color: "red", fontSize: "12px" }}>{errors.row_to}</div>}
//                       </div>
//                     </div>
//                   </div>
//                 </div>





//                 <div className="d-flex flex-row mt-5">
//                   <button
//                     disabled={loading}
//                     onClick={handleExcelFileSubmit}
//                     className="custom-icon-button button-success px-3 py-1 rounded me-2"
//                   >
//                     {loading ? (
//                       "Submitting..."
//                     ) : (
//                       <>
//                         <IoSaveOutline fontSize={16} className="me-1" /> Save
//                       </>
//                     )}
//                   </button>
//                   <Link
//                     href="/bulk-upload"
//                     className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
//                   >
//                     <MdOutlineCancel fontSize={16} className="me-1" /> Cancel
//                   </Link>
//                 </div>
//               </div>
//             </Tab>
//           </Tabs>
//         </div>


//         <ToastMessage
//           message={toastMessage}
//           show={showToast}
//           onClose={() => setShowToast(false)}
//           type={toastType}
//         />
//       </DashboardLayout>

//       {/* Model One */}
//       <Modal
//         centered
//         show={modalStates.stepOneModel}
//         className="large-model"
//         onHide={() => {
//           handleCloseModal("stepOneModel");
//         }}
//       >
//         <Modal.Header>
//           <div className="d-flex w-100 justify-content-end">
//             <div className="col-11 d-flex flex-row">
//               <p className="mb-0" style={{ fontSize: "16px", color: "#333" }}>
//                 Column Select
//               </p>
//             </div>
//             <div className="col-1 d-flex  justify-content-end">
//               <IoClose
//                 fontSize={20}
//                 style={{ cursor: "pointer" }}
//                 onClick={() => { handleCloseModal("stepOneModel"); }}
//               />
//             </div>
//           </div>
//         </Modal.Header>
//         <Modal.Body className="p-2 p-lg-4">
//           <div className="d-flex flex-column">
//             <div className="col d-flex flex-column justify-content-center align-items-center p-0 ps-lg-2 mb-2">
//               <div className="d-flex flex-column w-100 mb-3">
//                 <p
//                   className="mb-1 text-start w-100"
//                   style={{ fontSize: "14px" }}
//                 >
//                   Select column for name
//                 </p>
//                 <DropdownButton
//                   id="dropdown-column-name"
//                   title={selectedColumnForName || "Select Name Column"}
//                   className="custom-dropdown-text-start text-start w-100"
//                   onSelect={(value) => handleColumnSelect(value, "name")}
//                 >
//                   {columns.map((column, index) => (
//                     <Dropdown.Item key={index} eventKey={column}>
//                       {column}
//                     </Dropdown.Item>
//                   ))}
//                 </DropdownButton>
//                 {errors.column_for_name && <div style={{ color: "red", fontSize: "12px" }}>{errors.column_for_name}</div>}
//               </div>
//               <div className="d-flex flex-column w-100 mb-3">
//                 <p
//                   className="mb-1 text-start w-100"
//                   style={{ fontSize: "14px" }}
//                 >
//                   Select column for description
//                 </p>
//                 <DropdownButton
//                   id="dropdown-column-description"
//                   title={selectedColumnForDescription || "Select Description Column"}
//                   className="custom-dropdown-text-start text-start w-100"
//                   onSelect={(value) => handleColumnSelect(value, "description")}
//                 >
//                   {columns.map((column, index) => (
//                     <Dropdown.Item key={index} eventKey={column}>
//                       {column}
//                     </Dropdown.Item>
//                   ))}
//                 </DropdownButton>
//                 {errors.column_for_description && <div style={{ color: "red", fontSize: "12px" }}>{errors.column_for_description}</div>}
//               </div>
//               <div className="d-flex flex-column w-100 mb-3">
//                 <p
//                   className="mb-1 text-start w-100"
//                   style={{ fontSize: "14px" }}
//                 >
//                   Select column for meta tags
//                 </p>
//                 <DropdownButton
//                   id="dropdown-column-metaTags"
//                   title={selectedColumnForMetaTags || "Select MetaTags Column"}
//                   className="custom-dropdown-text-start text-start w-100"
//                   onSelect={(value) => handleColumnSelect(value, "metaTags")}
//                 >
//                   {columns.map((column, index) => (
//                     <Dropdown.Item key={index} eventKey={column}>
//                       {column}
//                     </Dropdown.Item>
//                   ))}
//                 </DropdownButton>
//                 {errors.column_for_meta_tags && <div style={{ color: "red", fontSize: "12px" }}>{errors.column_for_meta_tags}</div>}
//               </div>
//               <div className="d-flex justify-content-start text-start w-100">
//                 <p className="my-2 text-start" style={{ fontSize: "14px", fontWeight: 600, color: "#333" }}>
//                   Attributes
//                 </p>
//               </div>
//               <div className="d-flex p-0 row row-cols-1 row-cols-lg-2  w-100">

//                 {attributes.map((attribute, index) => (
//                   <div key={index} className="dropdown-container col-12 col-lg-6 mb-3">
//                     <p
//                       className="mb-1 text-start w-100"
//                       style={{ fontSize: "14px" }}
//                     >
//                       Select column for {attribute}
//                     </p>
//                     <DropdownButton
//                       id={`dropdown-column-${attribute}`}
//                       title={selectedColumns[attribute] || `Select Column for ${attribute}`}
//                       className="custom-dropdown-text-start text-start w-100"
//                       onSelect={(value) => handleAttributeColumnSelect(value, attribute)}
//                     >
//                       {columns.map((column, idx) => (
//                         <Dropdown.Item key={idx} eventKey={column}>
//                           {column}
//                         </Dropdown.Item>
//                       ))}
//                     </DropdownButton>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </Modal.Body>

//         <Modal.Footer>
//           <div className="d-flex flex-row justify-content-start">
//             <button
//               onClick={handleExcelFileConfirmSubmit}
//               className="custom-icon-button button-success px-3 py-1 rounded me-2"
//             >
//               <IoSaveOutline fontSize={16} className="me-1" /> Submit
//             </button>
//             <button
//               onClick={
//                 handleDeleteBulkDocument
//               }
//               className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
//             >
//               <MdOutlineCancel fontSize={16} className="me-1" /> Cancel
//             </button>
//           </div>
//         </Modal.Footer>
//       </Modal>

//       <Modal
//         centered
//         show={modalStates.stepTwoModel}
//         className="large-model"
//         onHide={() => {
//           handleCloseModal("stepTwoModel");
//         }}
//       >
//         <Modal.Header>
//           <div className="d-flex w-100 justify-content-end">
//             <div className="col-11 d-flex flex-row">
//               <p className="mb-0" style={{ fontSize: "16px", color: "#333" }}>
//                 Document Data
//               </p>
//             </div>
//             <div className="col-1 d-flex  justify-content-end">
//               <IoClose
//                 fontSize={20}
//                 style={{ cursor: "pointer" }}
//                 onClick={() => { handleCloseModal("stepTwoModel"); }}
//               />
//             </div>
//           </div>
//         </Modal.Header>
//         <Modal.Body className="p-2 p-lg-4">
//           <div className="d-flex flex-column">
//             <div>
//               <div
//                 style={{ maxHeight: "350px", overflowY: "auto" }}
//                 className="custom-scroll "
//               >
//                 <Table hover responsive>
//                   <thead className="sticky-header">
//                     <tr>
//                       {/* <th className="position-relative">
//                       {selectedItems.length > 0 ? (
//                         <Button shape="circle" icon={<FaShareAlt />} onClick={() => handleOpenModal("allDocShareModel")} style={{ position: "absolute", top: "5px", left: "5px", backgroundColor: "#6777ef", color: "#fff" }} />
//                       ) : (
//                         <Checkbox
//                           checked={
//                             selectedItems.length === paginatedData.length && paginatedData.length > 0
//                           }
//                           indeterminate={
//                             selectedItems.length > 0 && selectedItems.length < paginatedData.length
//                           }
//                           onChange={(e) => handleSelectAll(e.target.checked)}
//                           style={{
//                             display: "flex",
//                             alignSelf: "center",
//                             justifySelf: "center",
//                           }}
//                         />
//                       )}

//                     </th> */}
//                       <th>Action</th>
//                       <th className="text-start">Name</th>
//                       <th className="text-start">Storage</th>
//                       <th className="text-start">Type</th>
//                       <th className="text-start">Document Category</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {paginatedData.length > 0 ? (
//                       paginatedData.map((item) => (
//                         <tr key={item.id}>
//                           {/* <td>
//                           <Checkbox
//                             checked={selectedItems.includes(item.id)}
//                             onChange={() => handleCheckboxChange(item.id, item.name)}
//                             style={{
//                               display: "flex",
//                               alignSelf: "center",
//                               justifySelf: "center",
//                             }}
//                           />

//                         </td> */}
//                           <td>
//                             <DropdownButton
//                               id="dropdown-basic-button"
//                               drop="end"
//                               title={<FaEllipsisV />}
//                               className="no-caret position-static"
//                               style={{ zIndex: "99999" }}
//                             >
//                               <Dropdown.Item
//                                 onClick={() =>
//                                   handleOpenModal(
//                                     "deleteRecordModel",
//                                     item.id,
//                                   )
//                                 }
//                                 className="py-2"
//                               >
//                                 <MdModeEditOutline className="me-2" />
//                                 Delete
//                               </Dropdown.Item>
//                             </DropdownButton>
//                           </td>

//                           <td>
//                             {item.name || ""}
//                           </td>
//                           <td>{item?.storage || ""}</td>
//                           <td>{item?.type}</td>
//                           <td>{item?.document?.category_name}</td>
//                         </tr>
//                       ))
//                     ) : (
//                       <div className="text-start w-100 py-3">
//                         <Paragraph text="No data available" color="#333" />
//                       </div>
//                     )}
//                   </tbody>
//                 </Table>
//               </div>
//               <div className="d-flex flex-column flex-lg-row paginationFooter">
//                 <div className="d-flex justify-content-between align-items-center">
//                   <p className="pagintionText mb-0 me-2">Items per page:</p>
//                   <Form.Select
//                     onChange={handleItemsPerPageChange}
//                     value={itemsPerPage}
//                     style={{
//                       width: "100px",
//                       padding: "5px 10px !important",
//                       fontSize: "12px",
//                     }}
//                   >
//                     <option value={10}>10</option>
//                     <option value={20}>20</option>
//                     <option value={30}>30</option>
//                   </Form.Select>
//                 </div>
//                 <div className="d-flex flex-row align-items-center px-lg-5">
//                   <div className="pagination-info" style={{ fontSize: "14px" }}>
//                     {startIndex} – {endIndex} of {totalItems}
//                   </div>

//                   <Pagination className="ms-3">
//                     <Pagination.Prev
//                       onClick={handlePrev}
//                       disabled={currentPage === 1}
//                     />
//                     <Pagination.Next
//                       onClick={handleNext}
//                       disabled={currentPage === totalPages}
//                     />
//                   </Pagination>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </Modal.Body>
//         <Modal.Footer>
//           <div className="d-flex flex-row justify-content-start">
//             <button
//               onClick={handleSaveBulkSubmit}
//               className="custom-icon-button button-success px-3 py-1 rounded me-2"
//             >
//               <IoSaveOutline fontSize={16} className="me-1" /> Save All
//             </button>
//             <button
//               onClick={() => {
//                 handleCloseModal("stepTwoModel");
//               }}
//               className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
//             >
//               <MdOutlineCancel fontSize={16} className="me-1" /> Cancel
//             </button>
//           </div>
//         </Modal.Footer>
//       </Modal>

//       {/* delete Record model */}
//       <Modal
//         centered
//         show={modalStates.deleteRecordModel}
//         onHide={() => handleCloseModal("deleteRecordModel")}
//       >
//         <Modal.Body>
//           <div className="d-flex flex-column">
//             <div className="d-flex w-100 justify-content-end">
//               <div className="col-11 d-flex flex-row">
//                 <p
//                   className="mb-0 text-danger"
//                   style={{ fontSize: "18px", color: "#333" }}
//                 >
//                   Are you sure you want to delete?
//                 </p>
//               </div>
//               <div className="col-1 d-flex justify-content-end">
//                 <IoClose
//                   fontSize={20}
//                   style={{ cursor: "pointer" }}
//                   onClick={() => handleCloseModal("deleteRecordModel")}
//                 />
//               </div>
//             </div>
//             <div className="d-flex flex-row">
//               <button
//                 onClick={() => handleDeleteBulk(selectedDocumentId!)}
//                 className="custom-icon-button button-success px-3 py-1 rounded me-2"
//               >
//                 <IoCheckmark fontSize={16} className="me-1" /> Yes
//               </button>
//               <button
//                 onClick={() => {
//                   handleCloseModal("deleteRecordModel");
//                   setSelectedDocumentId(null);
//                 }}
//                 className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
//               >
//                 <MdOutlineCancel fontSize={16} className="me-1" /> No
//               </button>
//             </div>
//           </div>
//         </Modal.Body>
//       </Modal>

//       {/* delete document model */}
//       <Modal
//         centered
//         show={modalStates.deleteFileModel}
//         onHide={() => handleCloseModal("deleteFileModel")}
//       >
//         <Modal.Body>
//           <div className="d-flex flex-column">
//             <div className="d-flex w-100 justify-content-end">
//               <div className="col-11 d-flex flex-row">
//                 <p
//                   className="mb-0 text-danger"
//                   style={{ fontSize: "18px", color: "#333" }}
//                 >
//                   Are you sure you want to delete?
//                 </p>
//               </div>
//               <div className="col-1 d-flex justify-content-end">
//                 <IoClose
//                   fontSize={20}
//                   style={{ cursor: "pointer" }}
//                   onClick={() => handleCloseModal("deleteFileModel")}
//                 />
//               </div>
//             </div>
//             <div className="d-flex flex-row">
//               <button
//                 onClick={() => handleDeleteBulkDocument()}
//                 className="custom-icon-button button-success px-3 py-1 rounded me-2"
//               >
//                 <IoCheckmark fontSize={16} className="me-1" /> Yes
//               </button>
//               <button
//                 onClick={() => {
//                   handleCloseModal("deleteFileModel");
//                 }}
//                 className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
//               >
//                 <MdOutlineCancel fontSize={16} className="me-1" /> No
//               </button>
//             </div>
//           </div>
//         </Modal.Body>
//       </Modal>

//     </>
//   );
// }
