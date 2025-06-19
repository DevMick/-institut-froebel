import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Card, Row, Col, Statistic } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined, SearchOutlined, EyeOutlined, TeamOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../../components/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import '../../styles/table.css';

// Configuration de l'URL de base pour Axios
const API_BASE_URL = 'http://localhost:5265';

// Configuration d'Axios pour utiliser l'URL de base
axios.defaults.baseURL = API_BASE_URL;

const TypeReunionPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [typesReunion, setTypesReunion] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
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
  const [statistiques, setStatistiques] = useState({
    totalTypes: 0,
    typesAvecReunions: 0,
    typesSansReunions: 0,
  });

  // Récupérer le clubId depuis le user
  const clubId = user?.clubId;

  useEffect(() => {
    console.log('Current user:', user);
    console.log('ClubId:', clubId);
  }, [user, clubId]);

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

  const handleAuthError = (error) => {
    if (error.response?.status === 401) {
      message.error('Votre session a expiré. Veuillez vous reconnecter.');
      logout();
      navigate('/login');
    } else {
      throw error;
    }
  };

  const fetchTypesReunion = useCallback(async () => {
    if (!clubId) {
      console.log('No clubId available');
      setTypesReunion([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
      return;
    }
    setLoading(true);
    try {
      const url = `/api/clubs/${clubId}/types-reunion`;
      console.log('Fetching types reunion from:', url);
      
      const response = await axios.get(url);
      console.log('Response:', response.data);
      
      setTypesReunion(response.data.typesReunion);
      setStatistiques(response.data.statistiques);
      setPagination(prev => ({
        ...prev,
        total: response.data.typesReunion.length,
        current: 1,
      }));
    } catch (error) {
      console.error('Full error:', error);
      console.error('Error response:', error.response);
      handleAuthError(error);
      console.error('Erreur lors du chargement des types de réunion:', error);
      message.error("Erreur lors du chargement des types de réunion");
      setTypesReunion([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
    } finally {
      setLoading(false);
    }
  }, [clubId, logout, navigate]);

  useEffect(() => {
    fetchTypesReunion();
  }, [fetchTypesReunion]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Filtrage des types de réunion selon le champ de recherche
  const filteredTypesReunion = typesReunion.filter(type => {
    return (
      (type.libelle || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Statistiques calculées à partir des types filtrés
  const totalTypes = filteredTypesReunion.length;
  const typesAvecReunions = filteredTypesReunion.filter(type => type.nombreReunions > 0).length;
  const typesSansReunions = filteredTypesReunion.filter(type => type.nombreReunions === 0).length;

  const openModal = (record = null) => {
    setEditingType(record);
    setModalVisible(true);
    if (record) {
      form.setFieldsValue({
        libelle: record.libelle,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ 
        libelle: ''
      });
    }
  };

  const openDetailModal = async (record) => {
    try {
      setSelectedType(record);
      setDetailModalVisible(true);
    } catch (error) {
      message.error("Erreur lors du chargement des détails");
    }
  };

  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedType(null);
  };

  const handleDelete = async (type) => {
    try {
      await axios.delete(`/api/clubs/${clubId}/types-reunion/${type.id}`);
      message.success('Type de réunion supprimé');
      fetchTypesReunion();
    } catch (error) {
      handleAuthError(error);
      message.error("Erreur lors de la suppression: " + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmit = async (values) => {
    if (!clubId) {
      message.error("Erreur d'authentification.");
      return;
    }
    try {
      const typeData = {
        libelle: values.libelle,
      };

      if (editingType) {
        await axios.put(`/api/clubs/${clubId}/types-reunion/${editingType.id}`, typeData);
        message.success('Type de réunion modifié');
      } else {
        await axios.post(`/api/clubs/${clubId}/types-reunion`, typeData);
        message.success('Type de réunion ajouté');
      }
      setModalVisible(false);
      setEditingType(null);
      form.resetFields();
      fetchTypesReunion();
    } catch (error) {
      handleAuthError(error);
      message.error(error.response?.data?.message || error.message || "Erreur lors de l'enregistrement");
    }
  };

  const handleViewReunions = (typeId) => {
    navigate(`/clubs/${clubId}/types-reunion/${typeId}/reunions`);
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
          <TeamOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {text}
        </span>
      ),
      sorter: (a, b) => (a.libelle || '').localeCompare(b.libelle || ''),
    },
    {
      title: 'Nombre de Réunions',
      dataIndex: 'nombreReunions',
      key: 'nombreReunions',
      render: (count) => (
        <span style={{ 
          color: count > 0 ? '#52c41a' : '#d9d9d9', 
          fontWeight: count > 0 ? 'bold' : 'normal' 
        }}>
          <CalendarOutlined style={{ marginRight: 8 }} />
          {count || 0}
        </span>
      ),
      sorter: (a, b) => (a.nombreReunions || 0) - (b.nombreReunions || 0),
      align: 'center',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => openDetailModal(record)} 
            title="Voir les détails"
          />
          <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Popconfirm 
            title={`Supprimer le type de réunion "${record.libelle}" ?`}
            onConfirm={() => handleDelete(record)} 
            okText="Oui" 
            cancelText="Non"
            disabled={record.nombreReunions > 0}
          >
            <Button 
              icon={<DeleteOutlined />} 
              danger 
              disabled={record.nombreReunions > 0}
              title={record.nombreReunions > 0 ? "Impossible de supprimer: des réunions sont associées" : "Supprimer"}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!clubId) {
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
          <div className="container mx-auto px-4 py-8">
            <Card>
              <div className="text-center text-red-500">
                Vous n'avez pas de club assigné. Veuillez contacter un administrateur.
              </div>
            </Card>
          </div>
        </main>
      </div>
    );
  }

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
                  Types de Réunion
                </h1>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-full">
          {/* Statistiques */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} md={8} lg={8}>
              <Card>
                <Statistic
                  title="Total des Types"
                  value={totalTypes}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={8}>
              <Card>
                <Statistic
                  title="Types avec Réunions"
                  value={typesAvecReunions}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={8}>
              <Card>
                <Statistic
                  title="Types sans Réunions"
                  value={typesSansReunions}
                  prefix={<CalendarOutlined />}
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
              Nouveau Type
            </Button>
            <Input
              placeholder="Rechercher par libellé..."
              prefix={<SearchOutlined />}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', maxWidth: 300 }}
              allowClear
            />
          </div>

          <div className="w-full bg-white p-4 sm:p-6 rounded-lg shadow">
            <Table
              columns={columns}
              dataSource={filteredTypesReunion}
              rowKey="id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: filteredTypesReunion.length,
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

            {/* Modal d'ajout/modification */}
            <Modal
              title={editingType ? 'Modifier le Type de Réunion' : 'Nouveau Type de Réunion'}
              open={modalVisible}
              onCancel={() => { 
                setModalVisible(false); 
                setEditingType(null); 
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
                initialValues={editingType ? undefined : {
                  libelle: '',
                }}
              >
                <Form.Item
                  name="libelle"
                  label="Libellé"
                  rules={[
                    { required: true, message: 'Le libellé est obligatoire' },
                    { min: 3, message: 'Le libellé doit contenir au moins 3 caractères' },
                    { max: 100, message: 'Le libellé ne peut pas dépasser 100 caractères' }
                  ]}
                >
                  <Input 
                    placeholder="Saisissez le libellé du type de réunion"
                    prefix={<TeamOutlined />}
                  />
                </Form.Item>

                <Form.Item>
                  <Space className="w-full justify-end">
                    <Button type="primary" htmlType="submit">
                      {editingType ? 'Modifier' : 'Créer'}
                    </Button>
                    <Button onClick={() => { 
                      setModalVisible(false); 
                      setEditingType(null); 
                      form.resetFields(); 
                    }}>
                      Annuler
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Modal>

            {/* Modal de détails */}
            <Modal
              title="Détails du Type de Réunion"
              open={detailModalVisible}
              onCancel={closeDetailModal}
              footer={[
                <Button key="close" onClick={closeDetailModal}>
                  Fermer
                </Button>
              ]}
              width={isMobile ? '95%' : 600}
              centered={isMobile}
            >
              {selectedType && (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Libellé">
                        <p style={{ fontWeight: 'bold', color: '#1890ff' }}>
                          <TeamOutlined style={{ marginRight: 8 }} />
                          {selectedType.libelle}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Nombre de Réunions">
                        <p style={{ 
                          fontWeight: 'bold', 
                          color: selectedType.nombreReunions > 0 ? '#52c41a' : '#d9d9d9'
                        }}>
                          <CalendarOutlined style={{ marginRight: 8 }} />
                          {selectedType.nombreReunions || 0} réunion(s)
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24}>
                      <Card size="small" title="Actions disponibles">
                        <Space>
                          <Button 
                            type="primary"
                            icon={<CalendarOutlined />}
                            onClick={() => {
                              closeDetailModal();
                              handleViewReunions(selectedType.id);
                            }}
                          >
                            Voir les réunions
                          </Button>
                          <Button 
                            icon={<EditOutlined />}
                            onClick={() => {
                              closeDetailModal();
                              openModal(selectedType);
                            }}
                          >
                            Modifier
                          </Button>
                        </Space>
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

export default TypeReunionPage;