"use client";

import Heading from "@/components/common/Heading";
import DashboardLayout from "@/components/DashboardLayout";
import React, { useState } from "react";
import { Tabs, Tab, Card, Dropdown, DropdownButton } from "react-bootstrap";
import { IoImageOutline, IoSaveOutline } from "react-icons/io5";
import { MdOutlineCancel } from "react-icons/md";

type S3Fields = Record<"key" | "secret" | "bucket" | "region", string>;
type Errors = Record<"key" | "secret" | "bucket", boolean>;

export default function AllDocTable() {
  const [selectedStorage, setSelectedStorage] = useState(
    "Local Disk (Default)"
  );
  const [s3Fields, setS3Fields] = useState<S3Fields>({
    key: "",
    secret: "",
    bucket: "",
    region: "",
  });
  const [errors, setErrors] = useState<Errors>({
    key: false,
    secret: false,
    bucket: false,
  });

  const handleLogoChange = () => {
    console.log("clicked");
  };

  const handleBannerImageChange = () => {
    console.log("clicked");
  };

  const handleSave = () => {
    console.log("clicked");
  };

  const handleCancel = () => {
    console.log("clicked");
  };

  const handleStorageSave = () => {
    console.log("clicked");
  };

  const handleStorageCancel = () => {
    console.log("clicked");
  };

  const handleStorageSelect = (selected: string) => {
    setSelectedStorage(selected);
    setS3Fields({ key: "", secret: "", bucket: "", region: "" });
    setErrors({ key: false, secret: false, bucket: false });
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
          <Heading text="Company Profile" color="#444" />
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
                      <p className="mb-1" style={{ fontSize: "14px" }}>
                        Name
                      </p>
                      <div className="input-group mb-3 pe-lg-4">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Name"
                        ></input>
                      </div>
                      <p className="mb-2" style={{ fontSize: "14px" }}>
                        Logo
                      </p>
                      <Card
                        style={{ width: "18rem" }}
                        className="shadow-sm border-0 p-3"
                      >
                        <Card.Img variant="top" src="/logo.svg" />
                        <Card.Body className="p-0 pt-3">
                          <button
                            onClick={handleLogoChange}
                            className="custom-icon-button button-success px-3 py-1 rounded"
                          >
                            <IoImageOutline fontSize={16} className="me-1" />{" "}
                            Change Logo
                          </button>
                        </Card.Body>
                      </Card>
                    </div>
                    <div className="col-12 col-lg-6">
                      <p className="mb-2" style={{ fontSize: "14px" }}>
                        Banner Image
                      </p>
                      <Card
                        style={{ width: "80%" }}
                        className="shadow-sm border-0 p-3"
                      >
                        <Card.Img variant="top" src="/login-image.png" />
                        <Card.Body className="p-0 pt-3">
                          <button
                            onClick={handleBannerImageChange}
                            className="custom-icon-button button-success px-3 py-1 rounded"
                          >
                            <IoImageOutline fontSize={16} className="me-1" />{" "}
                            Change Banner
                          </button>
                        </Card.Body>
                      </Card>
                    </div>
                  </div>
                  <div className="d-flex flex-row">
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
                            value={s3Fields.key}
                            onChange={(e) =>
                              handleInputChange("key", e.target.value)
                            }
                            onBlur={() => handleFieldBlur("key")}
                          />
                          {errors.key && (
                            <p
                              className="mb-1 text-danger"
                              style={{ fontSize: "14px" }}
                            >
                              required field
                            </p>
                          )}
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
                            value={s3Fields.secret}
                            onChange={(e) =>
                              handleInputChange("secret", e.target.value)
                            }
                            onBlur={() => handleFieldBlur("secret")}
                          />
                          {errors.secret && (
                            <p
                              className="mb-1 text-danger"
                              style={{ fontSize: "14px" }}
                            >
                              required field
                            </p>
                          )}
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
                            value={s3Fields.region}
                            onChange={(e) =>
                              handleInputChange("region", e.target.value)
                            }
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
                            value={s3Fields.bucket}
                            onChange={(e) =>
                              handleInputChange("bucket", e.target.value)
                            }
                            onBlur={() => handleFieldBlur("bucket")}
                          />
                          {errors.bucket && (
                            <p
                              className="mb-1 text-danger"
                              style={{ fontSize: "14px" }}
                            >
                              required field
                            </p>
                          )}
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
      </DashboardLayout>
    </>
  );
}
