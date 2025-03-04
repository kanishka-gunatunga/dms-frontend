/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Toast } from "react-bootstrap";

export default function AllDocTable() {
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const handleSelectFolder = async () => {
    if ("showDirectoryPicker" in window) {
      try {
        const directoryHandle = await window.showDirectoryPicker();
        const files: string[] = [];
        for await (const [name, entry] of (directoryHandle as any).entries()) {
          if (entry.kind === "file" && !name.includes("_preview")) {
            files.push(name);
          }
        }

        setFileNames(files);
        setToastMessage(`Found ${files.length} files.`);
        setToastType("success");
        setShowToast(true);

        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      } catch (error) {
         if (error instanceof Error && error.name === "AbortError") {
           return;
         }

        console.error("Error selecting folder:", error);
        setToastMessage("Failed to select folder or retrieve files.");
        setToastType("error");
        setShowToast(true);

        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } else {
      setToastMessage("File System Access API is not supported in this browser.");
      setToastType("error");
      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    }
  };

  return (
    <>
      <div>
        <button onClick={handleSelectFolder}>Select Folder and Get Files</button>

        {showToast && (
          <Toast
            onClose={() => setShowToast(false)}
            show={showToast}
            delay={5000}
            autohide
            bg={toastType === "success" ? "success" : "danger"}
            style={{ position: "fixed", top: 20, right: 20 }}
          >
            <Toast.Header>
              <strong className="me-auto">Notification</strong>
            </Toast.Header>
            <Toast.Body>{toastMessage}</Toast.Body>
          </Toast>
        )}

        {fileNames.length > 0 && (
          <div>
            <h3>Files in Selected Folder:</h3>
            <ul>
              {fileNames.map((name, index) => (
                <li key={index}>{name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}