import { deleteWithAuth, getWithAuth, postWithAuth } from "./apiClient";

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

export const handleGetShareableLink = async (
  id: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  shareableLinkData: any,
  setGeneratedLink: React.Dispatch<React.SetStateAction<string>>,
  handleOpenModal: (modalName: string) => void
) => {
  try {
    const formData = new FormData();
    formData.append(
      "has_expire_date",
      shareableLinkData.has_expire_date ? "1" : "0"
    );
    formData.append("expire_date_time", shareableLinkData.expire_date_time);
    formData.append("has_password", shareableLinkData.has_password ? "1" : "0");
    formData.append("password", shareableLinkData.password);
    formData.append(
      "allow_download",
      shareableLinkData.allow_download ? "1" : "0"
    );

    const response = await postWithAuth(`get-shareble-link/${id}`, formData);
    console.log("share data: ", response);
    if (response.status === "success") {
      setGeneratedLink(response.link);
      handleOpenModal("generatedShareableLinkModel");
    }
  } catch (error) {
    console.error("Error getting shareable link:", error);
  }
};

export const copyToClipboard = (
  generatedLink: string,
  setCopySuccess: React.Dispatch<React.SetStateAction<string>>
) => {
  navigator.clipboard
    .writeText(generatedLink)
    .then(() => setCopySuccess("Copied!"))
    .catch(() => setCopySuccess("Failed to copy"));
  setTimeout(() => setCopySuccess(""), 2000);
};

export const handleDeleteShareableLink = async (
  id: string,
  fetchUserData: () => void
) => {
  try {
    const response = await deleteWithAuth(`delete-shareble-link/${id}`);
    console.log("link deleted successfully:", response);
    fetchUserData();
  } catch (error) {
    console.error("Error deleting shareable link:", error);
  }
};

export const handleDeleteDocument = async (id: number) => {
  if (!id) {
    console.error("Invalid document ID");
    return;
  }

  try {
    const response = await deleteWithAuth(`delete-document/${id}`);
    console.log("document deleted successfully:", response);
  } catch (error) {
    console.error("Error deleting document:", error);
  }
};
