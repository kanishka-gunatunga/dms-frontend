/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Container, Navbar, Button, Nav, Dropdown } from "react-bootstrap";
import { FiMinus, FiPlus } from "react-icons/fi";
import { HiOutlineCog6Tooth } from "react-icons/hi2";
import {
  IoDocumentOutline,
  IoDocumentTextOutline,
} from "react-icons/io5";
import { LuLayoutDashboard} from "react-icons/lu";
import Cookie from "js-cookie";
import { useRouter } from "next/navigation";
import { useCompanyProfile } from "@/context/userCompanyProfile";
import LoadingSpinner from "./common/LoadingSpinner";
import { TbUsers } from "react-icons/tb";

const DashboardLayoutSuperAdmin: React.FC<{ children: React.ReactNode }> = ({
  children,

}) => {
  const { data, loading, } = useCompanyProfile();


  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [expandedGroups, setExpandedGroups] = useState<{
    [key: string]: boolean;
  }>({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const router = useRouter();


  const handleLogout = () => {
    Cookie.remove("authToken");
    Cookie.remove("userId");
    Cookie.remove("userEmail");
    Cookie.remove("userType");
    router.push("/super-admin-login");
  };

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };
  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  const closeDrawer = () => setIsDrawerOpen(false);

  useEffect(() => {
    const handleKeyDown = (event: { key: string }) => {
      if (event.key === "Escape" && isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen]);


  const navItems = [
    {
      name: "Dashboard",
      url: "/super-admin-dashboard",
      icon: <LuLayoutDashboard />,
      permission: { group: "Dashboard", action: "View Dashboard" },
    },
    {
      name: "Document Categories",
      url: "/document-category-sd",
      icon: <IoDocumentOutline />,
      permission: { group: "Document Categories", action: "Manage Document Category" },
    },
    {
          name: "AD Users",
          url: "/ad-users",
          icon: <TbUsers />,
          permission: { group: "AD Users", action: "AD Users" },
        },
    {
      name: "Settings",
      url: "#",
      icon: <HiOutlineCog6Tooth />,
      subItems: [
        {
          name: "FTP Accounts",
          url: "/ftp-accounts",
          icon: <IoDocumentTextOutline />,
          permission: { group: "FTP Accounts", action: "View FTP Accounts" },
        },
      ],
    },
  ];


  const logoUrl = data?.logo_url || '/logo.svg';

  if (loading) return <LoadingSpinner />;


  return (
    <div
      className="d-flex flex-column bg-light"
      style={{ minHeight: "100vh", backgroundColor: "", overflow: "hidden" }}
    >
      {/* {contextHolder} */}
      {/* =============== Header ===================== */}
      <Navbar bg="white" expand="lg" className="w-100 fixed-top shadow-sm">
        <Container fluid>
          <div className="d-flex flex-row w-100 px-0 px-lg-5">
            <div className="col-12 col-lg-6 d-flex flex-row justify-content-between justify-content-lg-start">
              <Navbar.Brand href="#">
                <Image
                  src={logoUrl}
                  alt=""
                  width={120}
                  height={100}
                  objectFit="responsive"
                  className="img-fluid navLogo"
                />
              </Navbar.Brand>
              <Button
                onClick={toggleSidebar}
                className="me-2 d-none d-lg-block"
                style={{
                  backgroundColor: "#fff",
                  color: "#333",
                  border: "none",
                  borderRadius: "100%",
                }}
              >
                ☰
              </Button>
              <div className="d-flex d-lg-none align-items-center justify-content-center">
                
                <Dropdown className="d-inline d-lg-none mx-2 bg-transparent" drop="down">
                  <Dropdown.Toggle
                    id="dropdown-autoclose-true"
                    className="custom-dropdown-toggle no-caret p-0 bg-transparent"
                    style={{
                      backgroundColor: "#fff",
                      color: "#333",
                      border: "none",
                      borderRadius: "100%",
                    }}
                  >
                    <Image
                      src={"/user.jpg"}
                      alt=""
                      width={35}
                      height={35}
                      objectFit="responsive"
                      className="rounded-circle"
                    />
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    {/* <Dropdown.Item href={`my-profile`}>Admin Account</Dropdown.Item> */}
                    <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                <Button
                  onClick={toggleDrawer}
                  className="me-2 d-block d-lg-none"
                  style={{
                    backgroundColor: "#fff",
                    color: "#333",
                    border: "none",
                    borderRadius: "100%",
                  }}
                >
                  ☰
                </Button>
              </div>
            </div>
            <div className="col-12 col-lg-6 d-none d-lg-flex justify-content-end align-items-center">
              <Dropdown className="d-none d-lg-inline mx-2 bg-transparent" drop="down">
                <Dropdown.Toggle
                  id="dropdown-autoclose-true"
                  className="custom-dropdown-toggle no-caret p-0 bg-transparent"
                  style={{
                    backgroundColor: "#fff",
                    color: "#333",
                    border: "none",
                    borderRadius: "100%",
                  }}
                >
                  <Image
                    src={"/user.jpg"}
                    alt=""
                    width={35}
                    height={35}
                    objectFit="responsive"
                    className="rounded-circle"
                  />
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  {/* <Dropdown.Item href={`my-profile`}>Admin Account</Dropdown.Item> */}
                  <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </Container>
      </Navbar>

      {/* ===================== Sidebar and main content ==================== */}
      <div
        className="d-none d-lg-flex flex-grow-1"
        style={{ paddingTop: "67px", height: "100svh", overflow: "hidden" }}
      >
        {/* sidebar */}
        <div
          className={`bg-white rounded flex-grow-1 ${isSidebarCollapsed ? "collapsed-sidebar" : "expanded-sidebar"
            }`}
          style={{
            width: isSidebarCollapsed ? "70px" : "290px",
            transition: "width 0.3s",
          }}
        >
          <Nav
            className="d-flex flex-column p-3 navbarAside custom-scroll"
            style={{
              minHeight: "100svh",
              height: "100svh",
              overflowY: "scroll",
              overflowX: "hidden",
            }}
          >
            <div className="d-flex flex-column mb-5">
              {navItems.map((item, index) => (
                <div key={index}>
                  <Nav.Link
                    onClick={() =>
                      item.subItems ? toggleGroup(item.name) : null
                    }
                    href={item.subItems ? undefined : item.url}
                    className="d-flex align-items-center justify-content-between px-2 pb-4"
                  >
                    <div className="d-flex align-items-center">
                      {item.icon}
                      <span
                        className={`ms-2 ${isSidebarCollapsed ? "d-none" : ""}`}
                      >
                        {item.name}
                      </span>
                    </div>
                    {item.subItems &&
                      (expandedGroups[item.name] ? (
                        <FiMinus size={16} />
                      ) : (
                        <FiPlus size={16} />
                      ))}
                  </Nav.Link>

                  <div
                    className="submenu"
                    style={{
                      height: expandedGroups[item.name]
                        ? `${item.subItems?.length
                          ? item.subItems.length * 40
                          : 0
                        }px`
                        : "0",
                      overflow: "hidden",
                      transition: "height 0.3s ease",
                    }}
                  >
                    {item.subItems && (
                      <Nav className="flex-column ms-4">
                        {item.subItems.map((subItem, subIndex) => (
                          <Nav.Link
                            key={subIndex}
                            href={subItem.url}
                            className="d-flex align-items-center px-2 pb-2"
                          >
                            <span
                              className={`ms-2 ${isSidebarCollapsed ? "d-none" : ""
                                }`}
                            >
                              {subItem.name}
                            </span>
                          </Nav.Link>
                        ))}
                      </Nav>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Nav>
        </div>

        <Container fluid className="mt-0">
          {children}
        </Container>
      </div>

      <div
        className="d-flex d-lg-none flex-grow-1 position-relative mb-3"
        style={{ paddingTop: "67px", height: "100svh", overflow: "hidden", overflowY:"scroll" }}
      >
        {isDrawerOpen && (
          <div
            className="drawer-backdrop"
            onClick={closeDrawer}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 1040,
            }}
          />
        )}

        <div
          className={`bg-white rounded flex-grow-1 position-absolute top-0 left-0 ${isDrawerOpen ? "expanded-sidebar" : "collapsed-sidebar"
            }`}
          style={{
            width: isDrawerOpen ? "300px" : "0px",
            transition: "width 0.3s ease",
            zIndex: 1050,
          }}
        >
          <div className="d-flex pt-4 pb-3 px-2 flex-row justify-content-between">
            <Navbar.Brand href="#">
              <Image
                src={logoUrl}
                alt=""
                width={120}
                height={100}
                objectFit="responsive"
                className="img-fluid navLogo"
              />
            </Navbar.Brand>
            {/* <button onClick={closeDrawer}>X</button> */}
          </div>
          <Nav
            className="d-flex flex-column p-0 navbarAside custom-scroll"
            style={{
              minHeight: "100svh",
              height: "100svh",
              overflowY: "scroll",
              overflowX: "hidden",
            }}
          >
            <div className="d-flex flex-column mb-5 pb-4">
              {navItems.map((item, index) => (
                <div key={index}>
                  <Nav.Link
                    onClick={() =>
                      item.subItems ? toggleGroup(item.name) : null
                    }
                    href={item.subItems ? undefined : item.url}
                    className="d-flex align-items-center justify-content-between px-2 pb-4"
                  >
                    <div className="d-flex align-items-center">
                      {item.icon}
                      <span
                        className={`ms-2 ${isSidebarCollapsed ? "d-none" : ""}`}
                      >
                        {item.name}
                      </span>
                    </div>
                    {item.subItems &&
                      (expandedGroups[item.name] ? (
                        <FiMinus size={16} />
                      ) : (
                        <FiPlus size={16} />
                      ))}
                  </Nav.Link>

                  {/* sub items */}
                  <div
                    className="submenu"
                    style={{
                      height: expandedGroups[item.name]
                        ? `${item.subItems?.length
                          ? item.subItems.length * 40
                          : 0
                        }px`
                        : "0",
                      overflow: "hidden",
                      transition: "height 0.3s ease",
                    }}
                  >
                    {item.subItems && (
                      <Nav className="flex-column ms-4">
                        {item.subItems.map((subItem, subIndex) => (
                          <Nav.Link
                            key={subIndex}
                            href={subItem.url}
                            className="d-flex align-items-center px-2 pb-2"
                          >
                            <span
                              className={`ms-2 ${isSidebarCollapsed ? "d-none" : ""
                                }`}
                            >
                              {subItem.name}
                            </span>
                          </Nav.Link>
                        ))}
                      </Nav>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Nav>
        </div>

        <Container fluid>{children}</Container>
      </div>
    </div>
  );
};

export default DashboardLayoutSuperAdmin;
