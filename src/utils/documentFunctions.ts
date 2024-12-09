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

export  const handleDownload = async (id: number) => {
  try {
      console.log("download data id: ", id);
      const response = await getWithAuth(`download-document/${id}`);
      console.log("download data: ", response);

      if (response && response.downloadUrl) {
          const link = document.createElement("a");
          link.href = response.downloadUrl;
          link.download = response.fileName || "downloaded_file";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          console.log("File download initiated.");
      } else {
          console.error("Download URL not found in the response.");
      }
  } catch (error) {
      console.error("Error downloading file:", error);
  }
};
