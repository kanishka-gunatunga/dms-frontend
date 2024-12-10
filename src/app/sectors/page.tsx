"use client";

import Heading from "@/components/common/Heading";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ToastMessage from "@/components/common/Toast";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import { postWithAuth } from "@/utils/apiClient";
import { fetchSectorData } from "@/utils/dataFetchFunctions";
import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa6";



interface Sector {
    id: number;
    parent_sector: string;
    sector_name: string;
}


export default function Sectors() {
    const isAuthenticated = useAuth();
    const [showToast, setShowToast] = useState(false);
    const [toastType, setToastType] = useState<"success" | "error">("success");
    const [toastMessage, setToastMessage] = useState("");
    const [sectorsData, setSectorsData] = useState<Sector[]>([]);



    useEffect(() => {
        fetchSectorData(setSectorsData);
    }, []);

    const getRandomLightColor = (): string => {
        const r = Math.floor(Math.random() * 128 + 127);
        const g = Math.floor(Math.random() * 128 + 127);
        const b = Math.floor(Math.random() * 128 + 127);
        return `rgb(${r}, ${g}, ${b})`;
    };

    const groupedSectors = sectorsData.reduce<Record<string, Sector[]>>((acc, sector) => {
        const parentId = sector.parent_sector;
        if (!acc[parentId]) {
            acc[parentId] = [];
        }
        acc[parentId].push(sector);
        return acc;
    }, {});


    if (!isAuthenticated) {
        return <LoadingSpinner />;
    }

    const handleAddSectorCategory = async () => {

        try {

            const formData = new FormData();
            formData.append("type", 'user');

            for (const [key, value] of formData.entries()) {
                console.log(`Document share: ${key}: ${value}`);
            }
            const response = await postWithAuth(`delete-document`, formData);
            console.log("document deleted successfully:", response);

            if (response.status === "success") {
                setToastType("success");
                setToastMessage("Shares Document successfull!");
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                }, 5000);
            } else {
                setToastType("error");
                setToastMessage("Error occurred while delete shared document!");
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                }, 5000);
            }
        } catch (error) {
            console.error("Error deleting document:", error);
            setToastType("error");
            setToastMessage("Error occurred while delete shared document!");
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
            }, 5000);
        }
    };


    return (
        <>
            <DashboardLayout>
                <div className="d-flex justify-content-between align-items-center pt-2">
                    <div className="d-flex flex-row align-items-center">
                        <Heading text="Sector Categories" color="#444" />
                    </div>
                    <div className="d-flex flex-row">
                        <button onClick={() => handleAddSectorCategory}
                            className="addButton me-2 bg-white text-dark border border-success rounded px-3 py-1"
                        >
                            <FaPlus className="me-1" /> Add Sector Category
                        </button>
                    </div>
                </div>
                <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3 position-relative shadow">
                    {groupedSectors["none"]?.map((parentSector) => (
                        <div
                            key={parentSector.id}
                            style={{
                                backgroundColor: getRandomLightColor(),
                                padding: "0px",
                                borderRadius: "8px",
                                marginBottom: "20px",
                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                            }}
                        >
                            <h3 style={{ color: "#333", marginBottom: "10px",padding: "10px", fontSize: '16px' }}>
                                {parentSector.sector_name}
                            </h3>
                            <div style={{ marginLeft: "20px" }}>
                                {groupedSectors[parentSector.id]?.map((childSector) => (
                                    <div
                                        key={childSector.id}
                                        style={{
                                            backgroundColor: "#ffffffaa",
                                            padding: "10px",
                                            borderRadius: "8px",
                                            marginBottom: "10px",
                                            color: "black",
                                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                        }}
                                    >
                                        <h5 className="" style={{fontSize: '16px'}}>{childSector.sector_name}</h5>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </DashboardLayout>
            <ToastMessage
                message={toastMessage}
                show={showToast}
                onClose={() => setShowToast(false)}
                type={toastType}
            />
        </>
    );
}
