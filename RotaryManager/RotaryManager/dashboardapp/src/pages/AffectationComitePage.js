import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Card, Row, Col, Statistic, Select, DatePicker, Collapse } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserAddOutlined, SearchOutlined, EyeOutlined, UserOutlined, BankOutlined, CalendarOutlined, TeamOutlined, CrownOutlined, MailOutlined, ClockCircleOutlined, FileTextOutlined, SettingOutlined } from '@ant-design/icons';
import { getClubComiteMembers, assignMemberToComite, getComitesByClub, updateAffectationMembre, removeMemberFromComite } from '../api/comiteService';
import { getClubMembers } from '../api/memberService';
import { getMandats } from '../api/mandatService';
import { fonctionService } from '../api/fonctionService';
import Sidebar from '../components/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import '../styles/table.css';
import moment from 'moment';
import axios from 'axios';

const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

const AffectationComitePage = () => {
  const [membresAffectes, setMembresAffectes] = useState([]);
  const [membres, setMembres] = useState([]);
  const [comites, setComites] = useState([]);
  const [mandats, setMandats] = useState([]);
  const [fonctions, setFonctions] = useState([]);
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
      setComites([]);
      setMandats([]);
      setFonctions([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
      return;
    }
    setLoading(true);
    try {
      // Charger les données de base
      const [membresResponse, mandatsResponse, fonctionsResponse] = await Promise.all([
        getClubMembers(clubId),
        getMandats(clubId),
        fonctionService.getFonctions()
      ]);

      setMembres(membresResponse || []);
      setMandats(mandatsResponse || []);
      setFonctions(fonctionsResponse || []);

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
      for (const mandat of mandatsResponse || []) {
        try {
          const response = await axios.get(`/api/clubs/${clubId}/mandats/${mandat.id}/membres`);
          const membres = response.data.Membres || response.data.membres || [];
          const membresAvecMandat = membres.map(m => ({ 
            ...m, 
            mandatId: mandat.id,
            mandatAnnee: mandat.annee || mandat.Annee || '-',
            mandatDescription: mandat.description || mandat.Description || '-'
          }));
          allMembres = allMembres.concat(membresAvecMandat);
        } catch (error) {
          console.error(`Erreur lors du chargement des membres du mandat ${mandat.id}:`, error);
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
      setMandats([]);
      setFonctions([]);
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
      (membre.nomFonction || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (membre.mandatAnnee || '').toString().includes(searchTerm)
    );
    
    const matchesMandat = !selectedMandatId || membre.mandatId === selectedMandatId;
    
    return matchesSearch && matchesMandat;
  });

  // Grouper les membres par fonction
  const membresGroupesParFonction = filteredAffectations.reduce((acc, membre) => {
    const fonctionNom = membre.nomFonction || 'Fonction non définie';
    if (!acc[fonctionNom]) {
      acc[fonctionNom] = [];
    }
    acc[fonctionNom].push(membre);
    return acc;
  }, {});

  // Statistiques calculées à partir des affectations filtrées
  const totalAffectations = filteredAffectations.length;
  const fonctionsUniques = Object.keys(membresGroupesParFonction).length;
  const mandatsActifs = [...new Set(filteredAffectations.map(a => a.mandatAnnee).filter(Boolean))].length;
  const membresActifs = filteredAffectations.filter(m => m.isActiveMembre).length;

  // Colonnes pour le tableau des membres dans chaque fonction
  const membersColumns = [
    {
      title: 'Membre',
      key: 'membre',
      render: (_, record) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-blue-100 text-blue-600">
            <UserOutlined />
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {record.nomCompletMembre || 'Nom non disponible'}
            </div>
            <div className="text-sm text-gray-500">
              {record.emailMembre || 'Email non disponible'}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Email',
      key: 'email',
      render: (_, record) => (
        <span>
          <MailOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {record.emailMembre || 'Email non disponible'}
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
            title="Retirer ce membre du mandat ?" 
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

  const openModal = (record = null) => {
    setEditingAffectation(record);
    setModalVisible(true);
    if (record) {
      form.setFieldsValue({
        membreId: record.membreId,
        mandatId: record.mandatId,
        fonctionId: record.fonctionId
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
      
      form.setFieldsValue({ 
        membreId: undefined,
        mandatId: currentMandat?.id,
        fonctionId: undefined
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
      await axios.delete(`/api/clubs/${clubId}/mandats/${record.mandatId}/membres/${record.id}`);
      message.success('Membre retiré du mandat');
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
      const affectationData = {
        membreId: values.membreId,
        fonctionId: values.fonctionId
      };
      console.log('Données envoyées à l\'API:', affectationData, 'MandatId:', values.mandatId);

      if (editingAffectation) {
        await axios.put(`/api/clubs/${clubId}/mandats/${values.mandatId}/membres/${editingAffectation.id}`, {
          fonctionId: affectationData.fonctionId
        });
        message.success('Affectation modifiée');
      } else {
        const response = await axios.post(`/api/clubs/${clubId}/mandats/${values.mandatId}/membres`, affectationData);
        if (response.data && response.data.id) {
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
      if (error.response?.status === 400 && error.response?.data?.includes('déjà affecté')) {
        message.error('Ce membre est déjà affecté à ce mandat avec cette fonction');
      } else {
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
                  Gestion des Mandats
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
                  title="Fonctions différentes"
                  value={fonctionsUniques}
                  prefix={<SettingOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Membres actifs"
                  value={membresActifs}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Mandats actifs"
                  value={mandatsActifs}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-4">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              Ajouter un membre
            </Button>
            <Input
              placeholder="Rechercher par nom, email ou fonction..."
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
            ) : Object.keys(membresGroupesParFonction).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucun membre affecté</p>
              </div>
            ) : (
              <Collapse 
                defaultActiveKey={Object.keys(membresGroupesParFonction)} 
                className="fonction-collapse"
              >
                {Object.entries(membresGroupesParFonction).map(([fonctionNom, membres]) => (
                  <Panel 
                    header={
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CrownOutlined style={{ marginRight: 12, color: '#faad14', fontSize: '16px' }} />
                          <span className="font-semibold text-lg">{fonctionNom}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {membres.length} membre{membres.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    } 
                    key={fonctionNom}
                    className="mb-4"
                  >
                    <Table
                      columns={membersColumns}
                      dataSource={membres}
                      rowKey={(record) => `${record.id}-${record.mandatId}`}
                      pagination={false}
                      size="middle"
                      className="fonction-table"
                      scroll={{ x: 'max-content' }}
                    />
                  </Panel>
                ))}
              </Collapse>
            )}

            {/* Modal d'ajout/modification */}
            <Modal
              title={editingAffectation ? 'Modifier l\'affectation' : 'Affecter un membre au mandat'}
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
                  mandatId: undefined,
                  fonctionId: undefined,
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
                        disabled={editingAffectation}
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
                        disabled={editingAffectation}
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
                </Row>

                <Row gutter={16}>
                  <Col xs={24}>
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
                        allowClear
                        style={{ cursor: 'pointer' }}
                      >
                        {fonctions.map((fonction) => (
                          <Option key={fonction.id} value={fonction.id}>
                            {fonction.nomFonction}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

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
                      <Card size="small" title="Fonction">
                        <p style={{ fontWeight: 'bold', color: '#faad14' }}>
                          <CrownOutlined style={{ marginRight: 8 }} />
                          {selectedAffectation.nomFonction || 'Fonction non définie'}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Mandat">
                        <p>
                          <CalendarOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                          {selectedAffectation.mandatAnnee || 'Non défini'}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24}>
                      <Card size="small" title="Description du mandat">
                        <p>
                          <FileTextOutlined style={{ marginRight: 8, color: '#8c8c8c' }} />
                          {selectedAffectation.mandatDescription || 'Aucune description'}
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

export default AffectationComitePage;