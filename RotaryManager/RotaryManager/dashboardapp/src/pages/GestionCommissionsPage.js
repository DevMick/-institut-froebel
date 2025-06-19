import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Card, Row, Col, Statistic, Select, DatePicker, Switch, Collapse } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserAddOutlined, SearchOutlined, EyeOutlined, UserOutlined, BankOutlined, CalendarOutlined, TeamOutlined, CrownOutlined, MailOutlined, ClockCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { getClubCommissionMembers, assignMemberToCommission, getCommissionsByClub, updateAffectationMembre, removeMemberFromCommission } from '../api/commissionService';
import { getClubMembers } from '../api/memberService';
import { getMandats } from '../api/mandatService';
import Sidebar from '../components/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import '../styles/table.css';
import moment from 'moment';

const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

const GestionCommissionsPage = () => {
  const [membresAffectes, setMembresAffectes] = useState([]);
  const [membres, setMembres] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [mandats, setMandats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingAffectation, setEditingAffectation] = useState(null);
  const [selectedAffectation, setSelectedAffectation] = useState(null);
  const [form] = Form.useForm();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMandatId, setSelectedMandatId] = useState(null);
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
      setMembresAffectes([]);
      setMembres([]);
      setCommissions([]);
      setMandats([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
      return;
    }
    setLoading(true);
    try {
      // Charger les données de base
      const [membresResponse, commissionsResponse, mandatsResponse] = await Promise.all([
        getClubMembers(clubId),
        getCommissionsByClub(clubId),
        getMandats(clubId)
      ]);

      setMembres(membresResponse || []);
      setCommissions(commissionsResponse || []);
      setMandats(mandatsResponse || []);

      // Trouver le mandat en cours
      const currentDate = new Date();
      const currentMandat = mandatsResponse?.find(mandat => {
        const dateDebut = new Date(mandat.dateDebut);
        const dateFin = new Date(mandat.dateFin);
        return currentDate >= dateDebut && currentDate <= dateFin;
      });

      // Définir le mandat en cours comme sélectionné par défaut
      if (currentMandat) {
        setSelectedMandatId(currentMandat.id);
      }

      // Charger tous les membres affectés
      let allMembres = [];
      for (const commission of commissionsResponse || []) {
        try {
          const response = await getClubCommissionMembers(clubId, commission.id);
          const membres = response.Membres || response.membres || [];
          const commissionNom = commission.commission?.nom || commission.commission?.Nom || commission.nom || commission.Nom || '-';
          const membresAvecCommission = membres.map(m => ({ 
            ...m, 
            commissionNom, 
            commissionId: commission.id 
          }));
          allMembres = allMembres.concat(membresAvecCommission);
        } catch (error) {
          console.error(`Erreur lors du chargement des membres de la commission ${commission.id}:`, error);
        }
      }
      
      setMembresAffectes(allMembres);
      setPagination(prev => ({
        ...prev,
        total: allMembres.length,
        current: 1,
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      message.error("Erreur lors du chargement des données");
      setMembresAffectes([]);
      setMembres([]);
      setCommissions([]);
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

  // Filtrage des affectations selon le champ de recherche et le mandat sélectionné
  const filteredAffectations = membresAffectes.filter(membre => {
    const matchesSearch = (
      (membre.nomCompletMembre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (membre.emailMembre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (membre.commissionNom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (membre.mandatAnnee || '').toString().includes(searchTerm)
    );
    
    const matchesMandat = !selectedMandatId || membre.mandatId === selectedMandatId;
    
    return matchesSearch && matchesMandat;
  });

  // Grouper les membres par commission
  const membresGroupesParCommission = filteredAffectations.reduce((acc, membre) => {
    const commissionNom = membre.commissionNom || 'Commission non définie';
    if (!acc[commissionNom]) {
      acc[commissionNom] = [];
    }
    acc[commissionNom].push(membre);
    return acc;
  }, {});

  // Statistiques calculées à partir des affectations filtrées
  const totalAffectations = filteredAffectations.length;
  const responsables = filteredAffectations.filter(a => a.estResponsable).length;
  const membresSimples = filteredAffectations.filter(a => !a.estResponsable).length;
  const commissionsActives = Object.keys(membresGroupesParCommission).length;

  const openModal = (record = null) => {
    setEditingAffectation(record);
    setModalVisible(true);
    if (record) {
      console.log('Valeurs initiales pour modification:', {
        membreId: record.membreId,
        commissionId: record.commissionId,
        mandatId: record.mandatId,
        estResponsable: record.estResponsable,
        dateNomination: record.dateNomination ? moment(record.dateNomination) : null,
        commentaires: record.commentaires,
      });
      form.setFieldsValue({
        membreId: record.membreId,
        commissionId: record.commissionId,
        mandatId: record.mandatId,
        estResponsable: record.estResponsable,
        dateNomination: record.dateNomination ? moment(record.dateNomination) : null,
        commentaires: record.commentaires,
      });
    } else {
      form.resetFields();
      // Trouver le mandat actuel
      const now = new Date();
      const currentMandat = mandats.find(m => {
        const dateDebut = new Date(m.dateDebut);
        const dateFin = new Date(m.dateFin);
        return now >= dateDebut && now <= dateFin;
      });
      
      console.log('Valeurs initiales pour nouvel ajout:', {
        membreId: undefined,
        commissionId: undefined,
        mandatId: currentMandat?.id,
        estResponsable: false,
        dateNomination: moment(),
        commentaires: ''
      });
      
      form.setFieldsValue({ 
        membreId: undefined,
        commissionId: undefined,
        mandatId: currentMandat?.id,
        estResponsable: false,
        dateNomination: moment(),
        commentaires: ''
      });
    }
  };

  const openDetailModal = async (record) => {
    try {
      setSelectedAffectation(record);
      setDetailModalVisible(true);
    } catch (error) {
      message.error("Erreur lors du chargement des détails");
    }
  };

  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedAffectation(null);
  };

  const handleDelete = async (record) => {
    try {
      await removeMemberFromCommission(clubId, record.commissionId, record.id, record.mandatId);
      message.success('Membre retiré de la commission');
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
      console.log('Valeurs du formulaire avant soumission:', values);
      console.log('Valeur de estResponsable:', values.estResponsable);
      
      const affectationData = {
        membreId: values.membreId,
        mandatId: values.mandatId,
        estResponsable: values.estResponsable || false,
        dateNomination: values.dateNomination ? values.dateNomination.format('YYYY-MM-DD') : null,
        commentaires: values.commentaires || ''
      };
      
      console.log('Données d\'affectation préparées:', affectationData);

      if (editingAffectation) {
        console.log('Mise à jour de l\'affectation:', {
          estResponsable: affectationData.estResponsable,
          commentaires: affectationData.commentaires
        });
        await updateAffectationMembre(clubId, values.commissionId, editingAffectation.id, {
          estResponsable: affectationData.estResponsable,
          commentaires: affectationData.commentaires
        });
        message.success('Affectation modifiée');
      } else {
        console.log('Nouvelle affectation:', affectationData);
        const response = await assignMemberToCommission(clubId, values.commissionId, affectationData);
        if (response && response.id) {
          message.success('Membre affecté');
        } else {
          message.error('Erreur lors de l\'affectation');
          return;
        }
      }
      setModalVisible(false);
      setEditingAffectation(null);
      form.resetFields();
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return moment(dateString).format('DD/MM/YYYY');
  };

  // Ajout pour affichage mandat dans les détails
  let mandatDetails = 'Non défini';
  if (selectedAffectation && selectedAffectation.mandatId && mandats.length > 0) {
    const mandat = mandats.find(m => m.id === selectedAffectation.mandatId);
    if (mandat) {
      const dateDebut = new Date(mandat.dateDebut);
      const dateFin = new Date(mandat.dateFin);
      const anneeDebut = dateDebut.getFullYear();
      const anneeFin = dateFin.getFullYear();
      mandatDetails = `${anneeDebut} - ${anneeFin}`;
    }
  }

  const columns = [
    {
      title: 'Membre',
      key: 'membre',
      render: (_, record) => (
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
            record.estResponsable ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
          }`}>
            {record.estResponsable ? <CrownOutlined /> : <UserOutlined />}
          </div>
          <div>
            <div className="font-medium text-gray-900">{record.nomCompletMembre || 'Nom non disponible'}</div>
            <div className="text-sm text-gray-500">
              {record.emailMembre || 'Email non disponible'}
            </div>
          </div>
        </div>
      ),
      sorter: (a, b) => (a.nomCompletMembre || '').localeCompare(b.nomCompletMembre || ''),
    },
    {
      title: 'Rôle',
      dataIndex: 'estResponsable',
      key: 'estResponsable',
      render: (estResponsable) => (
        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
          estResponsable 
            ? 'bg-yellow-100 text-yellow-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {estResponsable ? <CrownOutlined style={{ marginRight: 4 }} /> : <TeamOutlined style={{ marginRight: 4 }} />}
          {estResponsable ? 'Responsable' : 'Membre'}
        </span>
      ),
      filters: [
        { text: 'Responsable', value: true },
        { text: 'Membre', value: false },
      ],
      onFilter: (value, record) => record.estResponsable === value,
    },
    {
      title: 'Date nomination',
      dataIndex: 'dateNomination',
      key: 'dateNomination',
      render: (date) => (
        <span>
          <ClockCircleOutlined style={{ marginRight: 8, color: '#f59e0b' }} />
          {formatDate(date)}
        </span>
      ),
      sorter: (a, b) => {
        const dateA = a.dateNomination ? new Date(a.dateNomination) : new Date(0);
        const dateB = b.dateNomination ? new Date(b.dateNomination) : new Date(0);
        return dateA - dateB;
      },
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
          <Popconfirm 
            title="Retirer ce membre de la commission ?" 
            onConfirm={() => handleDelete(record)} 
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
                  Gestion des Commissions
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
                  title="Total affectations"
                  value={totalAffectations}
                  prefix={<UserAddOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Responsables"
                  value={responsables}
                  prefix={<CrownOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Membres simples"
                  value={membresSimples}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Commissions actives"
                  value={commissionsActives}
                  prefix={<BankOutlined />}
                  valueStyle={{ color: '#52c41a' }}
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
              Affecter un membre
            </Button>
            <Input
              placeholder="Rechercher par nom, email, commission..."
              prefix={<SearchOutlined />}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', maxWidth: 300 }}
              allowClear
            />
            <Select
              placeholder="Filtrer par mandat"
              style={{ width: '100%', maxWidth: 200 }}
              value={selectedMandatId}
              onChange={setSelectedMandatId}
              allowClear
            >
              {mandats.map(mandat => {
                const dateDebut = new Date(mandat.dateDebut);
                const dateFin = new Date(mandat.dateFin);
                const anneeDebut = dateDebut.getFullYear();
                const anneeFin = dateFin.getFullYear();
                return (
                  <Option key={mandat.id} value={mandat.id}>
                    {`Mandat ${anneeDebut} - ${anneeFin}`}
                  </Option>
                );
              })}
            </Select>
          </div>

          <div className="w-full bg-white p-4 sm:p-6 rounded-lg shadow">
            {loading ? (
              <div className="text-center py-8">
                <p>Chargement des données...</p>
              </div>
            ) : Object.keys(membresGroupesParCommission).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucun membre affecté à une commission</p>
              </div>
            ) : (
              <Collapse 
                defaultActiveKey={Object.keys(membresGroupesParCommission)} 
                className="commission-collapse"
              >
                {Object.entries(membresGroupesParCommission).map(([commissionNom, membres]) => (
                  <Panel 
                    header={
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <BankOutlined style={{ marginRight: 12, color: '#1890ff', fontSize: '16px' }} />
                          <span className="font-semibold text-lg">{commissionNom}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {membres.length} membre{membres.length > 1 ? 's' : ''}
                          </span>
                          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                            Responsable: {membres.find(m => m.estResponsable)?.nomCompletMembre || 'Aucun'}
                          </span>
                        </div>
                      </div>
                    } 
                    key={commissionNom}
                    className="mb-4"
                  >
                    <Table
                      columns={columns}
                      dataSource={membres}
                      rowKey={(record) => `${record.id}-${record.commissionId}`}
                      pagination={false}
                      size="middle"
                      className="commission-table"
                      scroll={{ x: 'max-content' }}
                    />
                  </Panel>
                ))}
              </Collapse>
            )}

            {/* Modal d'ajout/modification */}
            <Modal
              title={editingAffectation ? 'Modifier l\'affectation' : 'Affecter un membre'}
              open={modalVisible}
              onCancel={() => { 
                setModalVisible(false); 
                setEditingAffectation(null); 
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
                initialValues={editingAffectation ? undefined : {
                  membreId: undefined,
                  commissionId: undefined,
                  mandatId: undefined,
                  estResponsable: false,
                  dateNomination: null,
                  commentaires: ''
                }}
              >
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="membreId"
                      label="Membre"
                      rules={[{ required: true, message: 'Le membre est obligatoire' }]}
                    >
                      <Select
                        placeholder="Sélectionner un membre"
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        allowClear
                        disabled={false}
                        style={{ cursor: 'pointer' }}
                      >
                        {membres.map((membre) => (
                          <Option key={membre.id} value={membre.id}>
                            {`${membre.firstName} ${membre.lastName}`}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="commissionId"
                      label="Commission"
                      rules={[{ required: true, message: 'La commission est obligatoire' }]}
                    >
                      <Select
                        placeholder="Sélectionner une commission"
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        allowClear
                        disabled={false}
                        style={{ cursor: 'pointer' }}
                      >
                        {commissions.map((commission) => (
                          <Option key={commission.id} value={commission.id}>
                            {commission.commission?.nom || commission.nom || 'Commission sans nom'}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
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
                        disabled={false}
                        style={{ cursor: 'pointer' }}
                      >
                        {mandats.map((mandat) => {
                          const dateDebut = new Date(mandat.dateDebut);
                          const dateFin = new Date(mandat.dateFin);
                          const anneeDebut = dateDebut.getFullYear();
                          const anneeFin = dateFin.getFullYear();
                          return (
                            <Option key={mandat.id} value={mandat.id}>
                              {`Mandat ${anneeDebut} - ${anneeFin}`}
                            </Option>
                          );
                        })}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="dateNomination"
                      label="Date de nomination"
                      rules={[{ required: true, message: 'La date de nomination est obligatoire' }]}
                    >
                      <DatePicker 
                        placeholder="Sélectionner la date de nomination"
                        style={{ width: '100%', cursor: 'pointer' }}
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="estResponsable" valuePropName="checked">
                  <div className="flex items-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <Switch 
                      size="default" 
                      onChange={(checked) => {
                        console.log('Switch onChange:', checked);
                        form.setFieldsValue({ estResponsable: checked });
                      }}
                    />
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">Responsable de commission</div>
                      <div className="text-sm text-gray-500">Ce membre dirige la commission</div>
                    </div>
                  </div>
                </Form.Item>

                <Form.Item
                  name="commentaires"
                  label="Commentaires"
                >
                  <TextArea 
                    rows={3}
                    placeholder="Ajoutez des notes sur cette affectation..."
                    maxLength={500}
                    showCount
                  />
                </Form.Item>

                <Form.Item>
                  <Space className="w-full justify-end">
                    <Button type="primary" htmlType="submit">
                      {editingAffectation ? 'Mettre à jour' : 'Affecter le membre'}
                    </Button>
                    <Button onClick={() => { 
                      setModalVisible(false); 
                      setEditingAffectation(null); 
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
              title="Détails de l'affectation"
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
              {selectedAffectation && (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Membre">
                        <p style={{ fontWeight: 'bold', color: '#1890ff' }}>
                          <UserOutlined style={{ marginRight: 8 }} />
                          {selectedAffectation.nomCompletMembre || 'Nom non disponible'}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Email">
                        <p>
                          <MailOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                          {selectedAffectation.emailMembre || 'Email non disponible'}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Commission">
                        <p>
                          <BankOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                          {selectedAffectation.commissionNom || 'Commission non définie'}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Mandat">
                        <p>
                          <CalendarOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                          {mandatDetails}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Rôle">
                        <p style={{ 
                          fontWeight: 'bold', 
                          color: selectedAffectation.estResponsable ? '#faad14' : '#1890ff' 
                        }}>
                          {selectedAffectation.estResponsable ? <CrownOutlined style={{ marginRight: 8 }} /> : <TeamOutlined style={{ marginRight: 8 }} />}
                          {selectedAffectation.estResponsable ? 'Responsable' : 'Membre'}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Date de nomination">
                        <p>
                          <ClockCircleOutlined style={{ marginRight: 8, color: '#f59e0b' }} />
                          {formatDate(selectedAffectation.dateNomination)}
                        </p>
                      </Card>
                    </Col>
                    {selectedAffectation.commentaires && (
                      <Col xs={24}>
                        <Card size="small" title="Commentaires">
                          <p style={{ whiteSpace: 'pre-wrap' }}>
                            <FileTextOutlined style={{ marginRight: 8, color: '#8c8c8c' }} />
                            {selectedAffectation.commentaires}
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

export default GestionCommissionsPage;