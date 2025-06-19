import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Card, Row, Col, Statistic, Select, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, AppstoreOutlined, TagsOutlined, FileTextOutlined, EyeOutlined, SearchOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { categoryBudgetService } from '../api/categoryBudgetService';
import { getTypesBudget } from '../api/typeBudgetService';
import Sidebar from '../components/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import '../styles/table.css';

const { Option } = Select;

const CategoryBudgetPage = () => {
  const [categories, setCategories] = useState([]);
  const [typesBudget, setTypesBudget] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingCategory, setViewingCategory] = useState(null);
  const [form] = Form.useForm();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Récupérer le clubId depuis le localStorage
  const clubId = JSON.parse(localStorage.getItem('user'))?.clubId;

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchTypesBudget = useCallback(async () => {
    try {
      const data = await getTypesBudget();
      setTypesBudget(data);
    } catch (error) {
      console.error('Erreur lors du chargement des types de budget:', error);
      message.error("Erreur lors du chargement des types de budget");
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const allCategories = [];
      const types = typesBudget.length ? typesBudget : await getTypesBudget();
      for (const type of types) {
        const data = await categoryBudgetService.getCategories(type.id);
        const enriched = data.map(cat => ({ 
          ...cat, 
          typeBudgetLibelle: type.libelle,
          typeBudgetId: type.id
        }));
        allCategories.push(...enriched);
      }
      setCategories(allCategories);
      setPagination(prev => ({
        ...prev,
        total: allCategories.length,
        current: 1,
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      message.error("Erreur lors du chargement des catégories");
      setCategories([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
    } finally {
      setLoading(false);
    }
  }, [typesBudget]);

  useEffect(() => {
    fetchTypesBudget();
  }, [fetchTypesBudget]);

  useEffect(() => {
    if (typesBudget.length > 0) {
      fetchCategories();
    }
  }, [typesBudget, fetchCategories]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Filtrage des catégories selon le champ de recherche
  const filteredCategories = categories.filter(c => {
    return (
      (c.libelle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.typeBudgetLibelle || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Statistiques calculées à partir des catégories filtrées
  const totalCategories = filteredCategories.length;
  const totalSousCategories = filteredCategories.reduce((sum, cat) => sum + (cat.nombreSousCategories || 0), 0);
  const moyenneSousCategories = totalCategories > 0 ? (totalSousCategories / totalCategories).toFixed(1) : 0;
  const nombreTypes = new Set(filteredCategories.map(c => c.typeBudgetId)).size;

  const openModal = (record = null) => {
    setEditingCategory(record);
    setModalVisible(true);
    if (record) {
      console.log('Données de la catégorie:', record);
      form.setFieldsValue({
        typeBudgetId: record.typeBudgetId,
        libelle: record.libelle
      });
    } else {
      form.resetFields();
    }
  };

  const openViewModal = (record) => {
    setViewingCategory(record);
    setViewModalVisible(true);
  };

  const closeViewModal = () => {
    setViewModalVisible(false);
    setViewingCategory(null);
  };

  const handleDelete = async (id, typeBudgetId) => {
    try {
      await categoryBudgetService.deleteCategory(typeBudgetId, id);
      message.success('Catégorie supprimée');
      fetchCategories();
    } catch (error) {
      message.error("Erreur lors de la suppression: " + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingCategory) {
        await categoryBudgetService.updateCategory(editingCategory.id, values);
        message.success('Catégorie mise à jour avec succès');
      } else {
        await categoryBudgetService.createCategory(values);
        message.success('Catégorie créée avec succès');
      }
      setModalVisible(false);
      setEditingCategory(null);
      form.resetFields();
      fetchCategories();
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.includes('existe déjà')) {
        message.error('Une catégorie avec ce libellé existe déjà pour ce type de budget. Veuillez choisir un autre libellé.');
      } else {
        message.error(error.response?.data?.message || error.message || 'Erreur lors de l\'enregistrement de la catégorie');
      }
    }
  };

  const handleToggleCollapse = useCallback((collapsed) => {
    setIsCollapsed(collapsed);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Largeur dynamique selon l'état du sidebar
  const sidebarWidth = isCollapsed ? '4rem' : '18rem';

  const columns = [
    {
      title: 'Catégorie',
      dataIndex: 'libelle',
      key: 'libelle',
      render: (text) => (
        <span>
          <AppstoreOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {text}
        </span>
      ),
      sorter: (a, b) => (a.libelle || '').localeCompare(b.libelle || ''),
    },
    {
      title: 'Type de Budget',
      dataIndex: 'typeBudgetLibelle',
      key: 'typeBudgetLibelle',
      render: (text) => (
        <span>
          <UnorderedListOutlined style={{ marginRight: 8, color: '#f59e0b' }} />
          {text}
        </span>
      ),
      sorter: (a, b) => (a.typeBudgetLibelle || '').localeCompare(b.typeBudgetLibelle || ''),
    },
    {
      title: 'Nombre de Sous-catégories',
      dataIndex: 'nombreSousCategories',
      key: 'nombreSousCategories',
      render: (text) => (
        <span>
          <TagsOutlined style={{ marginRight: 8, color: '#3f8600' }} />
          {text || 0}
        </span>
      ),
      sorter: (a, b) => (a.nombreSousCategories || 0) - (b.nombreSousCategories || 0),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => openViewModal(record)}
            title="Voir les détails"
          />
          <Popconfirm
            title="Supprimer cette catégorie ?" 
            onConfirm={() => handleDelete(record.id, record.typeBudgetId)}
            okText="Oui"
            cancelText="Non"
          >
            <Button icon={<DeleteOutlined />} danger title="Supprimer la catégorie" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />
      <main 
        className="flex-1 w-full transition-all duration-300 bg-gray-100 min-h-screen overflow-x-hidden" 
        style={{ 
          marginLeft: isMobile ? '0' : `calc(${sidebarWidth})`,
          width: isMobile ? '100%' : `calc(100% - ${sidebarWidth})`
        }}
      >
        <header className="sticky top-0 z-30 bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {isMobile && (
                  <button
                    onClick={toggleSidebar}
                    className="mr-4 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Toggle menu"
                  >
                    {isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                  </button>
                )}
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                  Catégories de Budget
                </h1>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-full">
          {/* Statistiques */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Total catégories"
                  value={totalCategories}
                  prefix={<AppstoreOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Sous-catégories"
                  value={totalSousCategories}
                  prefix={<TagsOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Moyenne par catégorie"
                  value={moyenneSousCategories}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#f59e0b' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Types de budget"
                  value={nombreTypes}
                  prefix={<UnorderedListOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-4">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              Ajouter une catégorie
            </Button>
            <Input
              placeholder="Rechercher par libellé ou type..."
              prefix={<SearchOutlined />}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', maxWidth: 300 }}
              allowClear
            />
          </div>

          <div className="w-full bg-white p-4 sm:p-6 rounded-lg shadow">
            <Table
              columns={columns}
              dataSource={filteredCategories}
              rowKey="id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: filteredCategories.length,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                responsive: true,
                showQuickJumper: isMobile ? false : true,
                showTotal: (total, range) => isMobile ? `${range[0]}-${range[1]} / ${total}` : `${range[0]}-${range[1]} sur ${total} éléments`,
              }}
              onChange={handleTableChange}
              scroll={{ x: 'max-content' }}
              size="middle"
              className="responsive-table"
            />

            <Modal
              title={editingCategory ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
              open={modalVisible}
              onCancel={() => { setModalVisible(false); setEditingCategory(null); form.resetFields(); }}
              footer={null}
              destroyOnClose
              width={isMobile ? '95%' : 600}
              centered={isMobile}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
              >
                <Form.Item
                  name="typeBudgetId"
                  label="Type de Budget"
                  rules={[{ required: true, message: 'Le type de budget est obligatoire' }]}
                >
                  <Select
                    placeholder="Sélectionnez un type de budget"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    allowClear
                  >
                    {typesBudget.map(type => (
                      <Option key={type.id} value={type.id}>
                        {type.libelle}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="libelle"
                  label="Libellé"
                  rules={[
                    { required: true, message: 'Le libellé est obligatoire' },
                    { max: 100, message: 'Le libellé ne peut pas dépasser 100 caractères' }
                  ]}
                >
                  <Input prefix={<AppstoreOutlined />} />
                </Form.Item>
                <Form.Item>
                  <Space className="w-full justify-end">
                    <Button type="primary" htmlType="submit">
                      {editingCategory ? 'Mettre à jour' : 'Ajouter'}
                    </Button>
                    <Button onClick={() => { setModalVisible(false); setEditingCategory(null); form.resetFields(); }}>
                      Annuler
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Modal>

            {/* Modal de détails/visualisation */}
            <Modal
              title="Détails de la catégorie"
              open={viewModalVisible}
              onCancel={closeViewModal}
              footer={[
                <Button key="close" onClick={closeViewModal}>
                  Fermer
                </Button>,
              ]}
              width={isMobile ? '95%' : 600}
              centered={isMobile}
            >
              {viewingCategory && (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Libellé">
                        <p style={{ fontWeight: 'bold', color: '#1890ff' }}>
                          <AppstoreOutlined style={{ marginRight: 8 }} />
                          {viewingCategory.libelle}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Type de Budget">
                        <p>
                          <UnorderedListOutlined style={{ marginRight: 8, color: '#f59e0b' }} />
                          {viewingCategory.typeBudgetLibelle}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Sous-catégories">
                        <p style={{ fontWeight: 'bold', color: '#3f8600' }}>
                          <TagsOutlined style={{ marginRight: 8 }} />
                          {viewingCategory.nombreSousCategories || 0} sous-catégorie(s)
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24}>
                      <Card size="small" title="Description">
                        <p>Catégorie budgétaire permettant de regrouper et organiser les sous-catégories selon leur type (recettes ou dépenses).</p>
                      </Card>
                    </Col>
                  </Row>
                </div>
              )}
            </Modal>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CategoryBudgetPage;