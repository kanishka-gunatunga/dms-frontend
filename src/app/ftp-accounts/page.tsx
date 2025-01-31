/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Heading from "@/components/common/Heading";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Paragraph from "@/components/common/Paragraph";
import useAuth from "@/hooks/useAuth";
import React, { useEffect, useState } from "react";
import {
  Dropdown,
  DropdownButton,
  Form,
  Modal,
  Pagination,
  Table,
} from "react-bootstrap";
import { FaPlus } from "react-icons/fa6";
import ToastMessage from "@/components/common/Toast";
import { IoCheckmark, IoClose, IoFolder, IoSaveOutline } from "react-icons/io5";
import { MdModeEditOutline, MdOutlineCancel } from "react-icons/md";
import {
  fetchFTPData,
} from "@/utils/dataFetchFunctions";
import { deleteWithAuth, getWithAuth, postWithAuth } from "@/utils/apiClient";
import { IoMdTrash } from "react-icons/io";
import { FaEllipsisV } from "react-icons/fa";
import DashboardLayoutSuperAdmin from "@/components/DashboardLayoutSuperAdmin";
import { Checkbox } from "antd";



interface FTPaccount {
  id: number;
  name: string;
  host: string;
  port: string;
  username: string;
  password: string;
  root_path: string;
}

export default function AllDocTable() {
  const isAuthenticated = useAuth();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [dummyData, setDummyData] = useState<FTPaccount[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>();
  const [isChecked, setIsChecked] = useState(false);
  const [isCheckedAD, setIsCheckedAD] = useState(false);


  const [ftpData, setFtpData] = useState({
    name: "",
    host: "",
    port: "",
    username: "",
    password: "",
    root_path: "",
  });

  const [modalStates, setModalStates] = useState({
    addCategory: false,
    editModel: false,
    deleteModel: false,
  });

  useEffect(() => {
    fetchFTPData(setDummyData);
    fetchCompanyProfile()
  }, []);

  useEffect(() => {
    if (modalStates.editModel && selectedItemId !== null) {
      fetchFTPDetails();
    }
  }, [modalStates.editModel, selectedItemId]);


  const handleOpenModal = (
    modalName: keyof typeof modalStates,
    ftpId?: string,
  ) => {
    if (ftpId) setSelectedItemId(ftpId);
    setModalStates((prev) => ({ ...prev, [modalName]: true }));
  };

  const handleCloseModal = (modalName: keyof typeof modalStates) => {
    setModalStates((prev) => ({ ...prev, [modalName]: false }));
  };


  const totalItems = dummyData.length;
  const totalPages = Math.ceil(dummyData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

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

  const paginatedData = dummyData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddCategory = async () => {
    try {

      const formData = new FormData();
      formData.append("name", ftpData.name);
      formData.append("host", ftpData.host);
      formData.append("port", ftpData.port);
      formData.append("username", ftpData.username);
      formData.append("password", ftpData.password);
      formData.append("root_path", ftpData.root_path);
      const response = await postWithAuth(`add-ftp-account`, formData);
      if (response.status === "success") {
        handleCloseModal("addCategory");
        setToastType("success");
        setToastMessage("FTP Account added successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);

        fetchFTPData(setDummyData);
      } else {
        handleCloseModal("addCategory");
        setToastType("error");
        setToastMessage("Failed to add FTP Account!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      console.error("Error new version updating:", error);
    }
  };

  const fetchFTPDetails = async () => {
    try {
      const response = await getWithAuth(`edit-ftp-account/${selectedItemId}`);
      if (response.status === "fail") {
      } else {
        setFtpData(response);
      }
    } catch (error) {
      console.error("Error new version updating:", error);
    }
  };

  const fetchCompanyProfile = async () => {
    try {
      const response = await getWithAuth(`company-profile`);
      // console.log("response cp",response)
      if (response.status === "fail") {
      } else {
        setIsChecked(response.enable_external_file_view);
        setIsCheckedAD(response.enable_ad_login)
      }
    } catch (error) {
      console.error("Error new version updating:", error);
    }
  };

  const handleEditCategory = async () => {
    try {



      const formData = new FormData();
      formData.append("name", ftpData.name);
      formData.append("host", ftpData.host);
      formData.append("port", ftpData.port);
      formData.append("username", ftpData.username);
      formData.append("password", ftpData.password);
      formData.append("root_path", ftpData.root_path);
      const response = await postWithAuth(
        `edit-ftp-account/${selectedItemId}`,
        formData
      );
      if (response.status === "success") {
        handleCloseModal("editModel");
        setToastType("success");
        setToastMessage("FTP Account updated successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);

        fetchFTPData(setDummyData);
      } else {
        handleCloseModal("editModel");
        setToastType("error");
        setToastMessage("Failed to update FTP Account!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      console.error("Error new version updating:", error);
    }
  };

  const handleDeleteCategory = async () => {
    try {
      const response = await deleteWithAuth(
        `delete-ftp-account/${selectedItemId}`
      );
      if (response.status === "success") {
        handleCloseModal("deleteModel");
        setToastType("success");
        setToastMessage("FTP Account deleted successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        fetchFTPData(setDummyData);
      } else {
        handleCloseModal("deleteModel");
        setToastType("error");
        setToastMessage("Failed to delete FTP Account!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      console.error("Error new version updating:", error);
    }
  };

  const handleCheckboxChange = async (e: { target: { checked: boolean | ((prevState: boolean) => boolean); }; }) => {
    const value = e.target.checked ? 1 : 0;
    setIsChecked(e.target.checked);

    const formData = new FormData();
    formData.append("enable_external_file_view", value.toString());

    try {
      const response = await postWithAuth(`company-profile`, formData);

      if (response.status === "success") {
        setToastType("success");
        setToastMessage("FTP Account updated successfully!");
      } else {
        setToastType("error");
        setToastMessage("Failed to update FTP Account!");
      }
    } catch (error) {
      console.error("Error updating FTP Account:", error);
      setToastType("error");
      setToastMessage("Failed to update FTP Account!");
    } finally {
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    }
  };

  const handleCheckboxChangeAD = async (e: { target: { checked: boolean | ((prevState: boolean) => boolean); }; }) => {
    const value = e.target.checked ? 1 : 0;
    setIsCheckedAD(e.target.checked);

    const formData = new FormData();
    formData.append("enable_ad_login", value.toString());

    try {
      const response = await postWithAuth(`company-profile`, formData);

      if (response.status === "success") {
        setToastType("success");
        setToastMessage("AD login enabled!");
      } else {
        setToastType("error");
        setToastMessage("AD login disabled!");
      }
    } catch (error) {
      console.error("Error updating FTP Account:", error);
      setToastType("error");
      setToastMessage("AD login disabled!");
    } finally {
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    }
  };


  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <DashboardLayoutSuperAdmin>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <Heading text="Enable 3rd Party Preview" color="#444" />
        </div>
        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3  mb-5">
          <div>
            <Checkbox checked={isChecked} onChange={handleCheckboxChange}>
              Enable 3rd party preview
            </Checkbox>

          </div>
        </div>


        <div className="d-flex justify-content-between align-items-center pt-2">
          <Heading text="Enable AD Login" color="#444" />
        </div>
        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3  mb-5">
          <div>
            <Checkbox checked={isCheckedAD} onChange={handleCheckboxChangeAD}>
              Enable AD Login
            </Checkbox>

          </div>
        </div>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <Heading text="Set File Preview Extension" color="#444" />
        </div>
        <div className="col-3 col-lg-3 d-flex flex-column mb-2">
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
              Preview Extension
              </p>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  value={ftpData.name}
                  onChange={(e) =>
                    setFtpData((prevState) => ({ ...prevState, name: e.target.value }))
                  }
                />

              </div>
            </div>

        <div className="d-flex justify-content-between align-items-center pt-2">
          <Heading text="FTP Accounts" color="#444" />

          <button
            onClick={() => handleOpenModal("addCategory")}
            className="addButton bg-white text-dark border border-success rounded px-3 py-1"
          >
            <FaPlus className="me-1" /> Add FTP Account
          </button>
        </div>
        
        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
          <div>
            <div
              style={{ maxHeight: "380px", overflowY: "auto" }}
              className="custom-scroll"
            >
              <Table hover responsive>
                <thead className="sticky-header">
                  <tr>
                    <th className="text-start" style={{ width: "5%" }}>
                      Action
                    </th>
                    <th className="text-start" style={{ width: "15%" }}>
                      Name
                    </th>
                    <th className="text-start" style={{ width: "10%" }}>
                      Host
                    </th>
                    <th className="text-start" style={{ width: "10%" }}>
                      Port
                    </th>
                    <th className="text-start" style={{ width: "25%" }}>
                      Username
                    </th>
                    <th className="text-start" style={{ width: "25%" }}>
                      Root Path
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <DropdownButton
                            id="dropdown-basic-button"
                            drop="end"
                            title={<FaEllipsisV />}
                            className="no-caret position-static"
                          >

                            <Dropdown.Item onClick={() =>
                              handleOpenModal("editModel", item.id.toString())
                            } className="py-2">
                              <MdModeEditOutline className="me-2" />
                              Edit
                            </Dropdown.Item>

                            <Dropdown.Item onClick={() =>
                              handleOpenModal("deleteModel", item.id.toString())
                            } className="py-2">
                              <IoMdTrash className="me-2" />
                              Delete
                            </Dropdown.Item>
                          </DropdownButton>
                        </td>
                        <td className="text-start">{item?.name}</td>
                        <td className="text-start">{item?.host}</td>
                        <td className="text-start">{item?.port}</td>
                        <td className="text-start">{item?.username}</td>
                        <td className="text-start">{item?.root_path}</td>
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
        <ToastMessage
          message={toastMessage}
          show={showToast}
          onClose={() => setShowToast(false)}
          type={toastType}
        />
      </DashboardLayoutSuperAdmin>

      {/* add parent */}
      <Modal
        centered
        show={modalStates.addCategory}
        onHide={() => {
          handleCloseModal("addCategory");
        }}
      >
        <Modal.Header>
          <div className="d-flex w-100 justify-content-end">
            <div className="col-11 d-flex flex-row">
              <IoFolder fontSize={20} className="me-2" />
              <p className="mb-0" style={{ fontSize: "16px", color: "#333" }}>
                Add FTP Account
              </p>
            </div>
            <div className="col-1 d-flex justify-content-end">
              <IoClose
                fontSize={20}
                style={{ cursor: "pointer" }}
                onClick={() => handleCloseModal("addCategory")}
              />
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className="py-3">
          <div
            className="d-flex flex-column custom-scroll mb-3"
            style={{ maxHeight: "200px", overflowY: "auto" }}
          >
            <div className="col-12 col-lg-12 d-flex flex-column mb-2">
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                Name
              </p>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  value={ftpData.name}
                  onChange={(e) =>
                    setFtpData((prevState) => ({ ...prevState, name: e.target.value }))
                  }
                />

              </div>
            </div>
            <div className="col-12 col-lg-12 d-flex flex-column mb-2">
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                Host
              </p>
              <input
                type="text"
                className="form-control"
                value={ftpData.host}
                onChange={(e) =>
                  setFtpData((prevState) => ({ ...prevState, host: e.target.value }))
                }
              />

            </div>
            <div className="col-12 col-lg-12 d-flex flex-column mb-2">
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                Port
              </p>
              <input
                type="text"
                className="form-control"
                value={ftpData.port}
                onChange={(e) =>
                  setFtpData((prevState) => ({ ...prevState, port: e.target.value }))
                }
              />

            </div>
            <div className="col-12 col-lg-12 d-flex flex-column mb-2">
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                Username
              </p>
              <input
                type="text"
                className="form-control"
                value={ftpData.username}
                onChange={(e) =>
                  setFtpData((prevState) => ({ ...prevState, username: e.target.value }))
                }
              />

            </div>
            <div className="col-12 col-lg-12 d-flex flex-column mb-2">
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                Password
              </p>
              <input
                type="password"
                className="form-control"
                value={ftpData.password}
                onChange={(e) =>
                  setFtpData((prevState) => ({ ...prevState, password: e.target.value }))
                }
              />

            </div>
            <div className="col-12 col-lg-12 d-flex flex-column mb-2">
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                Root Path
              </p>
              <input
                type="text"
                className="form-control"
                value={ftpData.root_path}
                onChange={(e) =>
                  setFtpData((prevState) => ({ ...prevState, root_path: e.target.value }))
                }
              />

            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex flex-row">
            <button
              onClick={() => handleAddCategory()}
              className="custom-icon-button button-success px-3 py-1 rounded me-2"
            >
              <IoSaveOutline fontSize={16} className="me-1" /> Save
            </button>
            <button
              onClick={() => {
                handleCloseModal("addCategory");
              }}
              className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
            >
              <MdOutlineCancel fontSize={16} className="me-1" /> Cancel
            </button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* edit */}
      <Modal
        centered
        show={modalStates.editModel}
        onHide={() => {
          handleCloseModal("editModel");
        }}
      >
        <Modal.Header>
          <div className="d-flex w-100 justify-content-end">
            <div className="col-11 d-flex flex-row">
              <IoFolder fontSize={20} className="me-2" />
              <p className="mb-0" style={{ fontSize: "16px", color: "#333" }}>
                Edit Category
              </p>
            </div>
            <div className="col-1 d-flex justify-content-end">
              <IoClose
                fontSize={20}
                style={{ cursor: "pointer" }}
                onClick={() => handleCloseModal("editModel")}
              />
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className="py-3">
          <div
            className="d-flex flex-column custom-scroll mb-3"
            style={{ maxHeight: "200px", overflowY: "auto" }}
          >
            <div className="col-12 col-lg-12 d-flex flex-column mb-2">
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                Name
              </p>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  value={ftpData.name}
                  onChange={(e) =>
                    setFtpData((prevState) => ({ ...prevState, name: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="col-12 col-lg-12 d-flex flex-column mb-2">
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                Host
              </p>
              <input
                type="text"
                className="form-control"
                value={ftpData.host}
                onChange={(e) =>
                  setFtpData((prevState) => ({ ...prevState, host: e.target.value }))
                }
              />
            </div>
            <div className="col-12 col-lg-12 d-flex flex-column mb-2">
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                Port
              </p>
              <input
                type="text"
                className="form-control"
                value={ftpData.port}
                onChange={(e) =>
                  setFtpData((prevState) => ({ ...prevState, port: e.target.value }))
                }
              />
            </div>
            <div className="col-12 col-lg-12 d-flex flex-column mb-2">
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                Username
              </p>
              <input
                type="text"
                className="form-control"
                value={ftpData.username}
                onChange={(e) =>
                  setFtpData((prevState) => ({ ...prevState, username: e.target.value }))
                }
              />
            </div>
            <div className="col-12 col-lg-12 d-flex flex-column mb-2">
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                Password
              </p>
              <input
                type="password"
                className="form-control"
                value={ftpData.password}
                onChange={(e) =>
                  setFtpData((prevState) => ({ ...prevState, password: e.target.value }))
                }
              />
            </div>
            <div className="col-12 col-lg-12 d-flex flex-column mb-2">
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                Root Path
              </p>
              <input
                type="text"
                className="form-control"
                value={ftpData.root_path}
                onChange={(e) =>
                  setFtpData((prevState) => ({ ...prevState, root_path: e.target.value }))
                }
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex flex-row">
            <button
              onClick={() => handleEditCategory()}
              className="custom-icon-button button-success px-3 py-1 rounded me-2"
            >
              <IoSaveOutline fontSize={16} className="me-1" /> Save
            </button>
            <button
              onClick={() => {
                handleCloseModal("editModel");
              }}
              className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
            >
              <MdOutlineCancel fontSize={16} className="me-1" /> Cancel
            </button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* delete */}
      <Modal
        centered
        show={modalStates.deleteModel}
        onHide={() => handleCloseModal("deleteModel")}
      >
        <Modal.Body>
          <div className="d-flex flex-column">
            <div className="d-flex w-100 justify-content-end">
              <div className="col-11 d-flex flex-row py-3">
                <p
                  className="mb-0 text-danger"
                  style={{ fontSize: "18px", color: "#333" }}
                >
                  Are you sure you want to delete?
                </p>
              </div>
              <div className="col-1 d-flex justify-content-end">
                <IoClose
                  fontSize={20}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleCloseModal("deleteModel")}
                />
              </div>
            </div>
            <div className="d-flex flex-row">
              <button
                onClick={() => handleDeleteCategory()}
                className="custom-icon-button button-success px-3 py-1 rounded me-2"
              >
                <IoCheckmark fontSize={16} className="me-1" /> Yes
              </button>
              <button
                onClick={() => {
                  handleCloseModal("deleteModel");
                }}
                className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
              >
                <MdOutlineCancel fontSize={16} className="me-1" /> No
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
