import DashboardLayout from "@/components/DashboardLayout";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <DashboardLayout>
      <h1>Welcome to the Dashboard</h1>
      <p>This is the main content area.</p>
    </DashboardLayout>
    </div>
  );
}
