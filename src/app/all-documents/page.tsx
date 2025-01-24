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
import { FaPlus } from "react-icons/fa6";
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
import { handleDownload, handleView } from "@/utils/documentFunctions";
import {
  fetchAndMapUserData,
  fetchCategoryData,
  fetchDocumentsData,
  fetchRoleData,
  fetchVersionHistory,
} from "@/utils/dataFetchFunctions";
import { useUserContext } from "@/context/userContext";
import ToastMessage from "@/components/common/Toast";
import { IoMdSend, IoMdTrash } from "react-icons/io";
import {
  CommentItem,
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
import { hasPermission } from "@/utils/permission";
import { usePermissions } from "@/context/userPermissions";
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
  const { userId } = useUserContext();
  const permissions = usePermissions();
  const isAuthenticated = useAuth();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedItemsNames, setSelectedItemsNames] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
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
  const [viewMetaTags, setViewMetaTags] = useState<string[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
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
  const [content, setContent] = useState<string>("");
  const [shareDocumentData, setShareDocumentData] = useState<{
    type: string;
    assigned_roles_or_users: string;
    is_time_limited: string;
    start_date_time: string;
    end_date_time: string;
    is_downloadable: string;
  } | null>(null);
  const [errorsShareDoc, setErrorsShareDoc] = useState({
    start_date_time: "",
    end_date_time: "",
  });
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
    viewModel: false,
  });
  const [generatedLink, setGeneratedLink] = useState<string>("");
  const [selectedDocumentData, setSelectedDocumentData] = useState<{
    name: string;
    category: string;
    description: string;
  } | null>(null);
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
  const [viewDocument, setViewDocument] = useState<ViewDocumentItem | null>(
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

  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [term, setTerm] = useState('');
  const [filterData, setFilterData] = useState({
    term: "",
    meta_tags: "",
    category: "",
    storage: "",
    created_date: "",
  });





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

  useEffect(() => {
    if (editDocument?.meta_tags) {
      const parsedTags = JSON.parse(editDocument.meta_tags);
      setMetaTags(parsedTags);
    }
  }, [editDocument]);

  useEffect(() => {
    fetchCategoryData(setCategoryDropDownData);
    fetchDocumentsData(setDummyData);
    fetchAndMapUserData(setUserDropDownData);
    fetchRoleData(setRoleDropDownData);
  }, []);

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
    if (modalStates.viewModel && selectedDocumentId !== null) {
      handleGetViewData(selectedDocumentId);
      console.log("View Document : ", viewDocument)
    }
  }, [modalStates.viewModel, selectedDocumentId]);


  // const handleCategoryEditSelect = (categoryId: string) => {
  //   setSelectedCategoryIdEdit(categoryId);
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = paginatedData.map((item) => item.id);
      const allNames = paginatedData.map((item) => item.name);
      setSelectedItems(allIds);
      setSelectedItemsNames(allNames);
    } else {
      setSelectedItems([]);
      setSelectedItemsNames([]);
    }
  };

  const handleCheckboxChange = (id: number, name: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );

    setSelectedItemsNames((prev) => {
      const updatedNames = prev.filter((item, index) => {
        return paginatedData[index].id !== id;
      });

      if (updatedNames.length === prev.length) {
        return [...updatedNames, name];
      }

      return updatedNames;
    });
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
  const totalItems = Array.isArray(dummyData) ? dummyData.length : 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);
  const paginatedData = Array.isArray(dummyData) ? dummyData.slice(startIndex, endIndex) : [];


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
  //   } else if (filterData.created_date) {
  //     formData.append("created_date", filterData.created_date || "");
  //   } else {
  //     fetchDocumentsData(setDummyData);
  //     return;
  //   }

  //   formData.forEach((value, key) => {
  //     console.log(`${key}: ${value}`);
  // });

  //   setIsLoadingTable(true)
  //   try {
  //     const response = await postWithAuth("filter-all-documents", formData);
  //     setDummyData(response);
  //     setIsLoadingTable(false)
  //   } catch (error) {
  //   }
  // };


  const handleSearch = async () => {
    const formData = new FormData();

    if (filterData.term) {
      formData.append("term", filterData.term);
    }
    if (filterData.meta_tags) {
      formData.append("meta_tags", filterData.meta_tags);
    }
    if (filterData.category) {
      formData.append("category", filterData.category);
    }
    if (filterData.storage) {
      formData.append("storage", filterData.storage);
    }
    if (filterData.created_date) {
      formData.append("created_date", filterData.created_date || "");
    }

    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    if (formData.entries().next().done) {
      fetchDocumentsData(setDummyData);
      return;
    }

    setIsLoadingTable(true);
    try {
      const response = await postWithAuth("filter-all-documents", formData);
      setDummyData(response);
      setIsLoadingTable(false);
    } catch (error) {
      console.error("Error:", error);
      setIsLoadingTable(false);
    }
  };


  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [filterData]);

  const handleChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
    setFilterValue(e.target.value);
  };


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
  const paginatedDataShare = filteredData.slice(startIndexShare, endIndexShare);



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
        setToastMessage("Error occurred while removing index!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      } else {
        handleCloseModal("removeIndexingModel");
        setToastType("success");
        setToastMessage("Index removed successfully!");
        setShowToast(true);
        fetchDocumentsData(setDummyData);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      setToastType("error");
      setToastMessage("Error occurred while removing index!");
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
        setToastMessage("Error occurred while archiving!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
      fetchDocumentsData(setDummyData);
    } catch (error) {
      setToastType("error");
      setToastMessage("Error occurred while archiving!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
      console.error("Error archiving document:", error);
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
        setToastMessage("Commented successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      } else {
        setToastType("error");
        setToastMessage("Error occurred while commenting!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      setToastType("error");
      setToastMessage("Error occurred while commenting!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
      console.error("Error commenting document:", error);
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
        setToastMessage("Document save successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      } else {
        setToastType("error");
        setToastMessage("Document save failed!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      setToastType("error");
      setToastMessage("Error occurred while new version updating!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
      console.error("Error new version updating:", error);
    }
  };

  const handleDeleteComment = async (id: string) => {
    try {
      const response = await deleteWithAuth(`delete-comment/${id}/${userId}`);
      if (response.status === "success") {
        setToastType("success");
        fetchComments(selectedDocumentId!);
        setToastMessage("comment deleted successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      } else {
        setToastType("error");
        setToastMessage("Error occurred while deleting comment!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      console.error("Error deleting shareable link:", error);
      setToastType("error");
      setToastMessage("Error occurred while delete!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
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

      const response = await postWithAuth(`get-shareble-link/${id}`, formData);
      if (response.status === "success") {
        handleCloseModal("shareableLinkModel");
        setGeneratedLink(response.link);
        handleOpenModal("generatedShareableLinkModel");
        setShareableLinkData(initialLinkData);
      } else {
        setToastType("error");
        setToastMessage("Error occurred while getting shareable link!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        setShareableLinkData(initialLinkData);
      }
    } catch (error) {
      console.error("Error getting shareable link:", error);
      setToastType("error");
      setToastMessage("Error occurred while getting shareable link!");
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
          console.error("Error copying to clipboard:", error);
          setToastType("error");
          setToastMessage("Error occurred while copying to clipboard!");
          setShowToast(true);
          setTimeout(() => {
            setShowToast(false);
          }, 5000);
        });
    } catch (error) {
      console.error("Error getting shareable link:", error);
      setToastType("error");
      setToastMessage("Error occurred while copying to clipboard!");
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
        setToastMessage("Link deleted successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      } else {
        setToastType("error");
        setToastMessage("Error occurred while deleting shareble link!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      console.error("Error deleting shareable link:", error);
      setToastType("error");
      setToastMessage("Error occurred while delete!");
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
      const response = await postWithAuth(
        `get-shareble-link/${id}`,
        formData
      );
      if (response.status === "fail") {
        setToastType("error");
        setToastMessage("Error occurred while get shareble link!");
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
      setToastMessage("Error occurred while get shareble link!");
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
        setToastMessage("Document delete successfull!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        fetchDocumentsData(setDummyData);
      } else {
        setToastType("error");
        setToastMessage("Error occurred while delete document!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      setToastType("error");
      setToastMessage("Error occurred while delete document!");
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

      const response = await postWithAuth(
        `document-send-email/${id}`,
        formData
      );
      setNewVersionDocument(null);
      if (response.status === "fail") {
        setToastType("error");
        setToastMessage("Error occurred while email sending!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      } else {

        handleCloseModal("sendEmailModel");
        setToastType("success");
        setToastMessage("Email sent!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      setToastType("error");
      setToastMessage("Error occurred while email sending!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
      console.error("Error new version updating:", error);
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
      console.error("Error :", error);
    }
  };


  // const handleGetViewData = async (id: number) => {
  //   try {
  //     const response = await getWithAuth(`view-document/${id}/${userId}`);
  //     console.log("response view: ", response)
  //     setViewDocument(response.data);
  //   } catch (error) {
  //     console.error("Error :", error);
  //   }
  // };

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

  const handleSaveEditData = async (id: number) => {

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

      if (response.status === "success") {
        setToastType("success");
        setToastMessage("Document updated successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        handleCloseModal("editModel");
        fetchDocumentsData(setDummyData);
        setMetaTags([])
      } else {
        setToastType("error");
        setToastMessage("Error updating document.");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        setMetaTags([])
      }
    } catch (error) {
      console.error("Error updating document:", error);
      setToastType("error");
      setToastMessage("Error updating document.");
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

      formData.append("users", JSON.stringify(addReminder?.users) || "");

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
        setToastType("success");
        setToastMessage("Reminder added!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      } else {
        setToastType("error");
        setToastMessage("Error occurred while reminder adding!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      setToastType("error");
      setToastMessage("Error occurred while reminder adding!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
      console.error("Error new version updating:", error);
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
        setToastMessage("Successfull!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        fetchShareDocumentData(id);
        handleCloseModal("shareAssignUserModel");
      } else if (response.status === "fail") {
        setToastType("error");
        setToastMessage("fail!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        fetchShareDocumentData(id);

      }
    } catch (error) {
      setToastType("error");
      setToastMessage("Error occurred!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
      console.error("Error new version updating:", error);
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
        setToastMessage("Successfull!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        fetchShareDocumentData(id);
        handleCloseModal("shareAssignRoleModel");
      } else if (response.status === "fail") {
        setToastType("error");
        setToastMessage("fail!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        fetchShareDocumentData(id);

      } else {
        setToastType("error");
        setToastMessage("Error occurred!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      setToastType("error");
      setToastMessage("Error occurred!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
      console.error("Error new version updating:", error);
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
        setToastMessage("Shares Document successfull!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        fetchShareDocumentData(id);
      } else {
        setToastType("error");
        setToastMessage("Error occurred while delete shared document!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        handleCloseModal("shareDeleteModel");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      setToastType("error");
      setToastMessage("Error occurred while delete shared document!");
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
      formData.append("documents", JSON.stringify(selectedItems));
      formData.append("selected_document_ids", JSON.stringify(selectedItemsNames) || '');
      formData.append("assigned_users", JSON.stringify(selectedUserIds) || '');
      formData.append("assigned_roles", JSON.stringify(selectedRoleIds) || '');
      formData.append("is_time_limited", shareDocumentData?.is_time_limited || "");
      formData.append("start_date_time", selectedStartDateTime || "");
      formData.append("end_date_time", selectedEndDateTime || "");
      formData.append("user", userId || "");


      const response = await postWithAuth(
        `document-bulk-share`,
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
        setToastMessage("Successfull!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        handleCloseModal("shareAssignRoleModel");
        setAllShareData([])
      } else if (response.status === "fail") {
        setToastType("error");
        setToastMessage("fail!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        setAllShareData([])
      } else {
        setToastType("error");
        setToastMessage("Error occurred!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      setToastType("error");
      setToastMessage("Error occurred!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
      console.error("Error new version updating:", error);
    }
  };

  useEffect(() => {
    const disableRightClick = (e: { preventDefault: () => void; }) => {
      e.preventDefault();
    };

    document.addEventListener("contextmenu", disableRightClick);

    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
    };
  }, []);

  // console.log("viewDocument : ",viewDocument)

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }


  return (
    <>
      <DashboardLayout>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <div className="d-flex flex-row align-items-center">
            <Heading text="All Documents" color="#444" />
            {/* <InfoModal
              title="Sample Blog"
              content={`<h1><strong>Hello world,</strong></h1><p>The Company Profile feature allows users to customize the branding of the application by entering the company name and uploading logos. This customization will reflect on the login screen, enhancing the professional appearance and brand identity of the application.</p><br><h3><strong>Hello world,</strong></h3><p>The Company Profile feature allows users to customize the branding of the application by entering the company name and uploading logos. This customization will reflect on the login screen, enhancing the professional appearance and brand identity of the application.</p><br><h3><strong>Hello world,</strong></h3><p>The Company Profile feature allows users to customize the branding of the application by entering the company name and uploading logos. This customization will reflect on the login screen, enhancing the professional appearance and brand identity of the application.</p><br><h3><strong>Hello world,</strong></h3><p>The Company Profile feature allows users to customize the branding of the application by entering the company name and uploading logos. This customization will reflect on the login screen, enhancing the professional appearance and brand identity of the application.</p>`}
            /> */}
          </div>
          <div className="d-flex flex-row">
            {hasPermission(permissions, "All Documents", "Create Document") && (
              <Link
                href="/all-documents/add"
                className="addButton me-2 bg-white text-dark border border-success rounded px-3 py-1"
              >
                <FaPlus className="me-1" /> Add Document
              </Link>
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
                  placeholder="Search by name or description"
                  onChange={(e) => handleTermSearch(e.target.value)}
                ></input>
              </div>
              <div className="input-group mb-3 pe-lg-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by meta tags"
                  onChange={(e) => handleMetaSearch(e.target.value)}
                ></input>
              </div>
            </div>
            <div className="col-12 col-lg-6 d-flex flex-column flex-lg-row">
              <div className="col-12 col-lg-4">
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
                          marginLeft: category.parent_category === "none" ? "0px" : "20px",
                        }}
                      >
                        {category.category_name}
                      </Dropdown.Item>
                    ))}
                  </DropdownButton>

                </div>
              </div>
              <div className="col-12 col-lg-4 px-lg-2">
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
              <div className="col-12 col-lg-4">
                <div className="input-group mb-3 mb-lg-0">
                  {/* <DatePicker onChange={() => handleDateChange} /> */}
                  <DatePicker placeholder="Created Date" onChange={handleDateChange} />
                </div>
              </div>
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
                    <th className="position-relative">
                      {selectedItems.length > 0 ? (
                        <Button shape="circle" icon={<FaShareAlt />} onClick={() => handleOpenModal("allDocShareModel")} style={{ position: "absolute", top: "5px", left: "5px", backgroundColor: "#6777ef", color: "#fff" }} />
                      ) : (
                        <Checkbox
                          checked={
                            selectedItems.length === paginatedData.length && paginatedData.length > 0
                          }
                          indeterminate={
                            selectedItems.length > 0 && selectedItems.length < paginatedData.length
                          }
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          style={{
                            display: "flex",
                            alignSelf: "center",
                            justifySelf: "center",
                          }}
                        />
                      )}

                    </th>
                    <th>Action</th>
                    <th className="text-start">Name</th>
                    <th className="text-start">Document Category</th>
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
                    <th className="text-start">Created By</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <Checkbox
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleCheckboxChange(item.id, item.name)}
                            style={{
                              display: "flex",
                              alignSelf: "center",
                              justifySelf: "center",
                            }}
                          />

                        </td>
                        <td>
                          <DropdownButton
                            id="dropdown-basic-button"
                            drop="end"
                            title={<FaEllipsisV />}
                            className="no-caret position-static"
                            style={{ zIndex: "99999" }}
                          >
                            {/* {hasPermission(permissions, "All Documents", "View Documents") && (
                              <Dropdown.Item
                                href="#"
                                className="py-2"
                                onClick={() => handleView(item.id, userId)}
                              >
                                <IoEye className="me-2" />
                                View
                              </Dropdown.Item>
                            )} */}
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
                            {hasPermission(permissions, "All Documents", "Edit Document") && (
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
                            {hasPermission(permissions, "All Documents", "Share Document") && (
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
                            {hasPermission(permissions, "All Documents", "Manage Sharable Link") && (
                              <Dropdown.Item
                                onClick={() =>
                                  handleOpenModal(
                                    "shareableLinkModel",
                                    item.id,
                                    item.name
                                  )
                                }
                                className="py-2"
                              >
                                <MdOutlineInsertLink className="me-2" />
                                Get Shareable Link
                              </Dropdown.Item>
                            )}
                            {hasPermission(permissions, "All Documents", "Download Document") && (
                              <Dropdown.Item
                                href="#"
                                className="py-2"
                                onClick={() => handleDownload(item.id, userId)}
                              >
                                <MdFileDownload className="me-2" />
                                Download
                              </Dropdown.Item>
                            )}
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

                            {hasPermission(permissions, "All Documents", "Add Reminder") && (
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
                            )}
                            {hasPermission(permissions, "All Documents", "Send Email") && (
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
                              Remove Indexing
                            </Dropdown.Item>

                            {hasPermission(permissions, "All Documents", "Archive Document") && (
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
                            )}
                            {hasPermission(permissions, "All Documents", "Delete Document") && (
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

                        <td>
                          {item.name}
                        </td>
                        <td>{item.category?.category_name || ""}</td>
                        <td>{item.storage}</td>
                        <td>
                          {new Date(item.created_date).toLocaleDateString(
                            "en-GB"
                          )}
                        </td>
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
                  Edit Document
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
                className="form-control"
                value={editDocument?.name || ""}
                onChange={(e) =>
                  setEditDocument((prev) =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
              />
            </div>
            <p className="mb-1" style={{ fontSize: "14px" }}>
              Category
            </p>
            {/* <DropdownButton
              id="dropdown-category-button"
              title={selectedCategory?.category_name || "Select Category"}
              className="custom-dropdown-text-start text-start w-100"
              onSelect={(value) => handleCategoryEditSelect(value || '')}
            >
              {categoryDropDownData.map((category) => (
                <Dropdown.Item
                  key={category.id}
                  eventKey={category.id}
                >
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
                {shareableLinkData.has_expire_date && (
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

                {shareableLinkData.has_password && (
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
                  className="btn btn-outline-secondary bg-success border-success text-white"
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
                  className="btn btn-outline-secondary bg-success border-success text-white"
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
                  {shareableLinkDataSetting.has_expire_date && (
                    <div className="d-flex flex-column gap-2 mb-3">
                      <DatePicker
                        showTime
                        className={`w-100`}
                        defaultValue={dayjs(shareableLinkDataSetting.expire_date_time, "YYYY-MM-DD HH:mm:ss")}
                        onChange={(value, dateString) => {
                          handleShareSettingInputChange("expire_date_time", `${dateString}`)
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

                  {shareableLinkDataSetting.has_password && (
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
                  Are you sure you want to delete?
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
                <li>Permisssions</li>
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
                  Are you sure want to remove document page indexing ? DMS Test
                  Document invoice .docx
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
                  : VERSION_HISOTRY
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
                <div className="col-12 col-lg-5">
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
                        Repeate Reminder
                      </p>
                    </Checkbox>
                  </label>
                </div>
                <div className="col-12 col-lg-7 d-flex flex-column flex-lg-row align-items-lg-center mb-3">
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
                  className="custom-icon-button button-success px-3 py-1 rounded me-lg-2 mb-2 mb-lg-0"
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
                  onChange={() => handleFilterChange}
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
                        Spacify the Period
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
                        Spacify the Period
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
                              setSelectedEndDateTime(dateString.toString())
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
                        Spacify the Period
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
                              setSelectedStartDateTime(dateString.toString())
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
                              setSelectedEndDateTime(dateString.toString())
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
        {/* view Modal */}
        <Modal
          centered
          show={modalStates.viewModel}
          className="large-model"
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
            <div className="d-flex preview-container watermark-container">
              {viewDocument && (
                <>
                  {viewDocument.enable_external_file_view === 1 ? (
                    <iframe
                      src={viewDocument.url}
                      title="Document Preview"
                      style={{ width: "100%", height: "500px", border: "none", pointerEvents: "none" }}
                    ></iframe>
                  ) : viewDocument.type === "pdf" ? (
                    <iframe
                      src={viewDocument.url}
                      title="PDF Preview"
                      style={{
                        width: "100%",
                        height: "500px",
                        border: "none",
                        pointerEvents: "auto",
                        overflow: "auto",
                      }}
                    ></iframe>
                  ) : viewDocument.type === "image" ? (
                    <Image
                      src={viewDocument.url}
                      alt={viewDocument.name}
                      style={{ maxWidth: "100%", height: "auto" }}
                    />
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
                  className="me-2 px-3 rounded py-1"
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
                    handleOpenModal("editModel", editDocument?.id, editDocument?.name)
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
                    editDocument?.id, editDocument?.name
                  )
                } className="addButton me-2 bg-white text-dark border border-success rounded px-3 py-1">
                  <IoShareSocial className="me-2" />
                  Share
                </button>
              )}
              {hasPermission(permissions, "All Documents", "Manage Sharable Link") && (
                <button
                  onClick={() =>
                    handleOpenModal(
                      "shareableLinkModel",
                      editDocument?.id, editDocument?.name
                    )
                  }
                  className="addButton me-2 bg-white text-dark border border-success rounded px-3 py-1"
                >
                  <MdOutlineInsertLink className="me-2" />
                  Get Shareable Link
                </button>
              )}
              {hasPermission(permissions, "All Documents", "Download Document") && (
                <button
                  className="addButton me-2 bg-white text-dark border border-success rounded px-3 py-1"
                  onClick={() => handleDownload(editDocument?.id || 0, userId)}
                >
                  <MdFileDownload className="me-2" />
                  Download
                </button>
              )}
              <button
                onClick={() =>
                  handleOpenModal(
                    "uploadNewVersionFileModel",
                    editDocument?.id, editDocument?.name
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
                    editDocument?.id, editDocument?.name
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
                    editDocument?.id, editDocument?.name
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
                      editDocument?.id, editDocument?.name
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
                      editDocument?.id, editDocument?.name
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
                    editDocument?.id, editDocument?.name
                  )
                }
                className="addButton me-2 bg-white text-dark border border-success rounded px-3 py-1"
              >
                <AiOutlineZoomOut className="me-2" />
                Remove Indexing
              </button>

              {hasPermission(permissions, "All Documents", "Archive Document") && (
                <button
                  onClick={() =>
                    handleOpenModal(
                      "docArchivedModel",
                      editDocument?.id, editDocument?.name
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
                      editDocument?.id, editDocument?.name
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
              <button
                onClick={() => handleSaveEditData(selectedDocumentId!)}
                className="custom-icon-button button-success px-3 py-1 rounded me-2"
              >
                <IoSaveOutline fontSize={16} className="me-1" /> Yes
              </button>
              <button
                onClick={() => {
                  handleCloseModal("viewModel");
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
