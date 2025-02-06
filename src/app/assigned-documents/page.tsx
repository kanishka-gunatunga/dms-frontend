/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Heading from "@/components/common/Heading";
import Paragraph from "@/components/common/Paragraph";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  Dropdown,
  DropdownButton,
  Form,
  Modal,
  Pagination,
  Table,
} from "react-bootstrap";
import { AiOutlineZoomOut, AiFillDelete } from "react-icons/ai";
import { BiSolidCommentDetail } from "react-icons/bi";
import { BsBellFill } from "react-icons/bs";
import { FaArchive, FaEllipsisV, FaShareAlt } from "react-icons/fa";
import { FaListUl, FaPlus } from "react-icons/fa6";
import { GoHistory } from "react-icons/go";
import {
  IoAdd,
  IoCheckmark,
  IoClose,
  IoEye,
  IoFolder,
  IoSaveOutline,
  IoSettings,
  IoShareSocial,
  IoTrash,
  IoTrashOutline,
} from "react-icons/io5";
import { Button, Checkbox, DatePicker, Input, Radio } from "antd";
import type { DatePickerProps } from "antd";
import type { RadioChangeEvent } from 'antd';
import {
  MdArrowDropDown,
  MdArrowDropUp,
  MdEmail,
  MdFileDownload,
  MdModeEditOutline,
  MdOutlineCancel,
  MdOutlineInsertLink,
  MdUpload,
} from "react-icons/md";
import InfoModal from "@/components/common/InfoModel";
import useAuth from "@/hooks/useAuth";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { deleteWithAuth, getWithAuth, postWithAuth } from "@/utils/apiClient";
import { useRouter } from "next/navigation";
import { handleDownload, handleView } from "@/utils/documentFunctions";
import {
  fetchAndMapUserData,
  fetchAssignedDocumentsData,
  fetchCategoryData,
  fetchRemindersData,
  fetchRoleData,
  fetchVersionHistory,
} from "@/utils/dataFetchFunctions";
import { useUserContext } from "@/context/userContext";
import ToastMessage from "@/components/common/Toast";
import { IoMdSend, IoMdTrash } from "react-icons/io";
import {
  CommentItem,
  FrequencyDetail,
  ReminderViewItem,
  RoleDropdownItem,
  UserDropdownItem,
  VersionHistoryItem,
} from "@/types/types";
import dynamic from "next/dynamic";
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

import "react-quill/dist/quill.snow.css";
import LoadingBar from "@/components/common/LoadingBar";
import { usePermissions } from "@/context/userPermissions";
import { hasPermission } from "@/utils/permission";
import Image from "next/image";

interface Category {
  category_name: string;
}

interface TableItem {
  id: number;
  name: string;
  category: Category;
  storage: string;
  created_date: string;
  created_by: string;
  document_preview: string;
}

interface ShareItem {
  id: number;
  allow_download: number;
  name: string;
  type: string;
  email: string;
  start_date_time: string;
  end_date_time: string;
}

interface EditDocumentItem {
  id: number;
  name: string;
  category: Category;
  description: string;
  meta_tags: string;
}

interface Attribute {
  value: string;
  attribute: string;
}

interface ViewDocumentItem {
  id: number;
  name: string;
  category: { id: number; category_name: string };
  description: string;
  meta_tags: string;
  attributes: string;
  type: string;
  url: string;
  enable_external_file_view: number
}

interface CategoryDropdownItem {
  id: number;
  parent_category: string;
  category_name: string;
}

interface HalfMonth {
  period: string;
  month: string;
  date: string | number;
}

export default function AllDocTable() {
  const { userId, userName } = useUserContext();
  const permissions = usePermissions();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedItemsNames, setSelectedItemsNames] = useState<string[]>([]);
  const [dummyData, setDummyData] = useState<TableItem[]>([]);
  const [copySuccess, setCopySuccess] = useState("");
  const [comment, setComment] = useState("");
  const [allComment, setAllComment] = useState<CommentItem[]>([]);
  const [selectedComment, setSelectedComment] = useState("");
  const [selectedStorage, setSelectedStorage] = useState<string>("Storage");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState<string[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedCategoryIdEdit, setSelectedCategoryIdEdit] = useState<string>("");

  const [metaTags, setMetaTags] = useState<string[]>([]);
  const [currentMeta, setCurrentMeta] = useState<string>("");
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");
  const [weekDay, setWeekDay] = useState<string[]>([]);
  const [days, setDays] = useState<string>("");
  const [halfMonths, setHalfMonths] = useState<HalfMonth[]>([]);
  const [quarterMonths, setQuarterMonths] = useState<HalfMonth[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [allShareData, setAllShareData] = useState<ShareItem[]>([]);
  const [filterValue, setFilterValue] = useState("");
  const [selectedShareDocUserType, setSelectedShareDocUserType] = useState("");
  const [selectedShareDocId, setSelectedShareDocId] = useState<number>();
  const [shareDocumentData, setShareDocumentData] = useState<{
    type: string;
    assigned_roles_or_users: string;
    is_time_limited: string;
    start_date_time: string;
    end_date_time: string;
    is_downloadable: string;
  } | null>(null);
  const [newVersionDocument, setNewVersionDocument] = useState<File | null>(
    null
  );
  const [sendEmailData, setSendEmailData] = useState<{
    subject: string;
    body: string;
    to: string;
  } | null>(null);
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
  } | null>(null);
  const [userDropDownData, setUserDropDownData] = useState<UserDropdownItem[]>(
    []
  );
  const [roleDropDownData, setRoleDropDownData] = useState<RoleDropdownItem[]>(
    []
  );
  const [modalStates, setModalStates] = useState({
    editModel: false,
    shareDocumentModel: false,
    shareAssignUserModel: false,
    shareAssignRoleModel: false,
    shareDeleteModel: false,
    shareableLinkModel: false,
    generatedShareableLinkModel: false,
    sharableLinkSettingModel: false,
    deleteConfirmShareableLinkModel: false,
    docArchivedModel: false,
    uploadNewVersionFileModel: false,
    sendEmailModel: false,
    versionHistoryModel: false,
    commentModel: false,
    addReminderModel: false,
    removeIndexingModel: false,
    deleteFileModel: false,
    allDocShareModel: false,
    myReminderModel: false,
    reminderViewModel: false,
    reminderDeleteModel: false,
    viewModel: false,
  });

  const [generatedLink, setGeneratedLink] = useState<string>("");
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(
    null
  );
  const [selectedDocumentName, setSelectedDocumentName] = useState<
    string | null
  >(null);
  const [categoryDropDownData, setCategoryDropDownData] = useState<
    CategoryDropdownItem[]
  >([]);
  const [versionHistory, setVersionHistory] = useState<VersionHistoryItem[]>(
    []
  );
  const initialLinkData = {
    has_expire_date: false,
    expire_date_time: "",
    has_password: false,
    password: "",
    allow_download: false,
  };
  const [shareableLinkData, setShareableLinkData] = useState(initialLinkData);

  const [editDocument, setEditDocument] = useState<EditDocumentItem | null>(
    null
  );
  const [selectedDateTime, setSelectedDateTime] = useState<string>("");
  const [selectedStartDateTime, setSelectedStartDateTime] = useState<string>("");
  const [selectedEndDateTime, setSelectedEndDateTime] = useState<string>("");
  const [errors, setErrors] = useState<{ expire_date_time: string; password: string }>({
    expire_date_time: "",
    password: "",
  });
  const [editErrors, seteditErrors] = useState<any>({});
  const [shareableLinkDataSetting, setShareableLinkDataSetting] = useState(initialLinkData);
  const [tableData, setTableData] = useState<ReminderViewItem[]>([]);
  const [selectedReminderId, setSelectedReminderId] = useState<number | null>(
    null
  );
  // const [viewReminder, setViewReminder] = useState<{
  //   subject: string;
  //   message: string;
  //   is_repeat: string;
  //   date_time: string;
  //   send_email: string;
  //   frequency: string;
  //   end_date_time: string;
  //   start_date_time: string;
  //   frequency_details: string[];
  //   users: string[];
  // } | null>(null);
  const [viewReminder, setViewReminder] = useState<ReminderViewItem>();
  const [frequencyData, setFrequencyData] = useState<(FrequencyDetail | string)[]>([]);
  const [filterData, setFilterData] = useState({
    term: "",
    meta_tags: "",
    category: "",
    storage: "",
  });
  const [isLoadingTable, setIsLoadingTable] = useState(false);

  const [viewDocument, setViewDocument] = useState<ViewDocumentItem | null>(
    null
  );
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const isAuthenticated = useAuth();
  const router = useRouter();

  // data fetch functions
  const fetchComments = async (id: number) => {
    try {
      const response = await getWithAuth(`document-comments/${id}`);

      if (response.status === "fail") {
      } else {
        setAllComment(response);
      }

    } catch (error) {
      console.error("Failed to fetch documents data:", error);
    }
  };

  const fetchShareDocumentData = async (id: number) => {
    try {
      const response = await getWithAuth(`document-share/${id}`);

      setAllShareData(response);


    } catch (error) {
      console.error("Failed to fetch documents data:", error);
    }
  };

  const fetchGetShareLinkData = async (id: number) => {
    try {
      const response = await getWithAuth(`get-shareble-link/${id}`);

      if (response.status === "fail") {
      } else {
        // setShareableLinkDataSetting(response);
        setShareableLinkDataSetting({
          has_expire_date: response.has_expire_date,
          expire_date_time: response.expire_date_time || "",
          has_password: response.has_password,
          password: "",
          allow_download: response.allow_download,
        });
      }

    } catch (error) {
      console.error("Failed to fetch documents data:", error);
    }
  };

  const fetchReminderData = async (id: number) => {
    try {
      const response = await getWithAuth(`edit-reminder/${id}`);
      if (response.status === "fail") {
      } else {
        setViewReminder(response);
        if (response.frequency_details) {
          const parsedDetails = typeof response.frequency_details === 'string'
            ? JSON.parse(response.frequency_details)
            : response.frequency_details;

          setFrequencyData(parsedDetails);
        }
      }
    } catch (error) {
      console.error("Failed to fetch reminder data:", error);
    }
  };

  useEffect(() => {
    if (editDocument?.meta_tags) {
      const parsedTags = JSON.parse(editDocument.meta_tags);
      setMetaTags(parsedTags);
    }
  }, [editDocument]);

  useEffect(() => {
    fetchCategoryData(setCategoryDropDownData);
    fetchAssignedDocumentsData(setDummyData);
    fetchAndMapUserData(setUserDropDownData);
    fetchRoleData(setRoleDropDownData);
    fetchRemindersData(setTableData);
  }, []);


  // when models change reload data of component
  useEffect(() => {
    if (modalStates.commentModel && selectedDocumentId !== null) {
      fetchComments(selectedDocumentId);
    }
  }, [modalStates.commentModel, selectedDocumentId]);

  useEffect(() => {
    if (modalStates.versionHistoryModel && selectedDocumentId !== null) {
      fetchVersionHistory(selectedDocumentId, setVersionHistory);
    }
  }, [modalStates.versionHistoryModel, selectedDocumentId]);

  useEffect(() => {
    if (modalStates.editModel && selectedDocumentId !== null) {
      handleGetEditData(selectedDocumentId);
    }
  }, [modalStates.editModel, selectedDocumentId]);

  useEffect(() => {
    if (modalStates.shareDocumentModel && selectedDocumentId !== null) {
      fetchShareDocumentData(selectedDocumentId);
    }
  }, [modalStates.shareDocumentModel, selectedDocumentId]);

  useEffect(() => {
    if (modalStates.sharableLinkSettingModel && selectedDocumentId !== null) {
      fetchGetShareLinkData(selectedDocumentId);
    }
  }, [modalStates.sharableLinkSettingModel, selectedDocumentId]);

  useEffect(() => {
    if (modalStates.reminderViewModel && selectedReminderId !== null) {
      fetchReminderData(selectedReminderId);
    }
  }, [modalStates.reminderViewModel, selectedReminderId]);

  useEffect(() => {
    if (modalStates.viewModel && selectedDocumentId !== null) {
      handleGetViewData(selectedDocumentId);
      // console.log("View Document : ", viewDocument)
    }
  }, [modalStates.viewModel, selectedDocumentId]);


  const handleMouseMove = (e: React.MouseEvent<HTMLTableRowElement>) => {
    setCursorPosition({ x: e.clientX, y: e.clientY });
  };

  const handleGetViewData = async (id: number) => {
    try {
      const response = await getWithAuth(`view-document/${id}/${userId}`);
      const data = response.data;

      const parsedMetaTags = JSON.parse(data.meta_tags || "[]");
      const parsedAttributes = JSON.parse(data.attributes || "[]");

      setViewDocument(data);
      setMetaTags(parsedMetaTags);
      setAttributes(parsedAttributes);
    } catch (error) {
      console.error("Error :", error);
    }
  };

  // dropdowns and input change functions
  // const handleCategorySelect = (categoryId: string) => {
  //   setSelectedCategoryId(categoryId);
  // };

  const handleCategoryEditSelect = (categoryId: string) => {
    const selectedCategory = categoryDropDownData.find(
      (category) => category.id.toString() === categoryId
    );
    if (selectedCategory) {
      setSelectedCategoryIdEdit(categoryId);
      setEditDocument((prev) =>
        prev ? { ...prev, category: selectedCategory } : null
      );
    }
  };
  const currentDateTime = new Date().toLocaleString();

  const selectedCategory = categoryDropDownData.find(
    (category) => category.id.toString() === selectedCategoryIdEdit
  );


  const handleSort = () => {
    setSortAsc(!sortAsc);
    const sortedData = [...dummyData].sort((a, b) =>
      sortAsc
        ? new Date(a.created_date).getTime() -
        new Date(b.created_date).getTime()
        : new Date(b.created_date).getTime() -
        new Date(a.created_date).getTime()
    );
    setDummyData(sortedData);
  };

  const handleNewVersionFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] || null;
    setNewVersionDocument(file);
  };



  const handleOpenModal = (
    modalName: keyof typeof modalStates,
    documentId?: number,
    documentName?: string
  ) => {
    if (documentId) setSelectedDocumentId(documentId);
    if (documentName) setSelectedDocumentName(documentName);

    setModalStates((prev) => ({ ...prev, [modalName]: true }));
  };

  const handleCloseModal = (modalName: keyof typeof modalStates) => {
    setModalStates((prev) => ({ ...prev, [modalName]: false }));
  };

  const handleShareCheckboxChange = (field: keyof typeof shareableLinkData) => {
    setShareableLinkData((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const handleShareInputChange = (
    field: keyof typeof shareableLinkData,
    value: string
  ) => {
    setShareableLinkData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleShareSettingCheckboxChange = (field: keyof typeof shareableLinkData) => {
    setShareableLinkDataSetting((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const handleShareSettingInputChange = (
    field: keyof typeof shareableLinkData,
    value: string
  ) => {
    setShareableLinkDataSetting((prevState) => ({
      ...prevState,
      [field]: value,
    }));
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


  // pagination
  const totalItems = dummyData.length;


  const totalPages = Math.ceil(dummyData.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  const paginatedData = dummyData.slice(startIndex, endIndex);


  const handleFilterChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
    setFilterValue(e.target.value);
  };





  const handleTermSearch = async (value: string) => {
    setFilterData((prevState) => ({
      ...prevState,
      term: value,
    }));
  };

  const handleMetaSearch = async (value: string) => {
    setFilterData((prevState) => ({
      ...prevState,
      meta_tags: value,
    }));
  };

  const handleCategorySelect = (categoryId: string) => {
    setFilterData((prevState) => ({
      ...prevState,
      category: categoryId,
    }));
  };

  const handleStorageSelect = (storage: string) => {
    setFilterData((prevState) => ({
      ...prevState,
      storage: storage,
    }));
  };

  const handleDateChange: DatePickerProps["onChange"] = (date, dateString) => {
    if (typeof dateString === "string") {
      setSelectedDate(dateString);
      setFilterData((prevState) => ({
        ...prevState,
        created_date: dateString,
      }));
    }
  };

  // const handleSearch = async () => {
  //   const formData = new FormData();

  //   if (filterData.term) {
  //     formData.append("term", filterData.term);
  //   } else if (filterData.meta_tags) {
  //     formData.append("meta_tags", filterData.meta_tags);
  //   } else if (filterData.category) {
  //     formData.append("category", filterData.category);
  //   } else if (filterData.storage) {
  //     formData.append("storage", filterData.storage);
  //   } else {
  //     fetchAssignedDocumentsData(setDummyData);
  //     return;
  //   }

  //   setIsLoadingTable(true)
  //   try {
  //     const response = await postWithAuth("filter-assigned-documents", formData);
  //     setDummyData(response);
  //     setIsLoadingTable(false)
  //   } catch (error) {
  //     console.error("Failed to fetch filtered data", error);
  //   }
  // };

  const handleSearch = async () => {
    const formData = new FormData();

    if (filterData.term) {
      formData.append("term", filterData.term);
    } else if (filterData.meta_tags) {
      formData.append("meta_tags", filterData.meta_tags);
    } else if (filterData.category) {
      formData.append("category", filterData.category);
    } else if (filterData.storage) {
      formData.append("storage", filterData.storage);
    }


    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    if (formData.entries().next().done) {
      fetchAssignedDocumentsData(setDummyData);
      return;
    }


    setIsLoadingTable(true)
    try {
      const response = await postWithAuth("filter-assigned-documents", formData);
      setDummyData(response);
      setIsLoadingTable(false)
    } catch (error) {
      console.error("Failed to fetch filtered data", error);
    }
  };



  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [filterData]);


  // pagination - share table
  const filteredData = filterValue
    ? allShareData.filter(
      (item) =>
        item.email && item.email.toLowerCase().includes(filterValue.toLowerCase())
    )
    : allShareData;

  const totalItemsShare = filteredData.length;
  const totalPagesShare = Math.ceil(totalItemsShare / itemsPerPage);
  const startIndexShare = (currentPage - 1) * itemsPerPage;
  const endIndexShare = Math.min(currentPage * itemsPerPage, totalItemsShare);

  // const paginatedDataShare = allShareData.slice(startIndexShare, endIndexShare);
  const paginatedDataShare = filteredData.slice(startIndexShare, endIndexShare);



  // pagination my reminder
  const totalItemsReminder = tableData.length;
  const totalPagesReminder = Math.ceil(totalItemsReminder / itemsPerPage);
  const startIndexReminder = (currentPage - 1) * itemsPerPage;
  const endIndexReminder = Math.min(currentPage * itemsPerPage, totalItemsReminder);
  const paginatedDataReminder = tableData.slice(startIndexReminder, endIndexReminder);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // meta tag functions
  const addMetaTag = () => {
    if (currentMeta && !metaTags.includes(currentMeta)) {
      const updatedMetaTags = [...metaTags, currentMeta];
      setMetaTags(updatedMetaTags);
      setEditDocument((prev) => prev ? { ...prev, meta_tags: JSON.stringify(updatedMetaTags) } : null);
      setCurrentMeta("");
    }
  };


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addMetaTag();
    }
  };

  const updateMetaTag = (index: number, value: string) => {
    const updatedMetaTags = metaTags.map((tag, i) => (i === index ? value : tag));
    setMetaTags(updatedMetaTags);
    setEditDocument((prev) => prev ? { ...prev, meta_tags: JSON.stringify(updatedMetaTags) } : null);
  };


  const removeMetaTag = (index: number) => {
    const updatedMetaTags = metaTags.filter((_, i) => i !== index);
    setMetaTags(updatedMetaTags);
    setEditDocument((prev) => prev ? { ...prev, meta_tags: JSON.stringify(updatedMetaTags) } : null);
  };


  // functions with api calls
  const handleRemoveIndexing = async (id: number, userId: string) => {
    try {
      const formData = new FormData();
      formData.append("user", userId);
      const response = await postWithAuth(
        `document-remove-index/${id}`,
        formData
      );
      if (response.status === "fail") {
        setToastType("error");
        setToastMessage("An error occurred while removing the index!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      } else {
        handleCloseModal("removeIndexingModel");
        setToastType("success");
        setToastMessage("Index removed successfully!");
        setShowToast(true);
        fetchAssignedDocumentsData(setDummyData);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      setToastType("error");
      setToastMessage("An error occurred while removing the index!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
      console.error("Error deleting document:", error);
    }
  };

  const handleDocumentArchive = async (id: number, userId: string) => {
    try {
      const formData = new FormData();
      formData.append("user", userId);
      const response = await postWithAuth(`document-archive/${id}`, formData);
      if (response.status === "success") {
        handleCloseModal("docArchivedModel");
        setToastType("success");
        setToastMessage("Document archived successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      } else {
        setToastType("error");
        setToastMessage("An error occurred while archiving the document!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      setToastType("error");
      setToastMessage("An error occurred while archiving the document!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
      // console.error("Error archiving document:", error);
    }
  };

  const handleDocumentComment = async (id: number, userId: string) => {
    try {
      const formData = new FormData();
      formData.append("comment", comment);
      formData.append("user", userId);
      const response = await postWithAuth(`document-comments/${id}`, formData);
      setComment("");
      if (response.status === "success") {
        fetchComments(selectedDocumentId!);
        setToastType("success");
        setToastMessage("Comment added successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      } else {
        setToastType("error");
        setToastMessage("An error occurred while adding the comment!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      setToastType("error");
      setToastMessage("An error occurred while adding the comment!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
      // console.error("Error commenting document:", error);
    }
  };

  const handleUploadNewVersion = async (id: number, userId: string) => {
    try {
      const formData = new FormData();
      formData.append("document", newVersionDocument || "");
      formData.append("user", userId);
      const response = await postWithAuth(
        `document-upload-new-version/${id}`,
        formData
      );
      setNewVersionDocument(null);
      if (response.status === "success") {
        handleCloseModal("uploadNewVersionFileModel");
        setToastType("success");
        setToastMessage("New version uploaded successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      } else {
        setToastType("error");
        setToastMessage("Failed to upload the new version!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      setToastType("error");
      setToastMessage("Failed to upload the new version!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
      // console.error("Error new version updating:", error);
    }
  };

  const handleDeleteComment = async (id: string) => {
    try {
      const response = await deleteWithAuth(`delete-comment/${id}/${userId}`);
      if (response.status === "success") {
        setToastType("success");
        fetchComments(selectedDocumentId!);
        setToastMessage("Comment deleted successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      } else {
        setToastType("error");
        setToastMessage("An error occurred while deleting the comment!!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      // console.error("Error deleting shareable link:", error);
      setToastType("error");
      setToastMessage("An error occurred while deleting the comment!!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    }
  };

  const handleGetShareableLinkModel = async (id: number) => {
    const response = await getWithAuth(`get-shareble-link/${id}`);
    if (!response.link) {
      handleOpenModal(
        "shareableLinkModel",
        id,
      )
    } else {
      setGeneratedLink(response.link);
      handleOpenModal(
        "generatedShareableLinkModel",
        id,
      )
    }

  };

  const handleGetShareableLink = async (id: number) => {

    try {
      let validationErrors = { expire_date_time: "", password: "" };
      setErrors(validationErrors);

      if (shareableLinkData.has_expire_date && !shareableLinkData.expire_date_time) {
        validationErrors.expire_date_time = "Expiration date is required.";
      }

      if (shareableLinkData.has_password && !shareableLinkData.password) {
        validationErrors.password = "Password is required.";
      }

      if (validationErrors.expire_date_time || validationErrors.password) {
        setErrors(validationErrors);
        return;
      }

      setErrors({ expire_date_time: "", password: "" });
      const formData = new FormData();
      formData.append(
        "has_expire_date",
        shareableLinkData.has_expire_date ? "1" : "0"
      );
      formData.append("expire_date_time", shareableLinkData.expire_date_time);
      formData.append(
        "has_password",
        shareableLinkData.has_password ? "1" : "0"
      );
      formData.append("password", shareableLinkData.password);
      formData.append(
        "allow_download",
        shareableLinkData.allow_download ? "1" : "0"
      );
      formData.append("user", userId || "");

      // for (const [key, value] of formData.entries()) {
      //   console.log(`${key}: ${value}`);
      // }



      const response = await postWithAuth(`get-shareble-link/${id}`, formData);
      if (response.status === "success") {
        handleCloseModal("shareableLinkModel");
        setGeneratedLink(response.link);
        handleOpenModal("generatedShareableLinkModel");
        setShareableLinkData(initialLinkData);
      } else {
        setToastType("error");
        setToastMessage("An error occurred while generating the sharable link!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        setShareableLinkData(initialLinkData);
      }
    } catch (error) {
      console.error("Error getting shareable link:", error);
      setToastType("error");
      setToastMessage("An error occurred while generating the sharable link!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    }
  };

  const copyToClipboard = (generatedLink: string) => {
    try {
      navigator.clipboard
        .writeText(generatedLink)
        .then(() => {
          setToastType("success");
          setToastMessage("Link copied to clipboard successfully!");
          setShowToast(true);
          setTimeout(() => {
            setShowToast(false);
          }, 5000);
        })
        .catch((error) => {
          // console.error("Error copying to clipboard:", error);
          setToastType("error");
          setToastMessage("An error occurred while copying to clipboard!");
          setShowToast(true);
          setTimeout(() => {
            setShowToast(false);
          }, 5000);
        });
    } catch (error) {
      // console.error("Error getting shareable link:", error);
      setToastType("error");
      setToastMessage("An error occurred while copying to clipboard!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    }
  };

  const handleDeleteShareableLink = async (id: number) => {
    try {
      const response = await deleteWithAuth(`delete-shareble-link/${id}/${userId}`);
      if (response.status === "success") {
        setToastType("success");
        setToastMessage("The link was deleted successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      } else {
        setToastType("error");
        setToastMessage("An error occurred while deleting the shareable link!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      // console.error("Error deleting shareable link:", error);
      setToastType("error");
      setToastMessage("An error occurred while deleting the shareable link!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    }
  };

  const handleUpdateShareableLink = async (id: number) => {
    try {
      let validationErrors = { expire_date_time: "", password: "" };
      setErrors(validationErrors);

      if (shareableLinkDataSetting.has_expire_date && !shareableLinkDataSetting.expire_date_time) {
        validationErrors.expire_date_time = "Expiration date is required.";
      }

      if (shareableLinkDataSetting.has_password && !shareableLinkDataSetting.password) {
        validationErrors.password = "Password is required.";
      }

      if (validationErrors.expire_date_time || validationErrors.password) {
        setErrors(validationErrors);
        return;
      }

      setErrors({ expire_date_time: "", password: "" });

      const formData = new FormData();
      formData.append(
        "has_expire_date",
        shareableLinkDataSetting.has_expire_date ? "1" : "0"
      );
      formData.append("expire_date_time", shareableLinkDataSetting.expire_date_time);
      formData.append(
        "has_password",
        shareableLinkDataSetting.has_password ? "1" : "0"
      );
      formData.append("password", shareableLinkDataSetting.password);
      formData.append(
        "allow_download",
        shareableLinkDataSetting.allow_download ? "1" : "0"
      );
      formData.append("user", userId || "");

      // for (const [key, value] of formData.entries()) {
      //   console.log(`${key}: ${value}`);
      // }
      const response = await postWithAuth(
        `get-shareble-link/${id}`,
        formData
      );
      if (response.status === "fail") {
        setToastType("error");
        setToastMessage("An error occurred while generating the shareable link!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        setShareableLinkDataSetting(initialLinkData);
      } else {
        handleCloseModal("sharableLinkSettingModel");
        setGeneratedLink(response.link);
        handleOpenModal("generatedShareableLinkModel");
        setShareableLinkDataSetting(initialLinkData);
      }
    } catch (error) {
      console.error("Error getting shareable link:", error);
      setToastType("error");
      setToastMessage("An error occurred while generating the sharable link!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    }
  };

  const handleDeleteDocument = async (id: number) => {
    if (!id) {
      console.error("Invalid document ID");
      return;
    }

    try {
      const response = await deleteWithAuth(`delete-document/${id}/${userId}`);

      if (response.status === "success") {
        handleCloseModal("deleteFileModel");
        setToastType("success");
        setToastMessage("Document deleted successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        fetchAssignedDocumentsData(setDummyData);
      } else {
        setToastType("error");
        setToastMessage("An error occurred while deleting the document!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      // console.error("Error deleting document:", error);
      setToastType("error");
      setToastMessage("An error occurred while deleting the document!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    }
  };

  const handleSendEmail = async (id: number, userId: string) => {
    try {
      const formData = new FormData();
      formData.append("subject", sendEmailData?.subject || "");
      formData.append("body", sendEmailData?.body || "");
      formData.append("to", sendEmailData?.to || "");
      formData.append("user", userId || "");

      // for (const [key, value] of formData.entries()) {
      //   console.log(`${key}: ${value}`);
      // }

      const response = await postWithAuth(
        `document-send-email/${id}`,
        formData
      );
      setNewVersionDocument(null);
      if (response.status === "fail") {
        setToastType("error");
        setToastMessage("An error occurred while sending the email!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      } else {

        handleCloseModal("sendEmailModel");
        setToastType("success");
        setToastMessage("Email sent successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      setToastType("error");
      setToastMessage("An error occurred while sending the email!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
      // console.error("Error new version updating:", error);
    }
  };


  const validate = () => {
    const validationErrors: any = {};

    if (editDocument) {
      if (!editDocument.name) {
        validationErrors.name = "Name is required.";
      }
    }
    if (!selectedCategoryIdEdit) {
      validationErrors.category = "Category is required.";
    }
    return validationErrors;
  };

  const handleGetEditData = async (id: number) => {
    try {
      const response = await getWithAuth(`edit-document/${id}`);
      // console.log("response edit: ", response)
      if (Array.isArray(response) && response.length > 0) {
        setEditDocument(response[0]);
        setSelectedCategoryIdEdit(response[0]?.category?.id.toString() || "");
      } else {
        console.error("Response is not a valid array or is empty");
      }
    } catch (error) {
      console.error("Error getting shareable link:", error);
    }
  };

  const handleSaveEditData = async (id: number) => {
    // console.log("response edit: ")
    try {
      const validationErrors = validate();
      if (Object.keys(validationErrors).length > 0) {
        seteditErrors(validationErrors);
        return;
      }

      seteditErrors({});
      const formData = new FormData();
      if (editDocument) {
        formData.append("name", editDocument.name);
        formData.append("description", editDocument.description);
        formData.append("category", `${selectedCategoryIdEdit}`);
        formData.append("meta_tags", JSON.stringify(metaTags));
        formData.append("user", userId || "");
      }

      const response = await postWithAuth(`edit-document/${id}`, formData);
      // console.log("response edit: ", response)
      if (response.status === "success") {
        setToastType("success");
        setToastMessage("Document updated successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        handleCloseModal("editModel");
        fetchAssignedDocumentsData(setDummyData);
        setMetaTags([])
      } else {
        setToastType("error");
        setToastMessage("An error occurred while updating the document!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        setMetaTags([])
      }
    } catch (error) {
      // console.error("Error updating document:", error);
      setToastType("error");
      setToastMessage("An error occurred while updating the document!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    }
  };

  const handleAddReminder = async (id: any, userId: string) => {
    try {
      const formData = new FormData();
      formData.append("document_id", id);
      formData.append("subject", addReminder?.subject || '');
      formData.append("message", addReminder?.message || "");
      formData.append("date_time", addReminder?.date_time || "");
      formData.append("is_repeat", addReminder?.is_repeat || "");
      formData.append("send_email", addReminder?.send_email || "");
      formData.append("frequency", addReminder?.frequency || "");
      formData.append("end_date_time", addReminder?.end_date_time || "");
      formData.append("start_date_time", addReminder?.start_date_time || "");
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
        formData.append("users", JSON.stringify(selectedUserIds) || "");
      }

      if (roles) {
        formData.append("roles", JSON.stringify(selectedRoleIds) || "");
      }

      formData.forEach((value, key) => {
        console.log(` ${key}: ${value}`);
      });

      const response = await postWithAuth(
        `reminder/`,
        formData
      );
      setAddReminder(null);
      setWeekDay([]);
      setDays("");
      setQuarterMonths([])
      setHalfMonths([])
      setUsers([])
      setSelectedUserIds([]);
      if (response.status === "success") {
        handleCloseModal("addReminderModel");
        setSelectedRoleIds([])
        setRoles([])
        setToastType("success");
        setToastMessage("Reminder added successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      } else {
        setToastType("error");
        setToastMessage("An error occurred while adding the reminder!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      setToastType("error");
      setToastMessage("An error occurred while adding the reminder!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
      // console.error("Error new version updating:", error);
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


  const handleShareUserDocument = async (id: any, userId: string) => {
    try {
      const formData = new FormData();
      formData.append("type", 'user');
      if (modalStates.shareAssignUserModel) {
        formData.append("assigned_roles_or_user", JSON.stringify(selectedUserIds) || '');
      } else if (modalStates.shareAssignRoleModel) {
        formData.append("assigned_roles_or_user", JSON.stringify(selectedRoleIds) || '');
      }
      formData.append("is_time_limited", shareDocumentData?.is_time_limited || "");
      formData.append("start_date_time", selectedStartDateTime || "");
      formData.append("end_date_time", selectedEndDateTime || "");
      formData.append("is_downloadable", shareDocumentData?.is_downloadable || "");
      formData.append("user", userId || "");
      // for (const [key, value] of formData.entries()) {
      //   console.log(`Document share: ${key}: ${value}`);
      // }
      const response = await postWithAuth(
        `document-share/${id}`,
        formData
      );
      setShareDocumentData(null);
      setUsers([])
      setSelectedUserIds([]);
      setSelectedEndDateTime("")
      setSelectedStartDateTime("")
      if (response.status === "success") {

        setToastType("success");
        setToastMessage("Document shared successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        fetchShareDocumentData(id);
        handleCloseModal("shareAssignUserModel");
      } else if (response.status === "fail") {
        setToastType("error");
        setToastMessage("An error occurred while sharing the document!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        fetchShareDocumentData(id);

      }
    } catch (error) {
      setToastType("error");
      setToastMessage("An error occurred while sharing the document!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
      // console.error("Error new version updating:", error);
    }
  };

  const handleShareRoleDocument = async (id: any, userId: string) => {
    try {
      const formData = new FormData();
      formData.append("type", "role");
      if (modalStates.shareAssignUserModel) {
        formData.append("assigned_roles_or_user", JSON.stringify(selectedUserIds) || '');
      } else if (modalStates.shareAssignRoleModel) {
        formData.append("assigned_roles_or_user", JSON.stringify(selectedRoleIds) || '');
      }
      formData.append("is_time_limited", shareDocumentData?.is_time_limited || "");
      formData.append("start_date_time", selectedStartDateTime || "");
      formData.append("end_date_time", selectedEndDateTime || "");
      formData.append("is_downloadable", shareDocumentData?.is_downloadable || "");
      formData.append("user", userId || "");
      // for (const [key, value] of formData.entries()) {
      //   console.log(`Document share: ${key}: ${value}`);
      // }
      const response = await postWithAuth(
        `document-share/${id}`,
        formData
      );
      setShareDocumentData(null);
      setRoles([])
      setSelectedRoleIds([]);
      setSelectedStartDateTime("")
      setSelectedEndDateTime("")
      if (response.status === "success") {
        setToastType("success");
        setToastMessage("Document shared successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        fetchShareDocumentData(id);
        handleCloseModal("shareAssignRoleModel");
      } else if (response.status === "fail") {
        setToastType("error");
        setToastMessage("An error occurred while sharing the document!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        fetchShareDocumentData(id);

      } else {
        setToastType("error");
        setToastMessage("An error occurred while sharing the document!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      setToastType("error");
      setToastMessage("An error occurred while sharing the document!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
      // console.error("Error new version updating:", error);
    }
  };

  const handleUserType = (itemType: React.SetStateAction<string>, itemId: number) => {
    setSelectedShareDocUserType(itemType);
    setSelectedShareDocId(itemId)
  };
  const handleDeleteShareDocument = async (id: any) => {
    if (!selectedShareDocId) {
      console.error("Invalid document ID");
      return;
    }

    try {
      const response = await deleteWithAuth(`delete-share/${selectedShareDocUserType}/${selectedShareDocId}`);

      if (response.status === "success") {
        handleCloseModal("shareDeleteModel");
        setToastType("success");
        setToastMessage("Document share deleted successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        fetchShareDocumentData(id);
      } else {
        setToastType("error");
        setToastMessage("An error occurred while deleting the document share!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        handleCloseModal("shareDeleteModel");
      }
    } catch (error) {
      // console.error("Error deleting document:", error);
      setToastType("error");
      setToastMessage("An error occurred while deleting the document share!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    }
  };
  const handleDeleteReminder = async (id: any) => {

    try {
      const response = await deleteWithAuth(`delete-reminder/${id}`);

      if (response.status === "success") {
        handleCloseModal("reminderDeleteModel");
        setToastType("success");
        setToastMessage("Reminder deleted successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        fetchRemindersData(setTableData);
      } else {
        setToastType("error");
        setToastMessage("An error occurred while deleting the reminder!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        handleCloseModal("reminderDeleteModel");
      }
    } catch (error) {
      // console.error("Error deleting document:", error);
      setToastType("error");
      setToastMessage("An error occurred while deleting the reminder!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    }
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


  const handleShareSelectedDoc = async () => {
    try {
      const formData = new FormData();
      formData.append("type", "role");
      formData.append("selected_document_ids", JSON.stringify(selectedItemsNames) || '');
      formData.append("assigned_users", JSON.stringify(selectedUserIds) || '');
      formData.append("assigned_roles", JSON.stringify(selectedRoleIds) || '');
      formData.append("is_time_limited", shareDocumentData?.is_time_limited || "");
      formData.append("start_date_time", selectedStartDateTime || "");
      formData.append("end_date_time", selectedEndDateTime || "");
      formData.append("is_downloadable", shareDocumentData?.is_downloadable || "");
      formData.append("user", userId || "");

      // for (const [key, value] of formData.entries()) {
      //   console.log(`Document share: ${key}: ${value}`);
      // }
      const response = await postWithAuth(
        `document-share`,
        formData
      );
      setShareDocumentData(null);
      setRoles([])
      setSelectedRoleIds([]);
      setSelectedStartDateTime("")
      setSelectedEndDateTime("")
      setAllShareData([])
      if (response.status === "success") {
        setToastType("success");
        setToastMessage("Documents shared successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        handleCloseModal("shareAssignRoleModel");
        setAllShareData([])
      } else if (response.status === "fail") {
        setToastType("error");
        setToastMessage("An error occurred while sharing the documents!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        setAllShareData([])
      } else {
        setToastType("error");
        setToastMessage("An error occurred while sharing the documents!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      setToastType("error");
      setToastMessage("An error occurred while sharing the documents!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
      // console.error("Error new version updating:", error);
    }
  };



  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <DashboardLayout>
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center pt-2">
          <Heading text="Assigned Documents" color="#444" />
          <div className="d-flex flex-row mt-3 mt-lg-0">
            {hasPermission(permissions, "Assigned Documents", "Create Document") && (
              <Link
                href="/all-documents/add"
                className="addButton me-2 bg-white text-dark border border-success rounded px-3 py-1"
              >
                <FaPlus className="me-1" /> Add Document
              </Link>
            )}
            {hasPermission(permissions, "Reminder", "View Reminders") && (
              <button
                onClick={() => handleOpenModal("myReminderModel")}
                className="reminderButton bg-danger text-white border border-danger rounded px-3 py-1"
              >
                <FaListUl className="me-1" /> My Reminders
              </button>
            )}


          </div>
        </div>
        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3 position-relative">
          <div className="d-flex flex-column flex-lg-row">
            <div className="col-12 col-lg-6 d-flex flex-column flex-lg-row">
              <div className="input-group mb-3 pe-lg-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search By Name Or Description"
                  onChange={(e) => handleTermSearch(e.target.value)}
                ></input>
              </div>
              <div className="input-group mb-3 pe-lg-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search By Meta Tags"
                  onChange={(e) => handleMetaSearch(e.target.value)}
                ></input>
              </div>
            </div>
            <div className="col-12 col-lg-6 d-flex flex-column flex-lg-row">
              <div className="col-12 col-lg-6">
                <div className="input-group mb-3">
                  <DropdownButton
                    id="dropdown-category-button"
                    title={
                      filterData.category
                        ? categoryDropDownData.find(
                          (item) => item.id.toString() === filterData.category
                        )?.category_name
                        : "Select Category"
                    }
                    className="custom-dropdown-text-start text-start w-100"
                    onSelect={(value) => handleCategorySelect(value || "")}
                  >
                    <Dropdown.Item eventKey="" style={{ fontStyle: "italic", color: "gray" }}>
                      None
                    </Dropdown.Item>

                    {categoryDropDownData.map((category) => (
                      <Dropdown.Item
                        key={category.id}
                        eventKey={category.id.toString()}
                        style={{
                          fontWeight:
                            category.parent_category === "none" ? "bold" : "normal",
                          paddingLeft: category.parent_category === "none" ? "10px" : "20px",
                        }}
                      >
                        {category.category_name}
                      </Dropdown.Item>
                    ))}
                  </DropdownButton>
                </div>
              </div>
              <div className="col-12 col-lg-6 px-lg-2">
                <div className="input-group mb-3">
                  <DropdownButton
                    id="dropdown-storage-button"
                    title={filterData.storage || "Select Storage"}
                    className="w-100 custom-dropdown-text-start"
                  >
                    <Dropdown.Item onClick={() => handleStorageSelect("")}>
                      None
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleStorageSelect("Local Disk (Default)")}>
                      Local Disk (Default)
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleStorageSelect("Amazon S3")}>
                      Amazon S3
                    </Dropdown.Item>
                  </DropdownButton>
                </div>
              </div>
              {/* <div className="col-12 col-lg-4">
                <div className="input-group">
                  <DatePicker onChange={handleDateChange} />
                </div>
              </div> */}
            </div>
          </div>
          <div>
            {isLoadingTable && <LoadingBar />}
          </div>


          <div>
            <div
              style={{ maxHeight: "350px", overflowY: "auto" }}
              className="custom-scroll "
            >
              <Table hover responsive>
                <thead className="sticky-header">
                  <tr>
                    <th>Actions</th>
                    <th className="text-start">Name</th>
                    <th className="text-start">Category Name</th>
                    <th className="text-start">Storage</th>
                    <th
                      className="text-start"
                      onClick={handleSort}
                      style={{ cursor: "pointer" }}
                    >
                      Created Date{" "}
                      {sortAsc ? (
                        <MdArrowDropUp fontSize={20} />
                      ) : (
                        <MdArrowDropDown fontSize={20} />
                      )}
                    </th>
                    <th
                      className="text-start"
                      onClick={handleSort}
                      style={{ cursor: "pointer" }}
                    >
                      Expired Date{" "}
                      {sortAsc ? (
                        <MdArrowDropUp fontSize={20} />
                      ) : (
                        <MdArrowDropDown fontSize={20} />
                      )}
                    </th>
                    <th className="text-start">Created By</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <tr key={item.id} onMouseEnter={() => setHoveredRow(item.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                        onMouseMove={handleMouseMove}>
                        <td>
                          <DropdownButton
                            id="dropdown-basic-button"
                            drop="end"
                            title={<FaEllipsisV />}
                            className="no-caret position-static"
                            style={{ zIndex: "99999" }}
                          >
                            {hasPermission(permissions, "All Documents", "View Documents") && (
                              <Dropdown.Item
                                className="py-2"
                                onClick={() =>
                                  handleOpenModal("viewModel", item.id, item.name)
                                }
                              >
                                <IoEye className="me-2" />
                                View
                              </Dropdown.Item>
                            )}

                            {hasPermission(permissions, "Assigned Documents", "Edit Document") && (
                              <Dropdown.Item
                                onClick={() =>
                                  handleOpenModal("editModel", item.id, item.name)
                                }
                                className="py-2"
                              >
                                <MdModeEditOutline className="me-2" />
                                Edit
                              </Dropdown.Item>
                            )}

                            {hasPermission(permissions, "Assigned Documents", "Share Document") && (
                              <Dropdown.Item onClick={() =>
                                handleOpenModal(
                                  "shareDocumentModel",
                                  item.id,
                                  item.name
                                )
                              } className="py-2">
                                <IoShareSocial className="me-2" />
                                Share
                              </Dropdown.Item>
                            )}

                            {hasPermission(permissions, "Assigned Documents", "Manage Sharable Link") && (
                              <Dropdown.Item
                                onClick={() =>
                                  handleGetShareableLinkModel(item?.id)
                                }
                                className="py-2"
                              >
                                <MdOutlineInsertLink className="me-2" />
                                Get Shareable Link
                              </Dropdown.Item>
                            )}
                            <Dropdown.Item className="py-2">
                              <Link
                                href={"#"}
                                style={{ color: "#212529" }}
                                onClick={() => handleDownload(item.id, userId)}
                              >
                                <MdFileDownload className="me-2" />
                                Download
                              </Link>
                            </Dropdown.Item>

                            {hasPermission(permissions, "Assigned Documents", "Upload New Version") && (
                              <Dropdown.Item
                                onClick={() =>
                                  handleOpenModal(
                                    "uploadNewVersionFileModel",
                                    item.id,
                                    item.name
                                  )
                                }
                                className="py-2"
                              >
                                <MdUpload className="me-2" />
                                Upload New Version file
                              </Dropdown.Item>
                            )}
                            <Dropdown.Item
                              onClick={() =>
                                handleOpenModal(
                                  "versionHistoryModel",
                                  item.id,
                                  item.name
                                )
                              }
                              className="py-2"
                            >
                              <GoHistory className="me-2" />
                              Version History
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                handleOpenModal(
                                  "commentModel",
                                  item.id,
                                  item.name
                                )
                              }
                              className="py-2"
                            >
                              <BiSolidCommentDetail className="me-2" />
                              Comment
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                handleOpenModal(
                                  "addReminderModel",
                                  item.id,
                                  item.name
                                )
                              }
                              className="py-2"
                            >
                              <BsBellFill className="me-2" />
                              Add Reminder
                            </Dropdown.Item>

                            {hasPermission(permissions, "Assigned Documents", "Send Email") && (
                              <Dropdown.Item
                                onClick={() =>
                                  handleOpenModal(
                                    "sendEmailModel",
                                    item.id,
                                    item.name
                                  )
                                }
                                className="py-2"
                              >
                                <MdEmail className="me-2" />
                                Send Email
                              </Dropdown.Item>
                            )}
                            <Dropdown.Item
                              onClick={() =>
                                handleOpenModal(
                                  "removeIndexingModel",
                                  item.id,
                                  item.name
                                )
                              }
                              className="py-2"
                            >
                              <AiOutlineZoomOut className="me-2" />
                              Remove From Search
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                handleOpenModal(
                                  "docArchivedModel",
                                  item.id,
                                  item.name
                                )
                              }
                              className="py-2"
                            >
                              <FaArchive className="me-2" />
                              Archive
                            </Dropdown.Item>


                            {hasPermission(permissions, "Assigned Documents", "Delete Document") && (
                              <Dropdown.Item
                                onClick={() =>
                                  handleOpenModal(
                                    "deleteFileModel",
                                    item.id,
                                    item.name
                                  )
                                }
                                className="py-2"
                              >
                                <AiFillDelete className="me-2" />
                                Delete
                              </Dropdown.Item>
                            )}
                          </DropdownButton>
                        </td>

                        {/* <td>
                          {item.name}
                          {hoveredRow === item.id && item.document_preview && (
                            <div
                              className="preview-image"
                              style={{
                                position: "fixed",
                                top: cursorPosition.y + 10,
                                left: cursorPosition.x + 10,
                                width: "200px",
                                maxHeight: "200px",
                                maxWidth: "200px",
                                zIndex: 1000,
                              }}
                            >
                              <Image
                                src={item.document_preview}
                                alt="Preview"
                                width={200}
                                height={200}
                              />
                            </div>
                          )}
                        </td> */}
                        <td
                          onMouseEnter={() => setHoveredRow(item.id)}
                          onMouseLeave={() => setHoveredRow(null)}
                        >
                          {item.name}
                          {hoveredRow === item.id && item.document_preview && (
                            <div
                              className="preview-image p-0"
                              style={{
                                position: "fixed",
                                top: cursorPosition.y + 10,
                                left: cursorPosition.x + 10,
                                width: "200px",
                                maxHeight: "200px",
                                maxWidth: "200px",
                                zIndex: 1000,
                                overflow: "hidden"
                              }}
                            >
                              <Image
                                src={item.document_preview}
                                alt="Preview"
                                width={200}
                                height={200}
                                style={{
                                  width: "200px",
                                  height: "200px",
                                }}
                              />
                            </div>
                          )}
                        </td>
                        <td>{item.category?.category_name || ""}</td>
                        <td>{item.storage}</td>
                        <td>
                          {new Date(item.created_date).toLocaleDateString(
                            "en-GB"
                          )}
                        </td>
                        <td>-</td>
                        <td>{item.created_by}</td>
                      </tr>
                    ))
                  ) : (
                    <div className="text-start w-100 py-3">
                      <Paragraph text="No data available" color="#333" />
                    </div>
                  )}
                </tbody>
              </Table>
            </div>
            <div className="d-flex flex-column flex-lg-row paginationFooter">
              <div className="d-flex justify-content-between align-items-center">
                <p className="pagintionText mb-0 me-2">Items per page:</p>
                <Form.Select
                  onChange={handleItemsPerPageChange}
                  value={itemsPerPage}
                  style={{
                    width: "100px",
                    padding: "5px 10px !important",
                    fontSize: "12px",
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                </Form.Select>
              </div>
              <div className="d-flex flex-row align-items-center px-lg-5">
                <div className="pagination-info" style={{ fontSize: "14px" }}>
                  {startIndex} – {endIndex} of {totalItems}
                </div>

                <Pagination className="ms-3">
                  <Pagination.Prev
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                  />
                  <Pagination.Next
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </div>
            </div>
          </div>
        </div>
        {/* Edit Modal */}
        <Modal
          centered
          show={modalStates.editModel}
          className="large-model"
          onHide={() => {
            handleCloseModal("editModel");
            setSelectedDocumentId(null);
            setMetaTags([])
          }}
        >
          <Modal.Header>
            <div className="d-flex w-100 justify-content-end">
              <div className="col-11 d-flex flex-row">
                <p className="mb-0" style={{ fontSize: "16px", color: "#333" }}>
                  Edit Model
                </p>
              </div>
              <div className="col-1 d-flex  justify-content-end">
                <IoClose
                  fontSize={20}
                  style={{ cursor: "pointer" }}
                  onClick={() => { handleCloseModal("editModel"); setMetaTags([]) }}
                />
              </div>
            </div>
          </Modal.Header>
          <Modal.Body className="p-2 p-lg-4">
            <p className="mb-1 mt-3" style={{ fontSize: "14px" }}>
              Name
            </p>
            <div className="input-group mb-3">
              <input
                type="text"
                className={`form-control ${editErrors?.name ? 'is-invalid' : ''}`}
                value={editDocument?.name || ""}
                onChange={(e) =>
                  setEditDocument((prev) =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
              />
            </div>
            {editErrors?.name && (
              <small className="text-danger">{editErrors.name}</small>
            )}
            <p className="mb-1" style={{ fontSize: "14px" }}>
              Category
            </p>
            {/* <DropdownButton
              id="dropdown-category-button"
              title={selectedCategory?.category_name || "Select Category"}
              className={`custom-dropdown-text-start text-start w-100 ${editErrors?.category ? 'is-invalid' : ''}`}
              onSelect={(value) => handleCategoryEditSelect(value || '')}
            >
              {categoryDropDownData.map((category) => (
                <Dropdown.Item key={category.id} eventKey={category.id}>
                  {category.category_name}
                </Dropdown.Item>
              ))}
            </DropdownButton> */}
            <DropdownButton
              id="dropdown-category-button"
              title={selectedCategory?.category_name || "Select Category"}
              className="custom-dropdown-text-start text-start w-100"
              onSelect={(value) => handleCategoryEditSelect(value || "")}
            >
              {categoryDropDownData.map((category) => (
                <Dropdown.Item
                  key={category.id}
                  eventKey={category.id.toString()}
                >
                  {category.category_name}
                </Dropdown.Item>
              ))}
            </DropdownButton>
            {editErrors?.category && (
              <small className="text-danger">{editErrors.category}</small>
            )}
            <p className="mb-1 mt-3" style={{ fontSize: "14px" }}>
              Description
            </p>
            <div className="input-group mb-3">
              <textarea
                className="form-control"
                value={editDocument?.description || ""}
                onChange={(e) =>
                  setEditDocument((prev) =>
                    prev ? { ...prev, description: e.target.value } : null
                  )
                }
              ></textarea>
            </div>
            <div className="col-12 col-lg-6 d-flex flex-column ps-lg-2">
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                Meta tags
              </p>
              <div className="col-12">
                <div style={{ marginBottom: "10px" }} className="w-100 d-flex metaBorder ">
                  <input
                    type="text"
                    value={currentMeta}
                    onChange={(e) => setCurrentMeta(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter a meta tag"
                    style={{
                      flex: 1,
                      padding: "6px 10px",
                      border: "1px solid #ccc",
                      borderTopRightRadius: "0 !important",
                      borderBottomRightRadius: "0 !important",
                      backgroundColor: 'transparent',
                      color: "#333",
                    }}
                  />
                  <button
                    onClick={addMetaTag}
                    className="successButton"
                    style={{
                      padding: "10px",
                      backgroundColor: "#4CAF50",
                      color: "white",
                      border: "1px solid #4CAF50",
                      borderLeft: "none",
                      borderTopRightRadius: "4px",
                      borderBottomRightRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    <IoAdd />
                  </button>
                </div>
                <div>
                  {metaTags.map((tag, index) => (
                    <div
                      key={index}
                      className="metaBorder"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "5px",
                      }}
                    >
                      <input
                        type="text"
                        value={tag}
                        onChange={(e) => updateMetaTag(index, e.target.value)}
                        style={{
                          flex: 1,
                          borderRadius: "0px",
                          backgroundColor: 'transparent',
                          border: "1px solid #ccc",
                          color: "#333",
                          padding: "6px 10px",
                        }}
                      />
                      <button
                        onClick={() => removeMetaTag(index)}
                        className="dangerButton"
                        style={{
                          padding: "10px !important",
                          backgroundColor: "#f44336",
                          color: "white",
                          border: "1px solid #4CAF50",
                          borderLeft: "none",
                          borderTopRightRadius: "4px",
                          borderBottomRightRadius: "4px",
                          cursor: "pointer",
                          height: "34px"
                        }}
                      >
                        <IoTrashOutline />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </Modal.Body>

          <Modal.Footer>
            <div className="d-flex flex-row justify-content-start">
              <button
                onClick={() => handleSaveEditData(selectedDocumentId!)}
                className="custom-icon-button button-success px-3 py-1 rounded me-2"
              >
                <IoSaveOutline fontSize={16} className="me-1" /> Yes
              </button>
              <button
                onClick={() => {
                  handleCloseModal("editModel");
                  setSelectedDocumentId(null);
                  setMetaTags([])
                }}
                className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
              >
                <MdOutlineCancel fontSize={16} className="me-1" /> No
              </button>
            </div>
          </Modal.Footer>
        </Modal>
        {/* shareable link model */}
        <Modal
          centered
          show={modalStates.shareableLinkModel}
          style={{ minWidth: "40%" }}
          onHide={() => {
            handleCloseModal("shareableLinkModel");
          }}
        >
          <Modal.Header>
            <div className="d-flex w-100 justify-content-end">
              <div className="col-11 d-flex flex-row">
                <IoFolder fontSize={20} className="me-2" />
                <p className="mb-0" style={{ fontSize: "16px", color: "#333" }}>
                  Shareable Link
                </p>
              </div>
              <div className="col-1 d-flex  justify-content-end">
                <IoClose
                  fontSize={20}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleCloseModal("shareableLinkModel")}
                />
              </div>
            </div>
          </Modal.Header>
          <Modal.Body className="p-2 p-lg-4">
            <div className="mt-1">
              <div className="d-flex flex-column">
                <Checkbox
                  checked={shareableLinkData.has_expire_date}
                  onChange={() => handleShareCheckboxChange("has_expire_date")}
                  className="me-2 mb-2"
                >
                  <p
                    className="mb-0 text-start w-100"
                    style={{ fontSize: "14px" }}
                  >
                    Is Link Valid until:
                  </p>

                </Checkbox>
                {Boolean(shareableLinkData.has_expire_date) && (
                  <div className="d-flex flex-column gap-2 mb-3">
                    <DatePicker
                      showTime
                      className={`w-100`}
                      onChange={(value, dateString) => {
                        handleShareInputChange("expire_date_time", `${dateString}`)
                      }}
                      onOk={(value) => onDateTimeOk(value, value?.format('YYYY-MM-DD HH:mm:ss') ?? '')}
                    />
                    {errors.expire_date_time && (
                      <div className="invalid-feedback">{errors.expire_date_time}</div>
                    )}
                  </div>
                )}

              </div>
              <div className="d-flex flex-column">
                <Checkbox
                  checked={shareableLinkData.has_password}
                  onChange={() => handleShareCheckboxChange("has_password")}
                  className="me-2  mb-2"
                >
                  <p
                    className="mb-0 text-start w-100"
                    style={{ fontSize: "14px" }}
                  >
                    Is password required:
                  </p>

                </Checkbox>

                {Boolean(shareableLinkData.has_password) && (
                  <div className="d-flex flex-column gap-2 mb-3">
                    <Input.Password
                      placeholder="input password"
                      className={errors.password ? "is-invalid" : ""}
                      value={shareableLinkData.password}
                      onChange={(e) =>
                        handleShareInputChange("password", e.target.value)
                      }
                    />
                    {errors.password && (
                      <div className="invalid-feedback">{errors.password}</div>
                    )}
                  </div>
                )}

              </div>
              <Checkbox
                checked={shareableLinkData.allow_download}
                onChange={() => handleShareCheckboxChange("allow_download")}
                className="me-2"
              >
                <p
                  className="mb-0 text-start w-100"
                  style={{ fontSize: "14px" }}
                >
                  Users with link can download this item
                </p>

              </Checkbox>

            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex flex-row">
              <button
                onClick={() => {
                  handleGetShareableLink(selectedDocumentId!);
                }}
                className="custom-icon-button button-success px-3 py-1 rounded me-2"
              >
                <IoSaveOutline fontSize={16} className="me-1" /> Create link
              </button>
            </div>
          </Modal.Footer>
        </Modal>
        {/* generated link model */}
        <Modal
          centered
          show={modalStates.generatedShareableLinkModel}
          onHide={() => {
            handleCloseModal("generatedShareableLinkModel");
          }}
        >
          <Modal.Header>
            <div className="d-flex w-100 justify-content-end">
              <div className="col-11 d-flex flex-row">
                <p className="mb-0" style={{ fontSize: "16px", color: "#333" }}>
                  Shareable Link
                </p>
              </div>
              <div className="col-1  d-flex  justify-content-end">
                <IoClose
                  fontSize={20}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleCloseModal("generatedShareableLinkModel")}
                />
              </div>
            </div>
          </Modal.Header>
          <Modal.Body className="p-2 p-lg-4">
            <div className="mt-1 d-flex flex-column">
              <div className="d-flex justify-content-between mb-2">
                <p
                  className="mb-1 text-start w-100"
                  style={{ fontSize: "14px" }}
                >
                  Link sharing is on
                </p>
                <div className="d-flex">
                  <IoTrash
                    fontSize={20}
                    style={{ cursor: "pointer" }}
                    className="me-2 text-danger"
                    onClick={() => {
                      handleCloseModal("generatedShareableLinkModel");
                      handleOpenModal("deleteConfirmShareableLinkModel");
                    }}
                  />
                  <IoSettings
                    fontSize={20}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      handleCloseModal("generatedShareableLinkModel");
                      handleOpenModal("sharableLinkSettingModel");
                    }}
                  />
                </div>
              </div>
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  value={generatedLink}
                  readOnly
                />
                <button
                  className="btn btn-outline-secondary bg-success border-success text-white copy-button"
                  onClick={() => copyToClipboard(generatedLink)}
                  type="button"
                >
                  Copy
                </button>
                {copySuccess && (
                  <span className="text-success ms-2">{copySuccess}</span>
                )}
              </div>
            </div>
          </Modal.Body>
        </Modal>
        {/* generated link model settings */}
        <Modal
          centered
          show={modalStates.sharableLinkSettingModel}
          onHide={() => {
            handleCloseModal("sharableLinkSettingModel");
          }}
        >
          <Modal.Header>
            <div className="d-flex w-100 justify-content-end">
              <div className="col-11 d-flex flex-row">
                <p className="mb-0" style={{ fontSize: "16px", color: "#333" }}>
                  Shareable Link
                </p>
              </div>
              <div className="col-1  d-flex justify-content-end">
                <IoClose
                  fontSize={20}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleCloseModal("sharableLinkSettingModel")}
                />
              </div>
            </div>
          </Modal.Header>
          <Modal.Body className="p-2 p-lg-4">
            <div className="mt-1 d-flex flex-column">
              <div className="d-flex justify-content-between mb-2">
                <p
                  className="mb-1 text-start w-100"
                  style={{ fontSize: "14px" }}
                >
                  Link sharing is on
                </p>
                <div className="d-flex">
                  <IoTrash
                    fontSize={20}
                    style={{ cursor: "pointer" }}
                    className="me-2 text-danger"
                    onClick={() => {
                      handleCloseModal("sharableLinkSettingModel");
                      handleOpenModal("deleteConfirmShareableLinkModel");
                    }}
                  />
                  <IoSettings
                    fontSize={20}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      handleCloseModal("sharableLinkSettingModel");
                      handleOpenModal("generatedShareableLinkModel");
                    }}
                  />
                </div>
              </div>
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  value={generatedLink}
                  readOnly
                />
                <button
                  className="btn btn-outline-secondary bg-success border-success text-white copy-button"
                  onClick={() => copyToClipboard(generatedLink)}
                  type="button"
                >
                  Copy
                </button>
                {copySuccess && (
                  <span className="text-success ms-2">{copySuccess}</span>
                )}
              </div>
            </div>
            <div className="mt-1">
              <div className="mt-1">
                <div className="d-flex flex-column">
                  <Checkbox
                    checked={shareableLinkDataSetting.has_expire_date}
                    onChange={() => handleShareSettingCheckboxChange("has_expire_date")}
                    className="me-2 mb-2"
                  >
                    <p className="mb-0 text-start w-100" style={{ fontSize: "14px" }}>
                      Is Link Valid until:
                    </p>
                  </Checkbox>
                  {Boolean(shareableLinkDataSetting.has_expire_date) && (
                    <div className="d-flex flex-column gap-2 mb-3">
                      <DatePicker
                        showTime
                        className="w-100"
                        defaultValue={
                          shareableLinkDataSetting.expire_date_time
                            ? dayjs(shareableLinkDataSetting.expire_date_time, "YYYY-MM-DD HH:mm:ss")
                            : null
                        }
                        onChange={(value, dateString) => {
                          if (typeof dateString === "string") {
                            handleShareSettingInputChange("expire_date_time", dateString);
                          }
                        }}
                        onOk={(value) => onDateTimeOk(value, value?.format('YYYY-MM-DD HH:mm:ss') ?? '')}
                      />

                      {errors.expire_date_time && (
                        <div className="invalid-feedback">{errors.expire_date_time}</div>
                      )}
                    </div>
                  )}


                </div>
                <div className="d-flex flex-column">
                  <Checkbox
                    checked={shareableLinkDataSetting.has_password}
                    onChange={() => handleShareSettingCheckboxChange("has_password")}
                    className="me-2 mb-2"
                  >
                    <p className="mb-0 text-start w-100" style={{ fontSize: "14px" }}>
                      Is password required:
                    </p>
                  </Checkbox>

                  {Boolean(shareableLinkDataSetting.has_password) && (
                    <div className="d-flex flex-column gap-2 mb-3">
                      <Input.Password
                        placeholder="input password"
                        className={errors.password ? "is-invalid" : ""}
                        value={shareableLinkDataSetting.password}
                        onChange={(e) =>
                          handleShareSettingInputChange("password", e.target.value)
                        }
                      />
                      {errors.password && (
                        <div className="invalid-feedback">{errors.password}</div>
                      )}
                    </div>
                  )}

                </div>
                <Checkbox
                  checked={shareableLinkDataSetting.allow_download}
                  onChange={() => handleShareSettingCheckboxChange("allow_download")}
                  className="me-2"
                >
                  <p className="mb-0 text-start w-100" style={{ fontSize: "14px" }}>
                    Users with link can download this item
                  </p>
                </Checkbox>

              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex flex-row">
              <button
                onClick={() => {
                  handleUpdateShareableLink(selectedDocumentId!);
                }}
                className="custom-icon-button button-success px-3 py-1 rounded me-2"
              >
                <IoSaveOutline fontSize={16} className="me-1" /> Update Link
              </button>
            </div>
          </Modal.Footer>
        </Modal>
        {/* delete sharable link model */}
        <Modal
          centered
          show={modalStates.deleteConfirmShareableLinkModel}
          onHide={() => handleCloseModal("deleteConfirmShareableLinkModel")}
        >
          <Modal.Header>
            <div className="d-flex w-100 justify-content-end">
              <div className="col-11 d-flex flex-row">
                <p className="mb-0" style={{ fontSize: "16px", color: "#333" }}>
                  Shareable Link
                </p>
              </div>
              <div className="col-1 d-flex justify-content-end">
                <IoClose
                  fontSize={20}
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    handleCloseModal("deleteConfirmShareableLinkModel")
                  }
                />
              </div>
            </div>
          </Modal.Header>
          <Modal.Body className="p-2 p-lg-4">
            <div className="">
              <p
                className="mb-1 text-start w-100 text-danger"
                style={{ fontSize: "14px" }}
              >
                Are you sure to Delete
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex flex-row">
              <button
                onClick={() => handleDeleteShareableLink(1)}
                className="custom-icon-button button-success px-3 py-1 rounded me-2"
              >
                <IoSaveOutline fontSize={16} className="me-1" /> Delete
              </button>
              <button
                onClick={() => {
                  handleCloseModal("deleteConfirmShareableLinkModel");
                  setSelectedDocumentId(null);
                }}
                className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
              >
                <MdOutlineCancel fontSize={16} className="me-1" /> Cancel
              </button>
            </div>
          </Modal.Footer>
        </Modal>
        {/* delete document model */}
        <Modal
          centered
          show={modalStates.deleteFileModel}
          onHide={() => handleCloseModal("deleteFileModel")}
        >
          <Modal.Header>
            <div className="d-flex w-100 justify-content-end">
              <div className="col-11 d-flex flex-row">
                <p
                  className="mb-0 text-danger"
                  style={{ fontSize: "18px", color: "#333" }}
                >
                  Are you sure you want to delete? {selectedDocumentName || "No document selected"}
                </p>
              </div>
              <div className="col-1 d-flex justify-content-end">
                <IoClose
                  fontSize={20}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleCloseModal("deleteFileModel")}
                />
              </div>
            </div>
          </Modal.Header>
          <Modal.Body className="p-2 p-lg-4">
            <div className="mt-1">
              <p
                className="mb-1 text-start w-100 text-danger"
                style={{ fontSize: "14px" }}
              >
                By deleting the document, it will no longer be accessible in the
                future, and the following data will be deleted from the system:
              </p>
              <ul>
                <li>Version History</li>
                <li>Meta Tags</li>
                <li>Comment</li>
                <li>Notifications</li>
                <li>Reminders</li>
                <li>Permissions</li>
              </ul>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex flex-row">
              <button
                onClick={() => handleDeleteDocument(selectedDocumentId!)}
                className="custom-icon-button button-success px-3 py-1 rounded me-2"
              >
                <IoSaveOutline fontSize={16} className="me-1" /> Yes
              </button>
              <button
                onClick={() => {
                  handleCloseModal("deleteFileModel");
                  setSelectedDocumentId(null);
                }}
                className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
              >
                <MdOutlineCancel fontSize={16} className="me-1" /> No
              </button>
            </div>
          </Modal.Footer>
        </Modal>
        {/* remove indexing model */}
        <Modal
          centered
          show={modalStates.removeIndexingModel}
          onHide={() => handleCloseModal("removeIndexingModel")}
        >
          <Modal.Header>
            <div className="d-flex w-100 justify-content-end">
              <div className="col-11">
                <p
                  className="mb-1 text-danger"
                  style={{ fontSize: "16px", color: "#333" }}
                >
                  Are you sure want to remove document page indexing ? {selectedDocumentName || "No document selected"}
                </p>
              </div>
              <div className="col-1">
                <IoClose
                  fontSize={20}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleCloseModal("removeIndexingModel")}
                />
              </div>
            </div>
          </Modal.Header>
          <Modal.Body className="py-5">
            <div className="mt-1">
              <p
                className="mb-1 text-start w-100 text-danger"
                style={{ fontSize: "14px" }}
              >
                Note::After removal, the document&apos;s content will no longer
                be searchable. Once removed, the document will not appear in
                deep search results.
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex flex-row justify-content-start">
              <button
                onClick={() => {
                  handleRemoveIndexing(selectedDocumentId!, userId!);
                  // handleCloseModal("removeIndexingModel");
                }}
                className="custom-icon-button button-success px-3 py-1 rounded me-2"
              >
                <IoSaveOutline fontSize={16} className="me-1" /> Yes
              </button>
              <button
                onClick={() => {
                  handleCloseModal("removeIndexingModel");
                  setSelectedDocumentId(null);
                }}
                className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
              >
                <MdOutlineCancel fontSize={16} className="me-1" /> No
              </button>
            </div>
          </Modal.Footer>
        </Modal>
        {/* archive document model */}
        <Modal
          centered
          show={modalStates.docArchivedModel}
          onHide={() => {
            handleCloseModal("docArchivedModel");
            setSelectedDocumentId(null);
            setSelectedDocumentName(null);
          }}
        >
          <Modal.Header>
            <div className="d-flex w-100 justify-content-end">
              <div className="col-11">
                <p className="mb-1" style={{ fontSize: "16px", color: "#333" }}>
                  Are you sure you want to archive?
                </p>
              </div>
              <div className="col-1 d-flex justify-content-end">
                <IoClose
                  fontSize={20}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleCloseModal("docArchivedModel")}
                />
              </div>
            </div>
          </Modal.Header>
          <Modal.Body className="py-3">
            <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
              {selectedDocumentName || "No document selected"}
            </p>
          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex flex-row">
              <button
                onClick={() =>
                  handleDocumentArchive(selectedDocumentId!, userId!)
                }
                className="custom-icon-button button-success px-3 py-1 rounded me-2"
              >
                <IoSaveOutline fontSize={16} className="me-1" /> Yes
              </button>
              <button
                onClick={() => {
                  handleCloseModal("docArchivedModel");
                  setSelectedDocumentId(null);
                  setSelectedDocumentName(null);
                }}
                className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
              >
                <MdOutlineCancel fontSize={16} className="me-1" /> Cancel
              </button>
            </div>
          </Modal.Footer>
        </Modal>
        {/* comment model */}
        <Modal
          centered
          show={modalStates.commentModel}
          className="large-model"
          onHide={() => {
            handleCloseModal("commentModel");
            setSelectedDocumentId(null);
            setSelectedDocumentName(null);
          }}
        >
          <Modal.Header>
            <div className="d-flex w-100 justify-content-end">
              <div className="col-11 d-flex flex-row">
                <IoFolder fontSize={20} className="me-2" />
                <p className="mb-0" style={{ fontSize: "16px", color: "#333" }}>
                  DMS Test Document{" "}
                  {selectedDocumentName || "No document selected"} Comment
                </p>
              </div>
              <div className="col-1 d-flex justify-content-end">
                <IoClose
                  fontSize={20}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleCloseModal("commentModel")}
                />
              </div>
            </div>
          </Modal.Header>
          <Modal.Body className="py-3">
            <div
              className="d-flex flex-column custom-scroll mb-3"
              style={{ maxHeight: "200px", overflowY: "auto" }}
            >
              {allComment.map((comment, index) => (
                <div
                  className="d-flex flex-column w-100 border border-1 rounded mb-2 p-2"
                  key={index}
                >
                  <div className="d-flex flex-row w-100 mb-2">
                    <p className="mb-0 me-3">{comment.comment}</p>{" "}
                    <IoMdTrash
                      fontSize={20}
                      style={{ cursor: "pointer" }}
                      className="text-danger"
                      onClick={() => handleDeleteComment(comment.id)}
                    />
                  </div>
                  <div className="d-flex flex-row">
                    <p className="mb-0 me-3">{comment.date_time}</p>{" "}
                    <Link href={`${comment.user}`} className="mb-0">
                      {comment.commented_by}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="d-flex w-100">
              <textarea
                name="comment"
                id="comment"
                value={comment}
                className="w-100"
                rows={5}
                onChange={(e) => setComment(e.target.value)}
              ></textarea>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex flex-row">
              <button
                onClick={() =>
                  handleDocumentComment(selectedDocumentId!, userId!)
                }
                className="custom-icon-button button-success px-3 py-1 rounded me-2"
              >
                <IoMdSend fontSize={16} className="me-1" /> Add Comment
              </button>
              <button
                onClick={() => {
                  handleCloseModal("commentModel");
                  setSelectedDocumentId(null);
                  setSelectedDocumentName(null);
                }}
                className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
              >
                <MdOutlineCancel fontSize={16} className="me-1" /> Cancel
              </button>
            </div>
          </Modal.Footer>
        </Modal>
        {/* version history model */}
        <Modal
          centered
          show={modalStates.versionHistoryModel}
          className="large-model"
          onHide={() => {
            handleCloseModal("versionHistoryModel");
            setSelectedDocumentId(null);
            setSelectedDocumentName(null);
          }}
        >
          <Modal.Header>
            <div className="d-flex w-100 justify-content-end">
              <div className="col-11 d-flex flex-row">
                <IoFolder fontSize={20} className="me-2" />
                <p className="mb-0" style={{ fontSize: "16px", color: "#333" }}>
                  {selectedDocumentName || "No document selected"}{" "}
                  : VERSION_HISTORY
                </p>
              </div>
              <div className="col-1 d-flex justify-content-end">
                <IoClose
                  fontSize={20}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleCloseModal("versionHistoryModel")}
                />
              </div>
            </div>
          </Modal.Header>
          <Modal.Body className="py-3">
            <div
              className="d-flex flex-column custom-scroll mb-3"
              style={{ maxHeight: "200px", overflowY: "auto" }}
            >
              {versionHistory.map((item, index) => {
                const isLatestVersion =
                  item.date_time === versionHistory[0].date_time;

                return (
                  <div
                    className="d-flex flex-column w-100 border border-1 rounded mb-2 p-2"
                    key={index}
                  >
                    <div className="d-flex flex-column flex-lg-row justify-content-between w-100">
                      <div className="col-12 col-lg-5 text-start">
                        <p className="mb-0 me-3">{item.date_time}</p>
                      </div>
                      <div className="col-12 col-lg-5 text-start">
                        <p className="mb-0 me-3">{item.created_by}</p>
                      </div>

                      <div className="col-12 col-lg-2 d-flex justify-content-lg-end">
                        {" "}
                        {isLatestVersion && (
                          <span
                            className="bg-success px-3 py-1 rounded-pill text-white mb-0 d-flex justify-content-center align-items-center"
                            style={{ fontSize: "12px" }}
                          >
                            Current Version
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Modal.Body>
        </Modal>
        {/* new version upload model */}
        <Modal
          centered
          show={modalStates.uploadNewVersionFileModel}
          onHide={() => {
            handleCloseModal("uploadNewVersionFileModel");
            setSelectedDocumentId(null);
            setSelectedDocumentName(null);
          }}
        >
          <Modal.Header>
            <div className="d-flex w-100 justify-content-end">
              <div className="col-11 d-flex flex-row">
                <IoFolder fontSize={20} className="me-2" />
                <p className="mb-0" style={{ fontSize: "16px", color: "#333" }}>
                  Upload New Version file
                </p>
              </div>
              <div className="col-1 d-flex justify-content-end">
                <IoClose
                  fontSize={20}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleCloseModal("uploadNewVersionFileModel")}
                />
              </div>
            </div>
          </Modal.Header>
          <Modal.Body className="py-3">
            <div
              className="d-flex flex-column custom-scroll mb-3"
              style={{ maxHeight: "200px", overflowY: "auto" }}
            >
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                Document Upload
              </p>
              <div className="input-group">
                <input
                  type="file"
                  className="form-control p-1"
                  id="newVersionDocument"
                  accept=".pdf,.doc,.docx,.png,.jpg"
                  onChange={handleNewVersionFileChange}
                  required
                ></input>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex flex-row">
              <button
                onClick={() =>
                  handleUploadNewVersion(selectedDocumentId!, userId!)
                }
                className="custom-icon-button button-success px-3 py-1 rounded me-2"
              >
                <IoSaveOutline fontSize={16} className="me-1" /> Save
              </button>
              <button
                onClick={() => {
                  handleCloseModal("uploadNewVersionFileModel");
                  setSelectedDocumentId(null);
                  setSelectedDocumentName(null);
                }}
                className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
              >
                <MdOutlineCancel fontSize={16} className="me-1" /> Cancel
              </button>
            </div>
          </Modal.Footer>
        </Modal>
        {/* send email model */}
        <Modal
          centered
          show={modalStates.sendEmailModel}
          className="large-model"
          onHide={() => {
            handleCloseModal("sendEmailModel");
            setSelectedDocumentId(null);
            setSelectedDocumentName(null);
          }}
        >
          <Modal.Header>
            <div className="d-flex w-100 justify-content-end">
              <div className="col-11 d-flex flex-row">
                <p className="mb-0" style={{ fontSize: "16px", color: "#333" }}>
                  Send Email
                </p>
              </div>
              <div className="col-1 d-flex justify-content-end">
                <IoClose
                  fontSize={20}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleCloseModal("sendEmailModel")}
                />
              </div>
            </div>
          </Modal.Header>
          <Modal.Body className="py-3">
            <div
              className="d-flex flex-column custom-scroll mb-3"
              style={{ maxHeight: "300px", overflowY: "auto" }}
            >
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                To
              </p>
              <div className="input-group mb-2">
                <input
                  type="text"
                  className="form-control"
                  id="to"
                  value={sendEmailData?.to || ""}
                  onChange={(e) =>
                    setSendEmailData((prev) => ({
                      ...(prev || { subject: "", body: "", to: "" }),
                      to: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                Subject
              </p>
              <div className="input-group mb-2">
                <input
                  type="text"
                  className="form-control"
                  id="subject"
                  value={sendEmailData?.subject || ""}
                  onChange={(e) =>
                    setSendEmailData((prev) => ({
                      ...(prev || { subject: "", body: "", to: "" }),
                      subject: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                Body
              </p>
              <ReactQuill
                value={sendEmailData?.body || ""}
                onChange={(content) =>
                  setSendEmailData((prev) => ({
                    ...(prev || { subject: "", body: "", to: "" }),
                    body: content,
                  }))
                }
              />
              <div className="d-flex w-100">
                <p
                  className="mb-1 text-start w-100 px-3 py-2 rounded mt-2"
                  style={{ fontSize: "14px", backgroundColor: "#eee" }}
                >
                  Attachment Document :: {selectedDocumentName || ""}
                </p>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex flex-row">
              <button
                onClick={() => handleSendEmail(selectedDocumentId!, userId!)}
                className="custom-icon-button button-success px-3 py-1 rounded me-2"
              >
                <IoMdSend fontSize={16} className="me-1" /> Send
              </button>
            </div>
          </Modal.Footer>
        </Modal>
        {/* add reminder model */}
        <Modal
          centered
          show={modalStates.addReminderModel}
          className="large-model"
          onHide={() => {
            handleCloseModal("addReminderModel");
            setSelectedDocumentId(null);
            setSelectedDocumentName(null);
          }}
        >
          <Modal.Header>
            <div className="d-flex w-100 justify-content-end">
              <div className="col-11 d-flex flex-row">
                <p className="mb-0" style={{ fontSize: "16px", color: "#333" }}>
                  Add Reminder :: {selectedDocumentName || ""}
                </p>
              </div>
              <div className="col-1 d-flex justify-content-end">
                <IoClose
                  fontSize={20}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleCloseModal("addReminderModel")}
                />
              </div>
            </div>
          </Modal.Header>
          <Modal.Body className="py-3 ">
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
                <div className="col-12 col-lg-6">
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
                <div className="col-12 col-lg-6 d-flex flex-column align-items-lg-start mb-3">
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
                  <div className=" d-flex flex-column position-relative w-100">
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
                  <div className="col-lg-6 d-flex flex-column position-relative w-100 mt-3">
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
                            setSelectedStartDateTime(dateString.toString());
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
                            setSelectedEndDateTime(dateString.toString());
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
                          setSelectedDateTime(dateString.toString());
                        }}
                        onOk={(value) => onDateTimeOk(value, value?.format('YYYY-MM-DD HH:mm:ss') ?? '')}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex flex-row">
              <button
                onClick={() => handleAddReminder(selectedDocumentId!, userId!)}
                className="custom-icon-button button-success px-3 py-1 rounded me-2"
              >
                <IoSaveOutline fontSize={16} className="me-1" /> Save
              </button>
            </div>
          </Modal.Footer>
        </Modal>
        {/* share model */}
        <Modal
          centered
          show={modalStates.shareDocumentModel}
          className="large-model"
          onHide={() => {
            handleCloseModal("shareDocumentModel");
            setSelectedDocumentId(null);
            setSelectedDocumentName(null);
          }}
        >
          <Modal.Header>
            <div className="d-flex w-100 justify-content-end">
              <div className="col-11 d-flex flex-row">
                <p className="mb-0" style={{ fontSize: "16px", color: "#333" }}>
                  Share Document
                </p>
              </div>
              <div className="col-1 d-flex justify-content-end">
                <IoClose
                  fontSize={20}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleCloseModal("shareDocumentModel")}
                />
              </div>
            </div>
          </Modal.Header>
          <Modal.Body className="py-3 ">

            <div
              className="d-flex flex-column custom-scroll mb-3  px-2"
              style={{ maxHeight: "400px", overflowY: "auto" }}
            >
              <p className="mb-0" style={{ fontSize: "14px", color: "#333" }}>
                Document Name: {selectedDocumentName || ""}
              </p>

              <div className="d-flex flex-column flex-sm-row mt-2 mb-4">
                <button
                  onClick={() =>
                    handleOpenModal(
                      "shareAssignUserModel"
                    )
                  }
                  className="custom-icon-button button-success px-3 py-1 rounded me-lg-2  mb-2 mb-lg-0"
                >
                  <IoAdd fontSize={16} className="me-1" /> Assign/share with users
                </button>
                <button
                  onClick={() =>
                    handleOpenModal(
                      "shareAssignRoleModel"
                    )
                  }
                  className="custom-icon-button button-success px-3 py-1 rounded me-lg-2 mb-2 mb-lg-0"
                >
                  <IoAdd fontSize={16} className="ms-1" /> Assign/share with roles
                </button>
              </div>


              <div className="input-group mb-2">
                <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                  Filter
                </p>
                <input
                  type="text"
                  className="form-control"
                  id="subject"
                  value={filterValue}
                  onChange={handleFilterChange}
                  required
                />
              </div>
              <div className="d-flex flex-column">
                <Table hover responsive>
                  <thead className="sticky-header">
                    <tr>
                      <th className="text-start">Action</th>
                      <th className="text-start">Type</th>
                      <th className="text-start">Allow Download</th>
                      <th className="text-start">User/Role Name</th>
                      <th className="text-start">Email</th>
                      <th className="text-start">Start Date</th>
                      <th className="text-start">End Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDataShare.length > 0 ? (
                      paginatedDataShare.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <button
                              onClick={() => {
                                handleUserType(item.type, item.id);
                                handleOpenModal("shareDeleteModel");
                              }}
                              className="custom-icon-button button-danger px-3 py-1 rounded me-2"
                            >
                              <IoTrash fontSize={16} className="me-1" /> Delete
                            </button>
                          </td>
                          <td>{item.type}</td>
                          <td>{item.allow_download === 1 ? 'Yes' : 'No'}</td>
                          <td>{item.name}</td>
                          <td>{item.email}</td>
                          <td>
                            {new Date(item.start_date_time).toLocaleDateString(
                              "en-GB"
                            )}
                          </td>
                          <td> {new Date(item.end_date_time).toLocaleDateString(
                            "en-GB"
                          )}</td>
                        </tr>
                      ))
                    ) : (
                      <div className="text-start w-100 py-3">
                        <Paragraph text="No data available" color="#333" />
                      </div>
                    )}
                  </tbody>
                </Table>
                <div className="d-flex flex-column flex-sm-row paginationFooter py-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <p className="pagintionText mb-0 me-2">Items per page:</p>
                    <Form.Select
                      onChange={handleItemsPerPageChange}
                      value={itemsPerPage}
                      style={{
                        width: "100px",
                        padding: "5px 10px !important",
                        fontSize: "12px",
                      }}
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={30}>30</option>
                    </Form.Select>
                  </div>
                  <div className="d-flex flex-row align-items-center px-lg-5">
                    <div className="pagination-info" style={{ fontSize: "14px" }}>
                      {startIndexShare} – {endIndexShare} of {totalItemsShare}
                    </div>

                    <Pagination className="ms-3">
                      <Pagination.Prev
                        onClick={handlePrev}
                        disabled={currentPage === 1}
                      />
                      <Pagination.Next
                        onClick={handleNext}
                        disabled={currentPage === totalPagesShare}
                      />
                    </Pagination>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
        </Modal>
        {/* share user model */}
        <Modal
          centered
          show={modalStates.shareAssignUserModel}
          onHide={() => {
            handleCloseModal("shareAssignUserModel");
            setUsers([])
            setSelectedUserIds([]);
          }}
        >
          <Modal.Header>
            <div className="d-flex w-100 justify-content-end">
              <div className="col-11 d-flex flex-row">
                <p className="mb-0" style={{ fontSize: "16px", color: "#333" }}>
                  User Permission
                </p>
              </div>
              <div className="col-1">
                <IoClose
                  fontSize={20}
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    handleCloseModal("shareAssignUserModel")
                    setUsers([])
                    setSelectedUserIds([]);
                    setShareDocumentData(null)
                  }}
                />
              </div>
            </div>
          </Modal.Header>
          <Modal.Body className="py-3 ">
            <div
              className="d-flex flex-column custom-scroll mb-3"
            >
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                Users
              </p>
              <div className=" d-flex flex-column position-relative w-100">
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
              <div className="d-flex flex-column">
                <div className="d-flex flex-column">
                  <label className="d-flex flex-row mt-2">
                    <Checkbox
                      checked={shareDocumentData?.is_time_limited === "1"}
                      onChange={(e) =>
                        setShareDocumentData((prev) => ({
                          ...(prev || {
                            type: "",
                            assigned_roles_or_users: "",
                            is_time_limited: '',
                            end_date_time: "",
                            start_date_time: "",
                            is_downloadable: ""
                          }),
                          is_time_limited: e.target.checked ? "1" : "0",
                        }))
                      }
                      className="me-2"
                    >
                      <p
                        className="mb-0 text-start w-100"
                        style={{ fontSize: "14px" }}
                      >
                        Specify the Period
                      </p>
                    </Checkbox>
                  </label>
                </div>
                <div className="d-flex flex-column">
                  {
                    shareDocumentData?.is_time_limited && (
                      <div className="d-flex flex-column flex-md-row">
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
                              // console.log('Selected Time: ', value);
                              // console.log('Formatted Selected Time: ', dateString);
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
                              // console.log('Selected Time: ', value);
                              // console.log('Formatted Selected Time: ', dateString);
                            }}
                            onOk={(value) => onEndDateTimeOk(value, value?.format('YYYY-MM-DD HH:mm:ss') ?? '')}
                          />
                        </div>
                      </div>
                    )
                  }
                </div>
              </div>
              <div className="col-12">
                <label className="d-flex flex-row mt-2">
                  <Checkbox
                    checked={shareDocumentData?.is_downloadable === "1"}
                    onChange={(e) =>
                      setShareDocumentData((prev) => ({
                        ...(prev || {
                          type: "",
                          assigned_roles_or_users: "",
                          is_time_limited: '',
                          end_date_time: "",
                          start_date_time: "",
                          is_downloadable: ""
                        }),
                        is_downloadable: e.target.checked ? "1" : "0",
                      }))
                    }
                    className="me-2"
                  >
                    <p
                      className="mb-0 text-start w-100"
                      style={{ fontSize: "14px" }}
                    >
                      Allow Download
                    </p>
                  </Checkbox>
                </label>
              </div>
            </div>

          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex flex-row">
              <button
                onClick={() => {
                  handleShareUserDocument(selectedDocumentId!, userId!)
                  fetchShareDocumentData(selectedDocumentId!)
                }}
                className="custom-icon-button button-success px-3 py-1 rounded me-2"
              >
                <IoSaveOutline fontSize={16} className="me-1" /> Save
              </button>
              <button
                onClick={() => {
                  handleCloseModal("shareAssignUserModel")
                  setShareDocumentData(null)
                  setUsers([])
                  setSelectedUserIds([]);
                }}
                className="custom-icon-button button-danger px-3 py-1 rounded me-2"
              >
                <IoClose fontSize={16} className="me-1" /> Cancel
              </button>
            </div>
          </Modal.Footer>
        </Modal>
        {/* share role model */}
        <Modal
          centered
          show={modalStates.shareAssignRoleModel}
          onHide={() => {
            handleCloseModal("shareAssignRoleModel");
            setRoles([])
            setSelectedRoleIds([]);
          }}
        >
          <Modal.Header>
            <div className="d-flex w-100 justify-content-end">
              <div className="col-11 d-flex flex-row">
                <p className="mb-0" style={{ fontSize: "16px", color: "#333" }}>
                  Role Permission
                </p>
              </div>
              <div className="col-1">
                <IoClose
                  fontSize={20}
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    handleCloseModal("shareAssignRoleModel")
                    setShareDocumentData(null)
                    setRoles([])
                    setSelectedRoleIds([]);
                  }}
                />
              </div>
            </div>
          </Modal.Header>
          <Modal.Body className="py-3 ">
            <div
              className="d-flex flex-column custom-scroll mb-3"
            >

              <div className="col-12 col-lg-6 d-flex flex-column">
                <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                  Roles
                </p>
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
              <div className="d-flex flex-column">
                <div className="d-flex flex-column">
                  <label className="d-flex flex-row mt-2">
                    <Checkbox
                      checked={shareDocumentData?.is_time_limited === "1"}
                      onChange={(e) =>
                        setShareDocumentData((prev) => ({
                          ...(prev || {
                            type: "",
                            assigned_roles_or_users: "",
                            is_time_limited: '',
                            end_date_time: "",
                            start_date_time: "",
                            is_downloadable: ""
                          }),
                          is_time_limited: e.target.checked ? "1" : "0",
                        }))
                      }
                      className="me-2"
                    >
                      <p
                        className="mb-0 text-start w-100"
                        style={{ fontSize: "14px" }}
                      >
                        Specify the Period
                      </p>
                    </Checkbox>
                  </label>
                </div>
                <div className="d-flex flex-column">
                  {
                    shareDocumentData?.is_time_limited && (
                      <div className="d-flex flex-column flex-md-row">
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
                              // console.log('Selected Time: ', value);
                              // console.log('Formatted Selected Time: ', dateString);
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
                              // console.log('Selected Time: ', value);
                              // console.log('Formatted Selected Time: ', dateString);
                            }}
                            onOk={(value) => onEndDateTimeOk(value, value?.format('YYYY-MM-DD HH:mm:ss') ?? '')}
                          />
                        </div>
                      </div>
                    )
                  }
                </div>
              </div>
              <div className="col-12">
                <label className="d-flex flex-row mt-2">
                  <Checkbox
                    checked={shareDocumentData?.is_downloadable === "1"}
                    onChange={(e) =>
                      setShareDocumentData((prev) => ({
                        ...(prev || {
                          type: "",
                          assigned_roles_or_users: "",
                          is_time_limited: '',
                          end_date_time: "",
                          start_date_time: "",
                          is_downloadable: ""
                        }),
                        is_downloadable: e.target.checked ? "1" : "0",
                      }))
                    }
                    className="me-2"
                  >
                    <p
                      className="mb-0 text-start w-100"
                      style={{ fontSize: "14px" }}
                    >
                      Allow Download
                    </p>
                  </Checkbox>
                </label>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex flex-row">
              <button
                onClick={() => handleShareRoleDocument(selectedDocumentId!, userId!)}
                className="custom-icon-button button-success px-3 py-1 rounded me-2"
              >
                <IoSaveOutline fontSize={16} className="me-1" /> Save
              </button>
              <button
                onClick={() => {
                  handleCloseModal("shareAssignRoleModel")
                  setShareDocumentData(null)
                  setRoles([])
                  setSelectedRoleIds([]);
                }}
                className="custom-icon-button button-danger px-3 py-1 rounded me-2"
              >
                <IoClose fontSize={16} className="me-1" /> Cancel
              </button>
            </div>
          </Modal.Footer>
        </Modal>
        {/* delete share document model */}
        <Modal
          centered
          show={modalStates.shareDeleteModel}
          onHide={() => handleCloseModal("shareDeleteModel")}
        >
          <Modal.Body>
            <div className="d-flex flex-column">
              <div className="d-flex w-100 justify-content-end">
                <div className="col-11 d-flex flex-row">
                  <p
                    className="mb-0 text-danger"
                    style={{ fontSize: "18px", color: "#333" }}
                  >
                    Are you sure you want to delete?
                  </p>
                </div>
                <div className="col-1 d-flex justify-content-end">
                  <IoClose
                    fontSize={20}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleCloseModal("shareDeleteModel")}
                  />
                </div>
              </div>
              <div className="d-flex flex-row">
                <button
                  onClick={() => handleDeleteShareDocument(selectedDocumentId)}
                  className="custom-icon-button button-success px-3 py-1 rounded me-2"
                >
                  <IoCheckmark fontSize={16} className="me-1" /> Yes
                </button>
                <button
                  onClick={() => {
                    handleCloseModal("shareDeleteModel");
                    setSelectedDocumentId(null);
                  }}
                  className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
                >
                  <MdOutlineCancel fontSize={16} className="me-1" /> No
                </button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
        {/* share all doc model */}
        <Modal
          centered
          show={modalStates.allDocShareModel}
          className="large-model"
          onHide={() => {
            handleCloseModal("allDocShareModel");
            setRoles([])
            setSelectedRoleIds([]);
            setSelectedItems([])
            setSelectedItemsNames([])
          }}
        >
          <Modal.Header>
            <div className="d-flex w-100 justify-content-end">
              <div className="col-11 d-flex flex-row">
                <p className="mb-0" style={{ fontSize: "16px", color: "#333" }}>
                  Share Document
                </p>
              </div>
              <div className="col-1 d-flex justify-content-end">
                <IoClose
                  fontSize={20}
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    handleCloseModal("allDocShareModel")
                    setShareDocumentData(null)
                    setRoles([])
                    setSelectedRoleIds([]);
                    setSelectedItems([])
                    setSelectedItemsNames([])
                  }}
                />
              </div>
            </div>
          </Modal.Header>
          <Modal.Body className="py-3 ">
            <div
              className="d-flex flex-column custom-scroll mb-3"
            >

              <div className="d-flex flex-wrap">
                {
                  selectedItemsNames.map((item, index) => (
                    <span key={index} className="px-3 py-2 me-2 mb-2 rounded-pill" style={{ backgroundColor: "#eee" }}>{item}</span>
                  ))
                }
              </div>

              <div className="d-flex flex-column flex-lg-row mb-3">
                <div className="col-12 col-lg-6 d-flex flex-column pe-1">
                  <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                    Users
                  </p>
                  <div className=" d-flex flex-column position-relative w-100">
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
                </div>
                <div className="col-12 col-lg-6 d-flex flex-column ps-1">
                  <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                    Roles
                  </p>
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
                          className="badge bg-primary text-light me-2 mb-2 p-2 d-inline-flex align-items-center"
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
              <div className="d-flex flex-column mb-3">
                <div className="d-flex flex-column mb-2">
                  <label className="d-flex flex-row mt-2">
                    <Checkbox
                      checked={shareDocumentData?.is_time_limited === "1"}
                      onChange={(e) =>
                        setShareDocumentData((prev) => ({
                          ...(prev || {
                            type: "",
                            assigned_roles_or_users: "",
                            is_time_limited: '',
                            end_date_time: "",
                            start_date_time: "",
                            is_downloadable: ""
                          }),
                          is_time_limited: e.target.checked ? "1" : "0",
                        }))
                      }
                      className="me-2"
                    >
                      <p
                        className="mb-0 text-start w-100"
                        style={{ fontSize: "14px" }}
                      >
                        Specify the Period
                      </p>
                    </Checkbox>
                  </label>
                </div>
                <div className="d-flex flex-column">
                  {
                    shareDocumentData?.is_time_limited && (
                      <div className="d-flex flex-column flex-md-row">
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
                            className="p-1"
                            onChange={(value, dateString) => {
                              // console.log('Selected Time: ', value);
                              // console.log('Formatted Selected Time: ', dateString);
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
                            className="p-1"
                            onChange={(value, dateString) => {
                              // console.log('Selected Time: ', value);
                              // console.log('Formatted Selected Time: ', dateString);
                            }}
                            onOk={(value) => onEndDateTimeOk(value, value?.format('YYYY-MM-DD HH:mm:ss') ?? '')}
                          />
                        </div>
                      </div>
                    )
                  }
                </div>
              </div>
              <div className="col-12">
                <label className="d-flex flex-row mt-2">
                  <Checkbox
                    checked={shareDocumentData?.is_downloadable === "1"}
                    onChange={(e) =>
                      setShareDocumentData((prev) => ({
                        ...(prev || {
                          type: "",
                          assigned_roles_or_users: "",
                          is_time_limited: '',
                          end_date_time: "",
                          start_date_time: "",
                          is_downloadable: ""
                        }),
                        is_downloadable: e.target.checked ? "1" : "0",
                      }))
                    }
                    className="me-2"
                  >
                    <p
                      className="mb-0 text-start w-100"
                      style={{ fontSize: "14px" }}
                    >
                      Allow Download
                    </p>
                  </Checkbox>
                </label>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex flex-row">
              <button
                onClick={() => handleShareSelectedDoc()}
                className="custom-icon-button button-success px-3 py-1 rounded me-2"
              >
                <IoSaveOutline fontSize={16} className="me-1" /> Save
              </button>
              <button
                onClick={() => {
                  handleCloseModal("allDocShareModel")
                  setShareDocumentData(null)
                  setRoles([])
                  setSelectedRoleIds([]);
                  setSelectedItems([])
                  setSelectedItemsNames([])
                }}
                className="custom-icon-button button-danger px-3 py-1 rounded me-2"
              >
                <IoClose fontSize={16} className="me-1" /> Cancel
              </button>
            </div>
          </Modal.Footer>
        </Modal>
        {/* reminders model */}
        <Modal
          centered
          className="large-model"
          show={modalStates.myReminderModel}
          onHide={() => {
            handleCloseModal("myReminderModel");
          }}
        >
          <Modal.Header>
            <div className="d-flex w-100 justify-content-end">
              <div className="col-11">
                <p className="mb-0" style={{ fontSize: "16px", color: "#333" }}>
                  Reminders
                </p>
              </div>
              <div className="col-1 d-flex justify-content-end">
                <IoClose
                  fontSize={20}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleCloseModal("myReminderModel")}
                />
              </div>
            </div>
          </Modal.Header>
          <Modal.Body className="py-3">
            <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
              <div>
                <div
                  style={{ maxHeight: "350px", overflowY: "auto" }}
                  className="custom-scroll"
                >
                  <Table hover responsive>
                    <thead className="sticky-header">
                      <tr>
                        <th></th>
                        <th className="text-start">Document</th>
                        <th
                          className="text-start"
                          // onClick={() => handleSort("startDate")}
                          style={{ cursor: "pointer" }}
                        >
                          Start Date{" "}
                          {/* {sortColumn === "startDate" ? (
                        sortAsc ? (
                          <MdArrowDropUp fontSize={20} />
                        ) : (
                          <MdArrowDropDown fontSize={20} />
                        )
                      ) : null} */}
                        </th>
                        <th
                          className="text-start"
                          // onClick={() => handleSort("endDate")}
                          style={{ cursor: "pointer" }}
                        >
                          End Date{" "}
                          {/* {sortColumn === "endDate" ? (
                        sortAsc ? (
                          <MdArrowDropUp fontSize={20} />
                        ) : (
                          <MdArrowDropDown fontSize={20} />
                        )
                      ) : null} */}
                        </th>
                        <th className="text-start">Subject</th>
                        <th className="text-start">Message</th>
                        <th className="text-start">Frequency</th>

                      </tr>
                    </thead>
                    <tbody>
                      {paginatedDataReminder.length > 0 ? (
                        paginatedDataReminder.map((item) => (
                          <tr key={item.id}>
                            <td className="d-flex flex-row">
                              {hasPermission(permissions, "Reminder", "Edit Reminder") && (
                                <button
                                  onClick={() => {
                                    handleOpenModal("reminderViewModel", item.id)
                                    setSelectedReminderId(item.id)
                                  }}
                                  className="custom-icon-button button-success px-1 py-1 d-flex justify-content-center align-items-center rounded me-2"
                                >
                                  <IoEye fontSize={16} />
                                </button>
                              )}
                              {hasPermission(permissions, "Reminder", "Delete Reminder") && (
                                <button
                                  onClick={() => {
                                    handleOpenModal("reminderDeleteModel", item.id)
                                  }}
                                  className="custom-icon-button button-danger px-1 py-1 d-flex justify-content-center align-items-center rounded me-2"
                                >
                                  <AiFillDelete fontSize={16} />
                                </button>
                              )}

                            </td>
                            <td>{item.document?.name}</td>
                            <td>{item.start_date_time}</td>
                            <td>{item.end_date_time}</td>
                            <td>{item.subject}</td>
                            <td>{item.message}</td>
                            <td>{item.frequency}</td>

                          </tr>
                        ))
                      ) : (
                        <div className="text-start w-100 py-3">
                          <Paragraph text="No data available" color="#333" />
                        </div>
                      )}
                    </tbody>
                  </Table>
                </div>

                <div className="d-flex flex-column flex-lg-row paginationFooter">
                  <div className="d-flex justify-content-between align-items-center">
                    <p className="pagintionText mb-0 me-2">Items per page:</p>
                    <Form.Select
                      onChange={handleItemsPerPageChange}
                      value={itemsPerPage}
                      style={{
                        width: "100px",
                        padding: "5px 10px !important",
                        fontSize: "12px",
                      }}
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={30}>30</option>
                    </Form.Select>
                  </div>
                  <div className="d-flex flex-row align-items-center px-lg-5">
                    <div className="pagination-info" style={{ fontSize: "14px" }}>
                      {startIndexReminder} – {endIndexReminder} of {totalItemsReminder}
                    </div>

                    <Pagination className="ms-3">
                      <Pagination.Prev
                        onClick={handlePrev}
                        disabled={currentPage === 1}
                      />
                      <Pagination.Next
                        onClick={handleNext}
                        disabled={currentPage === totalPagesReminder}
                      />
                    </Pagination>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
        </Modal>
        <Modal
          centered
          show={modalStates.reminderDeleteModel}
          onHide={() => handleCloseModal("reminderDeleteModel")}
        >
          <Modal.Body>
            <div className="d-flex flex-column">
              <div className="d-flex w-100 justify-content-end">
                <div className="col-11 d-flex flex-row py-3">
                  <p
                    className="mb-0 text-danger"
                    style={{ fontSize: "18px", color: "#333" }}
                  >
                    Are you sure you want to delete?
                  </p>
                </div>
                <div className="col-1 d-flex justify-content-end">
                  <IoClose
                    fontSize={20}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleCloseModal("reminderDeleteModel")}
                  />
                </div>
              </div>
              <div className="d-flex flex-row">
                <button
                  onClick={() => handleDeleteReminder(selectedDocumentId)}
                  className="custom-icon-button button-success px-3 py-1 rounded me-2"
                >
                  <IoCheckmark fontSize={16} className="me-1" /> Yes
                </button>
                <button
                  onClick={() => {
                    handleCloseModal("reminderDeleteModel");
                    setSelectedDocumentId(null);
                  }}
                  className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
                >
                  <MdOutlineCancel fontSize={16} className="me-1" /> No
                </button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
        {/* view reminder model */}
        <Modal
          centered
          show={modalStates.reminderViewModel}
          className="large-model"
          onHide={() => {
            handleCloseModal("reminderViewModel");
            setSelectedDocumentId(null);
            setSelectedDocumentName(null);
          }}
        >
          <Modal.Header>
            <div className="d-flex w-100 justify-content-end">
              <div className="col-11 d-flex flex-row">
                <p className="mb-0" style={{ fontSize: "16px", color: "#333" }}>
                  Reminder Detail
                </p>
              </div>
              <div className="col-1 d-flex justify-content-end">
                <IoClose
                  fontSize={20}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleCloseModal("reminderViewModel")}
                />
              </div>
            </div>
          </Modal.Header>
          <Modal.Body className="py-3 ">
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
                  value={viewReminder?.subject || ""}
                  disabled
                />
              </div>
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                Message
              </p>
              <div className="input-group mb-2">
                <textarea
                  className="form-control"
                  id="message"
                  value={viewReminder?.message || ""}
                  disabled
                />
              </div>
            </div>
            <div className="d-flex flex-column">
              <div className="d-flex flex-column-reverse flex-lg-row">
                <div className="col-12 col-lg-5">
                  <label className="d-flex flex-row mt-2">
                    <Checkbox
                      checked={viewReminder?.is_repeat === "1"}
                      disabled
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
                <div className="col-12 col-lg-7 d-flex flex-column flex-lg-row align-items-lg-center mb-3">
                  <label className="col-lg-3 d-flex flex-row me-2 align-items-center">
                    <Checkbox
                      checked={viewReminder?.send_email === "1"}
                      disabled
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
                </div>
              </div>
              <div className="d-flex flex-column flex-lg-row">
                {viewReminder?.is_repeat === "1" ? (
                  <div className="d-flex flex-column w-100">
                    <div className="d-flex flex-column pe-lg-1 mb-3">
                      <div className="d-flex col-12 col-lg-6">
                        <input
                          type="text"
                          className="form-control"
                          id="subject"
                          value={viewReminder?.frequency || ""}
                          disabled
                        />
                      </div>
                      {viewReminder?.frequency === "Daily" && (
                        <div className=" my-3">
                          {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                            <label key={day}>
                              <Checkbox
                                value={day}
                                checked={frequencyData.includes(day)}
                                disabled
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
                      {viewReminder?.frequency === "Weekly" && (
                        <div className="d-flex flex-column flex-lg-row my-3">
                          {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                            <div key={day}>
                              <Radio.Group
                                disabled
                                value={frequencyData.includes(day) ? day : undefined}
                                className="d-flex flex-column flex-lg-row"
                              >
                                <label style={{ display: "block", marginBottom: "5px" }}>
                                  <Radio value={day} checked={frequencyData.includes(day)}>
                                    {day}
                                  </Radio>
                                </label>
                              </Radio.Group>
                            </div>
                          ))}
                        </div>
                      )}
                      {viewReminder?.frequency === "Half Yearly" && (
                        <div className="my-4">
                          <div className="d-flex flex-column">
                            {frequencyData.map((item, index) => (
                              <div key={index}>
                                {typeof item === 'string' ? (
                                  <p>{item}</p>
                                ) : (
                                  <div className="d-flex flex-column flex-lg-row">
                                    <div className="col-12 col-lg-2 p-1">
                                      <p>{item.period}</p>
                                    </div>
                                    <div className="col-12 col-lg-5 p-1"><input
                                      type="text"
                                      className="form-control"
                                      id="subject"
                                      value={item.month}
                                      disabled
                                    /> </div>
                                    <div className="col-12 col-lg-5 p-1"><input
                                      type="text"
                                      className="form-control"
                                      id="subject"
                                      value={item.date}
                                      disabled
                                    /></div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {viewReminder?.frequency === "Quarterly" && (
                        <div className="my-4">
                          <div className="d-flex flex-column">
                            {frequencyData.map((item, index) => (
                              <div key={index}>
                                {typeof item === 'string' ? (
                                  <p>{item}</p>
                                ) : (
                                  <div className="d-flex flex-column flex-lg-row">
                                    <div className="col-12 col-lg-2 p-1">
                                      <p>{item.period}</p>
                                    </div>
                                    <div className="col-12 col-lg-5 p-1"><input
                                      type="text"
                                      className="form-control"
                                      id="subject"
                                      value={item.month}
                                      disabled
                                    /> </div>
                                    <div className="col-12 col-lg-5 p-1"><input
                                      type="text"
                                      className="form-control"
                                      id="subject"
                                      value={item.date}
                                      disabled
                                    /></div>
                                  </div>
                                )}
                              </div>
                            ))}
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
                          defaultValue={dayjs(viewReminder?.start_date_time, "YYYY-MM-DD HH:mm:ss")}
                          disabled
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
                          defaultValue={dayjs(viewReminder?.end_date_time, "YYYY-MM-DD HH:mm:ss")}
                          disabled
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
                        defaultValue={dayjs(viewReminder?.date_time, "YYYY-MM-DD HH:mm:ss")}
                        disabled
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Modal.Body>
        </Modal>
        {/* view Modal */}
        <Modal
          centered
          show={modalStates.viewModel}
          // className="large-model"
          fullscreen
          onHide={() => {
            handleCloseModal("viewModel");
            setSelectedDocumentId(null);
          }}
        >
          <Modal.Header>
            <div className="d-flex w-100 justify-content-end">
              <div className="col-11 d-flex flex-row">
                <p className="mb-0" style={{ fontSize: "16px", color: "#333" }}>
                  View Document : {viewDocument?.name || ""}
                </p>
              </div>
              <div className="col-1 d-flex  justify-content-end">
                <IoClose
                  fontSize={20}
                  style={{ cursor: "pointer" }}
                  onClick={() => { handleCloseModal("viewModel"); setMetaTags([]) }}
                />
              </div>
            </div>
          </Modal.Header>
          <Modal.Body className="p-2 p-lg-4">
            <div className="d-flex preview-container">
              {viewDocument && (

                <>
                  {["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg", "tiff", "ico", "avif"].includes(viewDocument.type) ? (
                    <Image
                      src={viewDocument.url}
                      alt={viewDocument.name}
                      width={600}
                      height={600}
                    />
                  ) : viewDocument.type === "pdf" || viewDocument.enable_external_file_view === 1 ? (
                    <div className="iframe-container" data-watermark={`Confidential\nDo Not Copy\n${userName}\n${currentDateTime}`}>
                      <iframe
                        src={
                          viewDocument.type === "pdf"
                            ? viewDocument.url
                            : `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(viewDocument.url)}`
                        }
                        title="Document Preview"
                        style={{ width: "100%", height: "500px", border: "none" }}
                      ></iframe>
                    </div>
                  ) : (
                    <p>No preview available for this document type.</p>
                  )}
                </>
              )}
            </div>


            <p className="mb-1" style={{ fontSize: "14px" }}>
              Document Name : <span style={{ fontWeight: 600 }} >{viewDocument?.name || ""}</span>
            </p>
            <p className="mb-1" style={{ fontSize: "14px" }}>
              Category : <span style={{ fontWeight: 600 }} >{viewDocument?.category.category_name}</span>
            </p>
            <p className="mb-1 " style={{ fontSize: "14px" }}>
              Description : <span style={{ fontWeight: 600 }} >{viewDocument?.description || ""}</span>
            </p>
            <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
              Meta tags:{" "}
              {metaTags.map((tag, index) => (
                <span
                  key={index}
                  style={{
                    fontWeight: 600,
                    backgroundColor: "#683ab7",
                    color: "white",
                  }}
                  className="me-2 px-3 rounded py-1 mb-2"
                >
                  {tag}
                </span>
              ))}
            </p>
            <div className="d-flex flex-column">
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                Attributes:
                {attributes.map((attr, index) => (
                  <div key={index} style={{
                    fontWeight: 600,
                    textTransform: 'capitalize'
                  }}
                    className="me-2 px-3 rounded py-1">
                    <span style={{ fontWeight: 600 }}>{attr.attribute}:</span> {attr.value}
                  </div>
                ))}
              </p>
            </div>

            <div className="d-flex flex-wrap gap-3 py-3">
              {hasPermission(permissions, "All Documents", "Edit Document") && (
                <button
                  onClick={() =>
                    handleOpenModal("editModel", viewDocument?.id, viewDocument?.name)
                  }
                  className="addButton me-2 bg-white text-dark border border-success rounded px-3 py-1"
                >
                  <MdModeEditOutline className="me-2" />
                  Edit
                </button>
              )}
              {hasPermission(permissions, "All Documents", "Share Document") && (
                <button onClick={() =>
                  handleOpenModal(
                    "shareDocumentModel",
                    viewDocument?.id, viewDocument?.name
                  )
                } className="addButton me-2 bg-white text-dark border border-success rounded px-3 py-1">
                  <IoShareSocial className="me-2" />
                  Share
                </button>
              )}
              {hasPermission(permissions, "All Documents", "Manage Sharable Link") && (
                <button onClick={() =>
                  handleGetShareableLinkModel(viewDocument?.id || 0)
                }
                  className="addButton me-2 bg-white text-dark border border-success rounded px-3 py-1">
                  <IoShareSocial className="me-2" />
                  Get Shareable Link
                </button>
              )}
              {hasPermission(permissions, "All Documents", "Download Document") && viewDocument?.id && (
                <button
                  onClick={() => handleDownload(viewDocument?.id || 0, userId)}
                  className="addButton me-2 bg-white text-dark border border-success rounded px-3 py-1">
                  <MdFileDownload className="me-2" />
                  Download
                </button>
              )}

              <button
                onClick={() =>
                  handleOpenModal(
                    "uploadNewVersionFileModel",
                    viewDocument?.id, viewDocument?.name
                  )
                }
                className="addButton me-2 bg-white text-dark border border-success rounded px-3 py-1"
              >
                <MdUpload className="me-2" />
                Upload New Version file
              </button>
              <button
                onClick={() =>
                  handleOpenModal(
                    "versionHistoryModel",
                    viewDocument?.id, viewDocument?.name
                  )
                }
                className="addButton me-2 bg-white text-dark border border-success rounded px-3 py-1"
              >
                <GoHistory className="me-2" />
                Version History
              </button>
              <button
                onClick={() =>
                  handleOpenModal(
                    "commentModel",
                    viewDocument?.id, viewDocument?.name
                  )
                }
                className="addButton me-2 bg-white text-dark border border-success rounded px-3 py-1"
              >
                <BiSolidCommentDetail className="me-2" />
                Comment
              </button>

              {hasPermission(permissions, "All Documents", "Add Reminder") && (
                <button
                  onClick={() =>
                    handleOpenModal(
                      "addReminderModel",
                      viewDocument?.id, viewDocument?.name
                    )
                  }
                  className="addButton me-2 bg-white text-dark border border-success rounded px-3 py-1"
                >
                  <BsBellFill className="me-2" />
                  Add Reminder
                </button>
              )}
              {hasPermission(permissions, "All Documents", "Send Email") && (
                <button
                  onClick={() =>
                    handleOpenModal(
                      "sendEmailModel",
                      viewDocument?.id, viewDocument?.name
                    )
                  }
                  className="addButton me-2 bg-white text-dark border border-success rounded px-3 py-1"
                >
                  <MdEmail className="me-2" />
                  Send Email
                </button>
              )}
              <button
                onClick={() =>
                  handleOpenModal(
                    "removeIndexingModel",
                    viewDocument?.id, viewDocument?.name
                  )
                }
                className="addButton me-2 bg-white text-dark border border-success rounded px-3 py-1"
              >
                <AiOutlineZoomOut className="me-2" />
                Remove From Search
              </button>

              {hasPermission(permissions, "All Documents", "Archive Document") && (
                <button
                  onClick={() =>
                    handleOpenModal(
                      "docArchivedModel",
                      viewDocument?.id, viewDocument?.name
                    )
                  }
                  className="addButton me-2 bg-white text-dark border border-success rounded px-3 py-1"
                >
                  <FaArchive className="me-2" />
                  Archive
                </button>
              )}
              {hasPermission(permissions, "All Documents", "Delete Document") && (
                <button
                  onClick={() =>
                    handleOpenModal(
                      "deleteFileModel",
                      viewDocument?.id, viewDocument?.name
                    )
                  }
                  className="addButton me-2 bg-white text-dark border border-success rounded px-3 py-1"
                >
                  <AiFillDelete className="me-2" />
                  Delete
                </button>
              )}

            </div>

          </Modal.Body>

          <Modal.Footer>
            <div className="d-flex flex-row justify-content-start">
              {/* <button
                onClick={() => handleSaveEditData(selectedDocumentId!)}
                className="custom-icon-button button-success px-3 py-1 rounded me-2"
              >
                <IoSaveOutline fontSize={16} className="me-1" /> Yes
              </button> */}
              <button
                onClick={() => {
                  handleCloseModal("viewModel");
                  setSelectedDocumentId(null);
                  setMetaTags([])
                }}
                className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
              >
                <MdOutlineCancel fontSize={16} className="me-1" /> Cancel
              </button>
            </div>
          </Modal.Footer>
        </Modal>
        {/* toast message */}
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
