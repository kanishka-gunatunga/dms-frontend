"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Modal,
  Form,
} from "react-bootstrap";
import { getWithAuth, postWithAuth, deleteWithAuth } from "@/utils/apiClient";

interface ChildCategory {
  name: string;
}

interface Sector {
  id: string;
  name: string;
  children: {
    invoice: ChildCategory[];
    attendance: ChildCategory[];
  };
}

const SectorCategories = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showSectorModal, setShowSectorModal] = useState(false);
  const [currentSector, setCurrentSector] = useState<Sector | null>(null);
  const [childName, setChildName] = useState("");
  const [sectorName, setSectorName] = useState("");
  const [currentType, setCurrentType] = useState<
    "invoice" | "attendance" | null
  >(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchSectors();
  }, []);

  const fetchSectors = async () => {
    const data: Sector[] = await getWithAuth("sectors");
    setSectors(data);
  };

  // Add Sector Category
  const addSectorCategory = async () => {
    const formData = new FormData();
    formData.append("parent_sector", "none");
    formData.append("sector_name", sectorName);

    const response = await postWithAuth("add-sector", formData);

    if (response.ok) {
      fetchSectors();
      setShowSectorModal(false);
    }
  };

  // Add Child Category
  const addChildCategory = async () => {
    if (!currentSector || !currentType) return;

    const formData = new FormData();
    formData.append("parent_sector_id", currentSector.id);
    formData.append("sector_name", childName);

    const response = await postWithAuth(
      `/sectors/${currentSector.id}`,
      formData
    );
    if (response.ok) {
      fetchSectors();
      setShowModal(false);
    }
  };

  // Delete Child Category
  const deleteChildCategory = async (sectorId: string) => {
    const response = await deleteWithAuth(`sectors/${sectorId}`);
    if (response.ok) fetchSectors();
  };

  // Delete Sector Category
  const deleteSectorCategory = async (sectorId: string) => {
    const response = await deleteWithAuth(`delete-sector/${sectorId}`);
    if (response.ok) fetchSectors();
  };

  // Show modal for adding/editing child categories
  const handleShowModal = (
    sector: Sector,
    type: "invoice" | "attendance",
    edit = false
  ) => {
    setCurrentSector(sector);
    setCurrentType(type);
    setEditMode(edit);
    setShowModal(true);
  };

  // Show modal for adding sector category
  const handleShowSectorModal = () => {
    setShowSectorModal(true);
  };

  // Component for rendering child categories
  const renderChildCategories = (
    sector: Sector,
    type: "invoice" | "attendance"
  ) => (
    <div>
      {sector.children[type].map((child, index) => (
        <Row className="align-items-center my-3" key={index}>
          <Col md={8}>
            <Card
              className="p-3 d-flex justify-content-center align-items-center"
              style={{
                backgroundColor: "#F5FCD6",
                borderRadius: "10px",
                textAlign: "center",
              }}
            >
              {child.name}
            </Card>
          </Col>
          <Col md={4} className="text-end">
            <Button
              variant="success"
              className="me-2"
              style={{ borderRadius: "8px" }}
              onClick={() => handleShowModal(sector, type, true)}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              style={{ borderRadius: "8px" }}
              onClick={() => deleteChildCategory(sector.id)}
            >
              Delete
            </Button>
          </Col>
        </Row>
      ))}
      <div className="text-end">
        <Button
          variant="outline-success"
          className="mt-2"
          style={{ borderRadius: "8px" }}
          onClick={() => handleShowModal(sector, type)}
        >
          + Add Child Category
        </Button>
      </div>
    </div>
  );

  return (
    <Container>
      <Row className="my-4">
        <Col className="d-flex justify-content-between">
          <h4>Sector Categories</h4>
          <Button
            variant="outline-dark"
            style={{ borderRadius: "8px" }}
            onClick={handleShowSectorModal}
          >
            + Add Sector Category
          </Button>
        </Col>
      </Row>
      {sectors.map((sector) => (
        <Card
          className="p-4 shadow-sm mb-4"
          style={{ borderRadius: "15px" }}
          key={sector.id}
        >
          <Row>
            <Col md={8}>
              <h5 className="fw-bold text-uppercase">{sector.name}</h5>
            </Col>
            <Col md={4} className="text-end">
              <h5 className="fw-bold text-uppercase">Action</h5>
              <Button
                variant="danger"
                className="ms-2"
                style={{ borderRadius: "8px" }}
                onClick={() => deleteSectorCategory(sector.id)}
              >
                Delete Sector
              </Button>
            </Col>
          </Row>
          <Row>
            <Col>
              <h6 className="fw-bold mt-4">Sub Category - Invoice</h6>
              {renderChildCategories(sector, "invoice")}
            </Col>
          </Row>
          <Row>
            <Col>
              <h6 className="fw-bold mt-4">Sub Category - Attendance</h6>
              {renderChildCategories(sector, "attendance")}
            </Col>
          </Row>
        </Card>
      ))}
      {/* Modal for adding/editing child category */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editMode ? "Edit Child Category" : "Add Child Category"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Child Category Name</Form.Label>
              <Form.Control
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={addChildCategory}>
            {editMode ? "Update" : "Add"}
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Modal for adding sector category */}
      <Modal show={showSectorModal} onHide={() => setShowSectorModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Sector Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Sector Category Name</Form.Label>
              <Form.Control
                type="text"
                value={sectorName}
                onChange={(e) => setSectorName(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSectorModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={addSectorCategory}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SectorCategories;
