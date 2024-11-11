import DashboardLayout from "@/components/DashboardLayout";
import styles from "./page.module.css";
import Heading from "@/components/common/Heading";

export default function Home() {
  return (
    <div className={styles.page}>
      <DashboardLayout>
        <div className="d-flex bg-white p-2 p-lg-3 rounded">
          <Heading text="Documents by Category" color="#444" />
        </div>
        <div className="d-flex bg-white p-2 p-lg-3 rounded" style={{ marginTop: '12px' }}>
          <Heading text="Reminders" color="#444" />
        </div>
      </DashboardLayout>
    </div>
  );
}
