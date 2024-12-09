"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Container, Navbar, Button, Nav, Dropdown } from "react-bootstrap";
import { BsArchive } from "react-icons/bs";
import { CiWavePulse1 } from "react-icons/ci";
import { FaRegBell } from "react-icons/fa6";
import { FiBell, FiMinus, FiPlus } from "react-icons/fi";
import { MdOutlineDocumentScanner } from "react-icons/md";
import { GoZoomIn } from "react-icons/go";
import { HiOutlineCog6Tooth } from "react-icons/hi2";
import {
  IoDocumentOutline,
  IoDocumentTextOutline,
  IoListOutline,
} from "react-icons/io5";
import { LuLayoutDashboard, LuLogIn, LuUserPlus } from "react-icons/lu";
import { RiUser3Line } from "react-icons/ri";
import { TbUsers } from "react-icons/tb";
import Cookie from "js-cookie";
import { useRouter } from "next/navigation";

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
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
    router.push("/login");
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
  const showSettings = false;
  

  const navItems = [
    { name: "Dashboard", url: "/", icon: <LuLayoutDashboard /> },
    {
      name: "Assigned Documents",
      url: "/assigned-documents",
      icon: <IoListOutline />,
    },
    {
      name: "All Documents",
      url: "/all-documents",
      icon: <IoDocumentTextOutline />,
    },
    {
      name: "Bulk Upload",
      url: "/bulk-upload",
      icon: <IoDocumentTextOutline />,
    },
    { name: "Deep Search", url: "/deep-search", icon: <GoZoomIn /> },
    {
      name: "Document Categories",
      url: "/document-categories",
      icon: <IoDocumentOutline />,
    },
    {
      name: "Attributes",
      url: "/attributes",
      icon: <IoDocumentOutline />,
    },
    {
      name: "Sector Categories",
      url: "/sector",
      icon: <MdOutlineDocumentScanner />,
    },
    {
      name: "Documents Audit Trail",
      url: "/documents-audit-trail",
      icon: <CiWavePulse1 />,
    },
    {
      name: "Archived Documents",
      url: "/archived-documents",
      icon: <BsArchive />,
    },
    { name: "Roles", url: "/roles", icon: <TbUsers /> },
    { name: "Users", url: "/users", icon: <RiUser3Line /> },
    { name: "Role User", url: "/role-user", icon: <LuUserPlus /> },
    { name: "Reminder", url: "/reminders", icon: <FiBell /> },
    { name: "Login Audits", url: "/login-audits", icon: <LuLogIn /> },
    {
      name: "Settings",
      url: "#",
      icon: <HiOutlineCog6Tooth />,
      subItems: [
        { name: "Email SMTP", url: "/email-smtp" },
        { name: "Company Profile", url: "/company-profile" },
        { name: "Languages", url: "/languages" },
        { name: "Page Helpers", url: "/page-helpers" },
      ],
    },
  ];

  const filteredNavItems = navItems.filter(item => item.name !== "Settings" || showSettings);

  return (
    <div
      className="d-flex flex-column bg-light"
      style={{ minHeight: "100vh", backgroundColor: "", overflow: "hidden" }}
    >
      {/* =============== Header ===================== */}
      <Navbar bg="white" expand="lg" className="w-100 fixed-top shadow-sm">
        <Container fluid>
          <div className="d-flex flex-row w-100 px-0 px-lg-5">
            <div className="col-12 col-lg-6 d-flex flex-row justify-content-between justify-content-lg-start">
              <Navbar.Brand href="#">
                <Image
                  src={"/logo.svg"}
                  alt=""
                  width={120}
                  height={100}
                  objectFit="responsive"
                  className="img-fluid"
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
            <div className="col-12 col-lg-6 d-flex justify-content-end align-items-center">
              <Dropdown className="d-inline mx-2 bg-transparent">
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
                    src={"/united-states.svg"}
                    alt=""
                    width={25}
                    height={25}
                    objectFit="responsive"
                    className="img-fluid rounded "
                  />
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item href="#">
                    <Image
                      src={"/united-states.svg"}
                      alt=""
                      width={25}
                      height={25}
                      objectFit="responsive"
                      className="img-fluid rounded"
                    />{" "}
                    English
                  </Dropdown.Item>
                  <Dropdown.Item href="#">
                    <Image
                      src={"/united-states.svg"}
                      alt=""
                      width={25}
                      height={25}
                      objectFit="responsive"
                      className="img-fluid rounded"
                    />{" "}
                    English
                  </Dropdown.Item>
                  <Dropdown.Item href="#">
                    <Image
                      src={"/united-states.svg"}
                      alt=""
                      width={25}
                      height={25}
                      objectFit="responsive"
                      className="img-fluid rounded"
                    />{" "}
                    English
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <Button
                className="px-3 py-0"
                style={{
                  backgroundColor: "#fff",
                  color: "#333",
                  border: "none",
                  borderRadius: "100%",
                }}
              >
                <div className="position-relative">
                  <FaRegBell />
                  <span className="position-absolute top-0 start-100 translate-middle p-1 bg-warning rounded-circle">
                    <span className="visually-hidden">New alerts</span>
                  </span>
                </div>
              </Button>

              <Dropdown className="d-inline mx-2 bg-transparent" drop="down">
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
                  <Dropdown.Item href="#">Admin Profile</Dropdown.Item>
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
          className={`bg-white rounded flex-grow-1 ${
            isSidebarCollapsed ? "collapsed-sidebar" : "expanded-sidebar"
          }`}
          style={{
            width: isSidebarCollapsed ? "70px" : "290px",
            transition: "width 0.3s",
          }}
        >
          {/* <Nav
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
                        ? `${
                            item.subItems?.length
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
                              className={`ms-2 ${
                                isSidebarCollapsed ? "d-none" : ""
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
          </Nav> */}
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
    {filteredNavItems.map((item, index) => (
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
              ? `${item.subItems?.length ? item.subItems.length * 40 : 0}px`
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
                    className={`ms-2 ${isSidebarCollapsed ? "d-none" : ""}`}
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
        className="d-flex d-lg-none flex-grow-1 position-relative"
        style={{ paddingTop: "67px", height: "100svh", overflow: "hidden" }}
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
          className={`bg-white rounded flex-grow-1 position-absolute top-0 left-0 ${
            isDrawerOpen ? "expanded-sidebar" : "collapsed-sidebar"
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
                src={"/logo.svg"}
                alt=""
                width={120}
                height={100}
                objectFit="responsive"
                className="img-fluid"
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

                  {/* sub items */}
                  <div
                    className="submenu"
                    style={{
                      height: expandedGroups[item.name]
                        ? `${
                            item.subItems?.length
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
                              className={`ms-2 ${
                                isSidebarCollapsed ? "d-none" : ""
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

export default DashboardLayout;
