/* eslint-disable @typescript-eslint/no-explicit-any */
import { getWithAuth } from "./apiClient";
// import Cookies from "js-cookie";
export const API_BASE_URL =
  // process.env.NEXT_PUBLIC_API_BASE_URL ||
  // "https://sites.techvoice.lk/dms-backend-v2/api/";
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000/api/";
  
  export const handleView = async (id: number,userId: any) => {
    try {
      const response = await getWithAuth(`view-document/${id}/${userId}`);
      // console.log("view data : ", response);
      window.open(response.data, "_blank");
    } catch (error) {
      console.error("Error viewing document:", error);
    }
  };
  

// export const handleDownload = async (id: number, userId: any) => {
//   try {
//       // const token = Cookies.get("authToken");
//       // console.log("Download data ID: ", id, userId);
//       const response = await getWithAuth(`download-document/${id}/${userId}`);
//       // const response = await fetch(`${API_BASE_URL}download-document/${id}/${userId}`, {
//       //     method: 'GET',
//       //     headers: {
//       //         Authorization: `Bearer ${token}`,
//       //     },
//       // });

//       console.log("response download: ", response)

//       // if (response.ok) {
//       //     const blob = await response.blob();

//       //     let fileName = "downloaded-file"; 
//       //     const contentDisposition = response.headers.get('Content-Disposition');
//       //     if (contentDisposition && contentDisposition.includes('filename=')) {
//       //         const matches = contentDisposition.match(/filename="?([^";]+)"?/);
//       //         if (matches && matches[1]) {
//       //             fileName = matches[1];
//       //         }
//       //     } else {
//       //         const contentType = response.headers.get('Content-Type') || 'unknown';
//       //         const extension = contentType.split('/').pop();
//       //         fileName = `${fileName}.${extension}`;
//       //     }

//       //     // Create a temporary link and trigger the download
//       //     const link = document.createElement('a');
//       //     const url = URL.createObjectURL(blob);
//       //     link.href = url;
//       //     link.download = fileName;
//       //     document.body.appendChild(link);
//       //     link.click();
//       //     document.body.removeChild(link);

//       //     // Clean up the object URL
//       //     URL.revokeObjectURL(url);

//       //     console.log("File download initiated with name:", fileName);
//       // } else {
//       //     console.error("Failed to download the file. Server responded with status:", response.status);
//       //     const errorMessage = await response.text();
//       //     console.error("Server error message:", errorMessage);
//       // }
//   } catch (error) {
//       console.error("Error downloading file:", error);
//   }
// };

// export const handleDownload = async (id: number, userId: any) => {
//   try {
//       const response = await getWithAuth(`download-document/${id}/${userId}`);
//       console.log("response download: ", response)
//   } catch (error) {
//       console.error("Error downloading file:", error);
//   }
// };

// export const handleDownload = async (id: number, userId: any) => {
//   try {
//     const response = await getWithAuth(`download-document/${id}/${userId}`);
//     // console.log("download data : ", response);
//     if (response?.data) {
//       const link = document.createElement("a");
//       link.href = response.data;
//       link.setAttribute("download", ""); 
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     } else {
//       console.error("Download URL not found in response.");
//     }
//   } catch (error) {
//     console.error("Error downloading file:", error);
//   }
// };


export const handleDownload = async (id: number, userId: any) => {
  try {
    const response = await getWithAuth(`download-document/${id}/${userId}`);

    if (response?.data) {
      const fileType = response.type;
      if (['png', 'jpg', 'jpeg', 'gif'].includes(fileType) || fileType === 'pdf') {
        const fileUrl = response.data;

        const fileResponse = await fetch(fileUrl);
        if (!fileResponse.ok) {
          throw new Error('Failed to fetch the file.');
        }

        const blob = await fileResponse.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);

        link.download = fileType === 'pdf' ? `${response.name}.pdf` : `${response.name}.${fileType}`;
        link.click();

        URL.revokeObjectURL(link.href);
      } else {

        const link = document.createElement('a');
        link.href = response.data;
        link.setAttribute('download', 'document');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } else {
      console.error('Download URL not found in response.');
    }
  } catch (error) {
    console.error('Error downloading file:', error);
  }
};

