/* eslint-disable @typescript-eslint/no-explicit-any */
import Cookies from "js-cookie";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://sites.techvoice.lk/dms-backend/api/";

if (!API_BASE_URL) {
  throw new Error("API base URL is not defined in environment variables.");
}

export async function postWithAuth(
  endpoint: string,
  formData: FormData
): Promise<any> {
  const token = Cookies.get("authToken");

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token || ""}`,
      },
      body: formData,
    });

    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error during POST request:", error);
    throw error;
  }
}

export async function getWithAuth(endpoint: string): Promise<any> {
  const token = Cookies.get("authToken");

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token || ""}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error during GET request:", error);
    throw error;
  }
}

export async function deleteWithAuth(endpoint: string): Promise<any> {
  const token = Cookies.get("authToken");

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token || ""}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error during GET request:", error);
    throw error;
  }
}
