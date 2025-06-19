import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Card, Row, Col, Statistic, Divider, Spin, Avatar } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined, SearchOutlined, EyeOutlined, SettingOutlined, UserOutlined, FunctionOutlined } from '@ant-design/icons';
import { fonctionService } from '../api/fonctionService';
import Sidebar from '../components/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import '../styles/table.css';

const { TextArea } = Input;

const FonctionsPage = () => {
  const [fonctions, setFonctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFonction, setEditingFonction] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingFonction, setViewingFonction] = useState(null);
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

  const fetchFonctions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fonctionService.getFonctions(searchTerm);
      console.log('Données reçues de getFonctions:', data);
      setFonctions(data);
      setPagination(prev => ({
        ...prev,
        total: data.length,
        current: 1,
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des fonctions:', error);
      message.error("Erreur lors du chargement des fonctions");
      setFonctions([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

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
    fetchFonctions();
  }, [fetchFonctions]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Filtrage des fonctions selon le champ de recherche
  const filteredFonctions = fonctions.filter(f => {
    return f.nomFonction.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Statistiques calculées à partir des fonctions filtrées
  const totalFonctions = filteredFonctions.length;
  const fonctionsRecentes = filteredFonctions.filter(f => {
    if (!f.dateCreation) return false;
    const createDate = new Date(f.dateCreation);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return createDate >= threeMonthsAgo;
  }).length;

  const openModal = (record = null) => {
    setEditingFonction(record);
    setModalVisible(true);
    if (record) {
      form.setFieldsValue({
        nomFonction: record.nomFonction
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ 
        nomFonction: ''
      });
    }
  };

  const openViewModal = (record) => {
    setViewingFonction(record);
    setViewModalVisible(true);
  };

  const closeViewModal = () => {
    setViewModalVisible(false);
    setViewingFonction(null);
  };

  const handleDelete = async (id) => {
    try {
      await fonctionService.deleteFonction(id);
      message.success('Fonction supprimée');
      fetchFonctions();
    } catch (error) {
      message.error("Erreur lors de la suppression: " + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingFonction) {
        await fonctionService.updateFonction(editingFonction.id, values);
        message.success('Fonction modifiée');
      } else {
        await fonctionService.createFonction(values);
        message.success('Fonction ajoutée');
      }
      setModalVisible(false);
      setEditingFonction(null);
      form.resetFields();
      fetchFonctions();
    } catch (error) {
      message.error(error.response?.data?.message || error.message || "Erreur lors de l'enregistrement");
    }
  };

  // Pour éviter les re-créations inutiles
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
      title: 'Fonction',
      key: 'fonction',
      render: (_, record) => (
        <div className="flex items-center">
          <Avatar 
            size={40} 
            icon={<FunctionOutlined />} 
            style={{ marginRight: 12, backgroundColor: '#1890ff' }}
          />
          <div>
            <div className="font-medium text-gray-900">
              {record.nomFonction}
            </div>
            <div className="text-sm text-gray-500">
              {record.description ? record.description.substring(0, 50) + (record.description.length > 50 ? '...' : '') : ''}
            </div>
          </div>
        </div>
      ),
      sorter: (a, b) => a.nomFonction.localeCompare(b.nomFonction),
    },

    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => openModal(record)}
            title="Modifier"
          />
          <Popconfirm 
            title="Supprimer cette fonction ?" 
            onConfirm={() => handleDelete(record.id)} 
            okText="Oui" 
            cancelText="Non"
            description="Cette action est irréversible. Assurez-vous qu'aucun utilisateur n'est associé à cette fonction."
          >
            <Button icon={<DeleteOutlined />} danger title="Supprimer" />
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
                  Gestion des Fonctions
                </h1>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-full">
          {/* Statistiques */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={24} md={12} lg={12}>
              <Card>
                <Statistic
                  title="Total fonctions"
                  value={totalFonctions}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12}>
              <Card>
                <Statistic
                  title="Nouvelles (3 mois)"
                  value={fonctionsRecentes}
                  prefix={<FunctionOutlined />}
                  valueStyle={{ color: '#f59e0b' }}
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
              Ajouter une fonction
            </Button>
            <Input
              placeholder="Rechercher une fonction..."
              prefix={<SearchOutlined />}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', maxWidth: 300 }}
              allowClear
            />
          </div>

          <div className="w-full bg-white p-4 sm:p-6 rounded-lg shadow">
            <Table
              columns={columns}
              dataSource={filteredFonctions}
              rowKey="id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: filteredFonctions.length,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                responsive: true,
                showQuickJumper: isMobile ? false : true,
                showTotal: (total, range) => isMobile ? `${range[0]}-${range[1]} / ${total}` : `${range[0]}-${range[1]} sur ${total} éléments`,
              }}
              onChange={(pagination, filters, sorter) => {
                handleTableChange(pagination);
                console.log('Données affichées dans le tableau:', fonctions);
              }}
              scroll={{ x: 'max-content' }}
              size="middle"
              className="responsive-table"
            />

            {/* Modal d'ajout/modification */}
            <Modal
              title={editingFonction ? 'Modifier la fonction' : 'Ajouter une fonction'}
              open={modalVisible}
              onCancel={() => { 
                setModalVisible(false); 
                setEditingFonction(null); 
                form.resetFields(); 
              }}
              footer={null}
              destroyOnClose
              width={isMobile ? '95%' : 600}
              centered={isMobile}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={editingFonction ? undefined : {
                  nomFonction: ''
                }}
              >
                <Form.Item
                  name="nomFonction"
                  label="Nom de la fonction"
                  rules={[
                    { required: true, message: 'Le nom de la fonction est obligatoire' },
                    { max: 100, message: 'Le nom de la fonction ne peut pas dépasser 100 caractères' }
                  ]}
                >
                  <Input 
                    placeholder="Entrez le nom de la fonction"
                    prefix={<FunctionOutlined />}
                  />
                </Form.Item>



                <Form.Item>
                  <Space className="w-full justify-end">
                    <Button type="primary" htmlType="submit">
                      {editingFonction ? 'Mettre à jour' : 'Ajouter'}
                    </Button>
                    <Button onClick={() => { 
                      setModalVisible(false); 
                      setEditingFonction(null); 
                      form.resetFields(); 
                    }}>
                      Annuler
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Modal>

            {/* Modal de détails/visualisation */}
            <Modal
              title="Détails de la fonction"
              open={viewModalVisible}
              onCancel={closeViewModal}
              footer={[
                <Button key="close" onClick={closeViewModal}>
                  Fermer
                </Button>,
              ]}
              destroyOnClose
              width={isMobile ? '95%' : 600}
              centered={isMobile}
            >
              {viewingFonction && (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Nom de la fonction">
                        <p style={{ fontWeight: 'bold', color: '#1890ff' }}>
                          <FunctionOutlined style={{ marginRight: 8 }} />
                          {viewingFonction.nomFonction}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Statut">
                        <p style={{ 
                          fontWeight: 'bold',
                          color: (viewingFonction.status === 'active' || viewingFonction.active === true) ? '#52c41a' : '#d9d9d9'
                        }}>
                          <SettingOutlined style={{ marginRight: 8 }} />
                          {(viewingFonction.status === 'active' || viewingFonction.active === true) ? 'Active' : 'Inactive'}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24}>
                      <Card size="small" title="Description">
                        <p>
                          <EditOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                          {viewingFonction.description || 'Aucune description disponible'}
                        </p>
                      </Card>
                    </Col>
                    {viewingFonction.dateCreation && (
                      <Col xs={24} sm={24} md={12}>
                        <Card size="small" title="Date de création">
                          <p>
                            <UserOutlined style={{ marginRight: 8, color: '#f59e0b' }} />
                            {new Date(viewingFonction.dateCreation).toLocaleDateString('fr-FR')}
                          </p>
                        </Card>
                      </Col>
                    )}
                    {viewingFonction.derniereMiseAJour && (
                      <Col xs={24} sm={24} md={12}>
                        <Card size="small" title="Dernière mise à jour">
                          <p>
                            <EditOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                            {new Date(viewingFonction.derniereMiseAJour).toLocaleDateString('fr-FR')}
                          </p>
                        </Card>
                      </Col>
                    )}
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

export default FonctionsPage;