/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import { Tree, Modal, Input, Button } from 'antd';
import type { TreeDataNode, TreeProps } from 'antd';
import { deleteWithAuth, getWithAuth, postWithAuth } from '@/utils/apiClient';
import Heading from '@/components/common/Heading';
import DashboardLayout from '@/components/DashboardLayout';
import { IoPencil, IoTrash } from 'react-icons/io5';

interface CategoryNode extends TreeDataNode {
  title: string | JSX.Element;
  key: string;
  parent_sector: string | null;
  children?: CategoryNode[];
}

const CategoryManagement: React.FC = () => {
  const [treeData, setTreeData] = useState<CategoryNode[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [categoryName, setCategoryName] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);

  const fetchRootNodes = async () => {
    try {
      const data = await getWithAuth("all-sectors");
      // console.log("data: ", data)
      const convertToTreeData = (nodes: any[]): CategoryNode[] => {
        const map: Record<string, CategoryNode> = {};
        nodes.forEach((node) => {
          map[node.id] = {
            title: node.sector_name,
            key: node.id.toString(),
            parent_sector: node.parent_sector === 'none' ? null : node.parent_sector,
            children: [],
          };
        });

        const tree: CategoryNode[] = [];
        nodes.forEach((node) => {
          if (node.parent_sector === 'none') {
            tree.push(map[node.id]);
          } else if (map[node.parent_sector]) {
            map[node.parent_sector].children!.push(map[node.id]);
          }
        });

        return tree;
      };

      setTreeData(convertToTreeData(data));
    } catch (error) {
      console.error('Failed to fetch sectors', error);
    }
  };

  useEffect(() => {
    fetchRootNodes();
  }, []);

  const handleAddNode = async () => {
    try {
      const formData = new FormData();
      formData.append('parent_sector', parentId || 'none');
      formData.append('sector_name', categoryName);
      await postWithAuth('add-sector', formData);
      setModalVisible(false);
      fetchRootNodes();
    } catch (error) {
      console.error('Failed to add node', error);
    }
  };

  const handleEditNode = async () => {
    if (!selectedKey) return;
    try {
      const formData = new FormData();
      formData.append('sector_name', categoryName);
      formData.append('parent_sector', parentId || 'none');
      await postWithAuth(`sector-details/${selectedKey}`, formData);
      setModalVisible(false);
      fetchRootNodes();
    } catch (error) {
      console.error('Failed to edit node', error);
    }
  };

  const handleDeleteNode = async (id: string) => {
    try {
      await deleteWithAuth(`delete-sector/${id}`);
      fetchRootNodes();
    } catch (error) {
      console.error('Failed to delete node', error);
    }
  };

  const showModal = (mode: 'add' | 'edit', key: string | null = null, parentKey: string | null = null) => {
    setModalMode(mode);
    setSelectedKey(key);
    setParentId(parentKey);
    setCategoryName('');
    setModalVisible(true);
  };

  return (
    <DashboardLayout>
      <div className="d-flex flex-column justify-content-center align-items-start pt-2">
        <div className="d-flex flex-row w-100 py-3 align-items-center justify-content-between">
          <Heading text="Sectors" color="#444" />
          <Button type="primary" className="addButton me-2 bg-white text-dark border border-success rounded px-3 py-1" onClick={() => showModal('add')}>Add Root Category</Button>
        </div>
        <div className="p-2 p-lg-5 bg-white w-100 rounded">
          <div className=''>
            <Tree
              checkable
              treeData={treeData}
              titleRender={(node) => (
                <div className='d-flex flex-column flex-md-row' >
                  {node.title}
                  <Button
                    size="small"
                    onClick={() => showModal('add', null, node.key)}
                    style={{ marginRight: 8, marginLeft: 8  }}
                    className="addButton me-2 bg-white text-dark border border-success rounded px-3 py-1 my-1 my-md-0"
                  >
                    Add Child
                  </Button>
                  <Button
                    size="small"
                    onClick={() => showModal('edit', node.key, node.parent_sector)}
                    style={{ marginLeft: 8 }}
                     className="custom-icon-button button-success px-3 py-2 rounded me-2 my-1 my-md-0"
                  >
                    <IoPencil fontSize={16} className="me-1" /> Edit
                  </Button>
                  <Button
                    size="small"
                    danger
                    onClick={() => handleDeleteNode(node.key)}
                    style={{ marginLeft: 8 }}
                    className="custom-icon-button button-danger text-white bg-danger px-3 py-2 rounded my-1 my-md-0"
                  >
                     <IoTrash fontSize={16} className="me-1" /> Delete
                  </Button>
                </div>
              )}
            />
            <Modal
              title={modalMode === 'add' ? 'Add Category' : 'Edit Category'}
              open={modalVisible}
              onOk={modalMode === 'add' ? handleAddNode : handleEditNode}
              onCancel={() => setModalVisible(false)}
            >
              <Input
                placeholder="Enter category name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </Modal>
          </div>
        </div>
      </div>
    </DashboardLayout>

  );
};

export default CategoryManagement;
