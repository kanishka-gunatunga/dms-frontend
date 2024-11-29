/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Heading from "@/components/common/Heading";
import Paragraph from "@/components/common/Paragraph";
import DashboardLayout from "@/components/DashboardLayout";
import { DatePicker } from "antd";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  Button,
  Dropdown,
  DropdownButton,
  Form,
  Modal,
  Pagination,
  Table,
} from "react-bootstrap";
import { AiOutlineZoomOut, AiFillDelete } from "react-icons/ai";
import { BiSolidCommentDetail } from "react-icons/bi";
import { BsBellFill } from "react-icons/bs";
import { FaArchive, FaEllipsisV } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { GoHistory } from "react-icons/go";
import {
  IoClose,
  IoEye,
  IoSaveOutline,
  IoSettings,
  IoShareSocial,
  IoTrash,
} from "react-icons/io5";
import type { DatePickerProps } from "antd";

import {
  MdArrowDropDown,
  MdArrowDropUp,
  MdEmail,
  MdFileDownload,
  MdModeEditOutline,
  MdOutlineCancel,
  MdOutlineInsertLink,
  MdUpload,
} from "react-icons/md";
import InfoModal from "@/components/common/InfoModel";
import useAuth from "@/hooks/useAuth";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { deleteWithAuth, getWithAuth, postWithAuth } from "@/utils/apiClient";
import { useRouter } from "next/navigation";
import {
  copyToClipboard,
  handleDeleteDocument,
  handleDeleteShareableLink,
  handleDownload,
  handleGetShareableLink,
  handleRemoveIndexing,
  handleView,
} from "@/utils/documentFunctions";
import {
  fetchCategoryData,
  fetchDocumentsData,
} from "@/utils/dataFetchFunctions";
import { useUserContext } from "@/context/userContext";

interface TableItem {
  id: number;
  name: string;
  category_name: string;
  storage: string;
  created_date: string;
  created_by: string;
}

interface CategoryDropdownItem {
  id: number;
  parent_category: string;
  category_name: string;
}

export default function AllDocTable() {
  const { userId } = useUserContext();

  console.log("user id: ", userId);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [dummyData, setDummyData] = useState<TableItem[]>([]);
  const [copySuccess, setCopySuccess] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<string>("Select category");
  const [selectedStorage, setSelectedStorage] = useState<string>("Storage");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(
    null
  );
  const [selectedDocumentName, setSelectedDocumentName] = useState<
    string | null
  >(null);
  const [categoryDropDownData, setCategoryDropDownData] = useState<
    CategoryDropdownItem[]
  >([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  const [shareableLinkData, setShareableLinkData] = useState({
    has_expire_date: false,
    expire_date_time: "",
    has_password: false,
    password: "",
    allow_download: false,
  });

  const [modalStates, setModalStates] = useState({
    editModel: false,
    shareableLinkModel: false,
    generatedShareableLinkModel: false,
    sharableLinkSettingModel: false,
    deleteConfirmShareableLinkModel: false,
    docArchivedModel: false,
    uploadNewVersionFileModel: false,
    sendEmailModel: false,
    versionHistoryModel: false,
    commentModel: false,
    addReminderModel: false,
    removeIndexingModel: false,
    deleteFileModel: false,
  });
  const [generatedLink, setGeneratedLink] = useState<string>("");

  const isAuthenticated = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchCategoryData(setCategoryDropDownData);
    fetchDocumentsData(setDummyData);
  }, []);

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };

  const handleSearch = (searchTerm: string) => {
    const filteredData = dummyData.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setDummyData(filteredData);
  };

  const handleStorageSelect = (selected: string) => {
    setSelectedStorage(selected);
  };

  const handleDateChange: DatePickerProps["onChange"] = (date, dateString) => {
    console.log("date string:", dateString);
    if (typeof dateString === "string") {
      setSelectedDate(dateString);
    }
  };

  const handleSort = () => {
    setSortAsc(!sortAsc);
    const sortedData = [...dummyData].sort((a, b) =>
      sortAsc
        ? new Date(a.created_date).getTime() -
          new Date(b.created_date).getTime()
        : new Date(b.created_date).getTime() -
          new Date(a.created_date).getTime()
    );
    setDummyData(sortedData);
  };

  const totalItems = dummyData.length;
  const totalPages = Math.ceil(dummyData.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  const paginatedData = dummyData.slice(startIndex, endIndex);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(dummyData.map((item) => item.id));
    }
    setSelectAll(!selectAll);
  };

  const handleCheckboxChange = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    if (!selectedItems.includes(id)) {
      console.log(id);
    }
  };

  const handleOpenModal = (
    modalName: keyof typeof modalStates,
    documentId?: number,
    documentName?: string
  ) => {
    if (documentId) setSelectedDocumentId(documentId);
    if (documentName) setSelectedDocumentName(documentName);

    setModalStates((prev) => ({ ...prev, [modalName]: true }));
  };

  const handleCloseModal = (modalName: keyof typeof modalStates) => {
    setModalStates((prev) => ({ ...prev, [modalName]: false }));
  };

  const handleSaveEditData = () => {
    console.log("save edit clicked");
  };

  // dropdown functions
  const handleShareCheckboxChange = (field: keyof typeof shareableLinkData) => {
    setShareableLinkData((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const handleShareInputChange = (
    field: keyof typeof shareableLinkData,
    value: string
  ) => {
    setShareableLinkData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  return (
    <>
      <DashboardLayout>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <div className="d-flex flex-row align-items-center">
            <Heading text="All Documents" color="#444" />
            <InfoModal
              title="Sample Blog"
              content={`<h1><strong>Hello world,</strong></h1><p>The Company Profile feature allows users to customize the branding of the application by entering the company name and uploading logos. This customization will reflect on the login screen, enhancing the professional appearance and brand identity of the application.</p><br><h3><strong>Hello world,</strong></h3><p>The Company Profile feature allows users to customize the branding of the application by entering the company name and uploading logos. This customization will reflect on the login screen, enhancing the professional appearance and brand identity of the application.</p><br><h3><strong>Hello world,</strong></h3><p>The Company Profile feature allows users to customize the branding of the application by entering the company name and uploading logos. This customization will reflect on the login screen, enhancing the professional appearance and brand identity of the application.</p><br><h3><strong>Hello world,</strong></h3><p>The Company Profile feature allows users to customize the branding of the application by entering the company name and uploading logos. This customization will reflect on the login screen, enhancing the professional appearance and brand identity of the application.</p>`}
            />
          </div>
          <div className="d-flex flex-row">
            <Button
              onClick={() => handleOpenModal("sharableLinkSettingModel", 1)}
            >
              sharableLinkSettingModel
            </Button>
            <Button
              onClick={() => handleOpenModal("generatedShareableLinkModel", 1)}
            >
              generatedShareableLinkModel
            </Button>
            <Button onClick={() => handleOpenModal("shareableLinkModel", 1)}>
              shareableLinkModel
            </Button>
            <a
              href="/all-documents/add"
              className="addButton me-2 bg-white text-dark border border-success rounded px-3 py-1"
            >
              <FaPlus className="me-1" /> Add Document
            </a>
          </div>
        </div>
        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3 position-relative">
          <div className="d-flex flex-column flex-lg-row">
            <div className="col-12 col-lg-6 d-flex flex-column flex-lg-row">
              <div className="input-group mb-3 pe-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name or description"
                  onChange={(e) => handleSearch(e.target.value)}
                ></input>
              </div>
              <div className="input-group mb-3 pe-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by meta tags"
                  onChange={(e) => handleSearch(e.target.value)}
                ></input>
              </div>
            </div>
            <div className="col-12 col-lg-6 d-flex flex-column flex-lg-row">
              <div className="col-12 col-lg-4">
                <div className="input-group mb-3">
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
                </div>
              </div>
              <div className="col-12 col-lg-4 px-2">
                <div className="input-group mb-3">
                  <DropdownButton
                    id="dropdown-storage-button"
                    title={selectedStorage}
                    className="w-100  custom-dropdown-text-start"
                  >
                    <Dropdown.Item onClick={() => handleStorageSelect("View")}>
                      View
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleStorageSelect("Edit")}>
                      Edit
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleStorageSelect("Share")}>
                      Share
                    </Dropdown.Item>
                  </DropdownButton>
                </div>
              </div>
              <div className="col-12 col-lg-4">
                <div className="input-group">
                  <DatePicker onChange={handleDateChange} />
                </div>
              </div>
            </div>
          </div>
          <div>
            <div
              style={{ maxHeight: "350px", overflowY: "auto" }}
              className="custom-scroll "
            >
              <Table hover responsive>
                <thead className="sticky-header">
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="custom-checkbox"
                        style={{
                          display: "flex",
                          alignSelf: "center",
                          justifySelf: "center",
                        }}
                      />
                    </th>
                    <th>Actions</th>
                    <th className="text-start">Name</th>
                    <th className="text-start">Document Category</th>
                    <th className="text-start">Storage</th>
                    <th
                      className="text-start"
                      onClick={handleSort}
                      style={{ cursor: "pointer" }}
                    >
                      Created Date{" "}
                      {sortAsc ? (
                        <MdArrowDropUp fontSize={20} />
                      ) : (
                        <MdArrowDropDown fontSize={20} />
                      )}
                    </th>
                    <th className="text-start">Created By</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <input
                            type="checkbox"
                            className="custom-checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleCheckboxChange(item.id)}
                            style={{
                              display: "flex",
                              alignSelf: "center",
                              justifySelf: "center",
                            }}
                          />
                        </td>
                        <td>
                          <DropdownButton
                            id="dropdown-basic-button"
                            drop="end"
                            title={<FaEllipsisV />}
                            className="no-caret position-static"
                            style={{ zIndex: "99999" }}
                          >
                            <Dropdown.Item
                              href="#"
                              className="py-2"
                              onClick={() => handleView(item.id)}
                            >
                              <IoEye className="me-2" />
                              View
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                handleOpenModal("editModel", item.id)
                              }
                              className="py-2"
                            >
                              <MdModeEditOutline className="me-2" />
                              Edit
                            </Dropdown.Item>
                            <Dropdown.Item href="#" className="py-2">
                              <IoShareSocial className="me-2" />
                              Share
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                handleOpenModal("shareableLinkModel", item.id)
                              }
                              className="py-2"
                            >
                              <MdOutlineInsertLink className="me-2" />
                              Get Shareable Link
                            </Dropdown.Item>
                            <Dropdown.Item
                              href="#"
                              className="py-2"
                              onClick={() => handleDownload(item.id)}
                            >
                              <MdFileDownload className="me-2" />
                              Download
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                handleOpenModal(
                                  "uploadNewVersionFileModel",
                                  item.id
                                )
                              }
                              className="py-2"
                            >
                              <MdUpload className="me-2" />
                              Upload New Version file
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                handleOpenModal("versionHistoryModel", item.id)
                              }
                              className="py-2"
                            >
                              <GoHistory className="me-2" />
                              Version History
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                handleOpenModal("commentModel", item.id)
                              }
                              className="py-2"
                            >
                              <BiSolidCommentDetail className="me-2" />
                              Comment
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                handleOpenModal("addReminderModel", item.id)
                              }
                              className="py-2"
                            >
                              <BsBellFill className="me-2" />
                              Add Reminder
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                handleOpenModal("sendEmailModel", item.id)
                              }
                              className="py-2"
                            >
                              <MdEmail className="me-2" />
                              Send Email
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                handleOpenModal("removeIndexingModel", item.id)
                              }
                              className="py-2"
                            >
                              <AiOutlineZoomOut className="me-2" />
                              Remove Indexing
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                handleOpenModal(
                                  "docArchivedModel",
                                  item.id,
                                  item.name
                                )
                              }
                              className="py-2"
                            >
                              <FaArchive className="me-2" />
                              Archive
                            </Dropdown.Item>

                            <Dropdown.Item
                              onClick={() =>
                                handleOpenModal("deleteFileModel", item.id)
                              }
                              className="py-2"
                            >
                              <AiFillDelete className="me-2" />
                              Delete
                            </Dropdown.Item>
                          </DropdownButton>
                        </td>

                        <td>
                          <Link href="#">{item.name}</Link>
                        </td>
                        <td>{item.category_name}</td>
                        <td>{item.storage}</td>
                        <td>
                          {new Date(item.created_date).toLocaleDateString(
                            "en-GB"
                          )}
                        </td>
                        <td>{item.created_by}</td>
                      </tr>
                    ))
                  ) : (
                    <div className="text-start w-100 py-3">
                      <Paragraph text="No data available" color="#333" />
                    </div>
                  )}
                </tbody>
              </Table>
            </div>

            <div className="d-flex flex-column flex-lg-row paginationFooter">
              <div className="d-flex justify-content-between align-items-center">
                <p className="pagintionText mb-0 me-2">Items per page:</p>
                <Form.Select
                  onChange={handleItemsPerPageChange}
                  value={itemsPerPage}
                  style={{
                    width: "100px",
                    padding: "5px 10px !important",
                    fontSize: "12px",
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                </Form.Select>
              </div>
              <div className="d-flex flex-row align-items-center px-lg-5">
                <div className="pagination-info" style={{ fontSize: "14px" }}>
                  {startIndex} – {endIndex} of {totalItems}
                </div>

                <Pagination className="ms-3">
                  <Pagination.Prev
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                  />
                  <Pagination.Next
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </div>
            </div>
          </div>
        </div>
        {/* Edit Modal */}
        <Modal
          centered
          show={modalStates.editModel}
          onHide={() => {
            handleCloseModal("editModel");
            setSelectedDocumentId(null);
          }}
        >
          <Modal.Body className="p-2 p-lg-4">
            <div className="d-flex justify-content-between align-items-center">
              <p className="mb-1" style={{ fontSize: "16px", color: "#333" }}>
                Edit Document
              </p>
              <IoClose
                fontSize={20}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  handleCloseModal("editModel");
                  setSelectedDocumentId(null);
                }}
              />
            </div>
            <p className="mb-1 mt-3" style={{ fontSize: "14px" }}>
              Name
            </p>
            <div className="input-group mb-3">
              <input type="text" className="form-control"></input>
            </div>
            <p className="mb-1" style={{ fontSize: "14px" }}>
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
                      category.parent_category === "none" ? "bold" : "normal",
                    marginLeft:
                      category.parent_category === "none" ? "0px" : "20px",
                  }}
                >
                  {category.category_name}
                </Dropdown.Item>
              ))}
            </DropdownButton>
            <p className="mb-1 mt-3" style={{ fontSize: "14px" }}>
              Description
            </p>
            <div className="input-group mb-3">
              <textarea className="form-control"></textarea>
            </div>
            <p className="mb-1" style={{ fontSize: "14px" }}>
              Meta Tags
            </p>
          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex flex-row mt-5">
              <button
                onClick={handleSaveEditData}
                className="custom-icon-button button-success px-3 py-1 rounded me-2"
              >
                <IoSaveOutline fontSize={16} className="me-1" /> Save
              </button>
              <button
                onClick={() => {
                  handleCloseModal("editModel");
                  setSelectedDocumentId(null);
                }}
                className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
              >
                <MdOutlineCancel fontSize={16} className="me-1" /> Cancel
              </button>
            </div>
          </Modal.Footer>
        </Modal>

        {/* shareable link model */}
        <Modal
          centered
          show={modalStates.shareableLinkModel}
          onHide={() => {
            handleCloseModal("shareableLinkModel");
            setSelectedDocumentId(null);
          }}
        >
          <Modal.Body className="p-2 p-lg-4">
            <div className="d-flex justify-content-between align-items-center">
              <p className="mb-1" style={{ fontSize: "16px", color: "#333" }}>
                Shareable Link
              </p>
              <IoClose
                fontSize={20}
                style={{ cursor: "pointer" }}
                onClick={() => handleCloseModal("shareableLinkModel")}
              />
            </div>
            <div className="mt-1">
              <label className="d-flex flex-row mt-2">
                <input
                  type="checkbox"
                  checked={shareableLinkData.has_expire_date}
                  onChange={() => handleShareCheckboxChange("has_expire_date")}
                  className="me-2"
                />
                <p
                  className="mb-1 text-start w-100"
                  style={{ fontSize: "14px" }}
                >
                  Is Link Valid until:
                </p>
              </label>
              {shareableLinkData.has_expire_date && (
                <div className="d-flex flex-column flex-lg-row gap-2">
                  <label className="d-block">
                    <input
                      type="datetime-local"
                      value={shareableLinkData.expire_date_time}
                      onChange={(e) =>
                        handleShareInputChange(
                          "expire_date_time",
                          e.target.value
                        )
                      }
                      className="form-control"
                    />
                  </label>
                </div>
              )}
              <label className="d-flex flex-row mt-2">
                <input
                  type="checkbox"
                  checked={shareableLinkData.has_password}
                  onChange={() => handleShareCheckboxChange("has_password")}
                  className="me-2"
                />
                <p
                  className="mb-1 text-start w-100"
                  style={{ fontSize: "14px" }}
                >
                  Is password required:
                </p>
              </label>
              {shareableLinkData.has_password && (
                <div className="d-flex flex-column flex-lg-row gap-2">
                  <label className="d-block">
                    <input
                      type="password"
                      placeholder="Enter a password"
                      value={shareableLinkData.password}
                      onChange={(e) =>
                        handleShareInputChange("password", e.target.value)
                      }
                      className="form-control"
                    />
                  </label>
                </div>
              )}
              <label className="d-flex flex-row mt-2">
                <input
                  type="checkbox"
                  checked={shareableLinkData.allow_download}
                  onChange={() => handleShareCheckboxChange("allow_download")}
                  className="me-2"
                />
                <p
                  className="mb-1 text-start w-100"
                  style={{ fontSize: "14px" }}
                >
                  Users with link can download this item
                </p>
              </label>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex flex-row mt-5">
              <button
                onClick={() => {
                  handleCloseModal("shareableLinkModel");
                  setSelectedDocumentId(null);
                }}
                className="custom-icon-button button-success px-3 py-1 rounded me-2"
              >
                <IoSaveOutline fontSize={16} className="me-1" /> Save
              </button>
            </div>
          </Modal.Footer>
        </Modal>

        {/* generated link model */}
        <Modal
          centered
          show={modalStates.generatedShareableLinkModel}
          onHide={() => {
            handleCloseModal("generatedShareableLinkModel");
            setSelectedDocumentId(null);
          }}
        >
          <Modal.Body className="p-2 p-lg-4">
            <div className="d-flex justify-content-between align-items-center">
              <p className="mb-1" style={{ fontSize: "16px", color: "#333" }}>
                Shareable Link
              </p>
              <IoClose
                fontSize={20}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  handleCloseModal("generatedShareableLinkModel");
                  setSelectedDocumentId(null);
                }}
              />
            </div>
            <div className="mt-1">
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                Link sharing is on
              </p>
              <IoTrash
                fontSize={20}
                style={{ cursor: "pointer" }}
                onClick={() => handleCloseModal("sharableLinkSettingModel")}
              />
              <IoSettings
                fontSize={20}
                style={{ cursor: "pointer" }}
                onClick={() => handleOpenModal("sharableLinkSettingModel")}
              />
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  value={generatedLink}
                  readOnly
                />
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => copyToClipboard}
                  type="button"
                >
                  Copy
                </button>
                {copySuccess && (
                  <span className="text-success ms-2">{copySuccess}</span>
                )}
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex flex-row mt-5">
              <button
                onClick={() => handleGetShareableLink}
                className="custom-icon-button button-success px-3 py-1 rounded me-2"
              >
                <IoSaveOutline fontSize={16} className="me-1" /> Save
              </button>
            </div>
          </Modal.Footer>
        </Modal>

        {/* generated link model settings */}
        <Modal
          centered
          show={modalStates.sharableLinkSettingModel}
          onHide={() => {
            handleCloseModal("sharableLinkSettingModel");
            setSelectedDocumentId(null);
          }}
        >
          <Modal.Body className="p-2 p-lg-4">
            <div className="d-flex justify-content-between align-items-center">
              <p className="mb-1" style={{ fontSize: "16px", color: "#333" }}>
                Shareable Link
              </p>
              <IoClose
                fontSize={20}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  handleCloseModal("sharableLinkSettingModel");
                  setSelectedDocumentId(null);
                }}
              />
            </div>
            <div className="mt-1">
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                Link sharing is on
              </p>
              <IoTrash
                fontSize={20}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  handleCloseModal("sharableLinkSettingModel");
                  setSelectedDocumentId(null);
                }}
              />
              <IoSettings
                fontSize={20}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  handleCloseModal("sharableLinkSettingModel");
                  setSelectedDocumentId(null);
                }}
              />
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  value={generatedLink}
                  readOnly
                />
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => copyToClipboard}
                  type="button"
                >
                  Copy
                </button>
                {copySuccess && (
                  <span className="text-success ms-2">{copySuccess}</span>
                )}
              </div>
            </div>
            <div className="mt-1">
              <label className="d-flex flex-row mt-2">
                <input
                  type="checkbox"
                  checked={shareableLinkData.has_expire_date}
                  onChange={() => handleShareCheckboxChange("has_expire_date")}
                  className="me-2"
                />
                <p
                  className="mb-1 text-start w-100"
                  style={{ fontSize: "14px" }}
                >
                  Is Link Valid until:
                </p>
              </label>
              {shareableLinkData.has_expire_date && (
                <div className="d-flex flex-column flex-lg-row gap-2">
                  <label className="d-block">
                    <input
                      type="datetime-local"
                      value={shareableLinkData.expire_date_time}
                      onChange={(e) =>
                        handleShareInputChange(
                          "expire_date_time",
                          e.target.value
                        )
                      }
                      className="form-control"
                    />
                  </label>
                </div>
              )}
              <label className="d-flex flex-row mt-2">
                <input
                  type="checkbox"
                  checked={shareableLinkData.has_password}
                  onChange={() => handleShareCheckboxChange("has_password")}
                  className="me-2"
                />
                <p
                  className="mb-1 text-start w-100"
                  style={{ fontSize: "14px" }}
                >
                  Is password required:
                </p>
              </label>
              {shareableLinkData.has_password && (
                <div className="d-flex flex-column flex-lg-row gap-2">
                  <label className="d-block">
                    <input
                      type="password"
                      placeholder="Enter a password"
                      value={shareableLinkData.password}
                      onChange={(e) =>
                        handleShareInputChange("password", e.target.value)
                      }
                      className="form-control"
                    />
                  </label>
                </div>
              )}
              <label className="d-flex flex-row mt-2">
                <input
                  type="checkbox"
                  checked={shareableLinkData.allow_download}
                  onChange={() => handleShareCheckboxChange("allow_download")}
                  className="me-2"
                />
                <p
                  className="mb-1 text-start w-100"
                  style={{ fontSize: "14px" }}
                >
                  Users with link can download this item
                </p>
              </label>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex flex-row mt-5">
              <button
                onClick={handleSaveEditData}
                className="custom-icon-button button-success px-3 py-1 rounded me-2"
              >
                <IoSaveOutline fontSize={16} className="me-1" /> Save
              </button>
            </div>
          </Modal.Footer>
        </Modal>

        {/* delete sharable link model */}
        <Modal
          centered
          show={modalStates.deleteConfirmShareableLinkModel}
          onHide={() => handleCloseModal("deleteConfirmShareableLinkModel")}
        >
          <Modal.Body className="p-2 p-lg-4">
            <div className="d-flex justify-content-between align-items-center">
              <p className="mb-1" style={{ fontSize: "16px", color: "#333" }}>
                Shareable Link
              </p>
              <IoClose
                fontSize={20}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  handleCloseModal("deleteConfirmShareableLinkModel")
                }
              />
            </div>
            <div className="mt-1">
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                Are you sure to Delete
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex flex-row mt-5">
              <button
                onClick={() => handleDeleteShareableLink}
                className="custom-icon-button button-success px-3 py-1 rounded me-2"
              >
                <IoSaveOutline fontSize={16} className="me-1" /> Delete
              </button>
              <button
                onClick={() => {
                  handleCloseModal("deleteConfirmShareableLinkModel");
                  setSelectedDocumentId(null);
                }}
                className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
              >
                <MdOutlineCancel fontSize={16} className="me-1" /> Cancel
              </button>
            </div>
          </Modal.Footer>
        </Modal>

        {/* delete document model */}
        <Modal
          centered
          show={modalStates.deleteFileModel}
          onHide={() => handleCloseModal("deleteFileModel")}
        >
          <Modal.Body className="p-2 p-lg-4">
            <div className="d-flex justify-content-between align-items-center">
              <p className="mb-1" style={{ fontSize: "16px", color: "#333" }}>
                Are you sure you want to delete?
              </p>
              <IoClose
                fontSize={20}
                style={{ cursor: "pointer" }}
                onClick={() => handleCloseModal("deleteFileModel")}
              />
            </div>
            <div className="mt-1">
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                By deleting the document, it will no longer be accessible in the
                future, and the following data will be deleted from the system:
              </p>
              <ul>
                <li>Version History</li>
                <li>Meta Tags</li>
                <li>Comment</li>
                <li>Notifications</li>
                <li>Reminders</li>
                <li>Permisssions</li>
              </ul>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex flex-row mt-5">
              <button
                onClick={() => handleDeleteDocument(selectedDocumentId!)}
                className="custom-icon-button button-success px-3 py-1 rounded me-2"
              >
                <IoSaveOutline fontSize={16} className="me-1" /> Yes
              </button>
              <button
                onClick={() => {
                  handleCloseModal("deleteFileModel");
                  setSelectedDocumentId(null);
                }}
                className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
              >
                <MdOutlineCancel fontSize={16} className="me-1" /> No
              </button>
            </div>
          </Modal.Footer>
        </Modal>

        {/* remove indexing model */}
        <Modal
          centered
          show={modalStates.removeIndexingModel}
          onHide={() => handleCloseModal("removeIndexingModel")}
        >
          <Modal.Body className="p-2 p-lg-4">
            <div className="d-flex justify-content-between align-items-center">
              <p className="mb-1" style={{ fontSize: "16px", color: "#333" }}>
                Are you sure want to remove document page indexing ? DMS Test
                Document invoice .docx
              </p>
              <IoClose
                fontSize={20}
                style={{ cursor: "pointer" }}
                onClick={() => handleCloseModal("removeIndexingModel")}
              />
            </div>
            <div className="mt-1">
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                Note::After removal, the document&apos;s content will no longer
                be searchable. Once removed, the document will not appear in
                deep search results.
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex flex-row mt-5">
              <button
                onClick={() =>
                  handleRemoveIndexing(selectedDocumentId!, userId!)
                }
                className="custom-icon-button button-success px-3 py-1 rounded me-2"
              >
                <IoSaveOutline fontSize={16} className="me-1" /> Yes
              </button>
              <button
                onClick={() => {
                  handleCloseModal("removeIndexingModel");
                  setSelectedDocumentId(null);
                }}
                className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
              >
                <MdOutlineCancel fontSize={16} className="me-1" /> No
              </button>
            </div>
          </Modal.Footer>
        </Modal>

        {/* archive document model */}
        <Modal
          centered
          show={modalStates.deleteConfirmShareableLinkModel}
          onHide={() => {
            handleCloseModal("docArchivedModel");
            setSelectedDocumentId(null);
            setSelectedDocumentName(null);
          }}
        >
          <Modal.Body className="p-2 p-lg-4">
            <div className="d-flex justify-content-between align-items-center">
              <p className="mb-1" style={{ fontSize: "16px", color: "#333" }}>
                Are you sure you want to archive?
              </p>
              <IoClose
                fontSize={20}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  handleCloseModal("docArchivedModel");
                  setSelectedDocumentId(null);
                  setSelectedDocumentName(null);
                }}
              />
            </div>
            <div className="mt-1">
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                {selectedDocumentName || "No document selected"}
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex flex-row mt-5">
              <button
                onClick={() => handleDeleteShareableLink}
                className="custom-icon-button button-success px-3 py-1 rounded me-2"
              >
                <IoSaveOutline fontSize={16} className="me-1" /> Yes
              </button>
              <button
                onClick={() => {
                  handleCloseModal("docArchivedModel");
                  setSelectedDocumentId(null);
                  setSelectedDocumentName(null);
                }}
                className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
              >
                <MdOutlineCancel fontSize={16} className="me-1" /> Cancel
              </button>
            </div>
          </Modal.Footer>
        </Modal>
      </DashboardLayout>
    </>
  );
}
