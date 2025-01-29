/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Heading from "@/components/common/Heading";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import React, { useEffect, useState } from "react";
import ToastMessage from "@/components/common/Toast";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { postWithAuth } from "@/utils/apiClient";
import { DropdownButton, Dropdown } from "react-bootstrap";
import { IoClose, IoSaveOutline } from "react-icons/io5";
import { fetchAndMapUserData, fetchRoleData } from "@/utils/dataFetchFunctions";
import { RoleDropdownItem, UserDropdownItem } from "@/types/types";
import { Checkbox, DatePicker, Radio } from "antd";
import type { DatePickerProps } from "antd";
import type { RadioChangeEvent } from 'antd';
import { useRouter } from "next/navigation";


interface HalfMonth {
    period: string;
    month: string;
    date: string | number;
}

export default function AllDocTable() {
    const isAuthenticated = useAuth();
    const router = useRouter()
    const [showToast, setShowToast] = useState(false);
    const [toastType, setToastType] = useState<"success" | "error">("success");
    const [toastMessage, setToastMessage] = useState("");
    const [addReminder, setAddReminder] = useState<{
        subject: string;
        message: string;
        is_repeat: string;
        date_time: string;
        send_email: string;
        frequency: string;
        end_date_time: string;
        start_date_time: string;
        frequency_details: string[];
        users: string[];
        roles: string[];
    } | null>(null);
    const [weekDay, setWeekDay] = useState<string[]>([]);
    const [days, setDays] = useState<string>("");
    const [halfMonths, setHalfMonths] = useState<HalfMonth[]>([]);
    const [quarterMonths, setQuarterMonths] = useState<HalfMonth[]>([]);
    const [users, setUsers] = useState<string[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [userDropDownData, setUserDropDownData] = useState<UserDropdownItem[]>(
        []
    );
    const [selectedDateTime, setSelectedDateTime] = useState<string>("");
    const [selectedStartDateTime, setSelectedStartDateTime] = useState<string>("");
    const [selectedEndDateTime, setSelectedEndDateTime] = useState<string>("");
    const [roles, setRoles] = useState<string[]>([]);
    const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
    const [roleDropDownData, setRoleDropDownData] = useState<RoleDropdownItem[]>(
        []
    );


    useEffect(() => {
        fetchAndMapUserData(setUserDropDownData);
        fetchRoleData(setRoleDropDownData);
    }, []);

    if (!isAuthenticated) {
        return <LoadingSpinner />;
    }

    const handleAddReminder = async () => {
        try {
            const formData = new FormData();
            formData.append("subject", addReminder?.subject || '');
            formData.append("message", addReminder?.message || "");
            formData.append("date_time", selectedDateTime || "");
            formData.append("is_repeat", addReminder?.is_repeat || "");
            formData.append("send_email", addReminder?.send_email || "");
            formData.append("frequency", addReminder?.frequency || "");
            formData.append("end_date_time", selectedEndDateTime || "");
            formData.append("start_date_time", selectedStartDateTime || "");
            if (addReminder?.frequency === "Daily") {
                formData.append("frequency_details", JSON.stringify(weekDay) || "");
            } else if (addReminder?.frequency === "Weekly") {
                formData.append("frequency_details", JSON.stringify(days) || "");
            }
            else if (addReminder?.frequency === "Quarterly") {
                formData.append("frequency_details", JSON.stringify(quarterMonths) || "");
            }
            else if (addReminder?.frequency === "Half Yearly") {
                formData.append("frequency_details", JSON.stringify(halfMonths) || "");
            }

            if (users) {
                formData.append("users", JSON.stringify(addReminder?.users) || "");
            }

            if (roles) {
                formData.append("roles", JSON.stringify(addReminder?.roles) || "");
            }


            formData.forEach((value, key) => {
                console.log(`${key}: ${value}`);
            });
            
            const response = await postWithAuth(
                `reminder/`,
                formData
            );
            if (response.status === "success") {
                setToastType("success");
                setToastMessage("Reminder added successfully!");
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                }, 5000);
                router.push("/reminders")
            } else if (response.status === "fail") {
                setToastType("error");
                setToastMessage("Failed to add reminder!");
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                }, 5000);
            }
        } catch (error) {
            setToastType("error");
            setToastMessage("Failed to add reminder!");
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
            }, 5000);
            // console.error("Error new version updating:", error);
        }
    };

    const handleUserSelect = (userId: string) => {
        const selectedUser = userDropDownData.find(
            (user) => user.id.toString() === userId
        );

        if (selectedUser && !selectedUserIds.includes(userId)) {
            setSelectedUserIds([...selectedUserIds, userId]);
            setUsers([...users, selectedUser.user_name]);

            setAddReminder((prev) => ({
                ...(prev || {
                    subject: "",
                    message: "",
                    is_repeat: "0",
                    date_time: "",
                    send_email: "",
                    frequency: "",
                    end_date_time: "",
                    start_date_time: "",
                    frequency_details: [],
                    users: [],
                    roles: [],
                }),
                users: [...(prev?.users || []), userId],
            }));
        }
    };

    const handleUserRemove = (userName: string) => {
        const userToRemove = userDropDownData.find(
            (user) => user.user_name === userName
        );

        if (userToRemove) {
            setSelectedUserIds(
                selectedUserIds.filter((id) => id !== userToRemove.id.toString())
            );
            setUsers(users.filter((r) => r !== userName));

            setAddReminder((prev) => ({
                ...(prev || {
                    subject: "",
                    message: "",
                    is_repeat: "0",
                    date_time: "",
                    send_email: "",
                    frequency: "",
                    end_date_time: "",
                    start_date_time: "",
                    frequency_details: [],
                    users: [],
                    roles: [],
                }),
                users: (prev?.users || []).filter(
                    (id) => id !== userToRemove.id.toString()
                ),
            }));
        }
    };

    const handleRoleSelect = (roleId: string) => {
        const selectedRole = roleDropDownData.find(
            (role) => role.id.toString() === roleId
        );

        if (selectedRole && !selectedRoleIds.includes(roleId)) {
            setSelectedRoleIds([...selectedRoleIds, roleId]);
            setRoles([...roles, selectedRole.role_name]);

            setAddReminder((prev) => ({
                ...(prev || {
                    subject: "",
                    message: "",
                    is_repeat: "0",
                    date_time: "",
                    send_email: "",
                    frequency: "",
                    end_date_time: "",
                    start_date_time: "",
                    frequency_details: [],
                    users: [],
                    roles: [],
                }),
                roles: [...(prev?.roles || []), roleId],
            }));
        }
    };

    const handleRemoveRole = (roleName: string) => {
        const roleToRemove = roleDropDownData.find(
            (role) => role.role_name === roleName
        );

        if (roleToRemove) {
            setSelectedRoleIds(
                selectedRoleIds.filter((id) => id !== roleToRemove.id.toString())
            );
            setRoles(roles.filter((r) => r !== roleName));
        }
    };

    const handleDailyCheckboxChange = (day: string) => {
        setWeekDay((prevWeekDay) => {
            if (prevWeekDay.includes(day)) {
                return prevWeekDay.filter((d) => d !== day);
            } else {
                return [...prevWeekDay, day];
            }
        });
    };


    const handleWeekRadioChange = (e: RadioChangeEvent) => {
        setDays(e.target.value);
    };

    const handleHalfMonthChange = (period: string, month: string) => {
        setHalfMonths((prevState) => {
            const updatedState = [...prevState];
            const periodIndex = updatedState.findIndex((item) => item.period === period);

            if (periodIndex > -1) {
                updatedState[periodIndex].month = month;
            } else {
                updatedState.push({ period, month, date: "" });
            }

            return updatedState;
        });
    };

    const handleHalfMonthDateChange = (period: string, date: string) => {
        setHalfMonths((prevState) => {
            const updatedState = [...prevState];
            const periodIndex = updatedState.findIndex((item) => item.period === period);

            if (periodIndex > -1) {
                updatedState[periodIndex].date = date;
            }

            return updatedState;
        });
    };

    const handleQuarterMonthChange = (period: string, month: string) => {
        setQuarterMonths((prevState) => {
            const updatedState = [...prevState];
            const periodIndex = updatedState.findIndex((item) => item.period === period);

            if (periodIndex > -1) {
                updatedState[periodIndex].month = month;
            } else {
                updatedState.push({ period, month, date: "" });
            }

            return updatedState;
        });
    };

    const handleQuarterMonthDateChange = (period: string, date: string) => {
        setQuarterMonths((prevState) => {
            const updatedState = [...prevState];
            const periodIndex = updatedState.findIndex((item) => item.period === period);

            if (periodIndex > -1) {
                updatedState[periodIndex].date = date;
            }

            return updatedState;
        });
    };


    const onDateTimeOk = (value: DatePickerProps['value'], dateString: string) => {
        if (value) {
            setSelectedDateTime(dateString);
        }
    };

    const onStartDateTimeOk = (value: DatePickerProps['value'], dateString: string) => {
        if (value) {
            setSelectedStartDateTime(dateString);
        }
    };

    const onEndDateTimeOk = (value: DatePickerProps['value'], dateString: string) => {
        if (value) {
            setSelectedEndDateTime(dateString);
        }
    };

    return (
        <>
            <DashboardLayout>
                <div className="d-flex justify-content-between align-items-center pt-2">
                    <Heading text="Add Reminder" color="#444" />
                </div>

                <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
                    <div
                        style={{
                            maxHeight: "70vh",
                            overflowY: "auto",
                            overflowX: "hidden",
                        }}
                        className="custom-scroll"
                    >
                        <div
                            className="d-flex flex-column mb-3 custom-scroll"
                        >
                            <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                                Subject
                            </p>
                            <div className="input-group mb-2">
                                <input
                                    type="text"
                                    className="form-control"
                                    id="subject"
                                    value={addReminder?.subject || ""}
                                    onChange={(e) =>
                                        setAddReminder((prev) => ({
                                            ...(prev || {
                                                subject: "",
                                                message: "",
                                                is_repeat: "",
                                                date_time: "",
                                                send_email: "",
                                                frequency: "",
                                                end_date_time: "",
                                                start_date_time: "",
                                                frequency_details: [],
                                                users: [],
                                                roles: [],
                                            }),
                                            subject: e.target.value,
                                        }))
                                    }
                                    required
                                />
                            </div>
                            <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                                Message
                            </p>
                            <div className="input-group mb-2">
                                <textarea
                                    className="form-control"
                                    id="message"
                                    value={addReminder?.message || ""}
                                    onChange={(e) =>
                                        setAddReminder((prev) => ({
                                            ...(prev || {
                                                subject: "",
                                                message: "",
                                                is_repeat: "",
                                                date_time: "",
                                                send_email: "",
                                                frequency: "",
                                                end_date_time: "",
                                                start_date_time: "",
                                                frequency_details: [],
                                                users: [],
                                                roles: [],
                                            }),
                                            message: e.target.value,
                                        }))
                                    }
                                    required
                                />
                            </div>
                        </div>
                        <div className="d-flex flex-column">
                            <div className="d-flex flex-column-reverse flex-lg-row">
                                <div className="col-12 col-lg-5  mb-3">
                                    <label className="d-flex flex-row mt-2">
                                        <Checkbox
                                            checked={addReminder?.is_repeat === "1"}
                                            onChange={(e) =>
                                                setAddReminder((prev) => ({
                                                    ...(prev || {
                                                        subject: "",
                                                        message: "",
                                                        is_repeat: "0",
                                                        date_time: "",
                                                        send_email: "",
                                                        frequency: "",
                                                        end_date_time: "",
                                                        start_date_time: "",
                                                        frequency_details: [],
                                                        users: [],
                                                        roles: [],
                                                    }),
                                                    is_repeat: e.target.checked ? "1" : "0",
                                                }))
                                            }
                                            className="me-2"
                                        >
                                            <p
                                                className="mb-0 text-start w-100"
                                                style={{ fontSize: "14px" }}
                                            >
                                                Repeat Reminder
                                            </p>
                                        </Checkbox>
                                    </label>
                                </div>
                                <div className="col-12 col-lg-4 d-flex flex-column flex-lg-row align-items-lg-center mb-3 pe-2">
                                    <label className="col-lg-3 d-flex flex-row me-2 align-items-center">
                                        <Checkbox
                                            checked={addReminder?.send_email === "1"}
                                            onChange={(e) =>
                                                setAddReminder((prev) => ({
                                                    ...(prev || {
                                                        subject: "",
                                                        message: "",
                                                        is_repeat: "0",
                                                        date_time: "",
                                                        send_email: "",
                                                        frequency: "",
                                                        end_date_time: "",
                                                        start_date_time: "",
                                                        frequency_details: [],
                                                        users: [],
                                                        roles: [],
                                                    }),
                                                    send_email: e.target.checked ? "1" : "0",
                                                }))
                                            }
                                            className="me-2"
                                        >
                                            <p
                                                className="mb-0 text-start w-100"
                                                style={{ fontSize: "14px" }}
                                            >
                                                Send Email
                                            </p>

                                        </Checkbox>
                                    </label>
                                    <div className="col-lg-9 d-flex flex-column flex-lg-row">
                                        <div className="col-lg-6 d-flex flex-column position-relative w-100 mb-3 me-1">
                                            <DropdownButton
                                                id="dropdown-category-button-2"
                                                title={
                                                    users.length > 0 ? users.join(", ") : "Select Users"
                                                }
                                                className="custom-dropdown-text-start text-start w-100"
                                                onSelect={(value) => {
                                                    if (value) handleUserSelect(value);
                                                }}
                                            >
                                                {userDropDownData.length > 0 ? (
                                                    userDropDownData.map((user) => (
                                                        <Dropdown.Item key={user.id} eventKey={user.id}>
                                                            {user.user_name}
                                                        </Dropdown.Item>
                                                    ))
                                                ) : (
                                                    <Dropdown.Item disabled>
                                                        No users available
                                                    </Dropdown.Item>
                                                )}
                                            </DropdownButton>

                                            <div className="mt-1">
                                                {users.map((user, index) => (
                                                    <span
                                                        key={index}
                                                        className="badge bg-primary text-light me-2 p-2 d-inline-flex align-items-center"
                                                    >
                                                        {user}
                                                        <IoClose
                                                            className="ms-2"
                                                            style={{ cursor: "pointer" }}
                                                            onClick={() => handleUserRemove(user)}
                                                        />
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="col-lg-6 d-flex flex-column position-relative w-100">
                                            <div className="d-flex flex-column position-relative">
                                                <DropdownButton
                                                    id="dropdown-category-button"
                                                    title={
                                                        roles.length > 0 ? roles.join(", ") : "Select Roles"
                                                    }
                                                    className="custom-dropdown-text-start text-start w-100"
                                                    onSelect={(value) => {
                                                        if (value) handleRoleSelect(value);
                                                    }}
                                                >
                                                    {roleDropDownData.length > 0 ? (
                                                        roleDropDownData.map((role) => (
                                                            <Dropdown.Item key={role.id} eventKey={role.id}>
                                                                {role.role_name}
                                                            </Dropdown.Item>
                                                        ))
                                                    ) : (
                                                        <Dropdown.Item disabled>
                                                            No Roles available
                                                        </Dropdown.Item>
                                                    )}
                                                </DropdownButton>

                                                <div className="mt-1">
                                                    {roles.map((role, index) => (
                                                        <span
                                                            key={index}
                                                            className="badge bg-primary text-light me-2 p-2 d-inline-flex align-items-center"
                                                        >
                                                            {role}
                                                            <IoClose
                                                                className="ms-2"
                                                                style={{ cursor: "pointer" }}
                                                                onClick={() => handleRemoveRole(role)}
                                                            />
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex flex-column flex-lg-row">
                                {addReminder?.is_repeat === "1" ? (
                                    <div className="d-flex flex-column w-100">
                                        <div className="d-flex flex-column pe-lg-1 mb-3">
                                            <div className="d-flex col-12 col-lg-6">
                                                <DropdownButton
                                                    id="dropdown-category-button"
                                                    title={addReminder?.frequency || "Select Frequency"}
                                                    className="custom-dropdown-text-start text-start w-100"
                                                    onSelect={(value) =>
                                                        setAddReminder((prev) => ({
                                                            ...(prev || {
                                                                subject: "",
                                                                message: "",
                                                                is_repeat: "0",
                                                                date_time: "",
                                                                send_email: "",
                                                                frequency: "",
                                                                end_date_time: "",
                                                                start_date_time: "",
                                                                frequency_details: [],
                                                                users: [],
                                                                roles: [],
                                                            }),
                                                            frequency: value || "",
                                                            frequency_details: [],
                                                        }))
                                                    }
                                                >
                                                    <Dropdown.Item eventKey="None">None</Dropdown.Item>
                                                    <Dropdown.Item eventKey="Daily">Daily</Dropdown.Item>
                                                    <Dropdown.Item eventKey="Weekly">
                                                        Weekly
                                                    </Dropdown.Item>
                                                    <Dropdown.Item eventKey="Monthly">
                                                        Monthly
                                                    </Dropdown.Item>
                                                    <Dropdown.Item eventKey="Quarterly">
                                                        Quarterly
                                                    </Dropdown.Item>
                                                    <Dropdown.Item eventKey="Half Yearly">
                                                        Half Yearly
                                                    </Dropdown.Item>
                                                    <Dropdown.Item eventKey="Yearly">
                                                        Yearly
                                                    </Dropdown.Item>
                                                </DropdownButton>
                                            </div>
                                            {addReminder?.frequency === "Daily" && (
                                                <div className=" my-3">
                                                    {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                                                        <label key={day}>
                                                            <Checkbox
                                                                value={day}
                                                                checked={weekDay.includes(day)}
                                                                onChange={() => handleDailyCheckboxChange(day)}
                                                                className="me-2"
                                                            >
                                                                <p className="mb-0 text-start w-100" style={{ fontSize: "14px" }}>
                                                                    {day}
                                                                </p>
                                                            </Checkbox>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                            {addReminder?.frequency === "Weekly" && (
                                                <div className="d-flex flex-column flex-lg-row my-3">
                                                    <Radio.Group
                                                        onChange={handleWeekRadioChange}
                                                        value={days}
                                                        className="d-flex flex-column flex-lg-row"
                                                    >
                                                        {[
                                                            "Sunday",
                                                            "Monday",
                                                            "Tuesday",
                                                            "Wednesday",
                                                            "Thursday",
                                                            "Friday",
                                                            "Saturday",
                                                        ].map((day) => (
                                                            <label key={day} style={{ display: "block", marginBottom: "5px" }}>
                                                                <Radio value={day}>{day}</Radio>
                                                            </label>
                                                        ))}
                                                    </Radio.Group>
                                                </div>
                                            )}

                                            {addReminder?.frequency === "Half Yearly" && (
                                                <div className="my-4">
                                                    <div className="d-none d-lg-flex flex-column flex-lg-row">
                                                        <div className="col-12 col-lg-2 p-1"></div>
                                                        <div className="col-12 col-lg-5 p-1">Select Reminder Month</div>
                                                        <div className="col-12 col-lg-5 p-1">Select Reminder Day</div>
                                                    </div>

                                                    {/* Jan - Jun */}
                                                    <div className="d-flex flex-column flex-lg-row">
                                                        <div className="col-12 col-lg-2 p-1">Jan - Jun</div>
                                                        <div className="col-12 col-lg-5 p-1">
                                                            <DropdownButton
                                                                id="dropdown-category-button"
                                                                title={halfMonths.find(item => item.period === "Jan - Jun")?.month || "Select Month"}
                                                                className="custom-dropdown-text-start text-start w-100"
                                                                onSelect={(month) => handleHalfMonthChange("Jan - Jun", month || "")}
                                                            >
                                                                {["January", "February", "March", "April", "May", "June"].map((month) => (
                                                                    <Dropdown.Item key={month} eventKey={month}>
                                                                        {month}
                                                                    </Dropdown.Item>
                                                                ))}
                                                            </DropdownButton>
                                                        </div>
                                                        <div className="col-12 col-lg-5">
                                                            <DropdownButton
                                                                id="dropdown-category-button"
                                                                title={halfMonths.find(item => item.period === "Jan - Jun")?.date || "Select Date"}
                                                                className="custom-dropdown-text-start text-start w-100"
                                                                onSelect={(date) => handleHalfMonthDateChange("Jan - Jun", date || "")}
                                                            >
                                                                {Array.from({ length: 31 }, (_, index) => index + 1).map((date) => (
                                                                    <Dropdown.Item key={date} eventKey={date}>
                                                                        {date}
                                                                    </Dropdown.Item>
                                                                ))}
                                                            </DropdownButton>
                                                        </div>
                                                    </div>

                                                    {/* Jun - Dec */}
                                                    <div className="d-flex flex-column flex-lg-row">
                                                        <div className="col-12 col-lg-2 p-1">Jun - Dec</div>
                                                        <div className="col-12 col-lg-5 p-1">
                                                            <DropdownButton
                                                                id="dropdown-category-button"
                                                                title={halfMonths.find(item => item.period === "Jun - Dec")?.month || "Select Month"}
                                                                className="custom-dropdown-text-start text-start w-100"
                                                                onSelect={(month) => handleHalfMonthChange("Jun - Dec", month || "")}
                                                            >
                                                                {["July", "August", "September", "October", "November", "December"].map((month) => (
                                                                    <Dropdown.Item key={month} eventKey={month}>
                                                                        {month}
                                                                    </Dropdown.Item>
                                                                ))}
                                                            </DropdownButton>
                                                        </div>
                                                        <div className="col-12 col-lg-5 p-1">
                                                            <DropdownButton
                                                                id="dropdown-category-button"
                                                                title={halfMonths.find(item => item.period === "Jun - Dec")?.date || "Select Date"}
                                                                className="custom-dropdown-text-start text-start w-100"
                                                                onSelect={(date) => handleHalfMonthDateChange("Jun - Dec", date || "")}
                                                            >
                                                                {Array.from({ length: 31 }, (_, index) => index + 1).map((date) => (
                                                                    <Dropdown.Item key={date} eventKey={date}>
                                                                        {date}
                                                                    </Dropdown.Item>
                                                                ))}

                                                            </DropdownButton>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {addReminder?.frequency === "Quarterly" && (
                                                <div className="my-4">
                                                    <div className="d-none d-lg-flex flex-column flex-lg-row ">
                                                        <div className="col-12 col-lg-2 p-1"></div>
                                                        <div className="col-12 col-lg-5 p-1">
                                                            Select Reminder Month
                                                        </div>
                                                        <div className="col-12 col-lg-5 p-1">
                                                            Select Reminder Day
                                                        </div>
                                                    </div>
                                                    {/* Jan - Mar */}
                                                    <div className="d-flex flex-column flex-lg-row">
                                                        <div className="col-12 col-lg-2 p-1">Jan - Jun</div>
                                                        <div className="col-12 col-lg-5 p-1">
                                                            <DropdownButton
                                                                id="dropdown-category-button"
                                                                title={quarterMonths.find(item => item.period === "Jan - Mar")?.month || "Select Month"}
                                                                className="custom-dropdown-text-start text-start w-100"
                                                                onSelect={(month) => handleQuarterMonthChange("Jan - Mar", month || "")}
                                                            >
                                                                {["January", "February", "March"].map((month) => (
                                                                    <Dropdown.Item key={month} eventKey={month}>
                                                                        {month}
                                                                    </Dropdown.Item>
                                                                ))}
                                                            </DropdownButton>
                                                        </div>
                                                        <div className="col-12 col-lg-5 p-1">
                                                            <DropdownButton
                                                                id="dropdown-category-button"
                                                                title={quarterMonths.find(item => item.period === "Jan - Mar")?.date || "Select Date"}
                                                                className="custom-dropdown-text-start text-start w-100"
                                                                onSelect={(date) => handleQuarterMonthDateChange("Jan - Mar", date || "")}
                                                            >
                                                                {Array.from({ length: 31 }, (_, index) => index + 1).map((date) => (
                                                                    <Dropdown.Item key={date} eventKey={date}>
                                                                        {date}
                                                                    </Dropdown.Item>
                                                                ))}
                                                            </DropdownButton>
                                                        </div>
                                                    </div>
                                                    {/* Apr - Jun */}
                                                    <div className="d-flex flex-column flex-lg-row">
                                                        <div className="col-12 col-lg-2 p-1">Apr - Jun</div>
                                                        <div className="col-12 col-lg-5 p-1">
                                                            <DropdownButton
                                                                id="dropdown-category-button"
                                                                title={quarterMonths.find(item => item.period === "Apr - Jun")?.month || "Select Month"}
                                                                className="custom-dropdown-text-start text-start w-100"
                                                                onSelect={(month) => handleQuarterMonthChange("Apr - Jun", month || "")}
                                                            >
                                                                {["April", "May", "June"].map((month) => (
                                                                    <Dropdown.Item key={month} eventKey={month}>
                                                                        {month}
                                                                    </Dropdown.Item>
                                                                ))}
                                                            </DropdownButton>
                                                        </div>
                                                        <div className="col-12 col-lg-5 p-1">
                                                            <DropdownButton
                                                                id="dropdown-category-button"
                                                                title={quarterMonths.find(item => item.period === "Apr - Jun")?.date || "Select Date"}
                                                                className="custom-dropdown-text-start text-start w-100"
                                                                onSelect={(date) => handleQuarterMonthDateChange("Apr - Jun", date || "")}
                                                            >
                                                                {Array.from({ length: 31 }, (_, index) => index + 1).map((date) => (
                                                                    <Dropdown.Item key={date} eventKey={date}>
                                                                        {date}
                                                                    </Dropdown.Item>
                                                                ))}
                                                            </DropdownButton>
                                                        </div>
                                                    </div>
                                                    {/* Jul - Sep */}
                                                    <div className="d-flex flex-column flex-lg-row">
                                                        <div className="col-12 col-lg-2 p-1">Jan - Jun</div>
                                                        <div className="col-12 col-lg-5 p-1">
                                                            <DropdownButton
                                                                id="dropdown-category-button"
                                                                title={quarterMonths.find(item => item.period === "Jul - Sep")?.month || "Select Month"}
                                                                className="custom-dropdown-text-start text-start w-100"
                                                                onSelect={(month) => handleQuarterMonthChange("Jul - Sep", month || "")}
                                                            >
                                                                {["July", "August", "September"].map((month) => (
                                                                    <Dropdown.Item key={month} eventKey={month}>
                                                                        {month}
                                                                    </Dropdown.Item>
                                                                ))}
                                                            </DropdownButton>
                                                        </div>
                                                        <div className="col-12 col-lg-5 p-1">
                                                            <DropdownButton
                                                                id="dropdown-category-button"
                                                                title={quarterMonths.find(item => item.period === "Jul - Sep")?.date || "Select Date"}
                                                                className="custom-dropdown-text-start text-start w-100"
                                                                onSelect={(date) => handleQuarterMonthDateChange("Jul - Sep", date || "")}
                                                            >
                                                                {Array.from({ length: 31 }, (_, index) => index + 1).map((date) => (
                                                                    <Dropdown.Item key={date} eventKey={date}>
                                                                        {date}
                                                                    </Dropdown.Item>
                                                                ))}
                                                            </DropdownButton>
                                                        </div>
                                                    </div>
                                                    {/* Oct - Dec */}
                                                    <div className="d-flex flex-column flex-lg-row">
                                                        <div className="col-12 col-lg-2 p-1">Oct - Dec</div>
                                                        <div className="col-12 col-lg-5 p-1">
                                                            <DropdownButton
                                                                id="dropdown-category-button"
                                                                title={quarterMonths.find(item => item.period === "Oct - Dec")?.month || "Select Month"}
                                                                className="custom-dropdown-text-start text-start w-100"
                                                                onSelect={(month) => handleQuarterMonthChange("Oct - Dec", month || "")}
                                                            >
                                                                {["October", "November", "December"].map((month) => (
                                                                    <Dropdown.Item key={month} eventKey={month}>
                                                                        {month}
                                                                    </Dropdown.Item>
                                                                ))}
                                                            </DropdownButton>
                                                        </div>
                                                        <div className="col-12 col-lg-5 p-1">
                                                            <DropdownButton
                                                                id="dropdown-category-button"
                                                                title={quarterMonths.find(item => item.period === "Oct - Dec")?.date || "Select Date"}
                                                                className="custom-dropdown-text-start text-start w-100"
                                                                onSelect={(date) => handleQuarterMonthDateChange("Oct - Dec", date || "")}
                                                            >
                                                                {Array.from({ length: 31 }, (_, index) => index + 1).map((date) => (
                                                                    <Dropdown.Item key={date} eventKey={date}>
                                                                        {date}
                                                                    </Dropdown.Item>
                                                                ))}
                                                            </DropdownButton>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="d-flex flex-column flex-lg-row w-100  pe-lg-2 mb-3">
                                            <div className="col-12 col-lg-6 d-flex flex-column pe-lg-1">
                                                <label className="d-flex flex-column w-100">
                                                    <p
                                                        className="mb-1 text-start w-100"
                                                        style={{ fontSize: "14px" }}
                                                    >
                                                        Reminder Start Date
                                                    </p>
                                                </label>
                                                <DatePicker
                                                    showTime
                                                    onChange={(value, dateString) => {

                                                    }}
                                                    onOk={(value) => onStartDateTimeOk(value, value?.format('YYYY-MM-DD HH:mm:ss') ?? '')}
                                                />
                                            </div>
                                            <div className="col-12 col-lg-6 d-flex flex-column  ps-lg-1">
                                                <label className="d-flex flex-column w-100">
                                                    <p
                                                        className="mb-1 text-start w-100"
                                                        style={{ fontSize: "14px" }}
                                                    >
                                                        Reminder End Date
                                                    </p>
                                                </label>
                                                <DatePicker
                                                    showTime
                                                    onChange={(value, dateString) => {

                                                    }}
                                                    onOk={(value) => onEndDateTimeOk(value, value?.format('YYYY-MM-DD HH:mm:ss') ?? '')}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-100">
                                        <div className="col-12 col-md-6 d-flex flex-column">
                                            <label className="d-block w-100">
                                                <p
                                                    className="mb-1 text-start w-100"
                                                    style={{ fontSize: "14px" }}
                                                >
                                                    Reminder Date
                                                </p>
                                            </label>

                                            <DatePicker
                                                showTime
                                                onChange={(value, dateString) => {

                                                }}
                                                onOk={(value) => onDateTimeOk(value, value?.format('YYYY-MM-DD HH:mm:ss') ?? '')}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="d-flex flex-row mt-3">
                            <button
                                onClick={() => handleAddReminder()}
                                className="custom-icon-button button-success px-3 py-1 rounded me-2"
                            >
                                <IoSaveOutline fontSize={16} className="me-1" /> Save
                            </button>
                            <button
                                onClick={() => router.push("/reminders")}
                                className="custom-icon-button button-danger px-3 py-1 rounded me-2"
                            >
                                <IoClose fontSize={16} className="me-1" /> Cancel
                            </button>
                        </div>

                    </div>

                </div>
                <ToastMessage
                    message={toastMessage}
                    show={showToast}
                    onClose={() => setShowToast(false)}
                    type={toastType}
                />
            </DashboardLayout>
        </>
    );
}
