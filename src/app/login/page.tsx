import Paragraph from "@/components/common/Paragraph";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Form } from "react-bootstrap";

const page = () => {
  return (
    <>
      <div
        className="d-flex flex-column flex-lg-row w-100"
        style={{ minHeight: "100svh", maxHeight: "100svh" }}
      >
        <div
          className="col-12 col-lg-8"
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
        <div className="col-12 col-lg-4 d-flex flex-column justify-content-center align-items-center">
          <Image
            src={"/logo.svg"}
            alt=""
            width={200}
            height={150}
            objectFit="cover"
            className="img-fluid mb-3"
          />
          <Paragraph text="Login to continue" color="Paragraph" />
          <Form>
            <div className="d-flex flex-column">
              <Form.Control
                type="email"
                placeholder="email"
                className="mb-3 mt-3"
              />
              <Form.Control
                type="password"
                placeholder="Password"
                className=""
              />
              <Link href="#" style={{fontSize: '14px', color: '#333', textDecoration: 'none'}} className="py-3">Forgot Password?</Link>
              <button type="button" className="btn btn-primary">
                Primary
              </button>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
};

export default page;
