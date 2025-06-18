import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Card, Row, Col, Statistic, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BankOutlined, SearchOutlined, EyeOutlined, CalendarOutlined, TeamOutlined, CrownOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { getComites, createComite, updateComite, deleteComite } from '../api/comiteService';
import { getMandats } from '../api/mandatService';
import Sidebar from '../components/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import '../styles/table.css';

const { Option } = Select;

const ComitesPage = () => {
  const [comites, setComites] = useState([]);
  const [mandats, setMandats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingComite, setEditingComite] = useState(null);
  const [selectedComite, setSelectedComite] = useState(null);
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
  const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
  const clubId = userInfo?.clubId;

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
      setComites([]);
      setMandats([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
      return;
    }
    setLoading(true);
    try {
      const [comitesData, mandatsData] = await Promise.all([
        getComites(clubId),
        getMandats(clubId)
      ]);
      
      console.log('=== Données des mandats reçues ===');
      console.log('Mandats bruts:', mandatsData);
      if (mandatsData && mandatsData.length > 0) {
        console.log('Premier mandat:', mandatsData[0]);
        console.log('Date de début:', mandatsData[0].dateDebut);
        console.log('Date de fin:', mandatsData[0].dateFin);
      }
      
      setComites(comitesData || []);
      setMandats(mandatsData || []);
      setPagination(prev => ({
        ...prev,
        total: (comitesData || []).length,
        current: 1,
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      message.error("Erreur lors du chargement des données");
      setComites([]);
      setMandats([]);
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

  // Filtrage des comités selon le champ de recherche
  const filteredComites = comites.filter(comite => {
    return (
      (comite.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (comite.mandatAnnee || '').toString().includes(searchTerm) ||
      (comite.mandatPeriodeComplete || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Statistiques calculées à partir des comités filtrés
  const totalComites = filteredComites.length;
  const comitesAvecMandat = filteredComites.filter(c => c.mandatId).length;
  const mandatsActuels = mandats.filter(m => m.estActuel).length;
  const pourcentageAvecMandat = totalComites > 0 ? ((comitesAvecMandat / totalComites) * 100).toFixed(1) : 0;

  const openModal = (record = null) => {
    setEditingComite(record);
    setModalVisible(true);
    if (record) {
      form.setFieldsValue({
        nom: record.nom,
        mandatId: record.mandatId,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ 
        nom: '',
        mandatId: undefined
      });
    }
  };

  const openDetailModal = async (record) => {
    try {
      setSelectedComite(record);
      setDetailModalVisible(true);
    } catch (error) {
      message.error("Erreur lors du chargement des détails");
    }
  };

  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedComite(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteComite(clubId, id);
      message.success('Comité supprimé');
      fetchData();
    } catch (error) {
      message.error("Erreur lors de la suppression: " + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmit = async (values) => {
    if (!clubId) {
      message.error("Erreur d'authentification.");
      return;
    }
    try {
      const comiteData = {
        nom: values.nom,
        mandatId: values.mandatId
      };

      if (editingComite) {
        await updateComite(clubId, editingComite.id, comiteData);
        message.success('Comité modifié');
      } else {
        await createComite(clubId, comiteData);
        message.success('Comité créé');
      }
      setModalVisible(false);
      setEditingComite(null);
      form.resetFields();
      fetchData();
    } catch (error) {
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

  const getMandatLabel = (mandatId) => {
    const mandat = mandats.find(m => m.id === mandatId);
    if (!mandat) return 'Mandat non trouvé';
    return `${mandat.annee} (${new Date(mandat.dateDebut).toLocaleDateString()} - ${new Date(mandat.dateFin).toLocaleDateString()})`;
  };

  const columns = [
    {
      title: 'Comité',
      key: 'comite',
      render: (_, record) => (
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
            <BankOutlined />
          </div>
          <div>
            <div className="font-medium text-gray-900">{record.nom || 'Comité sans nom'}</div>
          </div>
        </div>
      ),
      sorter: (a, b) => (a.nom || '').localeCompare(b.nom || ''),
    },
    {
      title: 'Mandat',
      key: 'mandat',
      render: (_, record) => (
        <span>
          <CalendarOutlined style={{ marginRight: 8, color: '#52c41a' }} />
          {record.mandatAnnee || 'Non défini'}
        </span>
      ),
      sorter: (a, b) => (a.mandatAnnee || 0) - (b.mandatAnnee || 0),
    },
    {
      title: 'Période',
      key: 'periode',
      render: (_, record) => (
        <span>
          <ClockCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {record.mandatPeriodeComplete || 'Période non définie'}
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
            onClick={() => openDetailModal(record)} 
            title="Voir les détails"
          />
          <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Popconfirm 
            title="Supprimer ce comité ?" 
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
                  Gestion des Comités
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
                  title="Total comités"
                  value={totalComites}
                  prefix={<BankOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Avec mandat"
                  value={comitesAvecMandat}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Mandats actuels"
                  value={mandatsActuels}
                  prefix={<CrownOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="% Avec mandat"
                  value={pourcentageAvecMandat}
                  suffix="%"
                  prefix={<TeamOutlined />}
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
              Ajouter un comité
            </Button>
            <Input
              placeholder="Rechercher par nom, mandat ou période..."
              prefix={<SearchOutlined />}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', maxWidth: 300 }}
              allowClear
            />
          </div>

          <div className="w-full bg-white p-4 sm:p-6 rounded-lg shadow">
            <Table
              columns={columns}
              dataSource={filteredComites}
              rowKey="id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: filteredComites.length,
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
              title={editingComite ? 'Modifier le comité' : 'Ajouter un comité'}
              open={modalVisible}
              onCancel={() => { 
                setModalVisible(false); 
                setEditingComite(null); 
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
                initialValues={editingComite ? undefined : {
                  nom: '',
                  mandatId: undefined
                }}
              >
                <Form.Item
                  name="nom"
                  label="Nom du comité"
                  rules={[
                    { required: true, message: 'Le nom du comité est obligatoire' },
                    { max: 100, message: 'Le nom ne peut pas dépasser 100 caractères' }
                  ]}
                >
                  <Input 
                    placeholder="Ex: Comité exécutif, Comité technique..."
                    prefix={<BankOutlined />}
                  />
                </Form.Item>

                <Form.Item
                  name="mandatId"
                  label="Mandat"
                  rules={[{ required: true, message: 'Le mandat est obligatoire' }]}
                >
                  <Select
                    placeholder="Sélectionner un mandat"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    allowClear
                  >
                    {mandats.map((mandat) => {
                      console.log('=== Affichage du mandat ===');
                      console.log('Mandat:', mandat);
                      console.log('Date de début:', mandat.dateDebut);
                      console.log('Date de fin:', mandat.dateFin);
                      return (
                        <Option key={mandat.id} value={mandat.id}>
                          {`${mandat.annee} (du ${mandat.dateDebut ? new Date(mandat.dateDebut).toLocaleDateString() : 'N/A'} au ${mandat.dateFin ? new Date(mandat.dateFin).toLocaleDateString() : 'N/A'})`}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>

                <Form.Item>
                  <Space className="w-full justify-end">
                    <Button type="primary" htmlType="submit">
                      {editingComite ? 'Mettre à jour' : 'Créer le comité'}
                    </Button>
                    <Button onClick={() => { 
                      setModalVisible(false); 
                      setEditingComite(null); 
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
              title="Détails du comité"
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
              {selectedComite && (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Nom du comité">
                        <p style={{ fontWeight: 'bold', color: '#1890ff' }}>
                          <BankOutlined style={{ marginRight: 8 }} />
                          {selectedComite.nom || 'Nom non défini'}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Mandat">
                        <p style={{ fontWeight: 'bold', color: '#52c41a' }}>
                          <CalendarOutlined style={{ marginRight: 8 }} />
                          {selectedComite.mandatAnnee || 'Mandat non défini'}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24}>
                      <Card size="small" title="Période du mandat">
                        <p>
                          <ClockCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                          {selectedComite.mandatPeriodeComplete || 'Période non définie'}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24}>
                      <Card size="small" title="Club">
                        <p>{userInfo.clubName || 'Club'}</p>
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

export default ComitesPage;