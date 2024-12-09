/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import Paragraph from "@/components/common/Paragraph";
import { Input } from "antd";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

const page = () => {
  const [email, setEmail] = useState<string>("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});

    const validationErrors: { email?: string; password?: string } = {};
    if (!email) validationErrors.email = "Email is required";
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);

      const response = await fetch("login", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (data.data?.token) {
        window.location.href = "/";
      } else {
        alert("Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Error during login:", error);
    } finally {
      setLoading(false);
    }
  };

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
            src={"/login-image.png"}
            alt=""
            width={1000}
            height={800}
            className="img-fluid"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>
        <div
          className="col-12 col-md-6 align-self-center  col-lg-4 px-4 px-lg-5 d-flex flex-column justify-content-center align-items-center"
          style={{ minHeight: "100svh", maxHeight: "100svh" }}
        >
          <Image
            src={"/logo.svg"}
            alt=""
            width={200}
            height={150}
            objectFit="cover"
            className="img-fluid mb-3 mb-lg-4"
          />
          <h3 className="mb-0">Forgotten Password ?</h3>
          <Paragraph
            text="Enter your email to reset your password"
            color="Paragraph"
          />
          <form
            className="d-flex flex-column px-0 px-lg-3 mt-3 mt-lg-4"
            style={{ width: "100%" }}
            onSubmit={handleLogin}
          >
            <div className="d-flex flex-column">
              <div className="d-flex flex-column mt-3">
                <Input type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`mb-3 ${errors.email ? "is-invalid" : ""}`} />
                {errors.email && (
                  <div className="text-danger">{errors.email}</div>
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
    </>
  );
};

export default page;
