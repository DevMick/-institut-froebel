import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Card, Row, Col, Statistic, Spin } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, EyeOutlined, FileTextOutlined, FolderOutlined } from '@ant-design/icons';
import { getTypesDocument, createTypeDocument, updateTypeDocument, deleteTypeDocument, getStatistiques } from '../api/typeDocumentService';
import Sidebar from '../components/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import '../styles/table.css';

const TypeDocumentPage = () => {
  const [typesDocument, setTypesDocument] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTypeDocument, setEditingTypeDocument] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingTypeDocument, setViewingTypeDocument] = useState(null);
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
    nombreTypesDocument: 0,
    nombreTotalDocuments: 0,
    tailleTotaleDocuments: 0
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

  const fetchTypesDocument = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTypesDocument(searchTerm);
      setTypesDocument(data);
      setPagination(prev => ({
        ...prev,
        total: data.length,
        current: 1,
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des types de document:', error);
      message.error('Erreur lors du chargement des types de document');
      setTypesDocument([]);
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
    fetchTypesDocument();
    fetchStats();
  }, [fetchTypesDocument, fetchStats]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Filtrage des types de document selon le champ de recherche
  const filteredTypesDocument = typesDocument.filter(t => {
    return (t.libelle || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Statistiques calculées à partir des types filtrés
  const totalTypes = filteredTypesDocument.length;
  const totalDocuments = filteredTypesDocument.reduce((sum, t) => sum + (t.nombreDocuments || 0), 0);

  const openModal = (record = null) => {
    setEditingTypeDocument(record);
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
    setViewingTypeDocument(record);
    setViewModalVisible(true);
  };

  const closeViewModal = () => {
    setViewModalVisible(false);
    setViewingTypeDocument(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteTypeDocument(id);
      message.success('Type de document supprimé avec succès');
      fetchTypesDocument();
      fetchStats();
    } catch (error) {
      message.error('Erreur lors de la suppression du type de document: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingTypeDocument) {
        await updateTypeDocument(editingTypeDocument.id, values);
        message.success('Type de document mis à jour avec succès');
      } else {
        await createTypeDocument(values);
        message.success('Type de document créé avec succès');
      }
      setModalVisible(false);
      setEditingTypeDocument(null);
      form.resetFields();
      fetchTypesDocument();
      fetchStats();
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Erreur lors de l\'enregistrement du type de document');
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const columns = [
    {
      title: 'Libellé',
      dataIndex: 'libelle',
      key: 'libelle',
      render: (text) => (
        <span>
          <FolderOutlined style={{ marginRight: 8, color: '#f59e0b' }} />
          {text}
        </span>
      ),
      sorter: (a, b) => (a.libelle || '').localeCompare(b.libelle || ''),
    },
    {
      title: 'Nombre de documents',
      dataIndex: 'nombreDocuments',
      key: 'nombreDocuments',
      render: (text) => (
        <span>
          <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {text || 0}
        </span>
      ),
      sorter: (a, b) => (a.nombreDocuments || 0) - (b.nombreDocuments || 0),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => openViewModal(record)} />
          <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Popconfirm 
            title="Supprimer ce type de document ?" 
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
                  Types de Documents
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
                  prefix={<FolderOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Documents associés"
                  value={totalDocuments}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Types globaux"
                  value={stats.nombreTypesDocument}
                  prefix={<FolderOutlined />}
                  valueStyle={{ color: '#f59e0b' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Taille totale"
                  value={formatFileSize(stats.tailleTotaleDocuments)}
                  prefix={<FileTextOutlined />}
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
              Ajouter un type de document
            </Button>

            <Input
              placeholder="Rechercher un type de document..."
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', maxWidth: 300 }}
              allowClear
            />
          </div>

          <div className="w-full bg-white p-4 sm:p-6 rounded-lg shadow">
            <Table
              columns={columns}
              dataSource={filteredTypesDocument}
              rowKey="id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: filteredTypesDocument.length,
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
              title={editingTypeDocument ? 'Modifier le type de document' : 'Ajouter un type de document'}
              open={modalVisible}
              onCancel={() => { setModalVisible(false); setEditingTypeDocument(null); form.resetFields(); }}
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
                  <Input prefix={<FolderOutlined />} />
                </Form.Item>

                <Form.Item>
                  <Space className="w-full justify-end">
                    <Button type="primary" htmlType="submit">
                      {editingTypeDocument ? 'Mettre à jour' : 'Ajouter'}
                    </Button>
                    <Button onClick={() => { setModalVisible(false); setEditingTypeDocument(null); form.resetFields(); }}>
                      Annuler
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Modal>

            {/* Modal de détails/visualisation */}
            <Modal
              title="Détails du type de document"
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
              {viewingTypeDocument && (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Libellé">
                        <p style={{ fontWeight: 'bold', color: '#f59e0b' }}>
                          <FolderOutlined style={{ marginRight: 8 }} />
                          {viewingTypeDocument.libelle}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Nombre de documents">
                        <p style={{ fontWeight: 'bold', color: '#1890ff' }}>
                          <FileTextOutlined style={{ marginRight: 8 }} />
                          {viewingTypeDocument.nombreDocuments || 0} document(s)
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24}>
                      <Card size="small" title="Description">
                        <p>Type de document utilisé pour classer et organiser les fichiers selon leur nature et leur fonction.</p>
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

export default TypeDocumentPage;