/* eslint-disable @typescript-eslint/no-explicit-any */
import { TableItem, UserDropdownItem, BulkUploadItem, AttributeUploadItem } from "@/types/types";
import { getWithAuth } from "./apiClient";

export const fetchCategoryData = async (
  setCategoryDropDownData: React.Dispatch<React.SetStateAction<any>>
) => {
  try {
    const response = await getWithAuth("categories");
    console.log("categories data:", response);
    setCategoryDropDownData(response);
  } catch (error) {
    console.error("Failed to fetch categories data:", error);
  }
};

export const fetchDocumentsData = async (
  setDummyData: React.Dispatch<React.SetStateAction<any>>
) => {
  try {
    const response = await getWithAuth("documents");
    console.log("documents data:", response);
    setDummyData(response);
  } catch (error) {
    console.error("Failed to fetch documents data:", error);
  }
};

export const fetchAssignedDocumentsData = async (
  setDummyData: React.Dispatch<React.SetStateAction<any>>
) => {
  try {
    const response = await getWithAuth("assigned-documents");
    console.log("assigned-documents data:", response);
    setDummyData(response);
  } catch (error) {
    console.error("Failed to fetch assigned-documents data:", error);
  }
};

export const fetchRoleData = async (
  setRoleDropDownData: React.Dispatch<React.SetStateAction<any>>
) => {
  try {
    const response = await getWithAuth("roles");
    console.log("roles data:", response);
    setRoleDropDownData(response);
  } catch (error) {
    console.error("Failed to fetch roles data:", error);
  }
};

export const fetchAndMapUserData = async (
  setUserDropDownData: React.Dispatch<React.SetStateAction<UserDropdownItem[]>>
) => {
  try {
    const response = await getWithAuth("users");
    console.log("user data:", response);

    const mappedData: UserDropdownItem[] = response.map((item: any) => ({
      id: item.id,
      user_name: `${item.user_details.first_name} ${item.user_details.last_name}`,
    }));

    setUserDropDownData(mappedData);
  } catch (error) {
    console.error("Failed to fetch user data:", error);
  }
};

export const fetchAndMapUserTableData = async (
  setTableData: React.Dispatch<React.SetStateAction<TableItem[]>>
) => {
  try {
    const response = await getWithAuth("users");
    console.log("user data:", response);

    const mappedData: TableItem[] = response.map((item: any) => ({
      id: item.id,
      email: item.email,
      firstName: item.user_details.first_name,
      lastName: item.user_details.last_name,
      mobileNumber: item.user_details.mobile_no.toString(),
    }));

    setTableData(mappedData);
  } catch (error) {
    console.error("Failed to fetch user data:", error);
  }
};

export const fetchVersionHistory = async (
  id: number,
  setVersionHistory: React.Dispatch<React.SetStateAction<any>>
) => {
  try {
    const response = await getWithAuth(`document-version-history/${id}`);
    console.log("version history:", response);
    setVersionHistory(response);
  } catch (error) {
    console.error("Failed to fetch version history:", error);
  }
};

export const fetchArchivedDocuments = async (
  setDummyData: React.Dispatch<React.SetStateAction<any>>
) => {
  try {
    const response = await getWithAuth("archived-documents");
    console.log("archived documents data:", response);
    setDummyData(response);
  } catch (error) {
    console.error("Failed to fetch archived documents data:", error);
  }
};

export const fetchDocumentAuditTrail = async (
  setDummyData: React.Dispatch<React.SetStateAction<any>>
) => {
  try {
    const response = await getWithAuth("document-audit-trial");
    console.log("document audit trail data:", response);
    setDummyData(response);
  } catch (error) {
    console.error("Failed to fetch archived documents data:", error);
  }
};

export const fetchAndMapBulkUploadTableData = async (
  setTableData: React.Dispatch<React.SetStateAction<BulkUploadItem[]>>
) => {
  try {
    const response = await getWithAuth("bulk-upload");
    console.log("documents:", response.documents);

    const mappedData: BulkUploadItem[] = response.documents.map((item: any) => ({
      id: item.id,
      type: item.type,
      name: item.name
    }));

    setTableData(mappedData);
  } catch (error) {
    console.error("Failed to fetch user data:", error);
  }
};


export const fetchLoginAudits = async (
  setDummyData: React.Dispatch<React.SetStateAction<any>>
) => {
  try {
    const response = await getWithAuth("login-audits");
    console.log("login audit data:", response);
    setDummyData(response);
  } catch (error) {
    console.error("Failed to fetch archived documents data:", error);
  }
};

export const fetchAndMapAttributeTableData = async (
  setTableData: React.Dispatch<React.SetStateAction<AttributeUploadItem[]>>
) => {
  try {
    const response = await getWithAuth("attributes");
    console.log("attributes:", response);

    const mappedData: AttributeUploadItem[] = response.map((item: any) => ({
      id: item.id,
      category: item.category.category_name, // Access nested category_name
      attributes: JSON.parse(item.attributes).join(", "), // Parse attributes JSON and join with commas
    }));

    setTableData(mappedData);
  } catch (error) {
    console.error("Failed to fetch attributes data:", error);
  }
};


export const fetchRemindersData = async (
  setRemindersData: React.Dispatch<React.SetStateAction<any>>
) => {
  try {
    const response = await getWithAuth("reminders");
    console.log("reminders data:", response);
    setRemindersData(response);
  } catch (error) {
    console.error("Failed to fetch reminders data:", error);
  }
};


export const fetchSectorData = async (
  setSectorsData: React.Dispatch<React.SetStateAction<any>>
) => {
  try {
    const response = await getWithAuth("sectors");
    console.log("sectors data:", response);
    setSectorsData(response);
  } catch (error) {
    console.error("Failed to fetch sectors data:", error);
  }
};