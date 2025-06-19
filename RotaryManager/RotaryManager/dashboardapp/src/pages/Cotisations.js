import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Card, Row, Col, Statistic, Tag, Avatar, Space, Button, Tooltip, Input, message, Spin, Modal, Form, Select, DatePicker, InputNumber, Progress } from 'antd';
import { UserOutlined, EyeOutlined, DollarOutlined, CalendarOutlined, PlusOutlined, SearchOutlined, TrophyOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { FaBars, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import dayjs from 'dayjs';
import Sidebar from '../components/Sidebar';
import { getMandats } from '../api/mandatService';
import '../styles/table.css';

const { TextArea } = Input;
const { Option } = Select;

// Structures JS pour la documentation
// ResumeGlobal: { montantTotalCotisations, montantTotalPaiements, soldeGlobal, nombreTotalCotisations, nombreTotalPaiements, tauxRecouvrementGlobal, montantMoyenCotisation, montantMoyenPaiement }
// MembreResume: { montantTotalCotisations, montantTotalPaiements, solde, nombreCotisations, nombrePaiements, tauxRecouvrement }
// MembreSituation: { membreId, nom, avatarUrl, resume }

const API_BASE = 'http://localhost:5265/api';

const statusColor = (situation) => {
  const { solde, montantTotalCotisations, montantTotalPaiements } = situation.resume;
  if (solde === 0) return { color: 'success', label: 'À jour' };
  if (montantTotalPaiements === 0) return { color: 'error', label: 'En retard' };
  if (solde > 0 && montantTotalPaiements > 0) return { color: 'warning', label: 'Partiellement payé' };
  return { color: 'default', label: 'N/A' };
};

// Composant Card personnalisée pour les membres
const CustomMemberCard = ({ membre, onViewDetails }) => {
  const getStatusConfig = (statut) => {
    switch (statut) {
      case 'À jour':
        return {
          color: 'success',
          bgColor: '#f6ffed',
          borderColor: '#b7eb8f',
          icon: <CheckCircleOutlined />,
          textColor: '#52c41a'
        };
      case 'Partiellement payé':
        return {
          color: 'warning',
          bgColor: '#fffbe6',
          borderColor: '#ffe58f',
          icon: <WarningOutlined />,
          textColor: '#faad14'
        };
      case 'En retard':
        return {
          color: 'error',
          bgColor: '#fff2f0',
          borderColor: '#ffccc7',
          icon: <WarningOutlined />,
          textColor: '#ff4d4f'
        };
      default:
        return {
          color: 'default',
          bgColor: '#f5f5f5',
          borderColor: '#d9d9d9',
          icon: <UserOutlined />,
          textColor: '#8c8c8c'
        };
    }
  };

  const statusConfig = getStatusConfig(membre.statut);
  const tauxPaiement = membre.montantTotalCotisations > 0 
    ? Math.round((membre.montantTotalPaiements / membre.montantTotalCotisations) * 100) 
    : 0;

  return (
    <Card
      hoverable
      style={{
        borderRadius: 16,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: `2px solid ${statusConfig.borderColor}`,
        background: `linear-gradient(135deg, ${statusConfig.bgColor} 0%, #ffffff 100%)`,
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
      bodyStyle={{ padding: '20px' }}
      actions={[
        <Tooltip title="Voir détails" key="details">
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            onClick={() => onViewDetails(membre)}
            style={{ 
              borderRadius: 8,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            Détails
          </Button>
        </Tooltip>
      ]}
    >
      {/* Badge de statut en haut à droite */}
      <div style={{
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 1
      }}>
        <Tag 
          color={statusConfig.color} 
          icon={statusConfig.icon}
          style={{ 
            borderRadius: 20,
            padding: '4px 12px',
            fontWeight: 'bold',
            fontSize: '11px',
            border: 'none',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
        >
          {membre.statut}
        </Tag>
      </div>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* En-tête avec avatar et nom */}
        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <Avatar 
              size={64} 
              src={membre.avatarUrl} 
              icon={<UserOutlined />}
              style={{ 
                border: `3px solid ${statusConfig.borderColor}`,
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
              }}
            />
            {membre.statut === 'À jour' && (
              <div style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                background: '#52c41a',
                borderRadius: '50%',
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid white'
              }}>
                <CheckCircleOutlined style={{ color: 'white', fontSize: 10 }} />
              </div>
            )}
          </div>
          <div style={{ 
            fontWeight: 700, 
            fontSize: '16px',
            color: '#262626',
            marginTop: '12px',
            lineHeight: '1.2'
          }}>
            {membre.nomComplet}
          </div>
        </div>

        {/* Barre de progression */}
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '12px', color: '#8c8c8c', fontWeight: 500 }}>
              Progression des paiements
            </span>
            <span style={{ 
              fontSize: '12px', 
              fontWeight: 'bold',
              color: statusConfig.textColor 
            }}>
              {tauxPaiement}%
            </span>
          </div>
          <Progress 
            percent={tauxPaiement} 
            strokeColor={{
              '0%': statusConfig.textColor,
              '100%': statusConfig.textColor,
            }}
            trailColor={statusConfig.bgColor}
            strokeWidth={8}
            showInfo={false}
            style={{ marginBottom: '4px' }}
          />
        </div>

        {/* Statistiques financières */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: 12,
          padding: '16px',
          backdropFilter: 'blur(10px)'
        }}>
          <Row gutter={[8, 12]}>
            <Col span={24}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <span style={{ 
                  color: '#8c8c8c', 
                  fontSize: '12px',
                  fontWeight: 500 
                }}>
                  Montant dû
                </span>
                <span style={{ 
                  color: '#1890ff', 
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  {membre.montantTotalCotisations.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </Col>
            <Col span={24}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <span style={{ 
                  color: '#8c8c8c', 
                  fontSize: '12px',
                  fontWeight: 500 
                }}>
                  Montant payé
                </span>
                <span style={{ 
                  color: '#52c41a', 
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  {membre.montantTotalPaiements.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </Col>
            <Col span={24}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0 0 0'
              }}>
                <span style={{ 
                  color: '#8c8c8c', 
                  fontSize: '12px',
                  fontWeight: 500 
                }}>
                  Solde restant
                </span>
                <span style={{ 
                  color: membre.solde === 0 ? '#52c41a' : '#ff4d4f', 
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}>
                  {membre.solde.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </Col>
          </Row>
        </div>
      </Space>
    </Card>
  );
};

const Cotisations = () => {
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState(null);
  const [membres, setMembres] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statut, setStatut] = useState('all'); // 'all' | 'success' | 'warning' | 'error'
  const [clubMembres, setClubMembres] = useState([]);
  const [clubMembresLoading, setClubMembresLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingMembre, setEditingMembre] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingMembre, setViewingMembre] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const clubId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).clubId : null;

  // Gestion sidebar responsive
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [realisations, setRealisations] = useState([]);
  const [mandats, setMandats] = useState([]);
  const [editingRealisation, setEditingRealisation] = useState(null);

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

  const handleToggleCollapse = useCallback((collapsed) => {
    setIsCollapsed(collapsed);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const sidebarWidth = isCollapsed ? '4rem' : '18rem';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Résumé global
        const resGlobal = await axios.get(`${API_BASE}/cotisation/situation`);
        console.log('Résumé global:', resGlobal.data);
        setResume(resGlobal.data.resume);

        // Liste des membres avec cotisations
        const resMembres = await axios.get(`${API_BASE}/cotisation`);
        console.log('Liste brute des membres:', resMembres.data);
        // Pour chaque membre, fetch la situation individuelle
        const membresData = await Promise.all(
          (resMembres.data.data || []).map(async (m) => {
            try {
              const res = await axios.get(`${API_BASE}/cotisation/situation/membre/${m.id}`);
              console.log(`Situation membre ${m.id} (${m.firstName} ${m.lastName}):`, res.data);
              return {
                membreId: m.id,
                nom: `${m.firstName} ${m.lastName}`,
                avatarUrl: m.avatarUrl,
                resume: res.data.resume,
              };
            } catch (err) {
              console.error(`Erreur chargement situation membre ${m.id}:`, err);
              return null;
            }
          })
        );
        const membresFiltresNull = membresData.filter(Boolean);
        console.log('Membres avec situations chargées:', membresFiltresNull);
        setMembres(membresFiltresNull);
      } catch (e) {
        console.error('Erreur globale chargement cotisations:', e);
        message.error("Erreur lors du chargement des données");
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchClubMembres = async () => {
      if (!clubId) return;
      setClubMembresLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/Cotisation/situation/club/${clubId}/membres`);
        if (res.data && res.data.membres) {
          setClubMembres(res.data.membres);
          console.log('Situation membres club:', res.data.membres);
        } else {
          setClubMembres([]);
        }
      } catch (e) {
        console.error('Erreur chargement situation club membres:', e);
        setClubMembres([]);
      }
      setClubMembresLoading(false);
    };
    fetchClubMembres();
  }, [clubId]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const fetchMandats = useCallback(async () => {
    if (!clubId) {
      console.log('Pas de clubId, impossible de charger les mandats');
      return;
    }
    try {
      console.log('Chargement des mandats pour le club:', clubId);
      const mandatsData = await getMandats(clubId);
      console.log('Mandats chargés:', mandatsData);
      if (mandatsData && Array.isArray(mandatsData)) {
        // Transformer les données pour s'assurer qu'elles ont le bon format
        const formattedMandats = mandatsData.map(mandat => ({
          id: mandat.id,
          annee: mandat.annee,
          description: mandat.description,
          dateDebut: mandat.dateDebut,
          dateFin: mandat.dateFin,
          estActuel: mandat.estActuel
        }));
        console.log('Mandats formatés:', formattedMandats);
        setMandats(formattedMandats);
      } else {
        console.error('Format de données invalide pour les mandats:', mandatsData);
        message.error("Format de données invalide pour les mandats");
      }
    } catch (error) {
      console.error('Erreur lors du chargement des mandats:', error);
      message.error("Erreur lors du chargement des mandats");
    }
  }, [clubId]);

  useEffect(() => {
    if (clubId) {
      console.log('ClubId trouvé, chargement des mandats...');
      fetchMandats();
    } else {
      console.log('Pas de clubId trouvé dans le localStorage');
    }
  }, [clubId, fetchMandats]);

  const getCurrentMandat = useCallback(() => {
    if (!mandats || mandats.length === 0) return null;
    const now = dayjs();
    return mandats.find(m => 
      now.isAfter(dayjs(m.dateDebut)) && now.isBefore(dayjs(m.dateFin))
    ) || mandats[0];
  }, [mandats]);

  const openModal = (record = null) => {
    console.log('Ouverture du modal avec record:', record);
    console.log('Mandats disponibles:', mandats);
    setEditingRealisation(record);
    setModalVisible(true);
    if (record) {
      console.log('Modification - Valeurs du formulaire:', {
        ...record,
        date: dayjs(record.date),
        mandatId: record.mandatId
      });
      form.setFieldsValue({
        ...record,
        date: dayjs(record.date),
        mandatId: record.mandatId
      });
    } else {
      console.log('Création - Réinitialisation du formulaire');
      form.resetFields();
      const currentMandat = getCurrentMandat();
      form.setFieldsValue({ 
        date: dayjs(),
        mandatId: currentMandat?.id || null,
        montant: 480000
      });
    }
  };

  const openViewModal = (record) => {
    setViewingMembre(record);
    setViewModalVisible(true);
  };

  const closeViewModal = () => {
    setViewModalVisible(false);
    setViewingMembre(null);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/cotisation/${id}`);
      message.success('Cotisation supprimée');
      // Refresh data
      window.location.reload();
    } catch (error) {
      message.error("Erreur lors de la suppression: " + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmit = async (values) => {
    try {
      const cotisationData = {
        membreId: values.membreId,
        montant: values.montant,
        dateEcheance: values.dateEcheance ? values.dateEcheance.toISOString() : null,
        description: values.description || "",
        mandatId: values.mandatId
      };

      if (editingRealisation) {
        await axios.put(`${API_BASE}/cotisation/${editingRealisation.id}`, cotisationData);
        message.success('Cotisation modifiée');
      } else {
        await axios.post(`${API_BASE}/cotisation`, cotisationData);
        message.success('Cotisation ajoutée');
      }
      setModalVisible(false);
      setEditingRealisation(null);
      form.resetFields();
      // Refresh data
      window.location.reload();
    } catch (error) {
      message.error(error.response?.data?.message || error.message || "Erreur lors de l'enregistrement");
    }
  };

  // Filtrage des membres selon le statut et le terme de recherche
  const membresFiltres = useMemo(() => {
    let filteredData = clubMembres;
    
    // Filtre par statut
    if (statut !== 'all') {
      filteredData = filteredData.filter(m => {
        let color = 'default';
        if (m.statut === 'À jour') color = 'success';
        else if (m.statut === 'Partiellement payé') color = 'warning';
        else if (m.statut === 'En retard') color = 'error';
        return color === statut;
      });
    }

    // Filtre par recherche
    if (searchTerm) {
      filteredData = filteredData.filter(m => 
        m.nomComplet.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filteredData;
  }, [clubMembres, searchTerm, statut]);

  if (loading || clubMembresLoading) {
    return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
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
                  Cotisations
                </h1>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-full">
          {/* Statistiques globales */}
          {resume && (
            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card>
                  <Statistic
                    title="Total des Cotisations"
                    value={resume.montantTotalCotisations}
                    precision={0}
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<DollarOutlined />}
                    suffix=" FCFA"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card>
                  <Statistic
                    title="Total Payé"
                    value={resume.montantTotalPaiements}
                    precision={0}
                    valueStyle={{ color: '#3f8600' }}
                    prefix={<DollarOutlined />}
                    suffix=" FCFA"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card>
                  <Statistic
                    title="Solde Global"
                    value={resume.soldeGlobal}
                    precision={0}
                    valueStyle={{ color: resume.soldeGlobal === 0 ? '#3f8600' : '#cf1322' }}
                    prefix={<CalendarOutlined />}
                    suffix=" FCFA"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card>
                  <Statistic
                    title="Taux de Recouvrement"
                    value={resume.tauxRecouvrementGlobal}
                    precision={0}
                    valueStyle={{ color: '#f59e0b' }}
                    prefix={<TrophyOutlined />}
                    suffix=" %"
                  />
                </Card>
              </Col>
            </Row>
          )}

          {/* Barre d'outils */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6">
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => openModal()}
              style={{ borderRadius: 8, height: 40 }}
              size="large"
            >
              Ajouter une cotisation
            </Button>
            <Input
              placeholder="Rechercher par membre..."
              prefix={<SearchOutlined />}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', maxWidth: 300, borderRadius: 8, height: 40 }}
              allowClear
            />
            <Space>
              <Button 
                type={statut === 'all' ? 'primary' : 'default'} 
                onClick={() => setStatut('all')}
                style={{ borderRadius: 8, height: 40 }}
              >
                Tous
              </Button>
              <Button 
                type={statut === 'success' ? 'primary' : 'default'} 
                onClick={() => setStatut('success')}
                style={{ borderRadius: 8, height: 40 }}
              >
                À jour
              </Button>
              <Button 
                type={statut === 'warning' ? 'primary' : 'default'} 
                onClick={() => setStatut('warning')}
                style={{ borderRadius: 8, height: 40 }}
              >
                Partiellement payé
              </Button>
              <Button 
                type={statut === 'error' ? 'primary' : 'default'} 
                onClick={() => setStatut('error')}
                style={{ borderRadius: 8, height: 40 }}
              >
                En retard
              </Button>
            </Space>
          </div>

          <div className="w-full bg-white p-6 rounded-lg shadow-lg" style={{ borderRadius: 16 }}>
            <Row gutter={[24, 24]}>
              {membresFiltres.map(membre => (
                <Col xs={24} sm={12} md={12} lg={8} xl={6} key={membre.membreId}>
                  <CustomMemberCard membre={membre} onViewDetails={openViewModal} />
                </Col>
              ))}
            </Row>

            {/* Message si aucun membre */}
            {membresFiltres.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 20px',
                color: '#8c8c8c' 
              }}>
                <UserOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <div style={{ fontSize: 16, fontWeight: 500 }}>
                  Aucun membre trouvé
                </div>
                <div style={{ fontSize: 14, marginTop: 8 }}>
                  Essayez de modifier vos critères de recherche
                </div>
              </div>
            )}

            {/* Modal de création/édition */}
            <Modal
              title={editingRealisation ? 'Modifier la cotisation' : 'Ajouter une cotisation'}
              open={modalVisible}
              onCancel={() => { setModalVisible(false); setEditingRealisation(null); form.resetFields(); }}
              footer={null}
              destroyOnHidden
              width={isMobile ? '95%' : 600}
              centered={isMobile}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                  mandatId: getCurrentMandat()?.id || null,
                  montant: 480000,
                  commentaires: ''
                }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="mandatId"
                      label="Mandat"
                      rules={[{ required: true, message: 'Le mandat est obligatoire' }]}
                    >
                      <Select
                        placeholder="Sélectionnez un mandat"
                        showSearch
                        optionFilterProp="children"
                        disabled={!!editingRealisation}
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        loading={!mandats || mandats.length === 0}
                      >
                        {mandats && mandats.length > 0 ? (
                          mandats.map(m => (
                            <Option key={m.id} value={m.id}>
                              {`${dayjs(m.dateDebut).format('YYYY')} - ${dayjs(m.dateFin).format('YYYY')}`}
                            </Option>
                          ))
                        ) : (
                          <Option disabled value="loading">Chargement des mandats...</Option>
                        )}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="membreId"
                      label="Membre"
                      rules={[{ required: true, message: 'Le membre est obligatoire' }]}
                    >
                      <Select
                        placeholder="Sélectionnez un membre"
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        style={{ borderRadius: 8 }}
                      >
                        {clubMembres.map(m => (
                          <Option key={m.membreId} value={m.membreId}>
                            {m.nomComplet}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="montant"
                  label="Montant (FCFA)"
                  rules={[
                    { required: true, message: 'Le montant est obligatoire' },
                    { type: 'number', min: 0.01, message: 'Le montant doit être supérieur à 0' }
                  ]}
                >
                  <InputNumber min={0.01} style={{ width: '100%', borderRadius: 8 }} />
                </Form.Item>

                <Form.Item
                  name="dateEcheance"
                  label="Date d'échéance"
                  rules={[{ required: true, message: 'La date d\'échéance est obligatoire' }]}
                >
                  <DatePicker style={{ width: '100%', borderRadius: 8 }} format="DD/MM/YYYY" />
                </Form.Item>

                <Form.Item
                  name="description"
                  label="Description"
                  rules={[{ max: 500, message: 'La description ne peut pas dépasser 500 caractères' }]}
                >
                  <TextArea rows={4} style={{ borderRadius: 8 }} />
                </Form.Item>

                <Form.Item>
                  <Space className="w-full justify-end">
                    <Button 
                      type="primary" 
                      htmlType="submit"
                      style={{ borderRadius: 8 }}
                    >
                      {editingRealisation ? 'Mettre à jour' : 'Ajouter'}
                    </Button>
                    <Button 
                      onClick={() => { setModalVisible(false); setEditingRealisation(null); form.resetFields(); }}
                      style={{ borderRadius: 8 }}
                    >
                      Annuler
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Modal>

            {/* Modal de détails/visualisation améliorée */}
            <Modal
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar 
                    src={viewingMembre?.avatarUrl} 
                    icon={<UserOutlined />}
                    size={32}
                  />
                  <span>Détails de {viewingMembre?.nomComplet}</span>
                </div>
              }
              open={viewModalVisible}
              onCancel={closeViewModal}
              footer={[
                <Button 
                  key="close" 
                  type="primary"
                  onClick={closeViewModal}
                  style={{ borderRadius: 8 }}
                >
                  Fermer
                </Button>,
              ]}
              width={isMobile ? '95%' : 700}
              centered={isMobile}
              style={{ borderRadius: 16 }}
            >
              {viewingMembre && (
                <div style={{ padding: '20px 0' }}>
                  <Row gutter={[16, 16]}>
                    <Col xs={24}>
                      <Card 
                        size="small" 
                        title="Statut du membre"
                        style={{ 
                          borderRadius: 12,
                          background: `linear-gradient(135deg, ${
                            viewingMembre.statut === 'À jour' ? '#f6ffed' :
                            viewingMembre.statut === 'Partiellement payé' ? '#fffbe6' :
                            viewingMembre.statut === 'En retard' ? '#fff2f0' : '#f5f5f5'
                          } 0%, #ffffff 100%)`
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <Tag 
                            color={
                              viewingMembre.statut === 'À jour' ? 'success' :
                              viewingMembre.statut === 'Partiellement payé' ? 'warning' :
                              viewingMembre.statut === 'En retard' ? 'error' : 'default'
                            }
                            style={{ 
                              padding: '8px 16px',
                              fontSize: '14px',
                              borderRadius: 20,
                              fontWeight: 'bold'
                            }}
                          >
                            {viewingMembre.statut}
                          </Tag>
                        </div>
                      </Card>
                    </Col>
                    
                    <Col xs={24} sm={8}>
                      <Card 
                        size="small" 
                        title="Montant dû"
                        style={{ borderRadius: 12 }}
                      >
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ 
                            color: '#1890ff', 
                            fontWeight: 'bold',
                            fontSize: '20px'
                          }}>
                            {viewingMembre.montantTotalCotisations.toLocaleString('fr-FR')}
                          </div>
                          <div style={{ color: '#8c8c8c', fontSize: '12px' }}>FCFA</div>
                        </div>
                      </Card>
                    </Col>
                    
                    <Col xs={24} sm={8}>
                      <Card 
                        size="small" 
                        title="Montant payé"
                        style={{ borderRadius: 12 }}
                      >
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ 
                            color: '#52c41a', 
                            fontWeight: 'bold',
                            fontSize: '20px'
                          }}>
                            {viewingMembre.montantTotalPaiements.toLocaleString('fr-FR')}
                          </div>
                          <div style={{ color: '#8c8c8c', fontSize: '12px' }}>FCFA</div>
                        </div>
                      </Card>
                    </Col>
                    
                    <Col xs={24} sm={8}>
                      <Card 
                        size="small" 
                        title="Solde restant"
                        style={{ borderRadius: 12 }}
                      >
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ 
                            color: viewingMembre.solde === 0 ? '#52c41a' : '#ff4d4f', 
                            fontWeight: 'bold',
                            fontSize: '20px'
                          }}>
                            {viewingMembre.solde.toLocaleString('fr-FR')}
                          </div>
                          <div style={{ color: '#8c8c8c', fontSize: '12px' }}>FCFA</div>
                        </div>
                      </Card>
                    </Col>

                    <Col xs={24}>
                      <Card 
                        size="small" 
                        title="Progression des paiements"
                        style={{ borderRadius: 12 }}
                      >
                        <Progress 
                          percent={viewingMembre.montantTotalCotisations > 0 
                            ? Math.round((viewingMembre.montantTotalPaiements / viewingMembre.montantTotalCotisations) * 100) 
                            : 0
                          } 
                          strokeColor={{
                            '0%': viewingMembre.statut === 'À jour' ? '#52c41a' :
                                  viewingMembre.statut === 'Partiellement payé' ? '#faad14' : '#ff4d4f',
                            '100%': viewingMembre.statut === 'À jour' ? '#52c41a' :
                                    viewingMembre.statut === 'Partiellement payé' ? '#faad14' : '#ff4d4f',
                          }}
                          strokeWidth={12}
                          style={{ marginBottom: '8px' }}
                        />
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

export default Cotisations;