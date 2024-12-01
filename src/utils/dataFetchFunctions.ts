/* eslint-disable @typescript-eslint/no-explicit-any */
import { TableItem, UserDropdownItem } from "@/types/types";
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
