import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Card, Row, Col, Statistic, Select, Collapse, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, EyeOutlined, FileTextOutlined, BarChartOutlined, CalendarOutlined, TeamOutlined } from '@ant-design/icons';
import Sidebar from '../components/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import '../styles/table.css';
import { API_BASE_URL } from '../config';
import axios from 'axios';

const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

const OrdreDuJourPage = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [reunions, setReunions] = useState([]);
  const [ordresDuJour, setOrdresDuJour] = useState([]);
  const [reunion, setReunion] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingOrdre, setEditingOrdre] = useState(null);
  const [selectedOrdre, setSelectedOrdre] = useState(null);
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

  // Intercepteur pour gérer les erreurs d'authentification
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          message.error('Votre session a expiré. Veuillez vous reconnecter.');
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

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

  const fetchData = useCallback(async () => {
    if (!clubId) {
      setReunions([]);
      setOrdresDuJour([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
      return;
    }
    setLoading(true);
    try {
      // Charger les réunions
      const reunionsRes = await axios.get(`${API_BASE_URL}/api/clubs/${clubId}/reunions`);
      setReunions(reunionsRes.data || []);

      // Charger tous les ordres du jour pour toutes les réunions
      let allOrdres = [];
      let totalCaracteres = 0;
      
      for (const reunion of reunionsRes.data || []) {
        try {
          const ordresRes = await axios.get(`${API_BASE_URL}/api/clubs/${clubId}/reunions/${reunion.id}/ordres-du-jour`);
          const ordres = ordresRes.data.ordresDuJour || [];
          
          // Enrichir avec les informations de la réunion
          const ordresEnrichis = ordres.map(ordre => ({
            ...ordre,
            reunionDate: reunion.date,
            reunionType: reunion.typeReunionLibelle || 'Réunion',
            reunionInfo: `${new Date(reunion.date).toLocaleDateString('fr-FR')} - ${reunion.typeReunionLibelle || 'Réunion'}`
          }));
          
          allOrdres = allOrdres.concat(ordresEnrichis);
          totalCaracteres += ordres.reduce((sum, ordre) => sum + (ordre.description?.length || 0), 0);
        } catch (error) {
          console.error(`Erreur lors du chargement des ordres pour la réunion ${reunion.id}:`, error);
        }
      }

      setOrdresDuJour(allOrdres);
      setStats({
        totalOrdres: allOrdres.length,
        caracteresTotaux: totalCaracteres,
        reunionsAvecOrdres: [...new Set(allOrdres.map(o => o.reunionId))].length,
        moyenneCaracteres: allOrdres.length > 0 ? Math.round(totalCaracteres / allOrdres.length) : 0
      });

      setPagination(prev => ({
        ...prev,
        total: allOrdres.length,
        current: 1,
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      if (error.response?.status !== 401) {
        message.error("Erreur lors du chargement des données");
      }
      setReunions([]);
      setOrdresDuJour([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Filtrage des ordres du jour selon le champ de recherche
  const filteredOrdres = ordresDuJour.filter(ordre => {
    return (
      (ordre.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ordre.reunionInfo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ordre.reunionType || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Grouper les ordres du jour par réunion
  const ordresGroupesParReunion = filteredOrdres.reduce((acc, ordre) => {
    const reunionInfo = ordre.reunionInfo || 'Réunion non définie';
    if (!acc[reunionInfo]) {
      acc[reunionInfo] = [];
    }
    acc[reunionInfo].push(ordre);
    return acc;
  }, {});

  // Colonnes pour le tableau des ordres du jour dans chaque réunion
  const ordresColumns = [
    {
      title: 'Ordre du jour',
      key: 'ordre',
      width: 300,
      render: (_, record) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-blue-100 text-blue-600">
            <FileTextOutlined />
          </div>
          <div style={{ maxWidth: 250 }}>
            <div className="font-medium text-gray-900 ellipsis-cell" style={{ maxWidth: 250 }} title={record.description}>
              {record.description ? record.description.substring(0, 60) + (record.description.length > 60 ? '...' : '') : 'Description vide'}
            </div>
          </div>
        </div>
      ),
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
          <Button 
            icon={<EditOutlined />} 
            onClick={() => openModal(record)} 
            title="Modifier"
          />
          <Popconfirm 
            title="Supprimer cet ordre du jour ?" 
            onConfirm={() => handleDelete(record)} 
            okText="Oui" 
            cancelText="Non"
            description="Cette action est irréversible."
          >
            <Button icon={<DeleteOutlined />} danger title="Supprimer" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const openModal = (record = null) => {
    setEditingOrdre(record);
    setModalVisible(true);
    if (record) {
      form.setFieldsValue({
        reunionId: record.reunionId,
        description: record.description,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ 
        reunionId: undefined,
        description: ''
      });
    }
  };

  const openDetailModal = async (record) => {
    try {
      setSelectedOrdre(record);
      setDetailModalVisible(true);
    } catch (error) {
      message.error("Erreur lors du chargement des détails");
    }
  };

  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedOrdre(null);
  };

  const handleDelete = async (record) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/clubs/${clubId}/reunions/${record.reunionId}/ordres-du-jour/${record.id}`);
      message.success('Ordre du jour supprimé');
      fetchData();
    } catch (error) {
      if (error.response?.status !== 401) {
        message.error("Erreur lors de la suppression: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleSubmit = async (values) => {
    if (!clubId) {
      message.error("Erreur d'authentification.");
      return;
    }
    try {
      const ordreData = {
        description: values.description,
        reunionId: values.reunionId
      };

      if (editingOrdre) {
        await axios.put(
          `${API_BASE_URL}/api/clubs/${clubId}/reunions/${values.reunionId}/ordres-du-jour/${editingOrdre.id}`, 
          ordreData
        );
        message.success('Ordre du jour modifié');
      } else {
        await axios.post(
          `${API_BASE_URL}/api/clubs/${clubId}/reunions/${values.reunionId}/ordres-du-jour`, 
          ordreData
        );
        message.success('Ordre du jour ajouté');
      }
      setModalVisible(false);
      setEditingOrdre(null);
      form.resetFields();
      fetchData();
    } catch (error) {
      if (error.response?.status !== 401) {
        message.error(error.response?.data?.message || error.message || "Erreur lors de l'enregistrement");
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

  // Calculer les statistiques pour une réunion spécifique
  const getReunionStats = (ordres) => {
    const totalCaracteres = ordres.reduce((sum, ordre) => sum + (ordre.description?.length || 0), 0);
    return { totalCaracteres, count: ordres.length };
  };

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
                  Ordres du Jour
                </h1>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-full">
          {/* Statistiques principales */}
          {stats && (
            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} sm={12} md={12} lg={6}>
                <Card>
                  <Statistic
                    title="Total ordres"
                    value={stats.totalOrdres}
                    prefix={<FileTextOutlined />}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={12} lg={6}>
                <Card>
                  <Statistic
                    title="Caractères totaux"
                    value={stats.caracteresTotaux}
                    prefix={<BarChartOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={12} lg={6}>
                <Card>
                  <Statistic
                    title="Réunions avec ordres"
                    value={stats.reunionsAvecOrdres}
                    prefix={<CalendarOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={12} lg={6}>
                <Card>
                  <Statistic
                    title="Moyenne caractères"
                    value={stats.moyenneCaracteres}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: '#f59e0b' }}
                  />
                </Card>
              </Col>
            </Row>
          )}

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-4">
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => openModal()}
            >
              Ajouter un ordre du jour
            </Button>
            <Input
              placeholder="Rechercher par description, réunion ou type..."
              prefix={<SearchOutlined />}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', maxWidth: 300 }}
              allowClear
            />
          </div>

          {/* Affichage groupé par réunion */}
          <div className="w-full bg-white p-4 sm:p-6 rounded-lg shadow">
            {loading ? (
              <div className="text-center py-8">
                <Spin size="large" />
                <p className="mt-4">Chargement des ordres du jour...</p>
              </div>
            ) : Object.keys(ordresGroupesParReunion).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucun ordre du jour trouvé</p>
              </div>
            ) : (
              <Collapse 
                defaultActiveKey={Object.keys(ordresGroupesParReunion)} 
                className="ordre-collapse"
              >
                {Object.entries(ordresGroupesParReunion).map(([reunionInfo, ordres]) => {
                  const stats = getReunionStats(ordres);
                  const reunionType = ordres[0]?.reunionType;
                  
                  return (
                    <Panel 
                      header={
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <CalendarOutlined style={{ marginRight: 12, color: '#1890ff', fontSize: '16px' }} />
                            <div>
                              <span className="font-semibold text-lg">{reunionInfo}</span>
                              {reunionType && (
                                <div className="text-sm text-gray-500">
                                  <TeamOutlined style={{ marginRight: 4 }} />
                                  {reunionType}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                              {ordres.length} ordre{ordres.length > 1 ? 's' : ''}
                            </span>
                            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                              {stats.totalCaracteres} caractères
                            </span>
                          </div>
                        </div>
                      } 
                      key={reunionInfo}
                      className="mb-4"
                    >
                      <Table
                        columns={ordresColumns}
                        dataSource={ordres}
                        rowKey="id"
                        pagination={false}
                        size="middle"
                        className="ordre-table"
                        scroll={{ x: 'max-content' }}
                      />
                    </Panel>
                  );
                })}
              </Collapse>
            )}

            {/* Modal d'ajout/modification */}
            <Modal
              title={editingOrdre ? 'Modifier l\'ordre du jour' : 'Ajouter un ordre du jour'}
              open={modalVisible}
              onCancel={() => { 
                setModalVisible(false); 
                setEditingOrdre(null); 
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
                initialValues={editingOrdre ? undefined : {
                  reunionId: undefined,
                  description: ''
                }}
              >
                <Form.Item
                  name="reunionId"
                  label="Réunion"
                  rules={[{ required: true, message: 'La réunion est obligatoire' }]}
                >
                  <Select
                    placeholder="Sélectionner une réunion"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    allowClear
                    disabled={editingOrdre !== null}
                    style={{ cursor: editingOrdre === null ? 'pointer' : 'not-allowed' }}
                  >
                    {reunions.map((reunion) => {
                      const date = new Date(reunion.date);
                      const formattedDate = date.toLocaleDateString('fr-FR');
                      return (
                        <Option key={reunion.id} value={reunion.id}>
                          {`${formattedDate} - ${reunion.typeReunionLibelle || 'Réunion'}`}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="description"
                  label="Description"
                  rules={[
                    { required: true, message: 'La description est obligatoire' },
                    { max: 1000, message: 'La description ne peut pas dépasser 1000 caractères' }
                  ]}
                >
                  <Input 
                    placeholder="Description de l'ordre du jour..."
                    maxLength={1000}
                    showCount
                  />
                </Form.Item>

                <Form.Item>
                  <Space className="w-full justify-end">
                    <Button type="primary" htmlType="submit">
                      {editingOrdre ? 'Mettre à jour' : 'Ajouter'}
                    </Button>
                    <Button onClick={() => { 
                      setModalVisible(false); 
                      setEditingOrdre(null); 
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
              title="Détails de l'ordre du jour"
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
              {selectedOrdre && (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24}>
                      <Card size="small" title="Description complète">
                        <p style={{ whiteSpace: 'pre-wrap' }}>
                          <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                          {selectedOrdre.description || 'Aucune description'}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Réunion">
                        <p>
                          <CalendarOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                          {selectedOrdre.reunionInfo || 'Réunion non définie'}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Type de réunion">
                        <p>
                          <TeamOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                          {selectedOrdre.reunionType || 'Non défini'}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Nombre de caractères">
                        <p style={{ fontWeight: 'bold', color: '#f59e0b' }}>
                          <BarChartOutlined style={{ marginRight: 8 }} />
                          {selectedOrdre.description?.length || 0} caractères
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Date de la réunion">
                        <p>
                          <CalendarOutlined style={{ marginRight: 8, color: '#8c8c8c' }} />
                          {selectedOrdre.reunionDate ? new Date(selectedOrdre.reunionDate).toLocaleDateString('fr-FR') : 'Non définie'}
                        </p>
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

export default OrdreDuJourPage;                                                               



