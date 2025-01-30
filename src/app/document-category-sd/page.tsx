/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { CategoryDropdownItem, FtpAccDropdownItem } from "@/types/types";
import { AiOutlineDelete } from "react-icons/ai";
import { FaPlus } from "react-icons/fa6";
import ToastMessage from "@/components/common/Toast";
import {
    MdOutlineEdit,
    MdOutlineKeyboardDoubleArrowDown,
    MdOutlineKeyboardDoubleArrowRight,
} from "react-icons/md";
import { IoAdd, IoCheckmark, IoClose, IoFolder, IoSaveOutline, IoTrashOutline } from "react-icons/io5";
import { MdOutlineCancel } from "react-icons/md";
import {
    fetchCategoryChildrenData,
    fetchCategoryData,
    fetchFtpAccounts,
} from "@/utils/dataFetchFunctions";
import { deleteWithAuth, getWithAuth, postWithAuth } from "@/utils/apiClient";
import { IoMdCloudDownload } from "react-icons/io";
import DashboardLayoutSuperAdmin from "@/components/DashboardLayoutSuperAdmin";

interface Category {
    id: number;
    parent_category: string;
    category_name: string;
    template: string;
    status: string;
    children?: Category[];
}

export default function AllDocTable() {
    const [category_name, setCategoryName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("none");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [toastType, setToastType] = useState<"success" | "error">("success");
    const [toastMessage, setToastMessage] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [dummyData, setDummyData] = useState<Category[]>([]);
    const [categoryDropDownData, setCategoryDropDownData] = useState<
        CategoryDropdownItem[]
    >([]);
    const [collapsedRows, setCollapsedRows] = useState<Record<number, boolean>>(
        {}
    );
    const [selectedParentId, setSelectedParentId] = useState<number>();
    const [selectedItemId, setSelectedItemId] = useState<number>();
    const isAuthenticated = useAuth();
    const [editData, setEditData] = useState({
        parent_category: "",
        category_name: "",
        description: "",
        template: "",
        ftp_account: ""
    });
    const [attributeData, setattributeData] = useState<string[]>([]);
    const [currentAttribue, setcurrentAttribue] = useState<string>("");
    const [excelGenerated, setExcelGenerated] = useState(false);
    const [excelGeneratedLink, setExcelGeneratedLink] = useState("");
    const [ftpAccountData, setFtpAccountData] = useState<
        FtpAccDropdownItem[]
    >([]);
    const [selectedFtpId, setSelectedFtpId] = useState<string>("");


    const [modalStates, setModalStates] = useState({
        addCategory: false,
        addChildCategory: false,
        editModel: false,
        deleteModel: false,
    });

    useEffect(() => {
        fetchCategoryChildrenData(setDummyData);
        fetchCategoryData(setCategoryDropDownData);
        fetchFtpAccounts(setFtpAccountData)
    }, []);

    useEffect(() => {
        // console.log("se:: id::", selectedItemId);
        if (modalStates.editModel && selectedItemId !== null) {
            fetchCategoryDetails();
        }
    }, [modalStates.editModel, selectedItemId]);

    const toggleCollapse = (id: number) => {
        setCollapsedRows((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };

    useEffect(() => {
        setSelectedFtpId(editData.ftp_account);
    }, [editData.ftp_account]);

    const handleFtpAccSelect = (ftpId: string) => {
        setSelectedFtpId(ftpId);
        setEditData((prevData) => ({
            ...prevData,
            ftp_account: ftpId,
        }));
    };

    const handleCategorySelect = (categoryId: string) => {
        setSelectedCategoryId(categoryId);
    };

    const handleEditCategorySelect = (value: string) => {
        if (value === "none") {
            setEditData((prevData) => ({
                ...prevData,
                parent_category: "none",
                category_name: "",
            }));
        } else {
            const selectedCategory = categoryDropDownData.find(
                (item) => item.id.toString() === value
            );
            setEditData((prevData) => ({
                ...prevData,
                parent_category: selectedCategory?.id.toString() || "",
                category_name: selectedCategory?.category_name || "",
            }));
        }
    };

    const handleOpenModal = (modalName: keyof typeof modalStates) => {
        setModalStates((prev) => ({ ...prev, [modalName]: true }));
    };

    const handleCloseModal = (modalName: keyof typeof modalStates) => {
        setModalStates((prev) => ({ ...prev, [modalName]: false }));
    };

    if (!isAuthenticated) {
        return <LoadingSpinner />;
    }

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

    const handleAddCategory = async () => {
        // console.log("attributeData : ", attributeData)
        try {
            const formData = new FormData();
            formData.append("parent_category", selectedCategoryId);
            formData.append("category_name", category_name || "");
            formData.append("description", description);
            formData.append("attribute_data", JSON.stringify(attributeData))
            formData.append("ftp_account", selectedFtpId);

            formData.forEach((value, key) => {
                console.log(`${key}: ${value}`);
            });
            const response = await postWithAuth(`add-category`, formData);

            if (response.status === "success") {
                console.log("template_url : ", response.template_url)
                setExcelGenerated(true)
                setExcelGeneratedLink(response.template_url)

                // handleCloseModal("addCategory");
                setCategoryName("")
                setDescription("")
                setSelectedCategoryId("")
                setSelectedFtpId("")

                setToastType("success");
                setToastMessage("Category added successfully!");
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                }, 5000);
                fetchCategoryChildrenData(setDummyData);
                fetchCategoryData(setCategoryDropDownData);
            } else {
                handleCloseModal("addCategory");
                setToastType("error");
                setToastMessage("Failed to add category!");
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                }, 5000);
            }
        } catch (error) {
            setToastType("error");
            setToastMessage("Failed to add category!");
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
            }, 5000);
            // console.error("Error new version updating:", error);
        }
    };

    const handleAddChildCategory = async () => {
        try {
            const formData = new FormData();
            formData.append("parent_category", selectedParentId?.toString() || "none");
            formData.append("category_name", category_name || "");
            formData.append("description", description);

            formData.append("attribute_data", JSON.stringify(attributeData))
            formData.append("ftp_account", selectedFtpId);

            formData.forEach((value, key) => {
                console.log(`${key}: ${value}`);
            });


            const response = await postWithAuth(`add-category`, formData);
            if (response.status === "success") {

                console.log("template_url : ", response.template_url)
                setExcelGenerated(true)
                setExcelGeneratedLink(response.template_url)

                setCategoryName("")
                setDescription("")
                setSelectedCategoryId("")
                setSelectedFtpId("")

                // handleCloseModal("addChildCategory");
                setToastType("success");
                setToastMessage("Child category added successfully!");
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                }, 5000);
                fetchCategoryChildrenData(setDummyData);
                fetchCategoryData(setCategoryDropDownData);
            } else {
                handleCloseModal("addChildCategory");
                setToastType("error");
                setToastMessage("Failed to add child category!");
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                }, 5000);
            }
        } catch (error) {
            setToastType("error");
            setToastMessage("Failed to add child category!");
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
            }, 5000);
            // console.error("Error new version updating:", error);
        }
    };

    const fetchCategoryDetails = async () => {
        // console.log("edit", selectedItemId);
        try {
            const response = await getWithAuth(`category-details/${selectedItemId}`);
            if (response.status === "fail") {
                // console.log("category data fail::: ",response)
            } else {
                // console.log("Validated Attributes (Array)---", response.attributes.attributes); 
                let attributesList: string[] = [];
                if (Array.isArray(response.attributes.attributes)) {
                    attributesList = response.attributes.attributes;
                    // console.log("Validated (Array)---", attributesList); 

                } else if (typeof response.attributes.attributes === "string") {
                    try {
                        attributesList = JSON.parse(response.attributes.attributes);
                    } catch (error) {
                        console.error("Failed to parse attributes string:", error);
                    }
                }

                // console.log("Validated Attributes (Array)---", attributes); 

                const parsedAttributes = attributesList
                    .map((attr: string) => {
                        const cleaned = attr.replace(/,/g, "").trim();
                        // console.log("Cleaned Attribute---", cleaned); 
                        return cleaned;
                    })
                    .filter((attr: string) => attr);

                setattributeData(parsedAttributes);
                setEditData(response);
                console.log("category data::: ", response);
            }
        } catch (error) {
            console.error("Error new version updating:", error);
        }
    };

    const handleEditCategory = async () => {
        try {
            const formData = new FormData();
            formData.append("parent_category", editData.parent_category || "");
            formData.append("category_name", editData.category_name || "");
            formData.append("description", editData.description);
            formData.append("attribute_data", JSON.stringify(attributeData));
            formData.append("ftp_account", selectedFtpId);

            formData.forEach((value, key) => {
                console.log(`${key}: ${value}`);
            });

            const response = await postWithAuth(
                `category-details/${selectedItemId}`,
                formData
            );
            if (response.status === "success") {
                handleCloseModal("editModel");
                setToastType("success");
                setToastMessage("Category updated successfully!");
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                }, 5000);

                fetchCategoryChildrenData(setDummyData);
                fetchCategoryData(setCategoryDropDownData);
            } else {
                handleCloseModal("editModel");
                setToastType("error");
                setToastMessage("Failed to update category!");
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                }, 5000);
            }
        } catch (error) {
            setToastType("error");
            setToastMessage("Failed to update category!");
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
            }, 5000);
            // console.error("Error new version updating:", error);
        }
    };

    const handleDeleteCategory = async () => {
        // console.log("delete", selectedItemId);
        try {
            const response = await deleteWithAuth(
                `delete-category/${selectedItemId}`
            );
            if (response.status === "success") {
                handleCloseModal("deleteModel");
                setToastType("success");
                setToastMessage("Category disabled successfully!");
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                }, 5000);
                fetchCategoryChildrenData(setDummyData);
                fetchCategoryData(setCategoryDropDownData);
            } else {
                handleCloseModal("deleteModel");
                setToastType("error");
                setToastMessage("Failed to disable category!");
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                }, 5000);
            }
        } catch (error) {
            handleCloseModal("deleteModel");
            setToastType("error");
            setToastMessage("Failed to disable category!");
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
            }, 5000);
            // console.error("Error new version updating:", error);
        }
    };

    return (
        <>
            <DashboardLayoutSuperAdmin>
                <div className="d-flex flex-column flex-lg-row justify-content-lg-between align-items-lg-center pt-2">
                    <Heading text="Document Categories" color="#444" />

                    <div className="d-flex mt-2 mt-lg-0">
                        <button
                            onClick={() => handleOpenModal("addCategory")}
                            className="addButton bg-white text-dark border border-success rounded px-3 py-1"
                        >
                            <FaPlus className="me-1" /> Add Document Category
                        </button>

                    </div>
                </div>
                <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
                    <div>
                        <div
                            style={{ maxHeight: "380px", overflowY: "auto" }}
                            className="custom-scroll"
                        >
                            <Table responsive>
                                <thead className="sticky-header">
                                    <tr>
                                        <th className="text-center" style={{ width: "10%" }}></th>
                                        <th className="text-start" style={{ width: "20%" }}>
                                            Action
                                        </th>
                                        <th className="text-start" style={{ width: "70%" }}>
                                            Name
                                        </th>
                                        <th className="text-start" style={{ width: "70%" }}>
                                            Template
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData.length > 0 ? (
                                        paginatedData.map((item) => (
                                            <React.Fragment key={item.id}>
                                                <tr className="border-bottom" >
                                                    <td className="border-0">
                                                        <button
                                                            onClick={() => toggleCollapse(item.id)}
                                                            className="custom-icon-button text-secondary"
                                                        >
                                                            {collapsedRows[item.id] ? (
                                                                <MdOutlineKeyboardDoubleArrowDown
                                                                    fontSize={20}
                                                                />
                                                            ) : (
                                                                <MdOutlineKeyboardDoubleArrowRight
                                                                    fontSize={20}
                                                                />
                                                            )}
                                                        </button>
                                                    </td>
                                                    <td className="border-0">
                                                        <div className="d-flex flex-row">

                                                            <button
                                                                onClick={() => {
                                                                    handleOpenModal("editModel");
                                                                    setSelectedItemId(item.id);
                                                                }}
                                                                className="custom-icon-button button-success px-3 py-1 rounded me-2"
                                                            >
                                                                <MdOutlineEdit fontSize={16} className="me-1" />{" "}
                                                                Edit
                                                            </button>

                                                            <button
                                                                onClick={() => {
                                                                    handleOpenModal("deleteModel");
                                                                    setSelectedItemId(item.id);
                                                                }}
                                                                className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
                                                            >
                                                                <AiOutlineDelete
                                                                    fontSize={16}
                                                                    className="me-1"
                                                                />{" "}
                                                                Disable
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="border-0">
                                                        <div className="d-flex flex-row align-items-center">
                                                            {item.category_name}
                                                            <span className={`ms-2 mb-0 badge ${item.status === 'active' ? 'active-badge' : 'inactive-badge'}`}>
                                                                {item.status}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="border-0">
                                                        <div className="col-12 col-lg-12 d-flex flex-column mt-2 pe-2">
                                                            <a href={item.template} download style={{ color: "#333" }} className="d-flex flex-row align-items-center ms-0 ">
                                                                <div className="d-flex flex-row align-items-center custom-icon-button button-success px-3 py-1 rounded ">
                                                                    <IoMdCloudDownload />
                                                                    <p className="ms-3 mb-0">Download Template</p>
                                                                </div>
                                                            </a>
                                                        </div>
                                                    </td>

                                                </tr>

                                                {collapsedRows[item.id] && (
                                                    <tr>
                                                        <td
                                                            colSpan={3}
                                                            style={{
                                                                paddingLeft: "10%",
                                                                paddingRight: "10%",
                                                            }}
                                                        >
                                                            <table className="table rounded">
                                                                <thead>
                                                                    <tr className="border-bottom" >
                                                                        <td colSpan={2}>
                                                                            <div className="d-flex flex-column flex-lg-row justify-content-lg-between align-items-lg-center">
                                                                                <div className="col-lg-auto pe-lg-3 mb-2 mb-lg-0">
                                                                                    <Paragraph
                                                                                        color="#333"
                                                                                        text="Child Categories"
                                                                                    />
                                                                                </div>
                                                                                <div className="col-lg-7 text-end">

                                                                                    <button
                                                                                        onClick={() => {
                                                                                            handleOpenModal(
                                                                                                "addChildCategory"
                                                                                            );
                                                                                            setSelectedParentId(item.id);
                                                                                        }}
                                                                                        className="addButton bg-success text-white border border-success rounded px-3 py-1"
                                                                                    >
                                                                                        <FaPlus className="me-1" /> Add Child Category
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <th className="text-start">Actions</th>
                                                                        <th className="text-start">Name</th>
                                                                        <th className="text-start">
                                                                            Template
                                                                        </th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {item.children && item.children.length > 0 ? (
                                                                        item.children.map((child) => (
                                                                            <tr key={child.id} className="border-bottom" >
                                                                                <td className=" border-0">
                                                                                    <div className="d-flex flex-row">
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                handleOpenModal("editModel");
                                                                                                setSelectedItemId(child.id);
                                                                                            }}
                                                                                            className="custom-icon-button button-success px-3 py-1 rounded me-2"
                                                                                        >
                                                                                            <MdOutlineEdit
                                                                                                fontSize={16}
                                                                                                className="me-1"
                                                                                            />{" "}
                                                                                            Edit
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                handleOpenModal("deleteModel");
                                                                                                setSelectedItemId(child.id);
                                                                                            }}
                                                                                            className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
                                                                                        >
                                                                                            <AiOutlineDelete
                                                                                                fontSize={16}
                                                                                                className="me-1"
                                                                                            />{" "}
                                                                                            Disable
                                                                                        </button>
                                                                                    </div>
                                                                                </td>
                                                                                <td className="border-0">
                                                                                    {child.category_name}
                                                                                    <span className={`ms-2 mb-0 badge ${item.status === 'active' ? 'active-badge' : 'inactive-badge'}`}>
                                                                                        {item.status}
                                                                                    </span>
                                                                                </td>
                                                                                <td className=" border-0">
                                                                                    <div className="col-12 col-lg-12 d-flex flex-column pe-2">
                                                                                        <a href={child.template} download style={{ color: "#333" }} className="d-flex flex-row align-items-center ms-0 ">
                                                                                            <div className="d-flex flex-row align-items-center custom-icon-button button-success px-3 py-1 rounded ">
                                                                                                <IoMdCloudDownload />
                                                                                                <p className="ms-3 mb-0">Download Template</p>
                                                                                            </div>
                                                                                        </a>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        ))
                                                                    ) : (
                                                                        <tr>
                                                                            <td
                                                                                colSpan={2}
                                                                                className="text-center py-3"
                                                                            >
                                                                                No child categories available.
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="text-start w-100 py-3">
                                                <Paragraph text="No data available" color="#333" />
                                            </td>
                                        </tr>
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
                                Add New Category
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
                        style={{ maxHeight: "450px", overflowY: "auto" }}
                    >
                        <div className="col-12 col-lg-12 d-flex flex-column mb-2 pe-2">
                            <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                                Parent Category
                            </p>
                            <DropdownButton
                                id="dropdown-category-button"
                                title={
                                    selectedCategoryId === "none"
                                        ? "None"
                                        : categoryDropDownData.find(
                                            (item) => item.id.toString() === selectedCategoryId
                                        )?.category_name || "Select Category"
                                }
                                className="custom-dropdown-text-start text-start w-100"
                                onSelect={(value) => handleCategorySelect(value || "")}
                            >
                                <Dropdown.Item
                                    key="none"
                                    eventKey="none"
                                    style={{
                                        fontWeight: "bold",
                                        marginLeft: "0px",
                                    }}
                                >
                                    None
                                </Dropdown.Item>
                                {categoryDropDownData
                                    .filter((category) => category.parent_category === "none")
                                    .map((category) => (
                                        <Dropdown.Item
                                            key={category.id}
                                            eventKey={category.id.toString()}
                                            style={{
                                                fontWeight: "bold",
                                                marginLeft: "0px",
                                            }}
                                        >
                                            {category.category_name}
                                        </Dropdown.Item>
                                    ))}
                            </DropdownButton>
                        </div>
                        <div className="col-12 col-lg-12 d-flex flex-column mb-2 pe-2">
                            <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                                Category Name
                            </p>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={category_name}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                />
                            </div>
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
                                        : "Select FTP Account"
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
                        </div>
                        <div className="col-12 col-lg-12 d-flex flex-column mb-2 pe-2">
                            <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                                Description
                            </p>
                            <textarea
                                className="form-control"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div className="col-12 col-lg-12 d-flex flex-column ps-lg-2 pe-2">
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
                                            borderTopRightRadius: "0px !important",
                                            borderBottomRightRadius: "0px !important",
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
                        {
                            excelGenerated && (
                                <div className="col-12 col-lg-12 d-flex flex-column ps-lg-2 pe-2">
                                    <a href={excelGeneratedLink} download style={{ color: "#333" }} className="d-flex flex-row align-items-center ms-0 ">
                                        <div className="d-flex flex-row align-items-center custom-icon-button button-success px-3 py-1 rounded ">
                                            <IoMdCloudDownload />
                                            <p className="ms-3 mb-0">Download Template</p>
                                        </div>
                                    </a>
                                </div>
                            )
                        }
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

            {/* add child */}
            <Modal
                centered
                show={modalStates.addChildCategory}
                onHide={() => {
                    handleCloseModal("addChildCategory");
                }}
            >
                <Modal.Header>
                    <div className="d-flex w-100 justify-content-end">
                        <div className="col-11 d-flex flex-row">
                            <IoFolder fontSize={20} className="me-2" />
                            <p className="mb-0" style={{ fontSize: "16px", color: "#333" }}>
                                Add New Category
                            </p>
                        </div>
                        <div className="col-1 d-flex justify-content-end">
                            <IoClose
                                fontSize={20}
                                style={{ cursor: "pointer" }}
                                onClick={() => handleCloseModal("addChildCategory")}
                            />
                        </div>
                    </div>
                </Modal.Header>
                <Modal.Body className="py-3">
                    <div
                        className="d-flex flex-column custom-scroll mb-3"
                        style={{ maxHeight: "450px", overflowY: "auto" }}
                    >
                        <div className="col-12 col-lg-12 d-flex flex-column mb-2">
                            <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                                Parent Category
                            </p>
                            <DropdownButton
                                id="dropdown-category-button"
                                title={
                                    selectedCategoryId.toString() === "none"
                                        ? "None"
                                        : selectedCategoryId
                                            ? categoryDropDownData.find(
                                                (item) => item.id.toString() === selectedCategoryId
                                            )?.category_name || "Select Category"
                                            : "Select Category"
                                }
                                className="custom-dropdown-text-start text-start w-100"
                                onSelect={(value) => handleCategorySelect(value || "none")}
                            >
                                <Dropdown.Item
                                    key="none"
                                    eventKey="none"
                                    style={{
                                        fontWeight: "bold",
                                        marginLeft: "0px",
                                    }}
                                >
                                    None
                                </Dropdown.Item>
                                {categoryDropDownData
                                    .filter((category) => category.parent_category === "none")
                                    .map((category) => (
                                        <Dropdown.Item
                                            key={category.id}
                                            eventKey={category.id.toString()}
                                            style={{
                                                fontWeight: "bold",
                                                marginLeft: "0px",
                                            }}
                                        >
                                            {category.category_name}
                                        </Dropdown.Item>
                                    ))}
                            </DropdownButton>
                        </div>
                        <div className="col-12 col-lg-12 d-flex flex-column mb-2">
                            <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                                Category Name
                            </p>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={category_name}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                />
                            </div>
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
                                        : "Select FTP Account"
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
                        </div>
                        <div className="col-12 col-lg-12 d-flex flex-column mb-2">
                            <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                                Description
                            </p>
                            <textarea
                                className="form-control"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div className="col-12 col-lg-12 d-flex flex-column ps-lg-2 pe-2">
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
                                            borderTopRightRadius: "0px !important",
                                            borderBottomRightRadius: "0px !important",
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
                        {
                            excelGenerated && (
                                <div className="col-12 col-lg-12 d-flex flex-column ps-lg-2 pe-2">
                                    <a href={excelGeneratedLink} download style={{ color: "#333" }} className="d-flex flex-row align-items-center ms-0 ">
                                        <div className="d-flex flex-row align-items-center custom-icon-button button-success px-3 py-1 rounded ">
                                            <IoMdCloudDownload />
                                            <p className="ms-3 mb-0">Download Template</p>
                                        </div>
                                    </a>
                                </div>
                            )
                        }
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <div className="d-flex flex-row">
                        <button
                            onClick={() => handleAddChildCategory()}
                            className="custom-icon-button button-success px-3 py-1 rounded me-2"
                        >
                            <IoSaveOutline fontSize={16} className="me-1" /> Save
                        </button>
                        <button
                            onClick={() => {
                                handleCloseModal("addChildCategory");
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
                        style={{ maxHeight: "300px", overflowY: "auto" }}
                    >
                        <div className="col-12 col-lg-12 d-flex flex-column mb-2">
                            <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                                Parent Category
                            </p>
                            <DropdownButton
                                id="dropdown-category-button"
                                title={
                                    editData.parent_category === "none"
                                        ? "None"
                                        : categoryDropDownData.find(
                                            (item) =>
                                                item.id.toString() === editData.parent_category
                                        )?.category_name || "Select Category"
                                }
                                className="custom-dropdown-text-start text-start w-100"
                                onSelect={(value) => handleEditCategorySelect(value || "")}
                            >
                                <Dropdown.Item
                                    key="none"
                                    eventKey="none"
                                    style={{
                                        fontWeight: "bold",
                                        marginLeft: "0px",
                                    }}
                                >
                                    None
                                </Dropdown.Item>

                                {categoryDropDownData
                                    .filter((category) => category.parent_category === "none")
                                    .map((category) => (
                                        <Dropdown.Item
                                            key={category.id}
                                            eventKey={category.id.toString()}
                                            style={{
                                                fontWeight: "bold",
                                                marginLeft: "0px",
                                            }}
                                        >
                                            {category.category_name}
                                        </Dropdown.Item>
                                    ))}
                            </DropdownButton>
                        </div>
                        <div className="col-12 col-lg-12 d-flex flex-column mb-2">
                            <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                                Category Name
                            </p>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={editData.category_name}
                                    onChange={(e) =>
                                        setEditData((prevData) => ({
                                            ...prevData,
                                            category_name: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>
                        <div className="col d-flex flex-column justify-content-center align-items-center p-0 px-3 px-lg-0 mb-2">
                            <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                                FTP Account
                            </p>
                            <DropdownButton
                                id="dropdown-category-button"
                                title={
                                    selectedFtpId
                                        ? ftpAccountData.find(
                                            (item) => item.id.toString() === selectedFtpId
                                        )?.name
                                        : "Select FTP Account"
                                }
                                className="custom-dropdown-text-start text-start w-100"
                                onSelect={(value) => handleFtpAccSelect(value || "")}
                            >
                                {ftpAccountData && ftpAccountData.length > 0 ? (
                                    ftpAccountData.map((ftp) => (
                                        <Dropdown.Item
                                            key={ftp.id}
                                            eventKey={ftp.id.toString()}
                                        >
                                            {ftp.name}
                                        </Dropdown.Item>
                                    ))
                                ) : (
                                    <Dropdown.Item disabled>No FTP Accounts Available</Dropdown.Item>
                                )}
                            </DropdownButton>
                        </div>

                        <div className="col-12 col-lg-12 d-flex flex-column mb-2">
                            <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                                Description
                            </p>
                            <textarea
                                className="form-control"
                                value={editData.description}
                                onChange={(e) =>
                                    setEditData((prevData) => ({
                                        ...prevData,
                                        description: e.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="col-12 col-lg-12 d-flex flex-column ps-lg-2">
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
                        {
                            editData.template && (
                                <div className="col-12 col-lg-12 d-flex flex-column pe-2">
                                    <a href={editData.template} download style={{ color: "#333" }} className="d-flex flex-row align-items-center ms-0 ">
                                        <div className="d-flex flex-row align-items-center custom-icon-button button-success px-3 py-1 rounded ">
                                            <IoMdCloudDownload />
                                            <p className="ms-3 mb-0">Download Template</p>
                                        </div>
                                    </a>
                                </div>
                            )
                        }

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
                                    Are you sure you want to disable?
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
