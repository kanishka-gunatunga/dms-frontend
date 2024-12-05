/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Heading from "@/components/common/Heading";
import Paragraph from "@/components/common/Paragraph";
import DashboardLayout from "@/components/DashboardLayout";
import { DatePicker } from "antd";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  Button,
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
import { FaArchive, FaEllipsisV } from "react-icons/fa";
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
import type { DatePickerProps } from "antd";

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
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

import "react-quill/dist/quill.snow.css";
import { json } from "stream/consumers";

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

  console.log("user id: ", userId);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [dummyData, setDummyData] = useState<TableItem[]>([]);
  const [copySuccess, setCopySuccess] = useState("");
  const [comment, setComment] = useState("");
  const [allComment, setAllComment] = useState<CommentItem[]>([]);
  const [versionHistory, setVersionHistory] = useState<VersionHistoryItem[]>(
    []
  );
  const [selectedComment, setSelectedComment] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<string>("Select category");
  const [selectedStorage, setSelectedStorage] = useState<string>("Storage");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState<string[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(
    null
  );
  const [selectedDocumentName, setSelectedDocumentName] = useState<
    string | null
  >(null);
  const [categoryDropDownData, setCategoryDropDownData] = useState<
    CategoryDropdownItem[]
  >([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  const [shareableLinkData, setShareableLinkData] = useState({
    has_expire_date: false,
    expire_date_time: "",
    has_password: false,
    password: "",
    allow_download: false,
  });

  const [editDocument, setEditDocument] = useState<EditDocumentItem | null>(
    null
  );
  const [metaTags, setMetaTags] = useState<string[]>([]);
  const [currentMeta, setCurrentMeta] = useState<string>("");

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
  });
  const [generatedLink, setGeneratedLink] = useState<string>("");
  const [selectedDocumentData, setSelectedDocumentData] = useState<{
    name: string;
    category: string;
    description: string;
  } | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");
  const [newVersionDocument, setNewVersionDocument] = useState<File | null>(
    null
  );
  const [content, setContent] = useState<string>("");
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
  const [weekDay, setWeekDay] = useState([""]);
  const [days, setDays] = useState([""]);
  const [halfMonths, setHalfMonths] = useState<HalfMonth[]>([]);
  const [quarterMonths, setQuarterMonths] = useState<HalfMonth[]>([]);
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

  const [userDropDownData, setUserDropDownData] = useState<UserDropdownItem[]>(
    []
  );
  const [roleDropDownData, setRoleDropDownData] = useState<RoleDropdownItem[]>(
    []
  );
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [allShareData, setAllShareData] = useState<ShareItem[]>([]);
  const [filterValue, setFilterValue] = useState("");
  const [selectedShareDocUserType, setSelectedShareDocUserType] = useState("");
  const [selectedShareDocId, setSelectedShareDocId] = useState<number>();

  const isAuthenticated = useAuth();
  const router = useRouter();

  // data fetch functions
  const fetchComments = async (id: number) => {
    try {
      const response = await getWithAuth(`document-comments/${id}`);
      console.log("comments:", response);
      if(response.status === "success"){
        setAllComment(response);
      }else if(response.status === "fail"){
        console.log("share doc data:", response)
      }
      
    } catch (error) {
      console.error("Failed to fetch documents data:", error);
    }
  };
  
  const fetchShareDocumentData = async (id: number) => {
    console.log("share123")
    try {
      const response = await getWithAuth(`document-share/${id}`);

        console.log("share docs get docs - 1:", response);
        setAllShareData(response);
      

    } catch (error) {
      console.error("Failed to fetch documents data:", error);
    }
  };

  useEffect(() => {
    fetchCategoryData(setCategoryDropDownData);
    fetchDocumentsData(setDummyData);
    fetchAndMapUserData(setUserDropDownData);
    fetchRoleData(setRoleDropDownData);
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

  // authenticate user
  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  // dropdowns and input change functions
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };

  const handleSearch = (searchTerm: string) => {
    const filteredData = dummyData.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.category_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
    setDummyData(filteredData);
  };

  const handleStorageSelect = (selected: string) => {
    setSelectedStorage(selected);
  };

  const handleDateChange: DatePickerProps["onChange"] = (date, dateString) => {
    console.log("date string:", dateString);
    if (typeof dateString === "string") {
      setSelectedDate(dateString);
    }
  };

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

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(dummyData.map((item) => item.id));
    }
    setSelectAll(!selectAll);
  };

  const handleCheckboxChange = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    if (!selectedItems.includes(id)) {
      console.log(id);
    }
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
  // pagination - share table
  console.log("allShareData123 :", allShareData)
  const filteredData = filterValue
    ? allShareData.filter(
      (item) =>
        item.email && item.email.toLowerCase().includes(filterValue.toLowerCase())
    )
    : allShareData;

  const totalItemsShare = filteredData.length;
  console.log("totalItemsShare :", totalItemsShare)
  const totalPagesShare = Math.ceil(totalItemsShare / itemsPerPage);
  const startIndexShare = (currentPage - 1) * itemsPerPage;
  const endIndexShare = Math.min(currentPage * itemsPerPage, totalItemsShare);

  // const paginatedDataShare = allShareData.slice(startIndexShare, endIndexShare);
  const paginatedDataShare = filteredData.slice(startIndexShare, endIndexShare);

  console.log("paginatedDataShare : ", paginatedDataShare)

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
    if (currentMeta.trim() !== "" && !metaTags.includes(currentMeta.trim())) {
      setMetaTags((prev) => [...prev, currentMeta.trim()]);
      setCurrentMeta("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addMetaTag();
    }
  };

  const updateMetaTag = (index: number, value: string) => {
    setMetaTags((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const removeMetaTag = (index: number) => {
    setMetaTags((prev) => prev.filter((_, i) => i !== index));
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
      if (response.status === "success") {
        console.log("index removed successfully:");
        handleCloseModal("removeIndexingModel");
        setToastType("success");
        setToastMessage("Index removed successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      } else {
        setToastType("error");
        setToastMessage("Error occurred while removing index!");
        setShowToast(true);
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
        console.log("index removed successfully:");
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
        setToastMessage("Version Updated successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      } else {
        setToastType("error");
        setToastMessage("Error occurred while new version updating!");
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

  const handleDeleteComment = async (id: number) => {
    console.log("id: ", id);
  };

  const handleGetShareableLink = async (id: number) => {
    try {
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

      const response = await postWithAuth(`get-shareble-link/${id}`, formData);
      console.log("share data: ", response);
      if (response.status === "success") {
        handleCloseModal("shareableLinkModel");
        setGeneratedLink(response.link);
        handleOpenModal("generatedShareableLinkModel");
      } else {
        setToastType("error");
        setToastMessage("Error occurred while get shareble link!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
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
      const response = await deleteWithAuth(`delete-shareble-link/${id}`);
      console.log("link deleted successfully:", response);
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

      const response = await postWithAuth(
        `update-shareble-link/${id}`,
        formData
      );
      console.log("share data: ", response);
      if (response.status === "success") {
        handleCloseModal("shareableLinkModel");
        setGeneratedLink(response.link);
        handleOpenModal("generatedShareableLinkModel");
      } else {
        setToastType("error");
        setToastMessage("Error occurred while get shareble link!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
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
      const response = await deleteWithAuth(`delete-document/${id}`);
      console.log("document deleted successfully:", response);

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
      const response = await postWithAuth(
        `document-send-email/${id}`,
        formData
      );
      setNewVersionDocument(null);
      if (response.status === "success") {
        handleCloseModal("sendEmailModel");
        setToastType("success");
        setToastMessage("Email sent!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      } else {
        setToastType("error");
        setToastMessage("Error occurred while email sending!");
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

  const handleGetEditData = async (id: number) => {
    try {
      const response = await getWithAuth(`edit-document/${id}`);
      console.log("edit data: ", response);
      if (Array.isArray(response) && response.length > 0) {
        setEditDocument(response[0]);
      } else {
        console.error("Response is not a valid array or is empty");
      }
    } catch (error) {
      console.error("Error getting shareable link:", error);
    }
  };

  const handleSaveEditData = async (id: number) => {
    try {
      const formData = new FormData();
      if (editDocument) {
        formData.append("name", editDocument.name);
        formData.append("description", editDocument.description);
        formData.append("category", editDocument.category.category_name);
        // formData.append("meta_tags", JSON.stringify(metaTags));
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
      } else {
        setToastType("error");
        setToastMessage("Error updating document.");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
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
        formData.append("frequency_details[]", JSON.stringify(weekDay) || "");
      } else if (addReminder?.frequency === "Weekly") {
        formData.append("frequency_details[]", JSON.stringify(days) || "");
      }
      else if (addReminder?.frequency === "Quarterly") {
        formData.append("frequency_details[]", JSON.stringify(quarterMonths) || "");
      }
      else if (addReminder?.frequency === "Half Yearly") {
        formData.append("frequency_details[]", JSON.stringify(halfMonths) || "");
      }

      formData.append("users[]", JSON.stringify(addReminder?.users) || "");

      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
      const response = await postWithAuth(
        `reminder/`,
        formData
      );
      setNewVersionDocument(null);
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


  const handleDailyCheckboxChange = (e: { target: { value: any; checked: any; }; }) => {
    const day = e.target.value;
    if (e.target.checked) {
      setWeekDay((prevState) => [...prevState, day]);
    } else {
      setWeekDay((prevState) => prevState.filter((d) => d !== day));
    }
  };

  const handleWeekRadioChange = (e: { target: { value: string; }; }) => {
    setDays([e.target.value]);
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

      const newErrors: any = {};

      if (shareDocumentData?.is_time_limited === "1") {
        if (!shareDocumentData?.start_date_time) {
          newErrors.start_date_time = "Start date is required.";
        }
        if (!shareDocumentData?.end_date_time) {
          newErrors.end_date_time = "End date is required.";
        }
      }

      if (Object.keys(newErrors).length > 0) {
        setErrorsShareDoc(newErrors);
        return;
      }
      const formData = new FormData();
      formData.append("type", 'user');

      // if(modalStates.shareAssignUserModel){
      //   formData.append("assigned_roles_or_users[]", JSON.stringify(selectedUserIds) || '');
      // }else if(modalStates.shareAssignRoleModel){
      //   formData.append("assigned_roles_or_users[]", JSON.stringify(selectedRoleIds) || '');
      // }

      if (modalStates.shareAssignUserModel) {
        formData.append("assigned_roles_or_users[]", "1");
      } else if (modalStates.shareAssignRoleModel) {
        formData.append("assigned_roles_or_users[]", "1");
      }

      formData.append("is_time_limited", shareDocumentData?.is_time_limited || "");
      formData.append("start_date_time", shareDocumentData?.start_date_time || "");
      formData.append("end_date_time", shareDocumentData?.end_date_time || "");
      formData.append("is_downloadable", shareDocumentData?.is_downloadable || "");

      for (const [key, value] of formData.entries()) {
        console.log(`Document share: ${key}: ${value}`);
      }
      const response = await postWithAuth(
        `document-share/${id}`,
        formData
      );
      setShareDocumentData(null);
      setUsers([])
      setSelectedUserIds([]);
      if (response.status === "success") {

        setToastType("success");
        setToastMessage("Successfull!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        fetchShareDocumentData(id);
        handleCloseModal("shareAssignUserModel");
      }else if(response.status === "fail"){
        console.log("share doc data:", response.error)
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

      const newErrors: any = {};

      if (shareDocumentData?.is_time_limited === "1") {
        if (!shareDocumentData?.start_date_time) {
          newErrors.start_date_time = "Start date is required.";
        }
        if (!shareDocumentData?.end_date_time) {
          newErrors.end_date_time = "End date is required.";
        }
      }


      if (Object.keys(newErrors).length > 0) {
        setErrorsShareDoc(newErrors);
        return;
      }
      const formData = new FormData();
      formData.append("type", "role");

      // if(modalStates.shareAssignUserModel){
      //   formData.append("assigned_roles_or_users[]", JSON.stringify(selectedUserIds) || '');
      // }else if(modalStates.shareAssignRoleModel){
      //   formData.append("assigned_roles_or_users[]", JSON.stringify(selectedRoleIds) || '');
      // }

      if (modalStates.shareAssignUserModel) {
        formData.append("assigned_roles_or_users[]", "1");
      } else if (modalStates.shareAssignRoleModel) {
        formData.append("assigned_roles_or_users[]", "1");
      }


      formData.append("is_time_limited", shareDocumentData?.is_time_limited || "");
      formData.append("start_date_time", shareDocumentData?.start_date_time || "");
      formData.append("end_date_time", shareDocumentData?.end_date_time || "");
      formData.append("is_downloadable", shareDocumentData?.is_downloadable || "");

      for (const [key, value] of formData.entries()) {
        console.log(`Document share: ${key}: ${value}`);
      }
      const response = await postWithAuth(
        `document-share/${id}`,
        formData
      );
      setShareDocumentData(null);
      setRoles([])
      setSelectedRoleIds([]);
      if (response.status === "success") {
        setToastType("success");
        setToastMessage("Successfull!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        fetchShareDocumentData(id);
        handleCloseModal("shareAssignRoleModel");
      }else if(response.status === "fail"){
        console.log("share doc data:", response.error)
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
    console.log(`Type: ${itemType}, Id: ${itemId}`);
  };
  const handleDeleteShareDocument = async (id:any) => {
    if (!selectedShareDocId) {
      console.error("Invalid document ID");
      return;
    }

    try {
      console.log("user type before call: ", selectedShareDocUserType)
      const response = await deleteWithAuth(`delete-share/${selectedShareDocUserType}/${selectedShareDocId}`);
      console.log("document deleted successfully:", response);

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

  return (
    <>
      <DashboardLayout>
        {" "}
        <div className="d-flex justify-content-between align-items-center pt-2">
          <div className="d-flex flex-row align-items-center">
            <Heading text="All Documents" color="#444" />
            <InfoModal
              title="Sample Blog"
              content={`<h1><strong>Hello world,</strong></h1><p>The Company Profile feature allows users to customize the branding of the application by entering the company name and uploading logos. This customization will reflect on the login screen, enhancing the professional appearance and brand identity of the application.</p><br><h3><strong>Hello world,</strong></h3><p>The Company Profile feature allows users to customize the branding of the application by entering the company name and uploading logos. This customization will reflect on the login screen, enhancing the professional appearance and brand identity of the application.</p><br><h3><strong>Hello world,</strong></h3><p>The Company Profile feature allows users to customize the branding of the application by entering the company name and uploading logos. This customization will reflect on the login screen, enhancing the professional appearance and brand identity of the application.</p><br><h3><strong>Hello world,</strong></h3><p>The Company Profile feature allows users to customize the branding of the application by entering the company name and uploading logos. This customization will reflect on the login screen, enhancing the professional appearance and brand identity of the application.</p>`}
            />
          </div>
          <div className="d-flex flex-row">
            <a
              href="/all-documents/add"
              className="addButton me-2 bg-white text-dark border border-success rounded px-3 py-1"
            >
              <FaPlus className="me-1" /> Add Document
            </a>
          </div>
        </div>
        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3 position-relative">
          <div className="d-flex flex-column flex-lg-row">
            <div className="col-12 col-lg-6 d-flex flex-column flex-lg-row">
              <div className="input-group mb-3 pe-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name or description"
                  onChange={(e) => handleSearch(e.target.value)}
                ></input>
              </div>
              <div className="input-group mb-3 pe-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by meta tags"
                  onChange={(e) => handleSearch(e.target.value)}
                ></input>
              </div>
            </div>
            <div className="col-12 col-lg-6 d-flex flex-column flex-lg-row">
              <div className="col-12 col-lg-4">
                <div className="input-group mb-3">
                  <DropdownButton
                    id="dropdown-category-button"
                    title={
                      selectedCategoryId
                        ? categoryDropDownData.find(
                          (item) => item.id.toString() === selectedCategoryId
                        )?.category_name
                        : "Select Category"
                    }
                    className="custom-dropdown-text-start text-start w-100"
                    onSelect={(value) => handleCategorySelect(value || "")}
                  >
                    {categoryDropDownData.map((category) => (
                      <Dropdown.Item
                        key={category.id}
                        eventKey={category.id.toString()}
                        style={{
                          fontWeight:
                            category.parent_category === "none"
                              ? "bold"
                              : "normal",
                          marginLeft:
                            category.parent_category === "none"
                              ? "0px"
                              : "20px",
                        }}
                      >
                        {category.category_name}
                      </Dropdown.Item>
                    ))}
                  </DropdownButton>
                </div>
              </div>
              <div className="col-12 col-lg-4 px-2">
                <div className="input-group mb-3">
                  <DropdownButton
                    id="dropdown-storage-button"
                    title={selectedStorage}
                    className="w-100  custom-dropdown-text-start"
                  >
                    <Dropdown.Item
                      onClick={() =>
                        handleStorageSelect("Local Disk (Default)")
                      }
                    >
                      Local Disk (Default)
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => handleStorageSelect("Amazon S3")}
                    >
                      Amazon S3
                    </Dropdown.Item>
                  </DropdownButton>
                </div>
              </div>
              <div className="col-12 col-lg-4">
                <div className="input-group">
                  <DatePicker onChange={handleDateChange} />
                </div>
              </div>
            </div>
          </div>
          <div>
            <div
              style={{ maxHeight: "350px", overflowY: "auto" }}
              className="custom-scroll "
            >
              <Table hover responsive>
                <thead className="sticky-header">
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="custom-checkbox"
                        style={{
                          display: "flex",
                          alignSelf: "center",
                          justifySelf: "center",
                        }}
                      />
                    </th>
                    <th>Actions</th>
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
                          <input
                            type="checkbox"
                            className="custom-checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleCheckboxChange(item.id)}
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
                            <Dropdown.Item
                              href="#"
                              className="py-2"
                              onClick={() => handleView(item.id)}
                            >
                              <IoEye className="me-2" />
                              View
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                handleOpenModal("editModel", item.id, item.name)
                              }
                              className="py-2"
                            >
                              <MdModeEditOutline className="me-2" />
                              Edit
                            </Dropdown.Item>
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
                            <Dropdown.Item
                              href="#"
                              className="py-2"
                              onClick={() => handleDownload(item.id)}
                            >
                              <MdFileDownload className="me-2" />
                              Download
                            </Dropdown.Item>
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
                          </DropdownButton>
                        </td>

                        <td>
                          <Link href="#">{item.name}</Link>
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
                  onClick={() => handleCloseModal("editModel")}
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
            <DropdownButton
              id="dropdown-category-button"
              title={editDocument?.category?.category_name || "Select Category"}
              className="custom-dropdown-text-start text-start w-100"
              onSelect={(value) =>
                setEditDocument((prev) =>
                  prev
                    ? {
                      ...prev,
                      category: { category_name: value || "" },
                    }
                    : null
                )
              }
            >
              {categoryDropDownData.map((category) => (
                <Dropdown.Item
                  key={category.id}
                  eventKey={category.category_name}
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
            <div className="col-12">
              <p className="mb-1" style={{ fontSize: "14px" }}>
                Meta Tags
              </p>
              {metaTags.map((tag, index) => (
                <div key={index} className="d-flex align-items-center">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => updateMetaTag(index, e.target.value)}
                    className="form-control"
                  />
                  <button onClick={() => removeMetaTag(index)}>Remove</button>
                </div>
              ))}
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
            setSelectedDocumentId(null);
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
              <label className="d-flex flex-row mt-2">
                <input
                  type="checkbox"
                  checked={shareableLinkData.has_expire_date}
                  onChange={() => handleShareCheckboxChange("has_expire_date")}
                  className="me-2"
                />
                <p
                  className="mb-1 text-start w-100"
                  style={{ fontSize: "14px" }}
                >
                  Is Link Valid until:
                </p>
              </label>
              {shareableLinkData.has_expire_date && (
                <div className="d-flex flex-column flex-lg-row gap-2">
                  <label className="d-block w-100">
                    <input
                      type="datetime-local"
                      value={shareableLinkData.expire_date_time}
                      onChange={(e) =>
                        handleShareInputChange(
                          "expire_date_time",
                          e.target.value
                        )
                      }
                      className="form-control"
                    />
                  </label>
                </div>
              )}
              <label className="d-flex flex-row mt-2">
                <input
                  type="checkbox"
                  checked={shareableLinkData.has_password}
                  onChange={() => handleShareCheckboxChange("has_password")}
                  className="me-2"
                />
                <p
                  className="mb-1 text-start w-100"
                  style={{ fontSize: "14px" }}
                >
                  Is password required:
                </p>
              </label>
              {shareableLinkData.has_password && (
                <div className="d-flex flex-column flex-lg-row gap-2">
                  <label className="d-block w-100">
                    <input
                      type="password"
                      placeholder="Enter a password"
                      value={shareableLinkData.password}
                      onChange={(e) =>
                        handleShareInputChange("password", e.target.value)
                      }
                      className="form-control"
                    />
                  </label>
                </div>
              )}
              <label className="d-flex flex-row mt-2">
                <input
                  type="checkbox"
                  checked={shareableLinkData.allow_download}
                  onChange={() => handleShareCheckboxChange("allow_download")}
                  className="me-2"
                />
                <p
                  className="mb-1 text-start w-100"
                  style={{ fontSize: "14px" }}
                >
                  Users with link can download this item
                </p>
              </label>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex flex-row">
              <button
                onClick={() => {
                  handleGetShareableLink(selectedDocumentId!);
                  setSelectedDocumentId(null);
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
            setSelectedDocumentId(null);
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
                  onClick={() => handleCloseModal("versionHistoryModel")}
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
            setSelectedDocumentId(null);
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
                  onClick={() => handleCloseModal("shareableLinkModel")}
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
              <label className="d-flex flex-row mt-2">
                <input
                  type="checkbox"
                  checked={shareableLinkData.has_expire_date}
                  onChange={() => handleShareCheckboxChange("has_expire_date")}
                  className="me-2"
                />
                <p
                  className="mb-1 text-start w-100"
                  style={{ fontSize: "14px" }}
                >
                  Is Link Valid until:
                </p>
              </label>
              {shareableLinkData.has_expire_date && (
                <div className="d-flex flex-column flex-lg-row gap-2">
                  <label className="d-block">
                    <input
                      type="datetime-local"
                      value={shareableLinkData.expire_date_time}
                      onChange={(e) =>
                        handleShareInputChange(
                          "expire_date_time",
                          e.target.value
                        )
                      }
                      className="form-control"
                    />
                  </label>
                </div>
              )}
              <label className="d-flex flex-row mt-2">
                <input
                  type="checkbox"
                  checked={shareableLinkData.has_password}
                  onChange={() => handleShareCheckboxChange("has_password")}
                  className="me-2"
                />
                <p
                  className="mb-1 text-start w-100"
                  style={{ fontSize: "14px" }}
                >
                  Is password required:
                </p>
              </label>
              {shareableLinkData.has_password && (
                <div className="d-flex flex-column flex-lg-row gap-2">
                  <label className="d-block">
                    <input
                      type="password"
                      placeholder="Enter a password"
                      value={shareableLinkData.password}
                      onChange={(e) =>
                        handleShareInputChange("password", e.target.value)
                      }
                      className="form-control"
                    />
                  </label>
                </div>
              )}
              <label className="d-flex flex-row mt-2">
                <input
                  type="checkbox"
                  checked={shareableLinkData.allow_download}
                  onChange={() => handleShareCheckboxChange("allow_download")}
                  className="me-2"
                />
                <p
                  className="mb-1 text-start w-100"
                  style={{ fontSize: "14px" }}
                >
                  Users with link can download this item
                </p>
              </label>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex flex-row">
              <button
                onClick={() => {
                  handleUpdateShareableLink(selectedDocumentId!);
                  setSelectedDocumentId(null);
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
          className="large-model"
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
              <div className="col-1">
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
                      onClick={() => handleDeleteComment(1)}
                    />
                  </div>
                  <div className="d-flex flex-row">
                    <p className="mb-0 me-3">{comment.date_time}</p>{" "}
                    <a href={comment.user} className="mb-0">
                      {comment.commented_by}
                    </a>
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
                  VERSION_HISOTRY
                </p>
              </div>
              <div className="col-1">
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
                    <div className="d-flex flex-row justify-content-between w-100">
                      <div className="col-5 text-start">
                        <p className="mb-0 me-3">{item.date_time}</p>
                      </div>
                      <div className="col-5 text-start">
                        <p className="mb-0 me-3">{item.created_by}</p>
                      </div>

                      <div className="col-2">
                        {" "}
                        {isLatestVersion && (
                          <span
                            className="bg-success px-2 py-1 rounded-pill text-white mb-0 d-flex justify-content-center align-items-center"
                            style={{ fontSize: "12px", lineHeight: "12px" }}
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
          className="large-model"
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
              <div className="col-1">
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
              <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                Document Upload
              </p>
              <div className="input-group">
                <input
                  type="file"
                  className="form-control"
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
              <div className="col-1">
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
                <IoSaveOutline fontSize={16} className="me-1" /> Save
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
              <div className="col-1">
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
              className="d-flex flex-column custom-scroll mb-3"
              style={{ maxHeight: "300px", overflowY: "auto" }}
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
              <div className="d-flex flex-column flex-lg-row">
                <div className="col-12 col-lg-5">
                  <label className="d-flex flex-row mt-2">
                    <input
                      type="checkbox"
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
                    />

                    <p
                      className="mb-1 text-start w-100"
                      style={{ fontSize: "14px" }}
                    >
                      Repeate Reminder
                    </p>
                  </label>
                </div>
                <div className="col-12 col-lg-7 d-flex flex-column flex-lg-row align-items-start mb-3">
                  <label className="col-3 d-flex flex-row me-2 align-items-center">
                    <input
                      type="checkbox"
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
                    />

                    <p
                      className="mb-0 text-start w-100"
                      style={{ fontSize: "14px" }}
                    >
                      Send Email
                    </p>
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
                        <div>
                          {[
                            "Sunday",
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday",
                          ].map((day) => (
                            <label key={day}>
                              <input
                                type="checkbox"
                                value={day}
                                checked={weekDay.includes(day)}
                                onChange={handleDailyCheckboxChange}
                              />{" "}
                              {day}
                            </label>
                          ))}
                        </div>
                      )}

                      {addReminder?.frequency === "Weekly" && (
                        <div className="d-flex flex-wrap">
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
                              <input
                                type="radio"
                                name="weeklyDay"
                                value={day}
                                checked={days.includes(day)}
                                onChange={handleWeekRadioChange}
                              />{" "}
                              {day}
                            </label>
                          ))}
                        </div>
                      )}

                      {addReminder?.frequency === "Half Yearly" && (
                        <>
                          <div className="d-flex flex-row">
                            <div className="col-12 col-lg-2 p-1"></div>
                            <div className="col-12 col-lg-5 p-1">Select Reminder Month</div>
                            <div className="col-12 col-lg-5 p-1">Select Reminder Day</div>
                          </div>

                          {/* Jan - Jun */}
                          <div className="d-flex flex-row">
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
                          <div className="d-flex flex-row">
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
                        </>
                      )}

                      {addReminder?.frequency === "Quarterly" && (
                        <>
                          <div className="d-flex flex-row">
                            <div className="col-12 col-lg-2 p-1"></div>
                            <div className="col-12 col-lg-5 p-1">
                              Select Reminder Month
                            </div>
                            <div className="col-12 col-lg-5 p-1">
                              Select Reminder Day
                            </div>
                          </div>
                          {/* Jan - Mar */}
                          <div className="d-flex flex-row">
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
                          <div className="d-flex flex-row">
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
                          <div className="d-flex flex-row">
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
                          <div className="d-flex flex-row">
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
                        </>
                      )}
                    </div>
                    <div className="d-flex flex-column flex-lg-row w-100">
                      <div className="col-12 col-lg-6 d-flex flex-column pe-lg-1">
                        <label className="d-flex flex-column w-100">
                          <p
                            className="mb-1 text-start w-100"
                            style={{ fontSize: "14px" }}
                          >
                            Reminder Start Date
                          </p>
                        </label>
                        <input
                          type="datetime-local"
                          value={addReminder?.start_date_time}
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
                              start_date_time: e.target.value,
                            }))
                          }
                          className="form-control"
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
                        <input
                          type="datetime-local"
                          value={addReminder?.end_date_time}
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
                              end_date_time: e.target.value,
                            }))
                          }
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="col-12 col-lg-6 d-flex flex-column">
                      <label className="d-block w-100">
                        <p
                          className="mb-1 text-start w-100"
                          style={{ fontSize: "14px" }}
                        >
                          Reminder Date
                        </p>
                      </label>
                      <input
                        type="datetime-local"
                        value={addReminder?.date_time}
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
                            date_time: e.target.value,
                          }))
                        }
                        className="form-control"
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
                  className="custom-icon-button button-success px-3 py-1 rounded me-2"
                >
                  <IoAdd fontSize={16} className="me-1" /> Assign/share with users
                </button>
                <button
                  onClick={() =>
                    handleOpenModal(
                      "shareAssignRoleModel"
                    )
                  }
                  className="custom-icon-button button-success px-3 py-1 rounded me-2"
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
                    <input
                      type="checkbox"
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
                    />
                    <p
                      className="mb-1 text-start w-100"
                      style={{ fontSize: "14px" }}
                    >
                      Spacify the Period
                    </p>
                  </label>
                </div>
                <div className="d-flex flex-column">
                  {
                    shareDocumentData?.is_time_limited && (
                      <div className="d-flex flex-column flex-md-row">
                        <div className="col-12 col-md-6 d-flex flex-column me-md-1">
                          <input
                            type="datetime-local"
                            placeholder="Choose a start date"
                            value={shareDocumentData?.start_date_time}
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
                                start_date_time: e.target.value,
                              }))
                            }
                            className="form-control"
                          />
                        </div>
                        <div className="col-12 col-md-6 d-flex flex-column ms-md-1">
                          <input
                            type="datetime-local"
                            placeholder="Choose a end date"
                            value={shareDocumentData?.end_date_time}
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
                                end_date_time: e.target.value,
                              }))
                            }
                            className="form-control"
                          />
                        </div>
                      </div>
                    )
                  }
                </div>
              </div>
              <div className="col-12">
                <label className="d-flex flex-row mt-2">
                  <input
                    type="checkbox"
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
                  />
                  <p
                    className="mb-1 text-start w-100"
                    style={{ fontSize: "14px" }}
                  >
                    Allow Download
                  </p>
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
                    <input
                      type="checkbox"
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
                    />
                    <p
                      className="mb-1 text-start w-100"
                      style={{ fontSize: "14px" }}
                    >
                      Spacify the Period
                    </p>
                  </label>
                </div>
                <div className="d-flex flex-column">
                  {
                    shareDocumentData?.is_time_limited && (
                      <div className="d-flex flex-column flex-md-row">
                        <div className="col-12 col-md-6 d-flex flex-column me-md-1">
                          <input
                            type="datetime-local"
                            placeholder="Choose a start date"
                            value={shareDocumentData?.start_date_time}
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
                                start_date_time: e.target.value,
                              }))
                            }
                            className="form-control"
                          />
                        </div>
                        <div className="col-12 col-md-6 d-flex flex-column ms-md-1">
                          <input
                            type="datetime-local"
                            placeholder="Choose a end date"
                            value={shareDocumentData?.end_date_time}
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
                                end_date_time: e.target.value,
                              }))
                            }
                            className="form-control"
                          />
                        </div>
                      </div>
                    )
                  }
                </div>
              </div>
              <div className="col-12">
                <label className="d-flex flex-row mt-2">
                  <input
                    type="checkbox"
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
                  />
                  <p
                    className="mb-1 text-start w-100"
                    style={{ fontSize: "14px" }}
                  >
                    Allow Download
                  </p>
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
