/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import Paragraph from "@/components/common/Paragraph";
import { useCompanyProfile } from "@/context/userCompanyProfile";
import { Input } from "antd";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { postWithAuth } from "@/utils/apiClient";
import ToastMessage from "@/components/common/Toast";
import { API_BASE_URL } from "@/utils/apiClient";
type Params = {
  id: string;
};

interface Props {
  params: Params;
}
const page = ({ params }: Props) => {
    const id = params?.id;
    const { data } = useCompanyProfile();
  const [password, setPassword] = useState<string>("");
  const [password_confirmation, setPasswordConfirmation] = useState<string>("");
  const [errors, setErrors] = useState<{ password?: string; password_confirmation?: string }>(
    {}
  );
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});

    const validationErrors: { password?: string; password_confirmation?: string } = {};
    if (!password) validationErrors.password = "Password is required";
    if (!password_confirmation) validationErrors.password_confirmation = "Confirm password is required";
    if (password != password_confirmation) validationErrors.password_confirmation = "Passwords dosen't match";
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("password", password);
      formData.append("password_confirmation", password_confirmation);

    const response = await fetch(`${API_BASE_URL}reset-password`, {
            method: "POST",
            body: formData,
    })
    const data = await response.json();

    if (data.status === "success") {
      setToastType("success");
      setToastMessage("Password reset successful");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    } else if (data.status === "fail") {
      if (data.errors) {
        setErrors({
          password: data.errors.host?.[0] || "",
          password_confirmation: data.errors.port?.[0] || "",
        });
      }
      setToastType("error");
      setToastMessage("Failed to reset.");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    }
    } catch (error) {
      console.error("Error during reset:", error);
      setToastType("error");
      setToastMessage("Failed to reset.");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };
  const imageUrl = data?.logo_url || '/logo.png';
  const bannerUrl = data?.banner_url || '/login-image.png';
  return (
    <>
      <div
        className="d-flex flex-column flex-lg-row-reverse w-100"
        style={{ minHeight: "100svh", maxHeight: "100svh" }}
      >
        <div
          className="col-12 col-lg-8 d-none d-lg-block"
          style={{
            minHeight: "100svh",
            maxHeight: "100svh",
            backgroundColor: "#EBF2FB",
          }}
        >
          <Image
            src={bannerUrl}
            alt=""
            width={1000}
            height={800}
            className="img-fluid"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
        <div
          className="col-12 col-md-6 align-self-center  col-lg-4 px-4 px-lg-5 d-flex flex-column justify-content-center align-items-center"
          style={{ minHeight: "100svh", maxHeight: "100svh" }}
        >
          <Image
            src={imageUrl}
            alt=""
            width={200}
            height={150}
            objectFit="cover"
            className="img-fluid mb-3 mb-lg-4 loginLogo"
          />
          <h3 className="mb-0">Rest Password</h3>
          <Paragraph
            text="Enter your new password"
            color="Paragraph"
          />
          <form
            className="d-flex flex-column px-0 px-lg-3 mt-3 mt-lg-4"
            style={{ width: "100%" }}
            onSubmit={handleLogin}
          >
            <div className="d-flex flex-column">
              <div className="d-flex flex-column mt-3">
                <Input type="password"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`mb-3 ${errors.password ? "is-invalid" : ""}`} />
                {errors.password && (
                  <div className="text-danger">{errors.password}</div>
                )}
              </div>
              <div className="d-flex flex-column mt-3">
                <Input type="password"
                  placeholder="Confirm Password"
                  value={password_confirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className={`mb-3 ${errors.password_confirmation ? "is-invalid" : ""}`} />
                {errors.password_confirmation && (
                  <div className="text-danger">{errors.password_confirmation}</div>
                )}
              </div>

              <div className="d-flex flex-row align-items-center">
                <p className="mb-0 me-2">Want to login ? </p>
                <Link
                  href="/login"
                  style={{
                    fontSize: "14px",
                    color: "#333",
                    textDecoration: "none",
                  }}
                  className="py-3 d-flex align-self-end"
                >
                  Log in
                </Link>
              </div>
              <button type="submit" className="loginButton text-white" disabled={loading}>
                {loading ? "Loading..." : "Reset My Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastMessage
          message={toastMessage}
          show={showToast}
          onClose={() => setShowToast(false)}
          type={toastType}
        />
    </>
  );
};

export default page;
