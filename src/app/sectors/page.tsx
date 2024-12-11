/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Heading from "@/components/common/Heading";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ToastMessage from "@/components/common/Toast";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import { deleteWithAuth, getWithAuth, postWithAuth } from "@/utils/apiClient";
import { fetchSectorData } from "@/utils/dataFetchFunctions";
import React, { useEffect, useState } from "react";
import {  Modal } from "react-bootstrap";
import { FaPlus } from "react-icons/fa6";
import { IoCheckmark, IoClose, IoPencil, IoSaveOutline, IoTrash } from "react-icons/io5";

interface Sector {
    id: number;
    sector_name: string;
}


export default function Sectors() {
    const isAuthenticated = useAuth();
    const [showToast, setShowToast] = useState(false);
    const [toastType, setToastType] = useState<"success" | "error">("success");
    const [toastMessage, setToastMessage] = useState("");
    const [sectorsData, setSectorsData] = useState<Sector[]>([]);
    const [subcategories, setSubcategories] = useState<{ [key: number]: any[] }>({});
    const [sectorName, setSectorName] = useState("");
    const [selectedSectorName, setSelectedSectorName] = useState("");
    // const [parentCategory, setParentCategory] = useState("");
    // const [parentCategoryID, setParentCategoryID] = useState("");
    const [seletecSectorID, setSeletecSectorID] = useState("");
    const [errors, setErrors] = useState<any>({});
    const [modalStates, setModalStates] = useState({
        addSectorCategoryModel: false,
        addChildSectorCategoryModel: false,
        editSectorCategoryModel: false,
        deleteSectorCategoryModel: false,
    });
    const [sectorEditData, setSectorEditData] = useState({
        id: 0,
        parent_sector: "",
        sector_name: "",
      });
      


    const handleOpenModal = (
        modalName: keyof typeof modalStates,
        sectorId?: string,
        sectorName?: string,
        sectorParentId?: string
    ) => {
        if (sectorId) setSeletecSectorID(sectorId);
        if (sectorName) setSelectedSectorName(sectorName!);
        if (sectorParentId) setSelectedSectorName(sectorParentId!);


        setModalStates((prev) => ({ ...prev, [modalName]: true }));
    };

    const handleCloseModal = (modalName: keyof typeof modalStates) => {
        setModalStates((prev) => ({ ...prev, [modalName]: false }));
    };

    useEffect(() => {
        fetchSectorData(setSectorsData);
    }, []);

    const fetchSectorDataData = async (id: string) => {
        try {
            const response = await getWithAuth(`sector-details/${id}`);

            console.log("sector - 1:", response);

            setSectorName(response.sector_name);
            setSectorEditData(response);


        } catch (error) {
            console.error("Failed to fetch documents data:", error);
        }
    };

    useEffect(() => {
        console.log("DOC ID:", seletecSectorID)
        if (modalStates.editSectorCategoryModel && seletecSectorID !== null) {
            fetchSectorDataData(seletecSectorID);
        }
    }, [modalStates.editSectorCategoryModel, seletecSectorID]);


    const handleChangeSectorName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSectorName(e.target.value);
    };
    // const getRandomLightColor = (): string => {
    //     let r = Math.floor(Math.random() * 128 + 127);
    //     let g = Math.floor(Math.random() * 128 + 127);
    //     let b = Math.floor(Math.random() * 128 + 127);

    //     while (r === g || g === b || r === b) {
    //         r = Math.floor(Math.random() * 128 + 127);
    //         g = Math.floor(Math.random() * 128 + 127);
    //         b = Math.floor(Math.random() * 128 + 127);
    //     }

    //     return `rgb(${r}, ${g}, ${b})`;
    // };

    // const groupedSectors = sectorsData.reduce<Record<string, Sector[]>>(
    //     (acc, sector) => {
    //         const parentId = sector.parent_sector;
    //         if (!acc[parentId]) {
    //             acc[parentId] = [];
    //         }
    //         acc[parentId].push(sector);
    //         return acc;
    //     },
    //     {}
    // );

    // const handleParentSelect = (eventKey: string | null) => {
    //     if (!eventKey) {
    //         console.warn("No eventKey provided");
    //         return;
    //     }
    //     const selectedData = JSON.parse(eventKey);
    //     setParentCategory(selectedData.sector_name);
    //     setParentCategoryID(selectedData.id);
    //     console.log("Selected sector ID:", selectedData.id);
    // };


    const handleGetSubCategoryData = async (id: number) => {
        try {
            const response = await getWithAuth(`sectors/${id}`);
            console.log("sectors data: ", response);
            if (Array.isArray(response)) {
                setSubcategories((prev) => ({
                    ...prev,
                    [id]: response,
                }));
            } else {
                console.error("Response is not a valid array");
            }
        } catch (error) {
            console.error("Error getting sectors: ", error);
        }
    };

    const handleEditSectorCategory = async (id: string) => {
    
        try {
    
          const formData = new FormData();
          formData.append("parent_sector", sectorEditData?.parent_sector);
          formData.append("sector_name", sectorName);
    
          const response = await postWithAuth(`sector-details/${id}`, formData);
    
          if (response.status === "success") {
            setToastType("success");
            setToastMessage("Sector updated successfully!");
            setShowToast(true);
            fetchSectorDataData(id);
            fetchSectorData(setSectorsData);
            setTimeout(() => {
              setShowToast(false);
            }, 5000);
            handleCloseModal("editSectorCategoryModel");
          } else {
            setToastType("error");
            setToastMessage("Error updating sector.");
            setShowToast(true);
            setTimeout(() => {
              setShowToast(false);
            }, 5000);
          }
        } catch (error) {
          console.error("Error updating sector:", error);
        }
      };

    const handleDeleteSubCategoryData = async (id: string) => {
        try {
            const response = await deleteWithAuth(`delete-sector/${id}`);
            console.log("sectors data: ", response);
            if (response.status === "success") {
                setToastType("success");
                handleCloseModal("deleteSectorCategoryModel");
                fetchSectorData(setSectorsData);
                setToastMessage("Delete Sector successfull!");
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                }, 5000);


            } else {
                setToastType("error");
                setToastMessage("Error occurred while delete sector!");
                setShowToast(true);
                handleCloseModal("deleteSectorCategoryModel");
                setTimeout(() => {
                    setShowToast(false);
                }, 5000);
            }

        } catch (error) {
            console.error("Error getting sectors: ", error);
        }
    };


    const validate = () => {
        const validationErrors: any = {};

        if (!sectorName) {
            validationErrors.sectorName = "Sector Name is required.";
        }

        return validationErrors;
    };

    const handleAddSectorCategory = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        try {
            const formData = new FormData();
            formData.append("parent_sector", "none");
            formData.append("sector_name", sectorName);

            for (const [key, value] of formData.entries()) {
                console.log(`Document share: ${key}: ${value}`);
            }
            const response = await postWithAuth(`add-sector`, formData);
            console.log("add sector successfully:", response);

            if (response.status === "success") {
                setToastType("success");
                handleCloseModal("addSectorCategoryModel");
                fetchSectorData(setSectorsData);
                setToastMessage("Add Sector successfull!");
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                }, 5000);


            } else {
                setToastType("error");
                setToastMessage("Error occurred while add sector!");
                setShowToast(true);
                handleCloseModal("addSectorCategoryModel");
                setTimeout(() => {
                    setShowToast(false);
                }, 5000);
            }
        } catch (error) {
            console.error("Error deleting document:", error);
            setToastType("error");
            setToastMessage("Error occurred while add sector!");
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
            }, 5000);
        }
    };

    const handleAddChildSectorCategory = async (parentId:string) => {

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        try {
            const formData = new FormData();
            formData.append("parent_sector", parentId);
            formData.append("sector_name", sectorName);

            for (const [key, value] of formData.entries()) {
                console.log(`Document share: ${key}: ${value}`);
            }
            const response = await postWithAuth(`add-sector`, formData);
            console.log("add sector successfully:", response);

            if (response.status === "success") {
                setToastType("success");
                handleCloseModal("addSectorCategoryModel");
                fetchSectorData(setSectorsData);
                setToastMessage("Add Sector successfull!");
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                }, 5000);


            } else {
                setToastType("error");
                setToastMessage("Error occurred while add sector!");
                setShowToast(true);
                handleCloseModal("addSectorCategoryModel");
                setTimeout(() => {
                    setShowToast(false);
                }, 5000);
            }
        } catch (error) {
            console.error("Error deleting document:", error);
            setToastType("error");
            setToastMessage("Error occurred while add sector!");
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
            <DashboardLayout>
                <div className="d-flex justify-content-between align-items-center pt-2">
                    <div className="d-flex flex-row align-items-center">
                        <Heading text="Sector Categories" color="#444" />
                    </div>
                    <div className="d-flex flex-row">
                        <button
                            onClick={() => {
                                handleOpenModal("addSectorCategoryModel");
                            }}
                            className="addButton me-2 bg-white text-dark border border-success rounded px-3 py-1"
                        >
                            <FaPlus className="me-1" /> Add Sector Category
                        </button>
                    </div>
                </div>
                <div
                    className="d-flex flex-column  p-2 p-lg-3  mt-3 position-relative  custom-scroll"
                    style={{ borderRadius: "8px", maxHeight: "calc(100vh - 100px)", overflowY: "auto" }}
                >
                    {sectorsData.map((parentSector) => {
                        return (
                            <div
                                className="d-flex flex-column w-100 mb-5 bg-white shadow rounded p-2 p-lg-3"
                                key={parentSector.id}
                            >
                                <div className="d-flex w-100 flex-column flex-lg-row">
                                    <div className="d-flex p-1 col-12 col-lg-8">
                                        <div
                                            className="text-center w-100"
                                            style={{
                                                backgroundColor: "#F5D69C",
                                                padding: "0px",
                                                borderRadius: "8px",
                                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                            }}
                                        >
                                            <h3
                                                style={{
                                                    color: "#333",
                                                    marginBottom: "10px",
                                                    padding: "10px",
                                                    fontSize: "16px",
                                                }}
                                            >
                                                Name
                                            </h3>
                                            <div
                                                style={{
                                                    backgroundColor: "#ffffffaa",
                                                    padding: "10px",
                                                    borderRadius: "8px",
                                                    color: "black",
                                                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                                    cursor: "pointer",
                                                }}
                                                onClick={() => handleGetSubCategoryData(parentSector.id)}
                                            >
                                                <h5 style={{ fontSize: "16px" }}>
                                                    {parentSector.sector_name}
                                                </h5>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex p-1 col-12 col-lg-4">
                                        <div
                                            className="text-center w-100"
                                            style={{
                                                backgroundColor: "#F5D69C",
                                                padding: "0px",
                                                borderRadius: "8px",
                                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                            }}
                                        >
                                            <h3
                                                style={{
                                                    color: "#333",
                                                    padding: "10px",
                                                    fontSize: "16px",
                                                    fontWeight: "600",
                                                }}
                                            >
                                                Action
                                            </h3>
                                            <div
                                                style={{
                                                    backgroundColor: "#ffffff88",
                                                    padding: "10px",
                                                    borderRadius: "8px",
                                                    color: "black",
                                                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                                }}
                                                className="d-flex flex-row justify-content-center align-items-center"
                                            >
                                                <button
                                                    onClick={() => { handleOpenModal("editSectorCategoryModel", parentSector.id.toString()) }}
                                                    className="custom-icon-button button-success px-3 py-1 rounded me-2"
                                                >
                                                    <IoPencil fontSize={16} className="me-1" /> Edit
                                                </button>
                                                <button
                                                    onClick={() => { handleOpenModal("deleteSectorCategoryModel", parentSector.id.toString(), parentSector.sector_name) }}
                                                    className="custom-icon-button button-danger px-3 py-1 rounded me-2"
                                                >
                                                    <IoTrash fontSize={16} className="me-1" /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex w-100 justify-content-end pt-3">
                                    <button
                                        onClick={() => {
                                            handleOpenModal("addChildSectorCategoryModel", parentSector.id.toString())
                                        }}
                                        className="custom-icon-button button-success px-3 py-1 rounded me-2"
                                    >
                                        <FaPlus className="me-1" /> Add Child Category
                                    </button>
                                </div>
                                {subcategories[parentSector.id] && (
                                    <div className="w-100 mt-2 d-flex flex-column">
                                        <h3
                                            style={{
                                                color: "#333",
                                                marginBottom: "10px",
                                                padding: "10px",
                                                fontSize: "16px",
                                            }}
                                        >
                                            Sub Category : {parentSector.sector_name}
                                        </h3>

                                        <div className="d-flex flex-column p-2 p-lg-3 mt-3 position-relative custom-scroll">
                                            <div className="d-flex flex-column flex-lg-row w-100 mb-3">
                                                <div className="d-flex p-1 col-12 col-lg-8">
                                                    <div
                                                        className="text-center w-100"
                                                        style={{
                                                            backgroundColor: "#E5EB9A",
                                                            padding: "0px",
                                                            borderRadius: "8px",
                                                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                                        }}
                                                    >
                                                        <h3
                                                            style={{
                                                                color: "#333",
                                                                marginBottom: "10px",
                                                                padding: "10px",
                                                                fontSize: "16px",
                                                            }}
                                                        >
                                                            Name
                                                        </h3>
                                                        {subcategories[parentSector.id]?.map((sub) => (
                                                            <div
                                                                key={sub.id}
                                                                style={{ marginBottom: "5px" }}
                                                                className="d-flex flex-column flex-lg-row w-100"
                                                            >
                                                                <div className="d-flex col-12">
                                                                    <div
                                                                        className="text-center w-100"
                                                                        style={{
                                                                            backgroundColor: "#ffffffaa",
                                                                            padding: "10px",
                                                                            borderRadius: "8px",
                                                                            color: "black",
                                                                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                                                            cursor: "pointer",
                                                                        }}
                                                                        onClick={() => handleGetSubCategoryData(parentSector.id)}
                                                                    >
                                                                        <h5 style={{ fontSize: "16px" }}>
                                                                            {sub.name || sub.sector_name}
                                                                        </h5>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="d-flex p-1 col-12 col-lg-4">
                                                    <div
                                                        className="text-center w-100"
                                                        style={{
                                                            backgroundColor: "#E5EB9A",
                                                            padding: "0px",
                                                            borderRadius: "8px",
                                                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                                        }}
                                                    >
                                                        <h3
                                                            style={{
                                                                color: "#333",
                                                                padding: "10px",
                                                                fontSize: "16px",
                                                                fontWeight: "600",
                                                            }}
                                                        >
                                                            Action
                                                        </h3>
                                                        {subcategories[parentSector.id]?.map((sub) => (
                                                            <div
                                                                key={sub.id}
                                                                style={{ marginBottom: "5px" }}
                                                                className="d-flex flex-column flex-lg-row w-100"
                                                            >
                                                                <div className="d-flex col-12">
                                                                    <div
                                                                        style={{
                                                                            backgroundColor: "#ffffff88",
                                                                            padding: "10px",
                                                                            borderRadius: "8px",
                                                                            color: "black",
                                                                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                                                        }}
                                                                        className="d-flex flex-row justify-content-center align-items-center text-center w-100">
                                                                        <button
                                                                             onClick={() => { handleOpenModal("editSectorCategoryModel", sub.id.toString()) }}
                                                                            className="custom-icon-button button-success px-3 py-1 rounded me-2"
                                                                        >
                                                                            <IoPencil fontSize={16} className="me-1" /> Edit
                                                                        </button>
                                                                        <button
                                                                            onClick={() => { handleOpenModal("deleteSectorCategoryModel", sub.id.toString(), parentSector.sector_name) }}
                                                                            className="custom-icon-button button-danger px-3 py-1 rounded ms-2"
                                                                        >
                                                                            <IoTrash fontSize={16} className="me-1" /> Delete
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex w-100 justify-content-end pt-3">
                                            <button
                                                onClick={() => {
                                                    handleOpenModal("addSectorCategoryModel");
                                                }}
                                                className="custom-icon-button button-success px-3 py-1 rounded me-2"
                                            >
                                                <FaPlus className="me-1" /> Add Child Category
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </DashboardLayout>

            {/* add sector model */}
            <Modal
                centered
                show={modalStates.addSectorCategoryModel}
                onHide={() => {
                    handleCloseModal("addSectorCategoryModel");
                }}
            >
                <Modal.Header>
                    <div className="d-flex w-100 justify-content-end">
                        <div className="col-11 d-flex flex-row">
                            <p className="mb-0" style={{ fontSize: "16px", color: "#333" }}>
                                Add Sector Category
                            </p>
                        </div>
                        <div className="col-1">
                            <IoClose
                                fontSize={20}
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                    handleCloseModal("addSectorCategoryModel");
                                }}
                            />
                        </div>
                    </div>
                </Modal.Header>
                <Modal.Body className="py-3 ">
                    <div className="d-flex flex-column custom-scroll mb-3">
                        <div className="col-12 d-flex flex-column">
                            <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                                Sector Name
                            </p>
                            <input
                                type="text"
                                value={sectorName}
                                required
                                className={`form-control ${errors.sectorName ? "is-invalid" : ""}`}
                                onChange={(e) => setSectorName(e.target.value)}
                            />
                            {errors.sectorName && <div style={{ color: "red" }}>{errors.sectorName}</div>}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <div className="d-flex flex-row">
                        <button
                            onClick={handleAddSectorCategory}
                            className="custom-icon-button button-success px-3 py-1 rounded me-2"
                        >
                            <IoSaveOutline fontSize={16} className="me-1" /> Save
                        </button>
                        <button
                            onClick={() => {
                                handleCloseModal("addSectorCategoryModel");
                            }}
                            className="custom-icon-button button-danger px-3 py-1 rounded me-2"
                        >
                            <IoClose fontSize={16} className="me-1" /> Cancel
                        </button>
                    </div>
                </Modal.Footer>
            </Modal>

             {/* add sector model */}
             <Modal
                centered
                show={modalStates.addChildSectorCategoryModel}
                onHide={() => {
                    handleCloseModal("addChildSectorCategoryModel");
                }}
            >
                <Modal.Header>
                    <div className="d-flex w-100 justify-content-end">
                        <div className="col-11 d-flex flex-row">
                            <p className="mb-0" style={{ fontSize: "16px", color: "#333" }}>
                                Add Sector Category
                            </p>
                        </div>
                        <div className="col-1">
                            <IoClose
                                fontSize={20}
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                    handleCloseModal("addChildSectorCategoryModel");
                                }}
                            />
                        </div>
                    </div>
                </Modal.Header>
                <Modal.Body className="py-3 ">
                    <div className="d-flex flex-column custom-scroll mb-3">
                        <div className="col-12 d-flex flex-column">
                            <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                                Sector Name
                            </p>
                            <input
                                type="text"
                                value={sectorName}
                                required
                                className={`form-control ${errors.sectorName ? "is-invalid" : ""}`}
                                onChange={(e) => setSectorName(e.target.value)}
                            />
                            {errors.sectorName && <div style={{ color: "red" }}>{errors.sectorName}</div>}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <div className="d-flex flex-row">
                        <button
                            onClick={()=>handleAddChildSectorCategory(seletecSectorID!)}
                            className="custom-icon-button button-success px-3 py-1 rounded me-2"
                        >
                            <IoSaveOutline fontSize={16} className="me-1" /> Save
                        </button>
                        <button
                            onClick={() => {
                                handleCloseModal("addChildSectorCategoryModel");
                            }}
                            className="custom-icon-button button-danger px-3 py-1 rounded me-2"
                        >
                            <IoClose fontSize={16} className="me-1" /> Cancel
                        </button>
                    </div>
                </Modal.Footer>
            </Modal>

            {/* edit sector model */}
            <Modal
                centered
                show={modalStates.editSectorCategoryModel}
                onHide={() => {
                    handleCloseModal("editSectorCategoryModel");
                }}
            >
                <Modal.Header>
                    <div className="d-flex w-100 justify-content-end">
                        <div className="col-11 d-flex flex-row">
                            <p className="mb-0" style={{ fontSize: "16px", color: "#333" }}>
                                Edit Sector Category
                            </p>
                        </div>
                        <div className="col-1 d-flex justify-content-end">
                            <IoClose
                                fontSize={20}
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                    handleCloseModal("editSectorCategoryModel");
                                }}
                            />
                        </div>
                    </div>
                </Modal.Header>
                <Modal.Body className="py-3 ">
                    <div className="d-flex flex-column custom-scroll mb-3">
                        <div className="col-12 d-flex flex-column">
                            <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                                Sector Name
                            </p>
                            <input
                                type="text"
                                value={sectorName}
                                className={`form-control ${errors.sectorName ? "is-invalid" : ""}`}
                                onChange={handleChangeSectorName}
                            />
                            {errors.sectorName && <div style={{ color: "red" }}>{errors.sectorName}</div>}
                            {/* <p className="mb-1 mt-3 text-start w-100" style={{ fontSize: "14px" }}>
                                Sectors
                            </p> */}
                            {/* <div className="d-flex flex-column position-relative">
                                <DropdownButton
                                    id="dropdown-category-button"
                                    title={parentCategory || "Select"}
                                    className="custom-dropdown-text-start text-start w-100"
                                    onSelect={handleParentSelect}
                                >
                                    {sectorsData.map((sector) => (
                                        <Dropdown.Item
                                            key={sector.id}
                                            eventKey={JSON.stringify({ id: sector.id, sector_name: sector.sector_name })}
                                        >
                                            {sector.sector_name}
                                        </Dropdown.Item>
                                    ))}
                                </DropdownButton>

                            </div> */}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <div className="d-flex flex-row">
                        <button
                            onClick={() => {
                                handleEditSectorCategory(seletecSectorID!)
                                console.log("edit---", seletecSectorID)
                            }}
                            className="custom-icon-button button-success px-3 py-1 rounded me-2"
                        >
                            <IoSaveOutline fontSize={16} className="me-1" /> Save
                        </button>
                        <button
                            onClick={() => {
                                handleCloseModal("editSectorCategoryModel");
                            }}
                            className="custom-icon-button button-danger px-3 py-1 rounded me-2"
                        >
                            <IoClose fontSize={16} className="me-1" /> Cancel
                        </button>
                    </div>
                </Modal.Footer>
            </Modal>


            {/* delete sector model */}
            <Modal
                centered
                show={modalStates.deleteSectorCategoryModel}
                onHide={() => {
                    handleCloseModal("deleteSectorCategoryModel");
                }}
            >
                <Modal.Header>
                    <div className="d-flex w-100 justify-content-end">
                        <div className="col-11 d-flex flex-row">
                            <p className="mb-0" style={{ fontSize: "16px", color: "#333" }}>
                                Are you sure you want to delete?
                            </p>
                        </div>
                        <div className="col-1 d-flex justify-content-end">
                            <IoClose
                                fontSize={20}
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                    handleCloseModal("deleteSectorCategoryModel");
                                }}
                            />
                        </div>
                    </div>
                </Modal.Header>
                <Modal.Body className="py-3 ">
                    <div className="d-flex flex-column custom-scroll mb-3">
                        <div className="col-12 d-flex flex-column">
                            <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                                {selectedSectorName}
                            </p>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <div className="d-flex flex-row">
                        <button
                            onClick={() => {
                                handleDeleteSubCategoryData(seletecSectorID!)
                            }}
                            className="custom-icon-button button-success px-3 py-1 rounded me-2"
                        >
                            <IoCheckmark fontSize={16} className="me-1" /> Yes
                        </button>
                        <button
                            onClick={() => {
                                handleCloseModal("deleteSectorCategoryModel");
                            }}
                            className="custom-icon-button button-danger px-3 py-1 rounded me-2"
                        >
                            <IoClose fontSize={16} className="me-1" /> No
                        </button>
                    </div>
                </Modal.Footer>
            </Modal>


            <ToastMessage
                message={toastMessage}
                show={showToast}
                onClose={() => setShowToast(false)}
                type={toastType}
            />
        </>
    );
}
