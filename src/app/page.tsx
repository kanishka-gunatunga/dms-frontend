/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import DashboardLayout from "@/components/DashboardLayout";
import styles from "./page.module.css";
import Heading from "@/components/common/Heading";
import { PieChart, Pie, Legend, ResponsiveContainer, Cell } from "recharts";
import InfoModal from "@/components/common/InfoModel";
import useAuth from "@/hooks/useAuth";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useEffect, useState } from "react";
import { fetchRemindersData } from "@/utils/dataFetchFunctions";
import { Badge, Calendar } from "antd";
import type { BadgeProps, CalendarProps } from "antd";
import type { Dayjs } from "dayjs";


export default function Home() {
  const isAuthenticated = useAuth();


  // const [selectedDates, setSelectedDates] = useState<{ date: string; content: string; type: BadgeProps["status"] }[]>([
  //   { date: "2024-12-15", content: "Meeting with client", type: "success" },
  //   { date: "2024-12-08", content: "Project deadline", type: "warning" },
  //   { date: "2024-12-10", content: "Code review session", type: "error" },
  // ]);

  const [selectedDates, setSelectedDates] = useState<{ date: string; content: string; type: BadgeProps["status"] }[]>(
    []
  );

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

  const monthCellRender = (value: Dayjs) => {
    return null; 
  };

  const cellRender: CalendarProps<Dayjs>["cellRender"] = (current, info) => {
    if (info.type === "date") return dateCellRender(current);
    if (info.type === "month") return monthCellRender(current);
    return info.originNode;
  };

  
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

  const onPanelChange = (value: Dayjs, mode: CalendarProps<Dayjs>["mode"]) => {
    console.log(value.format("YYYY-MM-DD"), mode);
  };

  useEffect(() => {
    fetchRemindersData(setSelectedDates);
    
  }, []);

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }


  return (
    <div className={styles.page}>
      <DashboardLayout>
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
      </DashboardLayout>
    </div>
  );
}
