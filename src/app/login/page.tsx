/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import Paragraph from "@/components/common/Paragraph";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

const page = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [loading, setLoading] = useState<boolean>(false);

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
          alert("Geolocation is not supported by your browser.");
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

      const response = await fetch(
        "https://sites.techvoice.lk/dms-backend/api/login",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      console.log("API Response:", data);
    } catch (error) {
      console.error("Error during login:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="d-flex flex-column flex-lg-row w-100"
        style={{ minHeight: "100svh", maxHeight: "100svh" }}
      >
        <div
          className="col-12 col-lg-8 d-none d-lg-block"
          style={{ minHeight: "100svh", maxHeight: "100svh" }}
        >
          <Image
            src={"/login-image.png"}
            alt=""
            width={800}
            height={600}
            objectFit="cover"
            className="img-fluid"
            style={{ width: "100%", height: "100%" }}
          />
        </div>
        <div
          className="col-12 col-lg-4 px-4 px-lg-5 d-flex flex-column justify-content-center align-items-center"
          style={{ minHeight: "100svh", maxHeight: "100svh" }}
        >
          <Image
            src={"/logo.svg"}
            alt=""
            width={200}
            height={150}
            objectFit="cover"
            className="img-fluid mb-3"
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
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`mb-3 ${errors.email ? "is-invalid" : ""}`}
                />
                {errors.email && (
                  <div className="text-danger">{errors.email}</div>
                )}
              </div>
              <div className="d-flex flex-column mt-3">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? "is-invalid" : ""}
                />
                {errors.password && (
                  <div className="text-danger">{errors.password}</div>
                )}
              </div>

              <Link
                href="#"
                style={{
                  fontSize: "14px",
                  color: "#333",
                  textDecoration: "none",
                }}
                className="py-3 d-flex align-self-end"
              >
                Forgot Password?
              </Link>
              <button type="submit" className="loginButton" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default page;
