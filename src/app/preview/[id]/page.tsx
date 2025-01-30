/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Heading from "@/components/common/Heading";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import React, { useEffect, useState } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { getWithAuth, postWithAuth } from "@/utils/apiClient";
import { useRouter } from "next/navigation";
import { RoleDropdownItem } from "@/types/types";
import { fetchRoleData } from "@/utils/dataFetchFunctions";
import ToastMessage from "@/components/common/Toast";
import { Input } from "antd";
import { IoSendSharp, IoShareSocial } from "react-icons/io5";
import Image from "next/image";
import { handleDownload } from "@/utils/documentFunctions";
import { useUserContext } from "@/context/userContext";
import { MdFileDownload } from "react-icons/md";



interface ValidationErrors {
  first_name?: string;
  last_name?: string;
  mobile_no?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  role?: string;
}

type Params = {
  id: string;
};

interface Props {
  params: Params;
}

interface ViewDocumentItem {
  id: number;
  name: string;
  category: { id: number; category_name: string };
  description: string;
  meta_tags: string;
  attributes: string;
  type: string;
  url: string;
  enable_external_file_view: number;
  allow_download: number
}

export default function AllDocTable({ params }: Props) {
  const isAuthenticated = useAuth();
  const { userId } = useUserContext();
  const [isLoading, setIsLoading] = useState(true);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");
  // const [docUrl, setDocUrl] = useState("");
  const [downloadable, setDownloadable] = useState();
  // const [docType, setDocType] = useState("");
  // const [docName, setName] = useState("");
  // const [externalViewEnable, setExternalViewEnable] = useState();
  const [viewDocument, setViewDocument] = useState<ViewDocumentItem | null>(
    null
  );

  // const router = useRouter();
  const id = params?.id;

  useEffect(() => {
    // console.log("shareCode : ", id)

    const fetchLinkStatus = async () => {
      try {
        const response = await getWithAuth(`unlock-shareble-link/${id}`);
        console.log("response : ", response)
        if (response.status === "fail" && response.message === "Need the password to unlock") {
          setRequiresPassword(true);
        } else {
          // setDocUrl(response.data.url)
          // setDownloadable(response.data.allow_download)
          // setName(response.data.name)
          // setDownloadable(response.allow_download)
          // setExternalViewEnable(response.data.enable_external_file_view)
          setViewDocument(response.data)
          setDownloadable(response.allow_download)
          // console.log("response : ", response)
        }
      } catch (error) {
        setErrors({ api: "Failed to load the link. Please try again." });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinkStatus();
  }, []);

  const handlePasswordSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("password", password);

      formData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });

      const response = await postWithAuth(
        `unlock-shareble-link/${id}`,
        formData
      );
      console.log("response pw: ", response)
      if (response.status === "success") {
        setToastType("success");
        setToastMessage("Successful!");

        setViewDocument(response.data)
        // setDocUrl(response.data.url)
        // setDownloadable(response.data.allow_download)
        // setName(response.data.name)
        // setDownloadable(response.allow_download)
        // setExternalViewEnable(response.data.enable_external_file_view)

        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      } else {
        setToastType("error");
        setToastMessage(`${response.message}`);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      setToastType("error");
      setToastMessage("Failed to upload the new version!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
      // console.error("Error new version updating:", error);
    }

  };



  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }


  return (
    <>
      <DashboardLayout>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <Heading text="View Shared Document" color="#444" />
        </div>

        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
          {/* <div
            style={{ maxHeight: "380px", overflowY: "auto" }}
            className="custom-scroll"
          > */}
          <div className="p-0 overflow-hidden w-100">
            <div className="d-flex flex-column align-items-start">
              {requiresPassword ? (

                <div className="d-flex flex-column">
                  <div className="d-flex flex-column mt-3">
                    <label htmlFor="password">Password</label>
                    <Input.Password
                      placeholder="Input password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="is-invalid"
                    />
                  </div>
                  <button
                    onClick={
                      handlePasswordSubmit
                    }
                    className="custom-icon-button button-success px-3 py-1 rounded me-2 mt-3"
                  >
                    <IoSendSharp fontSize={16} className="me-1" /> Submit
                  </button>
                </div>
              ) : (
                <div className="success-message">{message}</div>
              )}
            </div>
          </div>
          {/* <iframe
            src={docUrl}
            title="PDF Preview"
            style={{ width: "100%", height: "500px", border: "none" }}
          ></iframe> */}
          {/* {['jpg', 'jpeg', 'png'].includes(docType) ? (
            <Image
              src={docUrl}
              alt={docName}
              width={200}
              height={200}
              style={{ maxWidth: "200px", height: "auto" }}
            />
          ) : docType === "pdf" ? (
            
            <iframe
              src={docUrl}
              title="PDF Preview"
              style={{ width: "100%", height: "500px", border: "none" }}
            ></iframe>
          ) : externalViewEnable === 1 ? (
            <>
              {console.log(docUrl)}
              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(docUrl)}`}
                title="Document Preview"
                style={{ width: "100%", height: "500px", border: "none" }}
              ></iframe>
            </>
          ) : (
            <p>No preview available for this document type.</p>
          )} */}

          {viewDocument && (
            <>
              {['jpg', 'jpeg', 'png'].includes(viewDocument.type) ? (
                <Image
                  src={viewDocument.url}
                  alt={viewDocument.name}
                  width={200}
                  height={200}
                  style={{ maxWidth: "200px", height: "auto" }}
                />
              ) : viewDocument.type === "pdf" ? (
                <>
                  {/* {console.log("pdf url:",viewDocument.url)} */}
                  <iframe
                    src={`${viewDocument.url}#toolbar=0`}
                    title="PDF Preview"
                    style={{ width: "100%", height: "500px", border: "none" }}
                  ></iframe>
                </>
              ) : viewDocument.enable_external_file_view === 1 ? (
                <>
                  {/* {console.log(viewDocument.url)} */}
                  <iframe
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(viewDocument.url)}`}
                    title="Document Preview"
                    style={{ width: "100%", height: "500px", border: "none" }}
                  ></iframe>
                </>
              ) : (
                <p>No preview available for this document type.</p>
              )}
            </>
          )}
          {/* </div> */}
          {viewDocument && downloadable === 1 && (
            <button
              onClick={() => handleDownload(viewDocument?.id || 0, userId)}
              className="addButton me-2 bg-white text-dark border border-success rounded px-3 py-1 mt-3"
            >
              <MdFileDownload className="me-2" />
              Download
            </button>
          )}

        </div>
      </DashboardLayout>
      <ToastMessage
        message={toastMessage}
        show={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
      />
    </>
  );
}
