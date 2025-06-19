import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Card, Row, Col, Statistic, Select, Spin, Collapse } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, FileTextOutlined, EyeOutlined, CrownOutlined, UserOutlined } from '@ant-design/icons';
import { fonctionRolesResponsabilitesService } from '../api/fonctionRolesResponsabilitesService';
import { fonctionService } from '../api/fonctionService';
import Sidebar from '../components/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useParams, Link, useNavigate } from 'react-router-dom';
import '../styles/table.css';

const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

const FonctionRolesResponsabilitesPage = () => {
  const [rolesResponsabilites, setRolesResponsabilites] = useState([]);
  const [fonctions, setFonctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingRole, setViewingRole] = useState(null);
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
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Rafraîchir le cache des fonctions
      await fonctionRolesResponsabilitesService.refreshFonctionsCache();
      // Charger les rôles et responsabilités
      const data = await fonctionRolesResponsabilitesService.getRolesResponsabilites();
      setRolesResponsabilites(data);
      setPagination(prev => ({
        ...prev,
        total: data.length,
        current: 1,
      }));
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Erreur lors du chargement des données');
      setRolesResponsabilites([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFonctions = useCallback(async () => {
    try {
      const data = await fonctionService.getFonctions();
      setFonctions(data);
    } catch (error) {
      console.error('Erreur lors du chargement des fonctions:', error);
      message.error("Erreur lors du chargement des fonctions");
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
    fetchData();
    fetchFonctions();
  }, [fetchData, fetchFonctions]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Filtrage des rôles selon le champ de recherche
  const filteredRoles = rolesResponsabilites.filter(r => {
    return (
      (r.libelle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.fonctionNom || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Grouper les rôles par fonction
  const rolesGroupesParFonction = filteredRoles.reduce((acc, role) => {
    const fonctionNom = role.fonctionNom || 'Fonction non définie';
    if (!acc[fonctionNom]) {
      acc[fonctionNom] = [];
    }
    acc[fonctionNom].push(role);
    return acc;
  }, {});

  // Statistiques calculées à partir des rôles filtrés
  const totalRoles = filteredRoles.length;
  const nombreFonctions = new Set(filteredRoles.map(r => r.fonctionId)).size;

  // Colonnes pour le tableau des rôles dans chaque fonction
  const rolesColumns = [
    {
      title: 'Rôle',
      key: 'role',
      width: 250,
      render: (_, record) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-blue-100 text-blue-600">
            <FileTextOutlined />
          </div>
          <div style={{ maxWidth: 200 }}>
            <div className="font-medium text-gray-900 ellipsis-cell" style={{ maxWidth: 200 }} title={record.libelle}>
              {record.libelle}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Description',
      key: 'description',
      width: 300,
      render: (_, record) => (
        <span className="ellipsis-cell" style={{ maxWidth: 280 }} title={record.description || 'Aucune description'}>
          {record.description || 'Aucune description'}
        </span>
      ),
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
          <Button 
            icon={<EditOutlined />} 
            onClick={() => openModal(record)} 
            title="Modifier"
          />
          <Popconfirm 
            title="Supprimer ce rôle/responsabilité ?" 
            onConfirm={() => handleDelete(record.id, record.fonctionId)} 
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
    setEditingRole(record);
    setModalVisible(true);
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
  };

  const openViewModal = (record) => {
    setViewingRole(record);
    setViewModalVisible(true);
  };

  const closeViewModal = () => {
    setViewModalVisible(false);
    setViewingRole(null);
  };

  const handleDelete = async (id, fonctionId) => {
    try {
      await fonctionRolesResponsabilitesService.deleteRoleResponsabilite(fonctionId, id);
      message.success('Rôle et responsabilité supprimés avec succès');
      // Rafraîchir les données
      fetchData();
    } catch (error) {
      console.error('Error deleting role and responsibility:', error);
      message.error('Erreur lors de la suppression: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingRole) {
        await fonctionRolesResponsabilitesService.updateRoleResponsabilite(
          values.fonctionId,
          editingRole.id,
          values
        );
        message.success('Rôle/responsabilité modifié');
      } else {
        await fonctionRolesResponsabilitesService.createRoleResponsabilite(values);
        message.success('Rôle/responsabilité ajouté');
      }
      setModalVisible(false);
      setEditingRole(null);
      form.resetFields();
      // Recharger les données après modification
      fetchData();
    } catch (error) {
      console.error('Error saving:', error);
      message.error(error.response?.data?.message || error.message || "Erreur lors de l'enregistrement");
    }
  };

  const handleToggleCollapse = useCallback((collapsed) => {
    setIsCollapsed(collapsed);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Largeur dynamique selon l'état du sidebar - MISE À JOUR pour 18rem
  const sidebarWidth = isCollapsed ? '4rem' : '18rem';

  // Calculer le nombre de rôles pour une fonction spécifique
  const getFonctionStats = (roles) => {
    return { count: roles.length };
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
                  Rôles et Responsabilités
                </h1>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-full">
          {/* Statistiques principales */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Total des rôles"
                  value={totalRoles}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Fonctions concernées"
                  value={nombreFonctions}
                  prefix={<CrownOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
          </Row>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-4">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              Ajouter un rôle/responsabilité
            </Button>
            <Input
              placeholder="Rechercher par libellé, description ou fonction..."
              prefix={<SearchOutlined />}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', maxWidth: 400 }}
              allowClear
            />
          </div>

          {/* Affichage groupé par fonction */}
          <div className="w-full bg-white p-4 sm:p-6 rounded-lg shadow">
            {loading ? (
              <div className="text-center py-8">
                <Spin size="large" />
                <p className="mt-4">Chargement des rôles et responsabilités...</p>
              </div>
            ) : Object.keys(rolesGroupesParFonction).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucun rôle/responsabilité trouvé</p>
              </div>
            ) : (
              <Collapse 
                defaultActiveKey={Object.keys(rolesGroupesParFonction)} 
                className="role-collapse"
              >
                {Object.entries(rolesGroupesParFonction).map(([fonctionNom, roles]) => {
                  const stats = getFonctionStats(roles);
                  
                  return (
                    <Panel 
                      header={
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <CrownOutlined style={{ marginRight: 12, color: '#1890ff', fontSize: '16px' }} />
                            <span className="font-semibold text-lg">{fonctionNom}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                              {roles.length} rôle{roles.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      } 
                      key={fonctionNom}
                      className="mb-4"
                    >
                      <Table
                        columns={rolesColumns}
                        dataSource={roles}
                        rowKey="id"
                        pagination={false}
                        size="middle"
                        className="role-table"
                        scroll={{ x: 'max-content' }}
                      />
                    </Panel>
                  );
                })}
              </Collapse>
            )}

            {/* Modal d'ajout/modification */}
            <Modal
              title={editingRole ? 'Modifier le rôle/responsabilité' : 'Ajouter un rôle/responsabilité'}
              open={modalVisible}
              onCancel={() => { setModalVisible(false); setEditingRole(null); form.resetFields(); }}
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
                  name="fonctionId"
                  label="Fonction"
                  rules={[{ required: true, message: 'La fonction est obligatoire' }]}
                >
                  <Select
                    placeholder="Sélectionner une fonction"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    disabled={!!editingRole}
                  >
                    {fonctions.map(f => (
                      <Option key={f.id} value={f.id}>
                        {f.nomFonction}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="libelle"
                  label="Libellé"
                  rules={[
                    { required: true, message: 'Le libellé est obligatoire' },
                    { max: 200, message: 'Le libellé ne peut pas dépasser 200 caractères' }
                  ]}
                >
                  <Input prefix={<FileTextOutlined />} />
                </Form.Item>
                <Form.Item
                  name="description"
                  label="Description"
                  rules={[
                    { max: 1000, message: 'La description ne peut pas dépasser 1000 caractères' }
                  ]}
                >
                  <TextArea 
                    rows={4} 
                    placeholder="Décrivez les responsabilités et tâches associées à ce rôle..."
                  />
                </Form.Item>
                <Form.Item>
                  <Space className="w-full justify-end">
                    <Button type="primary" htmlType="submit">
                      {editingRole ? 'Mettre à jour' : 'Ajouter'}
                    </Button>
                    <Button onClick={() => { setModalVisible(false); setEditingRole(null); form.resetFields(); }}>
                      Annuler
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Modal>

            {/* Modal de détails/visualisation */}
            <Modal
              title="Détails du rôle et responsabilité"
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
              {viewingRole && (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Fonction">
                        <p>
                          <CrownOutlined style={{ marginRight: 8, color: '#f59e0b' }} />
                          {viewingRole.fonctionNom || 'Fonction inconnue'}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Libellé">
                        <p style={{ fontWeight: 'bold', color: '#1890ff' }}>
                          <FileTextOutlined style={{ marginRight: 8 }} />
                          {viewingRole.libelle}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24}>
                      <Card size="small" title="Description">
                        <p>{viewingRole.description || 'Aucune description fournie'}</p>
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

export default FonctionRolesResponsabilitesPage;