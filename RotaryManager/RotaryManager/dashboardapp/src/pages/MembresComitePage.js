import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button, Modal, Form, message, Space, Popconfirm, Card, Row, Col, Statistic, Select, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, SearchOutlined, EyeOutlined, TeamOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { getMembresMandat, affecterMembreMandat, modifierAffectationMembre, supprimerMembreMandat, getMembresDisponibles, getFonctions } from '../api/mandatMembreService';
import Sidebar from '../components/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import '../styles/table.css';

const { Option } = Select;

const MembresComitePage = () => {
  const { clubId, mandatId } = useParams();
  const navigate = useNavigate();
  const [membres, setMembres] = useState([]);
  const [membresDisponibles, setMembresDisponibles] = useState([]);
  const [fonctions, setFonctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingMembre, setEditingMembre] = useState(null);
  const [selectedMembre, setSelectedMembre] = useState(null);
  const [form] = Form.useForm();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mandatInfo, setMandatInfo] = useState(null);
  const [statistiques, setStatistiques] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Récupérer le clubId depuis le localStorage
  const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
  const currentClubId = clubId || userInfo?.clubId;

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

  const fetchMembresMandat = useCallback(async () => {
    if (!currentClubId || !mandatId) {
      setMembres([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
      return;
    }
    setLoading(true);
    try {
      const data = await getMembresMandat(currentClubId, mandatId);
      setMembres(data.membres || []);
      setMandatInfo(data.mandat);
      setStatistiques(data.statistiques);
      setPagination(prev => ({
        ...prev,
        total: (data.membres || []).length,
        current: 1,
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des membres du mandat:', error);
      message.error("Erreur lors du chargement des membres du mandat");
      setMembres([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
    } finally {
      setLoading(false);
    }
  }, [currentClubId, mandatId]);

  const fetchMembresDisponibles = useCallback(async () => {
    if (!currentClubId || !mandatId) return;
    try {
      const data = await getMembresDisponibles(currentClubId, mandatId);
      setMembresDisponibles(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des membres disponibles:', error);
      message.error("Erreur lors du chargement des membres disponibles");
    }
  }, [currentClubId, mandatId]);

  const fetchFonctions = useCallback(async () => {
    if (!currentClubId) return;
    try {
      const data = await getFonctions(currentClubId);
      setFonctions(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des fonctions:', error);
      message.error("Erreur lors du chargement des fonctions");
    }
  }, [currentClubId]);

  useEffect(() => {
    fetchMembresMandat();
    fetchMembresDisponibles();
    fetchFonctions();
  }, [fetchMembresMandat, fetchMembresDisponibles, fetchFonctions]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Filtrage des membres selon le champ de recherche
  const filteredMembres = membres.filter(membre => {
    return (
      (membre.nomCompletMembre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (membre.emailMembre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (membre.nomFonction || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const openModal = (record = null) => {
    setEditingMembre(record);
    setModalVisible(true);
    if (record) {
      form.setFieldsValue({
        membreId: record.membreId,
        fonctionId: record.fonctionId,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ 
        membreId: '',
        fonctionId: ''
      });
    }
  };

  const openDetailModal = async (record) => {
    try {
      setSelectedMembre(record);
      setDetailModalVisible(true);
    } catch (error) {
      message.error("Erreur lors du chargement des détails");
    }
  };

  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedMembre(null);
  };

  const handleDelete = async (id) => {
    try {
      await supprimerMembreMandat(currentClubId, mandatId, id);
      message.success('Membre retiré du mandat');
      fetchMembresMandat();
      fetchMembresDisponibles();
    } catch (error) {
      message.error("Erreur lors de la suppression: " + (error.message || "Erreur inconnue"));
    }
  };

  const handleSubmit = async (values) => {
    if (!currentClubId || !mandatId) {
      message.error("Erreur d'authentification.");
      return;
    }
    try {
      if (editingMembre) {
        const modificationData = {
          fonctionId: values.fonctionId
        };
        await modifierAffectationMembre(currentClubId, mandatId, editingMembre.id, modificationData);
        message.success('Fonction modifiée avec succès');
      } else {
        const affectationData = {
          membreId: values.membreId,
          fonctionId: values.fonctionId
        };
        await affecterMembreMandat(currentClubId, mandatId, affectationData);
        message.success('Membre affecté au mandat avec succès');
      }
      setModalVisible(false);
      setEditingMembre(null);
      form.resetFields();
      fetchMembresMandat();
      fetchMembresDisponibles();
    } catch (error) {
      message.error(error.message || "Erreur lors de l'enregistrement");
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
      title: 'Membre',
      dataIndex: 'nomCompletMembre',
      key: 'nomCompletMembre',
      render: (text, record) => (
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
            record.isActiveMembre ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}>
            <UserOutlined />
          </div>
          <div>
            <div className="font-medium text-gray-900">{text}</div>
            <div className="text-sm text-gray-500">{record.emailMembre}</div>
            <div className="text-xs text-gray-400">ID: {record.membreId}</div>
          </div>
        </div>
      ),
      sorter: (a, b) => (a.nomCompletMembre || '').localeCompare(b.nomCompletMembre || ''),
      width: '40%',
    },
    {
      title: 'Fonction',
      dataIndex: 'nomFonction',
      key: 'nomFonction',
      render: (fonction, record) => (
        <div>
          <div className="flex items-center">
            <TeamOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            <span className="font-medium">{fonction || 'Non définie'}</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Fonction ID: {record.fonctionId}
          </div>
        </div>
      ),
      sorter: (a, b) => (a.nomFonction || '').localeCompare(b.nomFonction || ''),
      width: '25%',
    },
    {
      title: 'Statut Membre',
      dataIndex: 'isActiveMembre',
      key: 'isActiveMembre',
      render: (isActive) => (
        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
          isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isActive ? 'Actif' : 'Inactif'}
        </span>
      ),
      filters: [
        { text: 'Actif', value: true },
        { text: 'Inactif', value: false },
      ],
      onFilter: (value, record) => record.isActiveMembre === value,
      width: '15%',
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
            size="small"
          />
          <Button 
            icon={<EditOutlined />} 
            onClick={() => openModal(record)} 
            title="Modifier la fonction"
            size="small"
          />
          <Popconfirm 
            title="Retirer ce membre du mandat ?" 
            onConfirm={() => handleDelete(record.id)} 
            okText="Oui" 
            cancelText="Non"
            placement="left"
          >
            <Button 
              icon={<DeleteOutlined />} 
              danger 
              size="small"
              title="Retirer du mandat"
            />
          </Popconfirm>
        </Space>
      ),
      width: '20%',
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
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                    Membres du Mandat
                  </h1>
                  {mandatInfo && (
                    <p className="text-gray-600 mt-1">
                      Mandat {mandatInfo.annee} - {mandatInfo.description}
                    </p>
                  )}
                </div>
              </div>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/mandats')}
                className="flex items-center"
              >
                Retour aux mandats
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-full">
          {/* Statistiques */}
          {statistiques && (
            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card>
                  <Statistic
                    title="Total membres"
                    value={statistiques.totalMembres}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card>
                  <Statistic
                    title="Membres actifs"
                    value={statistiques.membresActifs}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card>
                  <Statistic
                    title="Membres inactifs"
                    value={statistiques.membresInactifs}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card>
                  <Statistic
                    title="Fonctions distinctes"
                    value={statistiques.fonctionsDistinctes}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: '#1890ff' }}
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
              Affecter un membre
            </Button>
            <Input
              placeholder="Rechercher par nom, email ou fonction..."
              prefix={<SearchOutlined />}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', maxWidth: 300 }}
              allowClear
            />
          </div>

          <div className="w-full bg-white p-4 sm:p-6 rounded-lg shadow">
            <Table
              columns={columns}
              dataSource={filteredMembres}
              rowKey="id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: filteredMembres.length,
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
              title={editingMembre ? 'Modifier la fonction du membre' : 'Affecter un membre au mandat'}
              open={modalVisible}
              onCancel={() => { 
                setModalVisible(false); 
                setEditingMembre(null); 
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
                initialValues={editingMembre ? undefined : {
                  membreId: '',
                  fonctionId: ''
                }}
              >
                {!editingMembre && (
                  <Form.Item
                    name="membreId"
                    label="Membre à affecter"
                    rules={[{ required: true, message: 'Veuillez sélectionner un membre' }]}
                    extra="ComiteMembre.MembreId (string, Required) - Relation avec ApplicationUser (virtual)"
                  >
                    <Select
                      placeholder="Sélectionner un membre"
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      size="large"
                    >
                      {membresDisponibles.map((membre) => (
                        <Option key={membre.membreId} value={membre.membreId}>
                          <div>
                            <div>{membre.nomComplet}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {membre.email} • MembreId: {membre.membreId}
                            </div>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                )}

                {editingMembre && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center">
                      <UserOutlined className="text-blue-600 mr-2" />
                      <div>
                        <div className="font-medium text-blue-800">
                          {editingMembre.nomCompletMembre}
                        </div>
                        <div className="text-sm text-blue-600">
                          {editingMembre.emailMembre} • MembreId: {editingMembre.membreId}
                        </div>
                        <div className="text-xs text-blue-500">
                          ComiteMembre.MembreId: {editingMembre.membreId}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Form.Item
                  name="fonctionId"
                  label="Fonction dans le mandat"
                  rules={[{ required: true, message: 'Veuillez sélectionner une fonction' }]}
                  extra="ComiteMembre.FonctionId (Guid, Required) - Relation avec Fonction (virtual)"
                >
                  <Select
                    placeholder="Sélectionner une fonction"
                    showSearch
                    optionFilterProp="children"
                    size="large"
                    allowClear={editingMembre}
                  >
                    {fonctions.map((fonction) => (
                      <Option key={fonction.fonctionId} value={fonction.fonctionId}>
                        <div>
                          <div>{fonction.nomFonction}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            FonctionId: {fonction.fonctionId}
                          </div>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <div className="bg-gray-50 p-4 rounded-lg border mb-4">
                  <div className="text-gray-600">
                    <div className="flex items-center mb-2">
                      <TeamOutlined className="mr-2" />
                      <span className="text-sm font-medium">
                        {editingMembre ? 'Modification selon le modèle ComiteMembre :' : 'Création selon le modèle ComiteMembre :'}
                      </span>
                    </div>
                    {editingMembre ? (
                      <div className="text-xs font-mono bg-white p-2 rounded border">
                        <div className="font-medium text-purple-600 mb-1">ComiteMembre :</div>
                        <div>• Id: Guid = {editingMembre.id}</div>
                        <div>• MembreId: string [Required] = "{editingMembre.membreId}"</div>
                        <div>• MandatId: Guid = {mandatId}</div>
                        <div>• FonctionId: Guid [Required] = {form.getFieldValue('fonctionId') || 'null'}</div>
                        <div className="mt-2 text-gray-500">
                          Note: Seule la fonction peut être modifiée, MembreId et MandatId restent fixes<br/>
                          Relations:<br/>
                          • Membre: ApplicationUser (Navigation Property)<br/>
                          • Mandat: Mandat (Navigation Property)<br/>
                          • Fonction: Fonction (Navigation Property)
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs font-mono bg-white p-2 rounded border">
                        <div className="font-medium text-green-600 mb-1">ComiteMembre :</div>
                        <div>• Id: Guid (généré automatiquement)</div>
                        <div>• MembreId: string [Required] = "{form.getFieldValue('membreId') || ''}"</div>
                        <div>• MandatId: Guid = {mandatId}</div>
                        <div>• FonctionId: Guid [Required] = {form.getFieldValue('fonctionId') || 'null'}</div>
                        <div className="mt-2 text-gray-500">
                          Navigation Properties:<br/>
                          • Membre: ApplicationUser (virtual)<br/>
                          • Mandat: Mandat (virtual)<br/>
                          • Fonction: Fonction (virtual)
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Form.Item>
                  <Space className="w-full justify-end">
                    <Button type="primary" htmlType="submit" size="large">
                      {editingMembre ? 'Modifier la fonction' : 'Affecter au mandat'}
                    </Button>
                    <Button 
                      onClick={() => { 
                        setModalVisible(false); 
                        setEditingMembre(null); 
                        form.resetFields(); 
                      }}
                      size="large"
                    >
                      Annuler
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Modal>

            {/* Modal de détails */}
            <Modal
              title="Détails de l'affectation ComiteMembre"
              open={detailModalVisible}
              onCancel={closeDetailModal}
              footer={[
                <Button key="close" onClick={closeDetailModal} size="large">
                  Fermer
                </Button>
              ]}
              width={isMobile ? '95%' : 700}
              centered={isMobile}
            >
              {selectedMembre && (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="ID ComiteMembre" className="h-full">
                        <p style={{ fontWeight: 'bold', color: '#722ed1', fontFamily: 'monospace' }}>
                          {selectedMembre.id}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Identifiant unique de l'affectation
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="MembreId (string)" className="h-full">
                        <p style={{ fontWeight: 'bold', color: '#1890ff', fontFamily: 'monospace' }}>
                          "{selectedMembre.membreId}"
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          ComiteMembreDetailDto.MembreId<br/>
                          Référence vers ApplicationUser
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="NomCompletMembre (string)" className="h-full">
                        <p style={{ fontWeight: 'bold', color: '#1890ff' }}>
                          <UserOutlined style={{ marginRight: 8 }} />
                          {selectedMembre.nomCompletMembre}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          EmailMembre: {selectedMembre.emailMembre}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          ComiteMembreDetailDto.NomCompletMembre<br/>
                          Calculé: FirstName + " " + LastName
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="FonctionId (Guid)" className="h-full">
                        <p style={{ fontWeight: 'bold', color: '#52c41a', fontFamily: 'monospace' }}>
                          {selectedMembre.fonctionId}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          ComiteMembreDetailDto.FonctionId<br/>
                          Référence vers Fonction
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="NomFonction (string)" className="h-full">
                        <p style={{ fontWeight: 'bold', color: '#1890ff' }}>
                          <TeamOutlined style={{ marginRight: 8 }} />
                          {selectedMembre.nomFonction}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          ComiteMembreDetailDto.NomFonction<br/>
                          Valeur de Fonction.NomFonction
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="IsActiveMembre (bool)" className="h-full">
                        <p style={{ 
                          fontWeight: 'bold', 
                          color: selectedMembre.isActiveMembre ? '#52c41a' : '#ff4d4f'
                        }}>
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            selectedMembre.isActiveMembre ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {selectedMembre.isActiveMembre ? 'true' : 'false'}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          ComiteMembreDetailDto.IsActiveMembre<br/>
                          Valeur de ApplicationUser.IsActive
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Id (Guid)" className="h-full">
                        <p style={{ fontWeight: 'bold', color: '#722ed1', fontFamily: 'monospace' }}>
                          {selectedMembre.id}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          ComiteMembreDetailDto.Id<br/>
                          Identifiant unique de l'affectation ComiteMembre
                        </p>
                      </Card>
                    </Col>

                    {mandatInfo && (
                      <Col xs={24}>
                        <Card size="small" title="Mandat associé (MandatId)" className="h-full">
                          <div className="flex items-center">
                            <div className="mr-4">
                              <div className="font-medium">Mandat {mandatInfo.annee}</div>
                              <div className="text-sm text-gray-600">{mandatInfo.description}</div>
                              <div className="text-xs font-mono text-gray-400 mt-1">
                                MandatId: {mandatInfo.id}
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            ComiteMembre.MandatId référence vers cette entité Mandat
                          </p>
                        </Card>
                      </Col>
                    )}
                  </Row>
                  
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Mapping DTOs vers Entité ComiteMembre :</h4>
                    <div className="text-xs text-blue-600 font-mono">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <div className="font-medium">ComiteMembreDetailDto :</div>
                          <div>• Id: Guid = {selectedMembre.id}</div>
                          <div>• MembreId: string = "{selectedMembre.membreId}"</div>
                          <div>• NomCompletMembre: string = "{selectedMembre.nomCompletMembre}"</div>
                          <div>• EmailMembre: string = "{selectedMembre.emailMembre}"</div>
                          <div>• IsActiveMembre: bool = {selectedMembre.isActiveMembre.toString()}</div>
                          <div>• FonctionId: Guid = {selectedMembre.fonctionId}</div>
                          <div>• NomFonction: string = "{selectedMembre.nomFonction}"</div>
                        </div>
                        <div>
                          <div className="font-medium">Entité ComiteMembre :</div>
                          <div>• Id: Guid ✓</div>
                          <div>• MembreId: string [Required] ✓</div>
                          <div>• MandatId: Guid = {mandatInfo?.id}</div>
                          <div>• FonctionId: Guid [Required] ✓</div>
                          <div className="mt-2 text-gray-600">
                            Navigation Properties:<br/>
                            • Membre: ApplicationUser (virtual)<br/>
                            • Mandat: Mandat (virtual)<br/>
                            • Fonction: Fonction (virtual)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Modal>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MembresComitePage; 