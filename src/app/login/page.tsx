import Paragraph from "@/components/common/Paragraph";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const page = () => {
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
        <div className="col-12 col-lg-4 px-4 px-lg-5 d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "100svh", maxHeight: "100svh" }}>
          <Image
            src={"/logo.svg"}
            alt=""
            width={200}
            height={150}
            objectFit="cover"
            className="img-fluid mb-3"
          />
          <Paragraph text="Login to continue" color="Paragraph" />
          <form className="d-flex flex-column px-0 px-lg-3" style={{width: '100%'}}>
            <div className="d-flex flex-column">
              <div className="d-flex flex-column mt-3">
                <label htmlFor="email">Email</label>
                <input type="email" placeholder="email" className="mb-3" />
                <div className="d-none text-danger">Error</div>
              </div>
              <div className="d-flex flex-column mt-3">
                <label htmlFor="password">Password</label>
                <input type="password" placeholder="Password" className="" />
                <div className="d-none text-danger">Error</div>
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
              <button type="button" className="loginButton">
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default page;
