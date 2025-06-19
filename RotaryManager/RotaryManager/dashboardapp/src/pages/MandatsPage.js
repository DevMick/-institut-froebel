import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Card, Row, Col, Statistic, DatePicker, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined, SearchOutlined, EyeOutlined, ClockCircleOutlined, CheckCircleOutlined, StarOutlined, TagsOutlined, TeamOutlined } from '@ant-design/icons';
import { getMandats, createMandat, updateMandat, deleteMandat } from '../api/mandatService';
import Sidebar from '../components/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import '../styles/table.css';
import moment from 'moment';

const { TextArea } = Input;

const MandatsPage = () => {
  const [mandats, setMandats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingMandat, setEditingMandat] = useState(null);
  const [selectedMandat, setSelectedMandat] = useState(null);
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

  // Fonction pour calculer le statut automatiquement selon les dates
  const calculateStatus = (dateDebut, dateFin) => {
    if (!dateDebut || !dateFin) return 'Indéterminé';
    
    const now = new Date();
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    
    // Réinitialiser les heures pour comparaison par date uniquement
    now.setHours(0, 0, 0, 0);
    debut.setHours(0, 0, 0, 0);
    fin.setHours(0, 0, 0, 0);
    
    if (now < debut) return 'À venir';
    if (now >= debut && now <= fin) return 'Actuel';
    return 'Terminé';
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'Actuel': return { bg: 'bg-green-100', text: 'text-green-800', dot: 'text-green-600' };
      case 'À venir': return { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'text-blue-600' };
      case 'Terminé': return { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'text-gray-500' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'text-gray-500' };
    }
  };

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

  const fetchMandats = useCallback(async () => {
    if (!clubId) {
      setMandats([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
      return;
    }
    setLoading(true);
    try {
      const mandatsData = await getMandats(clubId);
      // Enrichir chaque mandat avec le statut calculé
      const mandatsWithStatus = (mandatsData || []).map(mandat => ({
        ...mandat,
        statusCalcule: calculateStatus(mandat.dateDebut, mandat.dateFin)
      }));
      setMandats(mandatsWithStatus);
      setPagination(prev => ({
        ...prev,
        total: mandatsWithStatus.length,
        current: 1,
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des mandats:', error);
      message.error("Erreur lors du chargement des mandats");
      setMandats([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    fetchMandats();
  }, [fetchMandats]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Filtrage des mandats selon le champ de recherche
  const filteredMandats = mandats.filter(mandat => {
    return (
      (mandat.annee || '').toString().includes(searchTerm) ||
      (mandat.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mandat.comite || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mandat.statusCalcule || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Statistiques calculées à partir des mandats filtrés avec le statut calculé
  const totalMandats = filteredMandats.length;
  const mandatsActuels = filteredMandats.filter(m => m.statusCalcule === 'Actuel').length;
  const mandatsTermines = filteredMandats.filter(m => m.statusCalcule === 'Terminé').length;
  const mandatsAvenir = filteredMandats.filter(m => m.statusCalcule === 'À venir').length;
  const moyenneDuree = totalMandats > 0 ? 
    (filteredMandats.reduce((sum, m) => {
      if (m.dateDebut && m.dateFin) {
        const duree = Math.ceil((new Date(m.dateFin) - new Date(m.dateDebut)) / (1000 * 60 * 60 * 24 * 30));
        return sum + duree;
      }
      return sum;
    }, 0) / totalMandats).toFixed(1) : 0;

  const openModal = (record = null) => {
    setEditingMandat(record);
    setModalVisible(true);
    if (record) {
      form.setFieldsValue({
        annee: record.annee,
        dateDebut: record.dateDebut ? moment(record.dateDebut) : null,
        dateFin: record.dateFin ? moment(record.dateFin) : null,
        description: record.description,
        comite: record.comite,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ 
        annee: null,
        dateDebut: null,
        dateFin: null,
        description: '',
        comite: ''
      });
    }
  };

  const openDetailModal = async (record) => {
    try {
      setSelectedMandat(record);
      setDetailModalVisible(true);
    } catch (error) {
      message.error("Erreur lors du chargement des détails");
    }
  };

  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedMandat(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteMandat(clubId, id);
      message.success('Mandat supprimé');
      fetchMandats();
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
      const mandatData = {
        annee: values.annee,
        dateDebut: values.dateDebut ? values.dateDebut.format('YYYY-MM-DD') : null,
        dateFin: values.dateFin ? values.dateFin.format('YYYY-MM-DD') : null,
        description: values.description || '',
        comite: values.comite || '',
        clubId: clubId
      };

      if (editingMandat) {
        await updateMandat(clubId, editingMandat.id, mandatData);
        message.success('Mandat modifié');
      } else {
        await createMandat(clubId, mandatData);
        message.success('Mandat créé');
      }
      setModalVisible(false);
      setEditingMandat(null);
      form.resetFields();
      fetchMandats();
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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return moment(dateString).format('DD/MM/YYYY');
  };

  const calculateDuration = (dateDebut, dateFin) => {
    if (!dateDebut || !dateFin) return 0;
    return Math.ceil((new Date(dateFin) - new Date(dateDebut)) / (1000 * 60 * 60 * 24 * 30));
  };

  const columns = [
    {
      title: 'Année',
      dataIndex: 'annee',
      key: 'annee',
      render: (text, record) => {
        const statusColor = getStatusColor(record.statusCalcule);
        return (
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
              record.statusCalcule === 'Actuel' ? 'bg-green-100 text-green-600' : 
              record.statusCalcule === 'À venir' ? 'bg-blue-100 text-blue-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              <CalendarOutlined />
            </div>
            <div>
              <div className="font-medium">{text}</div>
              <div className={`text-sm ${statusColor.text}`}>
                {record.statusCalcule}
              </div>
            </div>
          </div>
        );
      },
      sorter: (a, b) => a.annee - b.annee,
    },
    {
      title: 'Mandat date',
      key: 'periode',
      render: (_, record) => (
        <span>
          <ClockCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />
          {formatDate(record.dateDebut)} - {formatDate(record.dateFin)}
        </span>
      ),
    },
    {
      title: 'Comité',
      dataIndex: 'comite',
      key: 'comite',
      render: (comite) => (
        <span>
          <TeamOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {comite || 'Non défini'}
        </span>
      ),
    },
    {
      title: 'Durée',
      key: 'duree',
      render: (_, record) => {
        const duree = calculateDuration(record.dateDebut, record.dateFin);
        return (
          <span style={{ 
            color: duree > 0 ? '#1890ff' : '#d9d9d9', 
            fontWeight: duree > 0 ? 'bold' : 'normal' 
          }}>
            <ClockCircleOutlined style={{ marginRight: 8 }} />
            {duree} mois
          </span>
        );
      },
      sorter: (a, b) => calculateDuration(a.dateDebut, a.dateFin) - calculateDuration(b.dateDebut, b.dateFin),
    },
    {
      title: 'Statut',
      dataIndex: 'statusCalcule',
      key: 'statusCalcule',
      render: (status) => {
        const statusColor = getStatusColor(status);
        return (
          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${statusColor.bg} ${statusColor.text}`}>
            <CheckCircleOutlined style={{ marginRight: 4 }} />
            {status}
          </span>
        );
      },
      filters: [
        { text: 'Actuel', value: 'Actuel' },
        { text: 'À venir', value: 'À venir' },
        { text: 'Terminé', value: 'Terminé' },
      ],
      onFilter: (value, record) => record.statusCalcule === value,
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
            title="Supprimer ce mandat ?" 
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
                  title="Total mandats"
                  value={totalMandats}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Mandats actuels"
                  value={mandatsActuels}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Mandats à venir"
                  value={mandatsAvenir}
                  prefix={<StarOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Mandats terminés"
                  value={mandatsTermines}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#8c8c8c' }}
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
              Ajouter un mandat
            </Button>
            <Input
              placeholder="Rechercher par année, description, comité ou statut..."
              prefix={<SearchOutlined />}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', maxWidth: 300 }}
              allowClear
            />
          </div>

          <div className="w-full bg-white p-4 sm:p-6 rounded-lg shadow">
            <Table
              columns={columns}
              dataSource={filteredMandats}
              rowKey="id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: filteredMandats.length,
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
              title={editingMandat ? 'Modifier le mandat' : 'Ajouter un mandat'}
              open={modalVisible}
              onCancel={() => { 
                setModalVisible(false); 
                setEditingMandat(null); 
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
                initialValues={editingMandat ? undefined : {
                  annee: null,
                  dateDebut: null,
                  dateFin: null,
                  description: '',
                  comite: ''
                }}
              >
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="annee"
                      label="Année"
                      rules={[{ required: true, message: 'L\'année est obligatoire' }]}
                    >
                      <Input 
                        type="number"
                        placeholder="Ex: 2024"
                        prefix={<CalendarOutlined />}
                        min={2000}
                        max={2100}
                        style={{ cursor: 'pointer' }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="comite"
                      label="Comité"
                    >
                      <Input 
                        placeholder="Ex: Comité directeur, Bureau..."
                        prefix={<TeamOutlined />}
                        maxLength={100}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="dateDebut"
                      label="Date de début"
                      rules={[{ required: true, message: 'La date de début est obligatoire' }]}
                    >
                      <DatePicker 
                        placeholder="Sélectionner la date de début"
                        style={{ width: '100%', cursor: 'pointer' }}
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="dateFin"
                      label="Date de fin"
                      rules={[
                        { required: true, message: 'La date de fin est obligatoire' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || !getFieldValue('dateDebut')) {
                              return Promise.resolve();
                            }
                            if (value.isAfter(getFieldValue('dateDebut'))) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('La date de fin doit être postérieure à la date de début'));
                          },
                        }),
                      ]}
                    >
                      <DatePicker 
                        placeholder="Sélectionner la date de fin"
                        style={{ width: '100%', cursor: 'pointer' }}
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="description"
                  label="Description"
                  rules={[
                    { max: 200, message: 'La description ne doit pas dépasser 200 caractères' }
                  ]}
                >
                  <TextArea 
                    rows={4}
                    placeholder="Décrivez les grandes lignes de ce mandat..."
                    maxLength={200}
                    showCount
                  />
                </Form.Item>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                  <div className="flex items-center text-blue-700">
                    <CheckCircleOutlined className="mr-2" />
                    <span className="text-sm font-medium">
                      Le statut du mandat sera calculé automatiquement selon les dates saisies
                    </span>
                  </div>
                </div>

                <Form.Item>
                  <Space className="w-full justify-end">
                    <Button type="primary" htmlType="submit">
                      {editingMandat ? 'Mettre à jour' : 'Créer le mandat'}
                    </Button>
                    <Button onClick={() => { 
                      setModalVisible(false); 
                      setEditingMandat(null); 
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
              title="Détails du mandat"
              open={detailModalVisible}
              onCancel={closeDetailModal}
              footer={[
                <Button key="close" onClick={closeDetailModal}>
                  Fermer
                </Button>
              ]}
              width={isMobile ? '95%' : 700}
              centered={isMobile}
            >
              {selectedMandat && (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Année">
                        <p style={{ fontWeight: 'bold', color: '#1890ff' }}>
                          <CalendarOutlined style={{ marginRight: 8 }} />
                          Mandat {selectedMandat.annee}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Statut">
                        <p style={{ 
                          fontWeight: 'bold', 
                          color: selectedMandat.statusCalcule === 'Actuel' ? '#52c41a' :
                                 selectedMandat.statusCalcule === 'À venir' ? '#1890ff' : '#8c8c8c'
                        }}>
                          <CheckCircleOutlined style={{ marginRight: 8 }} />
                          {selectedMandat.statusCalcule}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Date de début">
                        <p>
                          <ClockCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                          {formatDate(selectedMandat.dateDebut)}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Date de fin">
                        <p>
                          <ClockCircleOutlined style={{ marginRight: 8, color: '#f59e0b' }} />
                          {formatDate(selectedMandat.dateFin)}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Comité">
                        <p style={{ fontWeight: 'bold', color: '#1890ff' }}>
                          <TeamOutlined style={{ marginRight: 8 }} />
                          {selectedMandat.comite || 'Non défini'}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Durée">
                        <p style={{ fontWeight: 'bold', color: '#1890ff' }}>
                          <ClockCircleOutlined style={{ marginRight: 8 }} />
                          {calculateDuration(selectedMandat.dateDebut, selectedMandat.dateFin)} mois
                        </p>
                      </Card>
                    </Col>
                    {selectedMandat.description && (
                      <Col xs={24}>
                        <Card size="small" title="Description">
                          <p style={{ whiteSpace: 'pre-wrap' }}>{selectedMandat.description}</p>
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

export default MandatsPage;