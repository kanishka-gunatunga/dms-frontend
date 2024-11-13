"use client";

import DashboardLayout from "@/components/DashboardLayout";
import styles from "./page.module.css";
import Heading from "@/components/common/Heading";
import { PieChart, Pie, Legend, ResponsiveContainer, Cell } from "recharts";

export default function Home() {
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

  return (
    <div className={styles.page}>
      <DashboardLayout>
        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded">
          <Heading text="Documents by Category" color="#444" />
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
          className="d-flex bg-white p-2 p-lg-3 rounded"
          style={{ marginTop: "12px" }}
        >
          <Heading text="Reminders" color="#444" />
        </div>
      </DashboardLayout>
    </div>
  );
}
