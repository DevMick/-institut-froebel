import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Card, Row, Col, Statistic, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FolderOutlined, FileOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { categorieService } from '../api/categorieService';
import Sidebar from '../components/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import '../styles/table.css';

const { TextArea } = Input;

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategorie, setEditingCategorie] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingCategorie, setViewingCategorie] = useState(null);
  const [form] = Form.useForm();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await categorieService.getCategories(searchTerm);
      console.log('Données reçues de getCategories:', data);
      setCategories(data);
      setPagination(prev => ({
        ...prev,
        total: data.length,
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
  }, [searchTerm]);

  const fetchStats = useCallback(async () => {
    try {
      const statsData = await categorieService.getStatistiques();
      console.log('Données reçues de getStatistiques:', statsData);
      setStats(statsData);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      message.error("Erreur lors du chargement des statistiques");
    }
  }, []);

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

  useEffect(() => {
    fetchCategories();
    fetchStats();
  }, [fetchCategories, fetchStats]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const openModal = (record = null) => {
    setEditingCategorie(record);
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
    setViewingCategorie(record);
    setViewModalVisible(true);
  };

  const closeViewModal = () => {
    setViewModalVisible(false);
    setViewingCategorie(null);
  };

  const handleDelete = async (id) => {
    try {
      await categorieService.deleteCategorie(id);
      message.success('Catégorie supprimée');
      fetchCategories();
      fetchStats();
    } catch (error) {
      message.error("Erreur lors de la suppression: " + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingCategorie) {
        await categorieService.updateCategorie(editingCategorie.id, values);
        message.success('Catégorie modifiée');
      } else {
        await categorieService.createCategorie(values);
        message.success('Catégorie ajoutée');
      }
      setModalVisible(false);
      setEditingCategorie(null);
      form.resetFields();
      fetchCategories();
      fetchStats();
    } catch (error) {
      message.error(error.response?.data?.message || error.message || "Erreur lors de l'enregistrement");
    }
  };

  // Filtrage des catégories selon le champ de recherche
  const filteredCategories = categories.filter(c => {
    return c.libelle.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const columns = [
    {
      title: 'Libellé',
      dataIndex: 'libelle',
      key: 'libelle',
      render: (text) => (
        <span>
          <FolderOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {text}
        </span>
      ),
      sorter: (a, b) => a.libelle.localeCompare(b.libelle),
    },
    {
      title: 'Nombre de documents',
      dataIndex: 'nombreDocuments',
      key: 'nombreDocuments',
      sorter: (a, b) => a.nombreDocuments - b.nombreDocuments,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => openViewModal(record)} />
          <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Popconfirm 
            title="Supprimer cette catégorie ?" 
            onConfirm={() => handleDelete(record.id)} 
            okText="Oui" 
            cancelText="Non"
            description="Cette action est irréversible. Assurez-vous qu'aucun document n'est associé à cette catégorie."
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Pour éviter les re-créations inutiles
  const handleToggleCollapse = useCallback((collapsed) => {
    setIsCollapsed(collapsed);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Largeur dynamique selon l'état du sidebar
  const sidebarWidth = isCollapsed ? '4rem' : '18rem';

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
                  Gestion des Catégories
                </h1>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-full">
          {/* Statistiques globales si disponibles */}
          {stats && (
            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} sm={24} md={12} lg={12}>
                <Card>
                  <Statistic
                    title="Nombre de Catégories"
                    value={stats.nombreCategories}
                    prefix={<FolderOutlined />}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12}>
                <Card>
                  <Statistic
                    title="Nombre Total de Documents"
                    value={stats.nombreTotalDocuments}
                    prefix={<FileOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
            </Row>
          )}

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-4">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              Ajouter une catégorie
            </Button>
            <Input
              placeholder="Rechercher une catégorie..."
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
              onChange={(pagination, filters, sorter) => {
                handleTableChange(pagination);
                console.log('Données affichées dans le tableau:', categories);
              }}
              scroll={{ x: 'max-content' }}
              size="middle"
              className="responsive-table"
            />

            <Modal
              title={editingCategorie ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
              open={modalVisible}
              onCancel={() => { setModalVisible(false); setEditingCategorie(null); form.resetFields(); }}
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
                    { max: 100, message: 'Le libellé ne peut pas dépasser 100 caractères' }
                  ]}
                >
                  <Input placeholder="Entrez le libellé de la catégorie" />
                </Form.Item>
                <Form.Item>
                  <Space className="w-full justify-end">
                    <Button type="primary" htmlType="submit">
                      {editingCategorie ? 'Mettre à jour' : 'Ajouter'}
                    </Button>
                    <Button onClick={() => { setModalVisible(false); setEditingCategorie(null); form.resetFields(); }}>
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
              {viewingCategorie && (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Libellé">
                        <p>{viewingCategorie.libelle}</p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Nombre de documents">
                        <p>{viewingCategorie.nombreDocuments}</p>
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

export default CategoriesPage;