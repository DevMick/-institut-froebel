import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Card, Row, Col, Statistic, Spin } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, EyeOutlined, DollarOutlined, UnorderedListOutlined, PieChartOutlined } from '@ant-design/icons';
import { getTypesBudget, createTypeBudget, updateTypeBudget, deleteTypeBudget, getStatistiques } from '../api/typeBudgetService';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import '../styles/table.css';

const TypeBudgetPage = () => {
  const { user } = useAuth();
  const [typesBudget, setTypesBudget] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTypeBudget, setEditingTypeBudget] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingTypeBudget, setViewingTypeBudget] = useState(null);
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
  const [stats, setStats] = useState({
    nombreTypesBudget: 0,
    nombreTotalCategories: 0,
    nombreTotalSousCategories: 0,
    nombreTotalRubriques: 0,
    typesDetails: []
  });

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
    setLoading(true);
    try {
      const data = await getTypesBudget(searchTerm);
      setTypesBudget(data);
      setPagination(prev => ({
        ...prev,
        total: data.length,
        current: 1,
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des types de budget:', error);
      message.error('Erreur lors du chargement des types de budget');
      setTypesBudget([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getStatistiques();
      setStats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      message.error('Erreur lors du chargement des statistiques');
    }
  }, []);

  useEffect(() => {
    fetchTypesBudget();
    fetchStats();
  }, [fetchTypesBudget, fetchStats]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Filtrage des types de budget selon le champ de recherche
  const filteredTypesBudget = typesBudget.filter(t => {
    return (t.libelle || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Statistiques calculées à partir des types filtrés
  const totalTypes = filteredTypesBudget.length;
  const totalCategories = filteredTypesBudget.reduce((sum, t) => sum + (t.nombreCategoriesBudget || 0), 0);

  const openModal = (record = null) => {
    setEditingTypeBudget(record);
    setModalVisible(true);
    if (record) {
      form.setFieldsValue({
        libelle: record.libelle
      });
    } else {
      form.resetFields();
    }
  };

  const openViewModal = (record) => {
    setViewingTypeBudget(record);
    setViewModalVisible(true);
  };

  const closeViewModal = () => {
    setViewModalVisible(false);
    setViewingTypeBudget(null);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingTypeBudget) {
        await updateTypeBudget(editingTypeBudget.id, values);
        message.success('Type de budget mis à jour avec succès');
      } else {
        await createTypeBudget(values);
        message.success('Type de budget créé avec succès');
      }
      setModalVisible(false);
      setEditingTypeBudget(null);
      form.resetFields();
      fetchTypesBudget();
      fetchStats();
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.includes('existe déjà')) {
        message.error('Un type de budget avec ce libellé existe déjà. Veuillez choisir un autre libellé.');
      } else {
        message.error(error.response?.data?.message || error.message || 'Erreur lors de l\'enregistrement du type de budget');
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTypeBudget(id);
      message.success('Type de budget supprimé avec succès');
      fetchTypesBudget();
      fetchStats();
    } catch (error) {
      message.error('Erreur lors de la suppression du type de budget: ' + (error.response?.data?.message || error.message));
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
      title: 'Libellé',
      dataIndex: 'libelle',
      key: 'libelle',
      render: (text) => (
        <span>
          <UnorderedListOutlined style={{ marginRight: 8, color: '#3f8600' }} />
          {text}
        </span>
      ),
      sorter: (a, b) => (a.libelle || '').localeCompare(b.libelle || ''),
    },
    {
      title: 'Nombre de catégories',
      dataIndex: 'nombreCategoriesBudget',
      key: 'nombreCategoriesBudget',
      render: (text) => (
        <span>
          <UnorderedListOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {text || 0}
        </span>
      ),
      sorter: (a, b) => (a.nombreCategoriesBudget || 0) - (b.nombreCategoriesBudget || 0),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => openViewModal(record)} />
          <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Popconfirm 
            title="Supprimer ce type de budget ?" 
            onConfirm={() => handleDelete(record.id)} 
            okText="Oui" 
            cancelText="Non"
          >
            <Button icon={<DeleteOutlined />} danger />
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
                  Types de Budget
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
                  title="Total types"
                  value={totalTypes}
                  prefix={<UnorderedListOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Catégories associées"
                  value={totalCategories}
                  prefix={<UnorderedListOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Sous-catégories"
                  value={stats.nombreTotalSousCategories}
                  prefix={<PieChartOutlined />}
                  valueStyle={{ color: '#f59e0b' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Rubriques"
                  value={stats.nombreTotalRubriques}
                  prefix={<PieChartOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-4">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
            >
              Ajouter un type de budget
            </Button>

            <Input
              placeholder="Rechercher un type de budget..."
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', maxWidth: 300 }}
              allowClear
            />
          </div>

          <div className="w-full bg-white p-4 sm:p-6 rounded-lg shadow">
            <Table
              columns={columns}
              dataSource={filteredTypesBudget}
              rowKey="id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: filteredTypesBudget.length,
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
              title={editingTypeBudget ? 'Modifier le type de budget' : 'Ajouter un type de budget'}
              open={modalVisible}
              onCancel={() => { setModalVisible(false); setEditingTypeBudget(null); form.resetFields(); }}
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
                  name="libelle"
                  label="Libellé"
                  rules={[
                    { required: true, message: 'Le libellé est obligatoire' },
                    { max: 50, message: 'Le libellé ne peut pas dépasser 50 caractères' }
                  ]}
                >
                  <Input prefix={<UnorderedListOutlined />} />
                </Form.Item>

                <Form.Item>
                  <Space className="w-full justify-end">
                    <Button type="primary" htmlType="submit">
                      {editingTypeBudget ? 'Mettre à jour' : 'Ajouter'}
                    </Button>
                    <Button onClick={() => { setModalVisible(false); setEditingTypeBudget(null); form.resetFields(); }}>
                      Annuler
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Modal>

            {/* Modal de détails/visualisation */}
            <Modal
              title="Détails du type de budget"
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
              {viewingTypeBudget && (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Libellé">
                        <p style={{ fontWeight: 'bold', color: '#3f8600' }}>
                          <UnorderedListOutlined style={{ marginRight: 8 }} />
                          {viewingTypeBudget.libelle}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Nombre de catégories">
                        <p style={{ fontWeight: 'bold', color: '#1890ff' }}>
                          <UnorderedListOutlined style={{ marginRight: 8 }} />
                          {viewingTypeBudget.nombreCategoriesBudget || 0} catégorie(s)
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24}>
                      <Card size="small" title="Description">
                        <p>Type de budget utilisé pour catégoriser et organiser les éléments budgétaires selon leur nature (recettes ou dépenses).</p>
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

export default TypeBudgetPage;