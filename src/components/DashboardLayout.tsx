"use client";
import Image from "next/image";
import React, { useState } from "react";
import { Container, Navbar, Button, Nav } from "react-bootstrap";
import { FaHome, FaChartBar } from "react-icons/fa";

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  return (
    <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>
      {/* Header */}
      <Navbar bg="light" expand="lg" className="border-bottom w-100 fixed-top">
        <Container fluid>
          <div className="d-flex flex-row w-100">
            <div className="col-12 col-lg-6 d-flex flex-row">
              <Navbar.Brand href="#">
                <Image
                  src={"/logo.svg"}
                  alt=""
                  width={100}
                  height={100}
                  objectFit="responsive"
                  className="img-fluid"
                />
              </Navbar.Brand>
              <Button
                variant="outline-primary"
                onClick={toggleSidebar}
                className="me-2"
              >
                ☰
              </Button>
            </div>
            <div className="col-12 col-lg-6 d-flex justify-content-end">
                Hi
            </div>
          </div>
        </Container>
      </Navbar>

      {/* Sidebar and Main Content */}
      <div className="d-flex flex-grow-1" style={{ paddingTop: "56px" }}>
        {/* Sidebar */}
        <div
          className={`bg-light border-end ${
            isSidebarCollapsed ? "collapsed-sidebar" : "expanded-sidebar"
          }`}
          style={{
            width: isSidebarCollapsed ? "80px" : "240px",
            transition: "width 0.3s",
          }}
        >
          <Nav className="flex-column p-3">
            <Nav.Link href="/" className="d-flex align-items-center">
              <FaHome size={20} />
              <span className={`ms-2 ${isSidebarCollapsed ? "d-none" : ""}`}>
                Home
              </span>
            </Nav.Link>
            <Nav.Link href="/dashboard" className="d-flex align-items-center">
              <FaChartBar size={20} />
              <span className={`ms-2 ${isSidebarCollapsed ? "d-none" : ""}`}>
                Dashboard
              </span>
            </Nav.Link>
          </Nav>
        </div>

        {/* Main Content Area */}
        <Container fluid className="mt-3">
          {children}
        </Container>
      </div>

      <style jsx global>{`
        .collapsed-sidebar {
          width: 80px;
        }
        .expanded-sidebar {
          width: 240px;
        }
        .sidebar-title {
          font-size: 1.25rem;
          font-weight: bold;
          color: #333;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
