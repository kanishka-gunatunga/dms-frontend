/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Heading from "@/components/common/Heading";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import { deleteWithAuth, getWithAuth, postWithAuth } from "@/utils/apiClient";
import React, { useEffect, useState } from "react";
import { IoAdd, IoClose, IoPencil, IoSave, IoTrash } from "react-icons/io5";


interface TreeNodeProps {
    level: number;
    id: number;
    name: string;
    onEdit: (id: number, name: string, parent_sector?: string) => void;
    onDelete: (id: number) => void;
    onAddChild: (parentId: number) => void;
}


const TreeNode: React.FC<TreeNodeProps> = ({ level, id, name, onEdit, onDelete, onAddChild }) => {
    const [childNodes, setChildNodes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const colors = [
        "#F7D8BA",
        "#E1F8DC",
        "#F1A7A1",
        "#BFDEF3",
        "#CAF1DE",
        "#E0B7F4", 
    ];

    const fetchChildren = async () => {
        try {
            setIsLoading(true);
            const response = await getWithAuth(`sectors/${id}`);
            console.log("Children data:", response);
            setChildNodes(response);
            setIsExpanded(true);
        } catch (error) {
            console.error("Failed to fetch child nodes", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleExpand = () => {
        if (!isExpanded) fetchChildren();
        else setIsExpanded(false);
    };

    return (
        <div className={level === 1 ? "shadow rounded-4 p-2 p-lg-3" : ""}
            style={{
                marginLeft: level * 20,
                backgroundColor: "#FFFFFF",
                border: "none",
                margin: "10px 0",
                borderRadius: "5px",
            }}>
            <div className="p-2 rounded-4" >
                <div className="d-flex flex-row mb-3">
                    <div className="d-flex flex-column text-center rounded-4 pt-3 w-100 me-2" style={{ backgroundColor: colors[level % colors.length], }}>
                        <div className="d-flex w-100 justify-content-center text-center position-relative">
                            <p className="" style={{ fontSize: "16px", fontWeight: 500 }}>Name</p>
                        </div>
                        <div className="d-flex p-3 text-center justify-content-center" style={{ backgroundColor: "#ffffff88" }}>
                            <h3 onClick={handleToggleExpand} style={{ cursor: "pointer", fontSize: "16px" }}>
                                <span className="pe-3">{isLoading ? "..." : isExpanded ? name : name}</span>
                            </h3>
                        </div>
                    </div>
                    <div className="d-flex flex-row justify-content-start rounded-4 pt-3 col-auto" style={{ backgroundColor: colors[level % colors.length], }}>
                        <div className="d-flex flex-column justify-content-center align-items-center">
                            <div className="d-flex text-center">
                                <p className="" style={{ fontSize: "16px", fontWeight: 500 }}>Actions</p>
                            </div>
                            <div className="d-flex flex-row px-3 pb-2">
                                <button
                                    onClick={() => onEdit(id, name)}
                                    className="custom-icon-button button-success px-3 py-1 rounded me-2"
                                >
                                    <IoPencil fontSize={16} className="me-1" /> Edit
                                </button>
                                <button
                                    onClick={() => onDelete(id)}
                                    className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
                                >
                                    <IoTrash fontSize={16} className="me-1" /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="d-flex w-100 justify-content-end">
                    <button
                        onClick={() => onAddChild(id)}
                        className="custom-icon-button button-success px-3 py-1 rounded me-2"
                    >
                        <IoAdd className="me-1" />
                        Add Sector Category
                    </button>
                </div>
            </div>
            {isExpanded &&
                childNodes.map((child: any) => (
                    <TreeNode
                        key={child.id}
                        level={level + 1}
                        id={child.id}
                        name={child.sector_name}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onAddChild={onAddChild}
                    />
                ))}
        </div>
    );
};
export default function Sectors() {
    const isAuthenticated = useAuth();

    const [rootNodes, setRootNodes] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<"add" | "edit">("add");
    const [currentNodeId, setCurrentNodeId] = useState<number | null>(null);
    const [nodeName, setNodeName] = useState("");
    const [parentId, setParentId] = useState<string>("none")


    const fetchRootNodes = async () => {
        try {
            const response = await getWithAuth("sectors");
            console.log("Root nodes:", response);
            setRootNodes(response);
        } catch (error) {
            console.error("Failed to fetch root nodes", error);
        }
    };

    useEffect(() => {
        fetchRootNodes();
    }, []);

    const handleOpenModal = async (type: "add" | "edit", id: number | null = null, name: string = "", parentId: string = "none") => {
        setModalType(type);
        setCurrentNodeId(id);
        setNodeName(name);
        console.log("current node id: ", id);
        console.log("current node name: ", name);
        console.log("current node parentId: ", parentId);
        if (type === "edit" && id !== null) {
            try {
                const response = await getWithAuth(`sector-details/${id}`);
                console.log("Fetched sector details:", response);
                setParentId(response.parent_sector || "none");
            } catch (error) {
                console.error("Failed to fetch sector details", error);
            }
        } else {
            setParentId(parentId);
        }

        setModalVisible(true);
    };




    const handleCloseModal = () => {
        setModalVisible(false);
        setNodeName("");
    };

    const handleAddNode = async () => {
        try {
            const formData = new FormData();
            formData.append("parent_sector", parentId);
            formData.append("sector_name", nodeName);
            await postWithAuth("add-sector", formData);
            handleCloseModal();
            handleLoadChildren(parentId)
            fetchRootNodes();
        } catch (error) {
            console.error("Failed to add node", error);
        }
    };

    const handleEditNode = async () => {
        if (currentNodeId === null) {
            console.error("No node selected for editing.");
            return;
        }
        console.log("currentNodeId edit:", currentNodeId)

        try {
            const formData = new FormData();
            formData.append("sector_name", nodeName);
            formData.append("parent_sector", parentId);
            await postWithAuth(`sector-details/${currentNodeId}`, formData);
            handleCloseModal();
            fetchRootNodes();
        } catch (error) {
            console.error("Failed to edit node", error);
        }
    };


    const handleDeleteNode = async (id: number) => {
        try {
            await deleteWithAuth(`delete-sector/${id}`);
            fetchRootNodes();
        } catch (error) {
            console.error("Failed to delete node", error);
        }
    };

    const handleLoadChildren = async (parentId: string) => {
        try {
            const response = await getWithAuth(`sectors/${parentId}`);
            setRootNodes((prev) =>
                prev.map((node) =>
                    node.id === parentId ? { ...node, children: response } : node
                )
            );
        } catch (error) {
            console.error("Error fetching child nodes:", error);
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
                            onClick={() => handleOpenModal("add")}
                            className="addButton me-2 bg-white text-dark border border-success rounded px-3 py-1"
                        >
                            <IoAdd className="me-1" />
                            Add Sector Category
                        </button>
                    </div>
                </div>
                <div className="d-flex flex-column custom-scroll py-5 px-2 px-lg-3" style={{ maxHeight: "calc(100vh - 150px)", overflowY: "auto", }}>
                    {rootNodes.map(rootNode => (
                        <TreeNode
                            key={rootNode.id}
                            level={1}
                            id={rootNode.id}
                            name={rootNode.sector_name}
                            onEdit={(id, name) => handleOpenModal("edit", id, name, rootNode.parent_sector || "none")}
                            onDelete={handleDeleteNode}
                            onAddChild={(id) => handleOpenModal("add", null, "", id.toString())}
                        />

                    ))}

                    {modalVisible && (
                        <div className="modal-sector">
                            <div className="modal-content-sector p-2 px-lg-3 py-lg-3">
                                <h2 style={{ fontSize: "18px" }}>{modalType === "add" ? "Add Sector" : "Edit Sector"}</h2>
                                <input required className="form-control mb-2" type="text" value={nodeName} onChange={e => setNodeName(e.target.value)} placeholder="Enter node name" />
                                {/* <button onClick={modalType === "add" ? handleAddNode : handleEditNode}>
                                    {modalType === "add" ? "Add" : "Save"}
                                </button>
                                <button onClick={handleCloseModal}>Close</button> */}
                                <div className="d-flex flex-row">
                                    <div className="d-flex flex-row pt-5">
                                        <button
                                            onClick={modalType === "add" ? handleAddNode : handleEditNode}
                                            className="custom-icon-button button-success px-3 py-1 rounded me-2"
                                        >
                                            {modalType === "add" ? <IoAdd fontSize={16} className="me-1" /> : <IoSave fontSize={16} className="me-1" />}{modalType === "add" ? "Add" : "Save"}
                                        </button>
                                        <button
                                            onClick={handleCloseModal}
                                            className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
                                        >
                                            <IoClose fontSize={16} className="me-1" /> Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
}
