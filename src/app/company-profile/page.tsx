/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Heading from "@/components/common/Heading";
import InfoModal from "@/components/common/InfoModel";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import React, { useState, useRef, useEffect } from "react";
import { Tabs, Tab, Card, Dropdown, DropdownButton } from "react-bootstrap";
import { IoImageOutline, IoSaveOutline } from "react-icons/io5";
import { MdOutlineCancel } from "react-icons/md";
import { postWithAuth,getWithAuth } from "@/utils/apiClient";
import ToastMessage from "@/components/common/Toast";

type S3Fields = Record<"key" | "secret" | "bucket" | "region", string>;
type Errors = Record<"key" | "secret" | "bucket", boolean>;

interface ValidationErrors {
  title?: string;
}

export default function AllDocTable() {
  const [title, setTitle] = useState("");
  const [key, setKey] = useState("");
  const [secret, setSecret] = useState("");
  const [region, setRegion] = useState("");
  const [bucket, setBucket] = useState("");
  const [logo, setLogo] = useState("/logo.svg");
  const [banner, setBanner] = useState("/login-image.png");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});

  const [selectedStorage, setSelectedStorage] = useState(
    "Local Disk (Default)"
  );
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const response = await getWithAuth(`company-profile`);
        setTitle(response.title || "");
        setLogo(response.logo_url || "");
        setBanner(response.banner_url || "");
        setSelectedStorage(response.storage || "");
        setKey(response.key || "");
        setSecret(response.secret || "");
        setBucket(response.bucket || "");
        setRegion(response.region || "");

      } catch (error) {
      }
    };

    fetchCompanyProfile();
  }, []);
  const validateFields = (): ValidationErrors => {
    const newErrors: ValidationErrors = {};

    if (!title.trim()) newErrors.title = "Title is required.";
    return newErrors;

  };
  
  const triggerLogoInput = () => {
    logoInputRef.current?.click();
  };

  const triggerBannerInput = () => {
    bannerInputRef.current?.click();
  };

  const [s3Fields, setS3Fields] = useState<S3Fields>({
    key: "",
    secret: "",
    bucket: "",
    region: "",
  });

  const isAuthenticated = useAuth();

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const logoURL = URL.createObjectURL(file);
      setLogo(logoURL);
    }
  };

  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file); 
      const bannerURL = URL.createObjectURL(file);
      setBanner(bannerURL);
    }
  };

  const handleSave =async () => {

    const fieldErrors = validateFields();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    const formData = new FormData();

    formData.append("title", title);

    if (logoFile) {
      formData.append("logo", logoFile);
    }
  
    if (bannerFile) {
      formData.append("banner", bannerFile);
    }

    try {
    
      const response = await postWithAuth("company-profile", formData);

      if (response.status === "success") {
        setToastType("success");
        setToastMessage("Company Details updated");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        // window.location.href = "/company-profile";
      } else if (response.status === "fail") {
        if (response.errors) {
          setErrors({
            title: response.errors.title?.[0] || "",
          });
        }
        setToastType("error");
        setToastMessage("Company Details updated failed.");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {

      setToastType("error");
        setToastMessage("Error uploading files:"+error+"");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
    }
  };


  const handleCancel = () => {
  };

  const handleStorageSave = async () => {

    try {
      const formData = new FormData();

      formData.append("storage", selectedStorage);
      formData.append("key", key);
      formData.append("secret", secret);
      formData.append("bucket", bucket);
      formData.append("region", region);

    

      const response = await postWithAuth("company-profile-storage", formData);

      if (response.status === "success") {
        setToastType("success");
        setToastMessage("Storage Details updated");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        // window.location.href = "/company-profile";
      } else if (response.status === "fail") {
        if (response.errors) {
          setErrors({
            title: response.errors.title?.[0] || "",
          });
        }
        setToastType("error");
        setToastMessage("Storage Details updated failed.");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {

      setToastType("error");
        setToastMessage("Error uploading files:"+error+"");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
    }
  };

  const handleStorageCancel = () => {
  };

  const handleStorageSelect = (selected: string) => {
    setSelectedStorage(selected);
    setS3Fields({ key: "", secret: "", bucket: "", region: "" });

  };

  const handleInputChange = (field: keyof S3Fields, value: string) => {
    setS3Fields((prevState) => ({ ...prevState, [field]: value }));
    if (field in errors) {
      setErrors((prevState) => ({ ...prevState, [field]: false }));
    }
  };

  const handleFieldBlur = (field: keyof S3Fields) => {
    if (s3Fields[field] === "" && field !== "region" && field in errors) {
      setErrors((prevState) => ({ ...prevState, [field]: true }));
    }
  };

  return (
    <>
      <DashboardLayout>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <div className="d-flex flex-row align-items-center">
            <Heading text="Company Profile" color="#444" />
            {/* <InfoModal
              title="Sample Blog"
              content={`<h1><strong>Hello world,</strong></h1><p>The Company Profile feature allows users to customize the branding of the application by entering the company name and uploading logos. This customization will reflect on the login screen, enhancing the professional appearance and brand identity of the application.</p><br><h3><strong>Hello world,</strong></h3><p>The Company Profile feature allows users to customize the branding of the application by entering the company name and uploading logos. This customization will reflect on the login screen, enhancing the professional appearance and brand identity of the application.</p><br><h3><strong>Hello world,</strong></h3><p>The Company Profile feature allows users to customize the branding of the application by entering the company name and uploading logos. This customization will reflect on the login screen, enhancing the professional appearance and brand identity of the application.</p><br><h3><strong>Hello world,</strong></h3><p>The Company Profile feature allows users to customize the branding of the application by entering the company name and uploading logos. This customization will reflect on the login screen, enhancing the professional appearance and brand identity of the application.</p>`}
            /> */}
          </div>
        </div>
        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
          <div
            style={{ maxHeight: "480px", overflowY: "scroll" }}
            className="custom-scroll"
          >
            <div className="companyProfileTabs">
              <Tabs
                defaultActiveKey="general"
                id="uncontrolled-tab-example"
                className="mb-3"
              >
                 <Tab eventKey="general" title="General">
                    <div className="d-flex flex-column flex-lg-row">
                      <div className="col-12 col-lg-6 pe-2">
                        <p className="mb-1" style={{ fontSize: "14px" }}>Name</p>
                        <div className="input-group mb-3 pe-lg-4">
                          <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="form-control w-100"
                          />
                           {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                        </div>

                        <p className="mb-2" style={{ fontSize: "14px" }}>Logo</p>
                        <Card style={{ width: "18rem" }} className="shadow-sm border-0 p-3">
                          <Card.Img variant="top" src={logo} />
                          <Card.Body className="p-0 pt-3">
                            <button
                              onClick={triggerLogoInput}
                              className="custom-icon-button button-success px-3 py-1 rounded"
                            >
                              <IoImageOutline fontSize={16} className="me-1" /> Change Logo
                            </button>
                            <input
                              type="file"
                              ref={logoInputRef}
                              accept="image/*"
                              style={{ display: "none" }}
                              onChange={handleLogoChange}
                            />
                          </Card.Body>
                        </Card>
                      </div>

                      <div className="col-12 col-lg-6">
                        <p className="mb-2 mt-2 mt-lg-0" style={{ fontSize: "14px" }}>Banner Image</p>
                        <Card className="shadow-sm border-0 p-3 bannerImage">
                          <Card.Img variant="top" src={banner} />
                          <Card.Body className="p-0 pt-3">
                            <button
                              onClick={triggerBannerInput}
                              className="custom-icon-button button-success px-3 py-1 rounded"
                            >
                              <IoImageOutline fontSize={16} className="me-1" /> Change Banner
                            </button>
                            <input
                              type="file"
                              ref={bannerInputRef}
                              accept="image/*"
                              style={{ display: "none" }}
                              onChange={handleBannerImageChange}
                            />
                          </Card.Body>
                        </Card>
                      </div>
                    </div>

                    <div className="d-flex flex-row mt-3">
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
                  </Tab>
                <Tab eventKey="storage" title="Storage">
                  <p className="mb-1" style={{ fontSize: "14px" }}>
                    Name
                  </p>
                  <DropdownButton
                    id="dropdown-category-button"
                    key="down-centered"
                    title={selectedStorage}
                    className="custom-dropdown-text-start col-12 col-lg-6 text-start"
                  >
                    <Dropdown.Item
                      onClick={() =>
                        handleStorageSelect("Local Disk (Default)")
                      }
                    >
                      Local Disk (Default)
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => handleStorageSelect("Amazon S3")}
                    >
                      Amazon S3
                    </Dropdown.Item>
                  </DropdownButton>
                  {selectedStorage === "Amazon S3" && (
                    <div
                      id="AmazonS3Fields"
                      className="d-flex row row-cols-1 row-cols-lg-2 mt-5"
                    >
                      <div className="col">
                        <p className="mb-1" style={{ fontSize: "14px" }}>
                          Amazon S3 Key
                        </p>
                        <div className="input-group d-flex flex-column mb-3">
                          <input
                            type="text"
                            className="form-control w-100"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            onBlur={() => handleFieldBlur("key")}
                          />
                         
                        </div>
                      </div>
                      <div className="col">
                        <p className="mb-1" style={{ fontSize: "14px" }}>
                          Amazon S3 Secret
                        </p>
                        <div className="input-group d-flex flex-column mb-3">
                          <input
                            type="text"
                            className="form-control w-100"
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                            onBlur={() => handleFieldBlur("secret")}
                          />
                          
                        </div>
                      </div>
                      <div className="col">
                        <p className="mb-1" style={{ fontSize: "14px" }}>
                          Amazon S3 Region
                        </p>
                        <div className="input-group d-flex flex-column mb-3">
                          <input
                            type="text"
                            className="form-control w-100"
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col">
                        <p className="mb-1" style={{ fontSize: "14px" }}>
                          Amazon S3 Bucket
                        </p>
                        <div className="input-group d-flex flex-column mb-3">
                          <input
                            type="text"
                            className="form-control w-100"
                            value={bucket}
                            onChange={(e) => setBucket(e.target.value)}
                          />
                         
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="d-flex flex-row mt-5">
                    <button
                      onClick={handleStorageSave}
                      className="custom-icon-button button-success px-3 py-1 rounded me-2"
                    >
                      <IoSaveOutline fontSize={16} className="me-1" /> Save
                    </button>
                    <button
                      onClick={handleStorageCancel}
                      className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
                    >
                      <MdOutlineCancel fontSize={16} className="me-1" /> Cancel
                    </button>
                  </div>
                </Tab>
              </Tabs>
            </div>
          </div>
        </div>
        <ToastMessage
          message={toastMessage}
          show={showToast}
          onClose={() => setShowToast(false)}
          type={toastType}
        />
      </DashboardLayout>
    </>
  );
}
