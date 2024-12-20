/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { getWithAuth } from "@/utils/apiClient";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface CompanyProfile {
    id: number;
    title: string;
    logo: string;
    banner: string;
    default_storage: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    logo_url: string;
    banner_url: string;
}

interface CompanyProfileContextType {
    data: CompanyProfile | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

const CompanyProfileContext = createContext<CompanyProfileContextType | undefined>(undefined);

export const CompanyProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [data, setData] = useState<CompanyProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getWithAuth(`company-profile`);
            setData(response);
        } catch (err) {
            
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <CompanyProfileContext.Provider value={{ data, loading, error, refetch: fetchData }}>
            {children}
        </CompanyProfileContext.Provider>
    );
};

// Custom hook to use the context
export const useCompanyProfile = () => {
    const context = useContext(CompanyProfileContext);
    if (!context) {
        throw new Error("useCompanyProfile must be used within a CompanyProfileProvider");
    }
    return context;
};
