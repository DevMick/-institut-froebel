import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, DatePicker, Select, Card, Row, Col, Statistic, Spin, Tag, Collapse } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ClockCircleOutlined, CheckCircleOutlined, WarningOutlined, EyeOutlined, CrownOutlined, CalendarOutlined, TeamOutlined } from '@ant-design/icons';
import { fonctionEcheancesService } from '../api/fonctionEcheancesService';
import { fonctionService } from '../api/fonctionService';
import Sidebar from '../components/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import dayjs from 'dayjs';
import '../styles/table.css';

const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

const FonctionEcheancesPage = () => {
  const [echeances, setEcheances] = useState([]);
  const [fonctions, setFonctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEcheance, setEditingEcheance] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingEcheance, setViewingEcheance] = useState(null);
  const [form] = Form.useForm();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [frequences, setFrequences] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchFonctions = useCallback(async () => {
    try {
      const data = await fonctionService.getFonctions();
      setFonctions(data);
    } catch (error) {
      console.error('Erreur lors du chargement des fonctions:', error);
      message.error("Erreur lors du chargement des fonctions");
    }
  }, []);

  const fetchFrequences = useCallback(async () => {
    try {
      const data = await fonctionEcheancesService.getFrequences();
      setFrequences(data);
    } catch (error) {
      console.error('Erreur lors du chargement des fréquences:', error);
      message.error("Erreur lors du chargement des fréquences");
    }
  }, []);

  const fetchEcheances = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fonctionEcheancesService.getEcheances();
      if (Array.isArray(data)) {
        setEcheances(data);
        setPagination(prev => ({
          ...prev,
          total: data.length,
          current: 1,
        }));
      } else {
        console.error('Les données reçues ne sont pas un tableau:', data);
        setEcheances([]);
        setPagination(prev => ({ ...prev, total: 0, current: 1 }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      message.error("Erreur lors du chargement des échéances");
      setEcheances([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
    } finally {
      setLoading(false);
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
    fetchFonctions();
    fetchFrequences();
    fetchEcheances();
  }, [fetchFonctions, fetchFrequences, fetchEcheances]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Filtrage des échéances selon le champ de recherche
  const filteredEcheances = echeances.filter(e => {
    return (
      (e.libelle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.fonctionNom || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Grouper les échéances par fonction
  const echeancesGroupeesParFonction = filteredEcheances.reduce((acc, echeance) => {
    const fonctionNom = echeance.fonctionNom || 'Fonction non définie';
    if (!acc[fonctionNom]) {
      acc[fonctionNom] = [];
    }
    acc[fonctionNom].push(echeance);
    return acc;
  }, {});

  // Statistiques calculées à partir des échéances filtrées
  const now = new Date();
  const totalEcheances = filteredEcheances.length;
  const echeancesAVenir = filteredEcheances.filter(e => new Date(e.dateButoir) > now).length;
  const echeancesEchues = filteredEcheances.filter(e => new Date(e.dateButoir) <= now).length;
  const prochainesEcheances = filteredEcheances.filter(e => {
    const date = new Date(e.dateButoir);
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 7;
  }).length;

  const getStatutEcheance = (dateButoir) => {
    const now = new Date();
    const date = new Date(dateButoir);
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { label: 'Échue', color: 'red' };
    } else if (diffDays <= 7) {
      return { label: 'Urgente', color: 'orange' };
    } else {
      return { label: 'À venir', color: 'green' };
    }
  };

  // Colonnes pour le tableau des échéances dans chaque fonction
  const echeancesColumns = [
    {
      title: 'Échéance',
      key: 'echeance',
      render: (_, record) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-blue-100 text-blue-600">
            <CalendarOutlined />
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {record.libelle || 'Non défini'}
            </div>
            <div className="text-sm text-gray-500">
              {record.dateButoir ? dayjs(record.dateButoir).format('DD/MM/YYYY') : 'Date non définie'}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Fréquence',
      key: 'frequence',
      render: (_, record) => {
        if (record.frequence === undefined || record.frequence === null) return 'Non définie';
        const frequenceObj = frequences.find(f => f.valeur === record.frequence);
        return frequenceObj ? frequenceObj.libelle : 'Inconnue';
      }
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
          <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Popconfirm 
            title="Supprimer cette échéance ?" 
            onConfirm={() => handleDelete(record.id, record.fonctionId)} 
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
    setEditingEcheance(record);
    setModalVisible(true);
    if (record) {
      form.setFieldsValue({
        ...record,
        dateButoir: dayjs(record.dateButoir),
        fonctionId: record.fonctionId
      });
    } else {
      form.resetFields();
    }
  };

  const openViewModal = (record) => {
    setViewingEcheance(record);
    setViewModalVisible(true);
  };

  const closeViewModal = () => {
    setViewModalVisible(false);
    setViewingEcheance(null);
  };

  const handleDelete = async (id, fonctionId) => {
    try {
      if (!fonctionId) {
        message.error("Impossible de supprimer l'échéance : fonction non définie");
        return;
      }
      await fonctionEcheancesService.deleteEcheance(fonctionId, id);
      message.success('Échéance supprimée avec succès');
      fetchEcheances();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      message.error(error.response?.data?.message || error.response?.data?.title || "Erreur lors de la suppression");
    }
  };

  const handleSubmit = async (values) => {
    try {
      const echeanceData = {
        ...values,
        dateButoir: values.dateButoir.toISOString(),
      };

      if (editingEcheance) {
        await fonctionEcheancesService.updateEcheance(editingEcheance.fonctionId, editingEcheance.id, {
          ...echeanceData,
          fonctionId: editingEcheance.fonctionId
        });
        message.success('Échéance modifiée avec succès');
      } else {
        const fonctionId = values.fonctionId;
        if (!fonctionId) {
          message.error("Veuillez sélectionner une fonction");
          return;
        }
        await fonctionEcheancesService.createEcheance(fonctionId, {
          ...echeanceData,
          fonctionId
        });
        message.success('Échéance créée avec succès');
      }
      setModalVisible(false);
      setEditingEcheance(null);
      form.resetFields();
      fetchEcheances();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      message.error(error.response?.data?.message || error.response?.data?.title || "Erreur lors de l'enregistrement");
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
                  Échéances des Fonctions
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
                  title="Total des échéances"
                  value={totalEcheances}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Échéances à venir"
                  value={echeancesAVenir}
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Échéances échues"
                  value={echeancesEchues}
                  valueStyle={{ color: '#cf1322' }}
                  prefix={<WarningOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Prochaines 7 jours"
                  value={prochainesEcheances}
                  valueStyle={{ color: '#fa8c16' }}
                  prefix={<ClockCircleOutlined />}
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
              Ajouter une échéance
            </Button>

            <Input
              placeholder="Rechercher par libellé ou fonction..."
              prefix={<SearchOutlined />}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', maxWidth: 300 }}
              allowClear
            />
          </div>

          <div className="w-full bg-white p-4 sm:p-6 rounded-lg shadow">
            {loading ? (
              <div className="text-center py-8">
                <p>Chargement des données...</p>
              </div>
            ) : Object.keys(echeancesGroupeesParFonction).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucune échéance trouvée</p>
              </div>
            ) : (
              <Collapse 
                defaultActiveKey={Object.keys(echeancesGroupeesParFonction)} 
                className="fonction-collapse"
              >
                {Object.entries(echeancesGroupeesParFonction).map(([fonctionNom, echeances]) => (
                  <Panel 
                    header={
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CrownOutlined style={{ marginRight: 12, color: '#f59e0b', fontSize: '16px' }} />
                          <span className="font-semibold text-lg">{fonctionNom}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {echeances.length} échéance{echeances.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    } 
                    key={fonctionNom}
                    className="mb-4"
                  >
                    <Table
                      columns={echeancesColumns}
                      dataSource={echeances}
                      rowKey="id"
                      pagination={false}
                      size="middle"
                      className="fonction-table"
                      scroll={{ x: 'max-content' }}
                    />
                  </Panel>
                ))}
              </Collapse>
            )}

            <Modal
              title={editingEcheance ? 'Modifier l\'échéance' : 'Ajouter une échéance'}
              open={modalVisible}
              onCancel={() => { setModalVisible(false); setEditingEcheance(null); form.resetFields(); }}
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
                    disabled={editingEcheance !== null}
                  >
                    {fonctions.map(fonction => (
                      <Option key={fonction.id} value={fonction.id}>
                        {fonction.nomFonction}
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
                  <Input prefix={<CalendarOutlined />} />
                </Form.Item>

                <Form.Item
                  name="dateButoir"
                  label="Date butoir"
                  rules={[{ required: true, message: 'La date butoir est obligatoire' }]}
                >
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>

                <Form.Item
                  name="frequence"
                  label="Fréquence"
                  rules={[{ required: true, message: 'La fréquence est obligatoire' }]}
                >
                  <Select
                    placeholder="Sélectionner une fréquence"
                    showSearch
                    optionFilterProp="children"
                  >
                    {frequences.map(freq => (
                      <Option key={freq.valeur} value={freq.valeur}>
                        {freq.libelle} - {freq.description}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item>
                  <Space className="w-full justify-end">
                    <Button type="primary" htmlType="submit">
                      {editingEcheance ? 'Mettre à jour' : 'Ajouter'}
                    </Button>
                    <Button onClick={() => { setModalVisible(false); setEditingEcheance(null); form.resetFields(); }}>
                      Annuler
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Modal>

            {/* Modal de détails/visualisation */}
            <Modal
              title="Détails de l'échéance"
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
              {viewingEcheance && (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Fonction">
                        <p>
                          <CrownOutlined style={{ marginRight: 8, color: '#f59e0b' }} />
                          {viewingEcheance.fonctionNom || 'Non définie'}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Échéance">
                        <p style={{ fontWeight: 'bold', color: '#1890ff' }}>
                          <CalendarOutlined style={{ marginRight: 8 }} />
                          {viewingEcheance.libelle || 'Non défini'}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Date butoir">
                        <p style={{ fontWeight: 'bold' }}>
                          <ClockCircleOutlined style={{ marginRight: 8, color: '#f59e0b' }} />
                          {viewingEcheance.dateButoir ? dayjs(viewingEcheance.dateButoir).format('DD/MM/YYYY') : 'Non définie'}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24}>
                      <Card size="small" title="Fréquence">
                        <p>
                          <TeamOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                          {viewingEcheance.frequence !== undefined && viewingEcheance.frequence !== null
                            ? (() => {
                                const frequenceObj = frequences.find(f => f.valeur === viewingEcheance.frequence);
                                return frequenceObj ? `${frequenceObj.libelle} - ${frequenceObj.description}` : 'Inconnue';
                              })()
                            : 'Non définie'
                          }
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

export default FonctionEcheancesPage;