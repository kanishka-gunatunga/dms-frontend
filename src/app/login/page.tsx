/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import Paragraph from "@/components/common/Paragraph";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import Cookies from "js-cookie";
import { API_BASE_URL } from "@/utils/apiClient";
import ToastMessage from "@/components/common/Toast";
import { Input } from "antd";
import { useCompanyProfile } from "@/context/userCompanyProfile";

const page = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");
  const { data } = useCompanyProfile();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});

    const validationErrors: { email?: string; password?: string } = {};
    if (!email) validationErrors.email = "Email is required";
    if (!password) validationErrors.password = "Password is required";
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const getLocation = (): Promise<{
      latitude?: number;
      longitude?: number;
    }> => {
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          resolve({});
          // alert("Geolocation is not supported by your browser.");
          setToastType("error");
          setToastMessage("Geolocation is not supported by your browser.");
          setShowToast(true);
          setTimeout(() => {
            setShowToast(false);
          }, 5000);
        } else {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            },
            () => {
              resolve({});
            }
          );
        }
      });
    };

    setLoading(true);

    try {
      const { latitude, longitude } = await getLocation();

      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      if (latitude !== undefined)
        formData.append("latitude", latitude.toString());
      if (longitude !== undefined)
        formData.append("longitude", longitude.toString());

      const response = await fetch(`${API_BASE_URL}login`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (data.data?.token) {
        Cookies.set("authToken", data.data.token, {
          expires: 1,
          secure: true,
          sameSite: "strict",
        });

        Cookies.set("userId", data.data.id, { expires: 1 });
        Cookies.set("userEmail", data.data.email, { expires: 1 });

        window.location.href = "/";
        setToastType("success");
        setToastMessage("Logged in successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      } else {
        setToastType("error");
        setToastMessage("Login failed. Please check your credentials.");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      console.error("Error during login:", error);
    } finally {
      setLoading(false);
    }
  };

  const imageUrl = data?.logo_url || '/logo.png';
  const bannerUrl = data?.banner_url || '/login-image.png';
  return (
    <>
      <div
        className="d-flex flex-column flex-lg-row w-100"
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
            className="img-fluid mb-3 loginLogo"
          />
          <Paragraph text="Login to continue" color="Paragraph" />
          <form
            className="d-flex flex-column px-0 px-lg-3"
            style={{ width: "100%" }}
            onSubmit={handleLogin}
          >
            <div className="d-flex flex-column">
              <div className="d-flex flex-column mt-3">
                <label htmlFor="email">Email</label>
                <Input type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`mb-3 ${errors.email ? "is-invalid" : ""}`} />
                {errors.email && (
                  <div className="text-danger">{errors.email}</div>
                )}
              </div>
              <div className="d-flex flex-column mt-3">
                <label htmlFor="password">Password</label>
                <Input.Password
                  placeholder="Input password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? "is-invalid" : ""}
                />
                {errors.password && (
                  <div className="text-danger">{errors.password}</div>
                )}
              </div>

              <Link
                href="/forgot-password"
                style={{
                  fontSize: "14px",
                  color: "#333",
                  textDecoration: "none",
                }}
                className="py-3 d-flex align-self-end"
              >
                Forgot Password?
              </Link>
              <button type="submit" className="loginButton text-white" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
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
