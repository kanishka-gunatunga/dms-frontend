import { getWithAuth } from "./apiClient";

export const handleView = async (id: number) => {
  try {
    const response = await getWithAuth(`view-document/${id}`);
    console.log("view data : ", response);
    window.open(response.data, "_blank");
  } catch (error) {
    console.error("Error viewing document:", error);
  }
};

export const handleDownload = async (id: number) => {
  try {
    const response = await getWithAuth(`view-document/${id}`);
    console.log("download data: ", response);
    window.open(response.data, "_blank");

    // const link = document.createElement("a");
    // link.href = response.data;
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
  } catch (error) {
    console.error("Error downloading file:", error);
  }
};
