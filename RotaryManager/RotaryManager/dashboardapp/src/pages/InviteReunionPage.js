import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Table, Button, Modal, Form, Input, message, Space, Popconfirm, 
  Card, Row, Col, Statistic, Select, DatePicker, Switch, Divider, List,
  Tabs, Upload, Tooltip, Collapse, Spin
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, UserAddOutlined, 
  SearchOutlined, EyeOutlined, UserOutlined, BankOutlined, 
  CalendarOutlined, TeamOutlined, CrownOutlined, MailOutlined, 
  PhoneOutlined, UploadOutlined, FileExcelOutlined,
  FileTextOutlined, DownloadOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import { FaBars, FaTimes } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import { 
  getInvitesReunion, ajouterInvite, modifierInvite, 
  supprimerInvite, ajouterInvitesBatch, getOrganisationsInvites 
} from '../api/inviteReunionService';
import '../styles/table.css';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const InviteReunionPage = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingInvite, setEditingInvite] = useState(null);
  const [selectedInvite, setSelectedInvite] = useState(null);
  const [form] = Form.useForm();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [organisations, setOrganisations] = useState([]);
  const [activeTab, setActiveTab] = useState('1');
  const [reunions, setReunions] = useState([]);
  const [selectedReunionId, setSelectedReunionId] = useState(null);
  const [stats, setStats] = useState({
    totalInvites: 0,
    invitesAvecEmail: 0,
    invitesAvecTelephone: 0,
    invitesAvecOrganisation: 0,
    organisationsUniques: 0
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Log au chargement initial
  useEffect(() => {
    console.log('=== PAGE CHARGÉE ===');
    console.log('Club ID:', clubId);
  }, [clubId]);

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
    const fetchReunions = async () => {
      if (!clubId) return;
      
      try {
        console.log('=== CHARGEMENT RÉUNIONS ===');
        const response = await fetch(`http://localhost:5265/api/clubs/${clubId}/reunions`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Réunions reçues:', data);
        
        if (data && Array.isArray(data)) {
          setReunions(data);
          // Si c'est la première fois qu'on charge les réunions, sélectionner la première
          if (data.length > 0 && !selectedReunionId) {
            console.log('Sélection automatique de la première réunion:', data[0].id);
            setSelectedReunionId(data[0].id);
            form.setFieldsValue({ reunionId: data[0].id });
            // Charger les invités de cette réunion
            fetchInvites(data[0].id);
          }
        } else if (data && data.reunions && Array.isArray(data.reunions)) {
          setReunions(data.reunions);
          if (data.reunions.length > 0 && !selectedReunionId) {
            console.log('Sélection automatique de la première réunion:', data.reunions[0].id);
            setSelectedReunionId(data.reunions[0].id);
            form.setFieldsValue({ reunionId: data.reunions[0].id });
            // Charger les invités de cette réunion
            fetchInvites(data.reunions[0].id);
          }
        } else {
          console.error('Format de données inattendu:', data);
          message.error('Format de données inattendu pour les réunions');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des réunions:', error);
        message.error(error.message);
      }
    };

    fetchReunions();
  }, [clubId, form, selectedReunionId]);

  const fetchInvites = async (reunionId) => {
    if (!clubId || !reunionId) return;
    
    console.log('=== CHARGEMENT INVITÉS ===');
    console.log('Club ID:', clubId);
    console.log('Réunion ID:', reunionId);
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5265/api/clubs/${clubId}/reunions/${reunionId}/invites`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Données invités reçues:', data);

      if (data && data.invites) {
        setInvites(data.invites);
        setPagination(prev => ({
          ...prev,
          total: data.invites.length
        }));

        if (data.statistiques) {
          setStats({
            totalInvites: data.statistiques.totalInvites,
            invitesAvecEmail: data.statistiques.avecEmail,
            invitesAvecTelephone: data.statistiques.avecTelephone,
            invitesAvecOrganisation: data.statistiques.avecOrganisation,
            organisationsUniques: data.statistiques.organisationsUniques
          });
        }

        // Mettre à jour les informations de la réunion si nécessaire
        if (data.reunion) {
          console.log('Informations de la réunion:', data.reunion);
        }
      } else {
        console.error('Format de données inattendu:', data);
        message.error('Format de données inattendu pour les invités');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des invités:', error);
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    console.log('=== DÉBUT SOUMISSION ===');
    console.log('Valeurs:', values);
    
    try {
      const reunionId = values.reunionId;
      console.log('Réunion ID:', reunionId);
      
      if (!reunionId) {
        message.error('Veuillez sélectionner une réunion');
        return;
      }

      if (editingInvite) {
        console.log('Modification invité:', editingInvite.id);
        const response = await modifierInvite(clubId, reunionId, editingInvite.id, values);
        console.log('Réponse modification:', response);
        message.success('Invité modifié avec succès');
      } else {
        console.log('Ajout nouvel invité');
        const response = await ajouterInvite(clubId, reunionId, values);
        console.log('Réponse ajout:', response);
        message.success('Invité ajouté avec succès');
      }

      setModalVisible(false);
      setEditingInvite(null);
      form.resetFields();

      // Recharger les invités
      await fetchInvites(reunionId);
      
      console.log('=== FIN SOUMISSION ===');
    } catch (error) {
      console.error('=== ERREUR SOUMISSION ===');
      console.error('Erreur:', error);
      console.error('Détails:', error.response?.data);
      message.error(error.message);
    }
  };

  const handleDelete = async (inviteId) => {
    try {
      if (!selectedReunionId) {
        message.error('Veuillez sélectionner une réunion');
        return;
      }

      await supprimerInvite(clubId, selectedReunionId, inviteId);
      message.success('Invité supprimé avec succès');

      // Recharger les invités
      await fetchInvites(selectedReunionId);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      message.error(error.message);
    }
  };

  const handleBatchUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      // Implémenter la logique d'upload en lot
      message.success('Fichier uploadé avec succès');
      fetchInvites(selectedReunionId);
    } catch (error) {
      message.error(error.message);
    }
  };

  // Filtrage des invités selon le champ de recherche
  const filteredInvites = invites.filter(invite => {
    return (
      (invite.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invite.prenom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invite.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invite.organisation || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Grouper les invités par réunion
  const invitesGroupesParReunion = filteredInvites.reduce((acc, invite) => {
    const reunion = reunions.find(r => r.id === invite.reunionId);
    const reunionKey = reunion 
      ? `${new Date(reunion.date).toLocaleDateString('fr-FR')} - ${reunion.typeReunionLibelle || 'Réunion'}`
      : 'Réunion non définie';
    
    if (!acc[reunionKey]) {
      acc[reunionKey] = [];
    }
    acc[reunionKey].push(invite);
    return acc;
  }, {});

  // Statistiques calculées à partir des invités filtrés
  const totalInvites = filteredInvites.length;
  const invitesAvecEmail = filteredInvites.filter(i => i.email).length;
  const invitesAvecTelephone = filteredInvites.filter(i => i.telephone).length;
  const invitesAvecOrganisation = filteredInvites.filter(i => i.organisation).length;

  // Colonnes pour le tableau des invités dans chaque réunion
  const invitesColumns = [
    {
      title: 'Invité',
      key: 'invite',
      width: 200,
      render: (_, record) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-blue-100 text-blue-600">
            <UserOutlined />
          </div>
          <div style={{ maxWidth: 150 }}>
            <div className="font-medium text-gray-900 ellipsis-cell" style={{ maxWidth: 150 }} title={`${record.prenom} ${record.nom}`}>
              {`${record.prenom} ${record.nom}`}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Organisation',
      key: 'organisation',
      width: 200,
      render: (_, record) => (
        <div className="flex items-center">
          <BankOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          <span className="ellipsis-cell" style={{ maxWidth: 150 }} title={record.organisation || 'Non spécifiée'}>
            {record.organisation || 'Non spécifiée'}
          </span>
        </div>
      ),
    },
    {
      title: 'Email',
      key: 'email',
      width: 200,
      render: (_, record) => (
        <div className="flex items-center">
          <MailOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          <span className="ellipsis-cell" style={{ maxWidth: 150 }} title={record.email || 'Non spécifié'}>
            {record.email || 'Non spécifié'}
          </span>
        </div>
      ),
    },
    {
      title: 'Téléphone',
      key: 'telephone',
      width: 150,
      render: (_, record) => (
        <div className="flex items-center">
          <PhoneOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          <span className="ellipsis-cell" style={{ maxWidth: 100 }} title={record.telephone || 'Non spécifié'}>
            {record.telephone || 'Non spécifié'}
          </span>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => {
              setSelectedInvite(record);
              setDetailModalVisible(true);
            }}
            title="Voir les détails"
          />
          <Button 
            icon={<EditOutlined />} 
            onClick={() => {
              setEditingInvite(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
            title="Modifier"
          />
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer cet invité ?"
            onConfirm={() => handleDelete(record.id)}
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

  const handleToggleCollapse = useCallback((collapsed) => {
    setIsCollapsed(collapsed);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const sidebarWidth = isCollapsed ? '4rem' : '18rem';

  const handleReunionChange = (value) => {
    console.log('=== CHANGEMENT RÉUNION ===');
    console.log('Nouvelle réunion:', value);
    if (value) {
      setSelectedReunionId(value);
      fetchInvites(value);
    }
  };

  // Corriger l'avertissement du formulaire
  useEffect(() => {
    if (form && !form.getFieldValue('reunionId') && reunions.length > 0) {
      form.setFieldsValue({ reunionId: reunions[0].id });
    }
  }, [form, reunions]);

  // Calculer les statistiques pour une réunion spécifique
  const getReunionStats = (invites) => {
    const avecEmail = invites.filter(i => i.email).length;
    const avecTelephone = invites.filter(i => i.telephone).length;
    const avecOrganisation = invites.filter(i => i.organisation).length;
    return { avecEmail, avecTelephone, avecOrganisation, total: invites.length };
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
                  Gestion des Invitations
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
                  title="Total invités"
                  value={totalInvites}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Avec email"
                  value={invitesAvecEmail}
                  prefix={<MailOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Avec téléphone"
                  value={invitesAvecTelephone}
                  prefix={<PhoneOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Avec organisation"
                  value={invitesAvecOrganisation}
                  prefix={<BankOutlined />}
                  valueStyle={{ color: '#f59e0b' }}
                />
              </Card>
            </Col>
          </Row>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-4">
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => {
                setEditingInvite(null);
                form.resetFields();
                setModalVisible(true);
              }}
            >
              Ajouter un invité
            </Button>
            <Input
              placeholder="Rechercher par nom, email, organisation..."
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
                <p className="mt-4">Chargement des invitations...</p>
              </div>
            ) : Object.keys(invitesGroupesParReunion).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucune invitation trouvée</p>
              </div>
            ) : (
              <Collapse 
                defaultActiveKey={Object.keys(invitesGroupesParReunion)} 
                className="invite-collapse"
              >
                {Object.entries(invitesGroupesParReunion).map(([reunionInfo, invites]) => {
                  const stats = getReunionStats(invites);
                  const reunion = reunions.find(r => 
                    invites.length > 0 && r.id === invites[0].reunionId
                  );
                  
                  return (
                    <Panel 
                      header={
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <CalendarOutlined style={{ marginRight: 12, color: '#1890ff', fontSize: '16px' }} />
                            <div>
                              <span className="font-semibold text-lg">{reunionInfo}</span>
                              {reunion && reunion.heure && (
                                <div className="text-sm text-gray-500">
                                  <TeamOutlined style={{ marginRight: 4 }} />
                                  {reunion.heure.substring(0,5)}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                              {invites.length} invité{invites.length > 1 ? 's' : ''}
                            </span>
                            {stats.avecEmail > 0 && (
                              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                {stats.avecEmail} email{stats.avecEmail > 1 ? 's' : ''}
                              </span>
                            )}
                            {stats.avecTelephone > 0 && (
                              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                                {stats.avecTelephone} tél.
                              </span>
                            )}
                          </div>
                        </div>
                      } 
                      key={reunionInfo}
                      className="mb-4"
                    >
                      <Table
                        columns={invitesColumns}
                        dataSource={invites}
                        rowKey="id"
                        pagination={false}
                        size="middle"
                        className="invite-table"
                        scroll={{ x: 'max-content' }}
                      />
                    </Panel>
                  );
                })}
              </Collapse>
            )}
          </div>

          {/* Modal d'ajout/modification d'invité */}
          <Modal
            title={editingInvite ? "Modifier l'invité" : "Ajouter un invité"}
            open={modalVisible}
            onCancel={() => {
              setModalVisible(false);
              setEditingInvite(null);
              form.resetFields();
            }}
            footer={null}
            destroyOnClose
            width={isMobile ? '95%' : 700}
            centered={isMobile}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="prenom"
                    label="Prénom"
                    rules={[
                      { required: true, message: 'Veuillez saisir le prénom' },
                      { min: 2, message: 'Le prénom doit contenir au moins 2 caractères' }
                    ]}
                  >
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="nom"
                    label="Nom"
                    rules={[
                      { required: true, message: 'Veuillez saisir le nom' },
                      { min: 2, message: 'Le nom doit contenir au moins 2 caractères' }
                    ]}
                  >
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { type: 'email', message: 'Format d\'email invalide' }
                    ]}
                  >
                    <Input prefix={<MailOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="telephone"
                    label="Téléphone"
                    rules={[
                      { pattern: /^[0-9+\s-()]*$/, message: 'Format de téléphone invalide' }
                    ]}
                  >
                    <Input prefix={<PhoneOutlined />} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="organisation"
                    label="Organisation"
                  >
                    <Input prefix={<BankOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="reunionId"
                    label="Réunion"
                    rules={[
                      { required: true, message: 'Veuillez sélectionner une réunion' }
                    ]}
                  >
                    <Select
                      placeholder="Sélectionner une réunion"
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      allowClear
                      style={{ cursor: 'pointer' }}
                      onChange={handleReunionChange}
                    >
                      {reunions.map((reunion) => (
                        <Option key={reunion.id} value={reunion.id}>
                          {`${new Date(reunion.date).toLocaleDateString('fr-FR')} - ${reunion.typeReunionLibelle || 'Réunion'}`}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <div className="flex justify-end space-x-4">
                  <Button onClick={() => {
                    setModalVisible(false);
                    setEditingInvite(null);
                    form.resetFields();
                  }}>
                    Annuler
                  </Button>
                  <Button type="primary" htmlType="submit">
                    {editingInvite ? 'Modifier' : 'Ajouter'}
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </Modal>

          {/* Modal de détails */}
          <Modal
            title="Détails de l'invité"
            open={detailModalVisible}
            onCancel={() => {
              setDetailModalVisible(false);
              setSelectedInvite(null);
            }}
            footer={null}
            width={isMobile ? '95%' : 700}
            centered={isMobile}
          >
            {selectedInvite && (
              <div className="space-y-4">
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Card size="small" title="Nom complet">
                      <div className="flex items-center">
                        <UserOutlined className="mr-2 text-blue-500" />
                        <span className="font-medium">{`${selectedInvite.prenom} ${selectedInvite.nom}`}</span>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Card size="small" title="Organisation">
                      <div className="flex items-center">
                        <BankOutlined className="mr-2 text-blue-500" />
                        <span>{selectedInvite.organisation || 'Non spécifiée'}</span>
                      </div>
                    </Card>
                  </Col>
                  {selectedInvite.email && (
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Email">
                        <div className="flex items-center">
                          <MailOutlined className="mr-2 text-blue-500" />
                          <span>{selectedInvite.email}</span>
                        </div>
                      </Card>
                    </Col>
                  )}
                  {selectedInvite.telephone && (
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Téléphone">
                        <div className="flex items-center">
                          <PhoneOutlined className="mr-2 text-blue-500" />
                          <span>{selectedInvite.telephone}</span>
                        </div>
                      </Card>
                    </Col>
                  )}
                </Row>
              </div>
            )}
          </Modal>
        </div>
      </main>
    </div>
  );
};

export default InviteReunionPage;