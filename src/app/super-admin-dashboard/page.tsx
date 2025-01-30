/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Heading from "@/components/common/Heading";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import { fetchRemindersData } from "@/utils/dataFetchFunctions";
import React, { useState, useRef, useEffect } from "react";
import { Badge, Calendar } from "antd";
import type { BadgeProps, CalendarProps } from "antd";
import type { Dayjs } from "dayjs";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from "recharts";
import styles from "../page.module.css";
import DashboardLayoutSuperAdmin from "@/components/DashboardLayoutSuperAdmin";



type Reminder = {
    id: number;
    subject: string;
    start_date_time: string | null;
};

type SelectedDate = {
    date: string;
    content: string;
    type: "success" | "processing" | "error" | "default" | "warning";
};

export default function SuperAdminDashboard() {
    const isAuthenticated = useAuth();
    const data01 = [
        {
            name: "Invoice",
            value: 400,
            color: "#8884d8",
        },
        {
            name: "HR Employee fee",
            value: 300,
            color: "#888458",
        },
        {
            name: "Test Documents",
            value: 300,
            color: "#887778",
        },
    ];

    const [selectedDates, setSelectedDates] = useState<SelectedDate[]>([]);


    useEffect(() => {
        fetchRemindersData((data) => {
            const transformedData = data
                .filter((reminder: { start_date_time: any; }) => reminder.start_date_time)
                .map((reminder: { start_date_time: any; subject: any; }) => ({
                    date: reminder.start_date_time!.split(" ")[0],
                    content: reminder.subject,
                    type: "success",
                }));
            setSelectedDates(transformedData);
        });
    }, []);

    const getListData = (value: Dayjs) => {
        const formattedDate = value.format("YYYY-MM-DD");
        return selectedDates.filter((item) => item.date === formattedDate);
    };

    const dateCellRender = (value: Dayjs) => {
        const listData = getListData(value);
        return (
            <ul className="events">
                {listData.map((item, index) => (
                    <li key={index}>
                        <Badge status={item.type} text={item.content} />
                    </li>
                ))}
            </ul>
        );
    };

    const cellRender: CalendarProps<Dayjs>["cellRender"] = (current, info) => {
        if (info.type === "date") return dateCellRender(current);
        return info.originNode;
    };

    const onPanelChange = (value: Dayjs, mode: CalendarProps<Dayjs>["mode"]) => {
        console.log(value.format("YYYY-MM-DD"), mode);
    };


    if (!isAuthenticated) {
        return <LoadingSpinner />;
    }

    return (
        <>
            <div className={styles.page}>
                <DashboardLayoutSuperAdmin>
                    <div
                        className="d-flex flex-column custom-scroll"
                        style={{ minHeight: "100vh", maxHeight: "100%", overflowY: "scroll" }}
                    >
                        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded">
                            <div className="d-flex flex-row align-items-center">
                                <Heading text="Documents by Category" color="#444" />
                                {/* <InfoModal
                title="Sample Blog"
                content={`<h1><strong>Hello world,</strong></h1><p>The Company Profile feature allows users to customize the branding of the application by entering the company name and uploading logos. This customization will reflect on the login screen, enhancing the professional appearance and brand identity of the application.</p><br><h3><strong>Hello world,</strong></h3><p>The Company Profile feature allows users to customize the branding of the application by entering the company name and uploading logos. This customization will reflect on the login screen, enhancing the professional appearance and brand identity of the application.</p><br><h3><strong>Hello world,</strong></h3><p>The Company Profile feature allows users to customize the branding of the application by entering the company name and uploading logos. This customization will reflect on the login screen, enhancing the professional appearance and brand identity of the application.</p><br><h3><strong>Hello world,</strong></h3><p>The Company Profile feature allows users to customize the branding of the application by entering the company name and uploading logos. This customization will reflect on the login screen, enhancing the professional appearance and brand identity of the application.</p>`}
              /> */}
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={data01}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        label
                                        outerRadius={80}
                                    >
                                        {data01.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Legend
                                        layout="vertical"
                                        align="right"
                                        verticalAlign="middle"
                                        height={36}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div
                            className="d-flex flex-column bg-white p-2 p-lg-3 rounded mb-3"
                            style={{ marginTop: "12px" }}
                        >
                            <div className="d-flex flex-row align-items-center">
                                <Heading text="Reminders" color="#444" />
                                {/* <InfoModal
                title="Sample Blog"
                content={`<h1><strong>Hello world,</strong></h1><p>The Company Profile feature allows users to customize the branding of the application by entering the company name and uploading logos. This customization will reflect on the login screen, enhancing the professional appearance and brand identity of the application.</p><br><h3><strong>Hello world,</strong></h3><p>The Company Profile feature allows users to customize the branding of the application by entering the company name and uploading logos. This customization will reflect on the login screen, enhancing the professional appearance and brand identity of the application.</p><br><h3><strong>Hello world,</strong></h3><p>The Company Profile feature allows users to customize the branding of the application by entering the company name and uploading logos. This customization will reflect on the login screen, enhancing the professional appearance and brand identity of the application.</p><br><h3><strong>Hello world,</strong></h3><p>The Company Profile feature allows users to customize the branding of the application by entering the company name and uploading logos. This customization will reflect on the login screen, enhancing the professional appearance and brand identity of the application.</p>`}
              /> */}
                            </div>
                            {/* <Calendar onPanelChange={onPanelChange} /> */}
                            <Calendar cellRender={cellRender} onPanelChange={onPanelChange} />

                        </div>
                    </div>
                </DashboardLayoutSuperAdmin>
            </div>
        </>
    );
}
