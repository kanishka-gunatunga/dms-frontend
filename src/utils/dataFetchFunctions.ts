/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TableItem, UserDropdownItem, BulkUploadItem, AttributeUploadItem, SMTPUploadItem, AuditTrialItem, RoleUserItem } from "@/types/types";
import { getWithAuth } from "./apiClient";
import dayjs from "dayjs";

export const fetchCategoryData = async (
  setCategoryDropDownData: React.Dispatch<React.SetStateAction<any>>
) => {
  try {
    const response = await getWithAuth("categories");
    setCategoryDropDownData(response);
  } catch (error) {
    console.error("Failed to fetch categories data:", error);
  }
};


export const fetchCategoryChildrenData = async (
  setCategoryDropDownData: React.Dispatch<React.SetStateAction<any>>
) => {
  try {
    const response = await getWithAuth("categories-with-childs");
    console.log("response :: ", response)
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
    setDummyData(response);
  } catch (error) {
    console.error("Failed to fetch documents data:", error);
  }
};

export const fetchAssignedDocumentsData = async (
  setDummyData: React.Dispatch<React.SetStateAction<any>>
) => {
  try {
    const response = await getWithAuth(`assigned-documents`);
    setDummyData(response);
  } catch (error) {
    console.error("Failed to fetch assigned-documents data:", error);
  }
};
export const fetchAssignedDocumentsByUserData = async (
  id: number,
  setDummyData: React.Dispatch<React.SetStateAction<any>>
) => {
  try {

    const response = await getWithAuth(`assigned-documents-by-user/${id}`);
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

    const mappedData: UserDropdownItem[] = response.map((item: any) => ({
      id: item?.id,
      user_name: `${item?.user_details?.first_name} ${item?.user_details?.last_name}`,
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
    // console.log("response users: ", response)
    const mappedData: TableItem[] = response.map((item: any) => ({
      id: item?.id,
      email: item?.email,
      firstName: item?.user_details?.first_name,
      lastName: item?.user_details?.last_name,
      mobileNumber: item?.user_details?.mobile_no.toString(),
    }));

    setTableData(mappedData);
  } catch (error) {
    console.error("Failed to fetch user data:", error);
  }
};

export const fetchAndMapRoleUserData = async (
  setTableData: React.Dispatch<React.SetStateAction<RoleUserItem[]>>
) => {
  try {
    const response = await getWithAuth("users");

    const mappedData: RoleUserItem[] = response.map((item: any) => ({
      id: item?.id,
      email: item?.email,
      firstName: item?.user_details?.first_name,
      lastName: item?.user_details?.last_name,
      mobileNumber: item?.user_details?.mobile_no.toString(),
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
    setDummyData(response);
  } catch (error) {
    console.error("Failed to fetch archived documents data:", error);
  }
};

export const fetchDocumentAuditTrail = async (
  setDummyData: React.Dispatch<React.SetStateAction<AuditTrialItem[]>>
) => {
  try {
    const response = await getWithAuth("document-audit-trial");

    // Map the data to the TableItem interface
    const mappedData = response.map((item: any): AuditTrialItem => ({
      id: item?.id,
      operation: item?.operation,
      category: item?.category || 'No Category',
      type: item?.type,
      user: item?.user,
      changed_source: item?.changed_source,
      date_time: item?.date_time,
      document_name: item?.document_name,
      asigned_users: item?.assigned_users.join(', ') || '-',
      asigned_roles: item?.assigned_roles.join(', ') || '-',
    }));

    setDummyData(mappedData);
  } catch (error) {
    console.error("Failed to fetch archived documents data:", error);
  }
};


export const fetchAndMapBulkUploadTableData = async (
  setTableData: React.Dispatch<React.SetStateAction<BulkUploadItem[]>>
) => {
  try {
    const response = await getWithAuth("bulk-upload");

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
    const parsedResponse = typeof response === "string" ? JSON.parse(response) : response;

    console.log("Parsed response: ", parsedResponse);

    if (!Array.isArray(parsedResponse)) {
      throw new Error("Expected an array but got: " + JSON.stringify(parsedResponse));
    }

    const mappedData: AttributeUploadItem[] = parsedResponse.map((item: any) => {
      const categoryName = item?.category?.category_name || "Unknown Category";

      let attributesArray: string[] = [];
      try {
        attributesArray = item?.attributes ? JSON.parse(item.attributes) : [];
        if (!Array.isArray(attributesArray)) {
          attributesArray = [];
        }
      } catch (error) {
        console.error(`Error parsing attributes for item ${item.id}:`, error);
      }

      const formattedAttributes = attributesArray.join(", ");

      return {
        id: String(item.id),
        category: { category_name: categoryName },
        attributes: formattedAttributes,
      };
    });

    console.log("Mapped data: ", mappedData);

    setTableData(mappedData);

  } catch (error) {
    console.error("Failed to fetch attributes data:", error);
  }
};


export const fetchRemindersData = async (
  setSelectedDates: React.Dispatch<React.SetStateAction<any>>
) => {
  try {
    const response = await getWithAuth("reminders");
    console.log("response reminders :", response)
    const transformedData = response.map((item: { date_time: any; created_at: any; end_date_time: any; subject: any; }) => {
      const date = item.date_time || item.created_at || item.end_date_time;
      return {
        date: dayjs(date).format("YYYY-MM-DD"),
        content: item.subject,
        type: "success",
      };
    });
    setSelectedDates(response);
  } catch (error) {
    console.error("Failed to fetch reminders data:", error);
  }
};


export const fetchSectorData = async (
  setSectorsData: React.Dispatch<React.SetStateAction<any>>
) => {
  try {
    const response = await getWithAuth("sectors");
    setSectorsData(response);
  } catch (error) {
    console.error("Failed to fetch sectors data:", error);
  }
};

export const fetchAndMapSMTPUploadTableData = async (
  setTableData: React.Dispatch<React.SetStateAction<SMTPUploadItem[]>>
) => {
  try {
    const response = await getWithAuth("all-smtps");

    const mappedData: SMTPUploadItem[] = response.map((item: any) => ({
      id: item.id,
      user_name: item.user_name,
      host: item.host,
      port: item.port,
      is_default: item.is_default === '1' ? 'yes' : 'no'
    }));

    setTableData(mappedData);
  } catch (error) {
    console.error("Failed to fetch user data:", error);
  }
};


export const fetchSectors = async (
  setSectors: React.Dispatch<React.SetStateAction<any>>
) => {
  try {
    const response = await getWithAuth("all-sectors");
    setSectors(response);
  } catch (error) {
    console.error("Failed to fetch archived documents data:", error);
  }
};


export const fetchFtpAccounts = async (
  setFtpAccountData: React.Dispatch<React.SetStateAction<any>>
) => {
  try {
    const response = await getWithAuth("ftp-accounts");
    setFtpAccountData(response);
  } catch (error) {
    console.error("Failed to fetch ftp-accounts:", error);
  }
};


export const fetchFTPData = async (
  setDummyData: React.Dispatch<React.SetStateAction<any>>
) => {
  try {
    const response = await getWithAuth("ftp-accounts");
    setDummyData(response);
  } catch (error) {
    console.error("Failed to fetch data:", error);
  }
};