'use client';

import Heading from "@/components/common/Heading";
import DashboardLayout from "@/components/DashboardLayout";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';

import { MdOutlineCancel } from "react-icons/md";
import { IoSaveOutline } from "react-icons/io5";

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

import 'react-quill/dist/quill.snow.css';

interface PageHelpersEditorProps {
  params: { id: string; title?: string; content?: string };
}

export default function PageHelpersEditor({ params }: PageHelpersEditorProps) {
  const router = useRouter();
  const { title: initialTitle, content: initialContent } = params;

  console.log("Initial Title:", initialTitle || "Untitled");
  console.log("Initial Content:", initialContent || "No content");

  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    if (initialTitle && initialContent) {
      setTitle(initialTitle as string);
      setContent(initialContent as string);
    }
  }, [initialTitle, initialContent]);

  const handleSave = () => {
    console.log("Saved title:", title);
    console.log("Saved content:", content);
    router.push("/");
  };

  const handleCancel = () => {
    console.log("clicked");
  };

  return (
    <>
      <DashboardLayout>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <Heading text="Edit Page Helper" color="#444" />
        </div>
        <div
          className="custom-scroll w-100"
          style={{ minHeight: "100vh", maxHeight: "100%", overflowY: "scroll" }}
        >
          <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3 w-100">
            <div
              style={{ maxHeight: "480px", overflowY: "scroll" }}
              className="custom-scroll"
            >
              <p className="mb-1" style={{ fontSize: "14px" }}>
                Name
              </p>
              <div className="col-12 col-lg-6">
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Name"
                  ></input>
                </div>
              </div>
              <p className="mb-1" style={{ fontSize: "14px" }}>
                Description
              </p>
              <ReactQuill value={content} onChange={setContent} />
              <div className="d-flex flex-row mt-5">
                <button
                  onClick={handleSave}
                  className="custom-icon-button button-success px-3 py-1 rounded me-2"
                >
                  <IoSaveOutline fontSize={16} className="me-1" /> Save
                </button>
                <button
                  onClick={handleCancel}
                  className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
                >
                  <MdOutlineCancel fontSize={16} className="me-1" /> Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
