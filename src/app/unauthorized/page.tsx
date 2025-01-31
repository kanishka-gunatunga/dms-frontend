"use client";

import Heading from "@/components/common/Heading";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useCompanyProfile } from "@/context/userCompanyProfile";
import useAuth from "@/hooks/useAuth";
import Image from "next/image";
import React from "react";

export default function AllDocTable() {
  const isAuthenticated = useAuth();
    const { data } = useCompanyProfile();

    const imageUrl = data?.logo_url || '/logo.png';


  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }
  return (
    <>
      <div
        className="d-flex flex-column flex-lg-row w-100"
        style={{ minHeight: "100svh", maxHeight: "100svh" }}
      >
        <div
          className="col-12 align-self-center px-4 px-lg-5 d-flex flex-column justify-content-center align-items-center"
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
          <Heading text="You doesn't have permission. please contact admin" color="#444" />
        </div>
      </div>
    </>
  );
}
