import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, InputNumber, DatePicker, Input, message, Space, Popconfirm, Card, Row, Col, Statistic, Select, Spin, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DollarOutlined, CalendarOutlined, BarChartOutlined, InfoCircleOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import Sidebar from '../components/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import dayjs from 'dayjs';
import { rubriqueBudgetRealiseService } from '../api/rubriqueBudgetRealiseService';
import { rubriqueBudgetService } from '../api/rubriqueBudgetService';
import '../styles/table.css';

const { TextArea } = Input;
const { Option } = Select;

const RubriqueBudgetRealisePage = () => {
  const [realisations, setRealisations] = useState([]);
  const [rubriques, setRubriques] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRealisation, setEditingRealisation] = useState(null);
  const [statsModalVisible, setStatsModalVisible] = useState(false);
  const [selectedRubriqueForStats, setSelectedRubriqueForStats] = useState(null);
  const [rubriqueStats, setRubriqueStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [form] = Form.useForm();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [globalStats, setGlobalStats] = useState(null); // For overall stats if needed later
  const [dateRange, setDateRange] = useState(null);
  const [filters, setFilters] = useState({ clubId: null, rubriqueId: null });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingRealisation, setViewingRealisation] = useState(null);

  const clubId = JSON.parse(localStorage.getItem('user'))?.clubId;

  const fetchRubriques = useCallback(async () => {
    if (!clubId) {
      console.log('fetchRubriques: clubId is missing');
      return;
    }
    console.log('fetchRubriques: Starting to fetch rubriques for clubId:', clubId);
    try {
      console.log('fetchRubriques: Calling rubriqueBudgetService.getRubriquesBudget');
      const rubriquesData = await rubriqueBudgetService.getRubriquesBudget(clubId);
      console.log('fetchRubriques: Received data:', rubriquesData);
      setRubriques(rubriquesData);
    } catch (error) {
      console.error('fetchRubriques: Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      message.error("Erreur lors du chargement des rubriques budgétaires");
    }
  }, [clubId]);

  const fetchRealisations = useCallback(async (page = pagination.current, pageSize = pagination.pageSize, dateDebut = dateRange ? dateRange[0] : null, dateFin = dateRange ? dateRange[1] : null) => {
    if (!clubId || rubriques.length === 0) {
      setRealisations([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1}));
      return;
    }
    setLoading(true);
    try {
      // Appeler l'API pour chaque rubrique et fusionner les résultats
      const allResults = await Promise.all(
        rubriques.map(rubrique =>
          rubriqueBudgetRealiseService.getRealisations(
            clubId,
            rubrique.id,
            dateDebut ? dateDebut.toISOString() : null,
            dateFin ? dateFin.toISOString() : null,
            1, // on récupère tout, pagination à gérer côté front si besoin
            1000 // nombre élevé pour tout récupérer
          ).then(res => (res.items || []).map(item => ({ ...item, rubriqueId: rubrique.id })))
        )
      );
      const merged = allResults.flat();
      setRealisations(merged);
      setPagination(prev => ({
        ...prev,
        current: 1,
        pageSize: pageSize,
        total: merged.length,
      }));
    } catch (error) {
      message.error("Erreur lors du chargement des réalisations");
      setRealisations([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1}));
    } finally {
      setLoading(false);
    }
  }, [clubId, rubriques, dateRange, pagination.pageSize]);

  const loadStatistics = useCallback(async () => {
    if (!clubId || !rubriques.length) return;
    
    setStatsLoading(true);
    try {
      const results = await Promise.all(rubriques.map(rubrique => 
        rubriqueBudgetRealiseService.getStatistiques(clubId, rubrique.id)
      ));
      const stats = results.reduce((acc, curr, index) => {
        acc[rubriques[index].id] = {
          ...curr,
          libelle: rubriques[index].libelle
        };
        return acc;
      }, {});
      setRubriqueStats(stats);
    } catch (error) {
      message.error("Erreur lors du chargement des statistiques");
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setStatsLoading(false);
    }
  }, [clubId, rubriques]);

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
    if (clubId) {
      fetchRubriques();
    }
  }, [clubId, fetchRubriques]);

  useEffect(() => {
    if (rubriques.length > 0) {
      loadStatistics();
    }
  }, [rubriques, loadStatistics]);

  useEffect(() => {
    fetchRealisations(1, pagination.pageSize);
  }, [clubId, rubriques, fetchRealisations]);

  const handleTableChange = (newPagination) => {
    fetchRealisations(newPagination.current, newPagination.pageSize, dateRange ? dateRange[0] : null, dateRange ? dateRange[1] : null);
  };

  const openModal = (record = null) => {
    setEditingRealisation(record);
    setModalVisible(true);
    if (record) {
      form.setFieldsValue({
        ...record,
        date: dayjs(record.date),
        rubriqueId: record.rubriqueId
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ 
        date: dayjs(),
        rubriqueId: filters.rubriqueId
      });
    }
  };

  const handleDelete = async (id) => {
    if (!clubId || !filters.rubriqueId) return;
    try {
      await rubriqueBudgetRealiseService.deleteRealisation(clubId, filters.rubriqueId, id);
      message.success('Réalisation supprimée');
      fetchRealisations(pagination.current, pagination.pageSize, dateRange ? dateRange[0] : null, dateRange ? dateRange[1] : null);
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
      const realisationData = {
        date: values.date.toISOString(),
        montant: values.montant,
        commentaires: values.commentaires || "",
      };

      if (editingRealisation) {
        await rubriqueBudgetRealiseService.updateRealisation(clubId, values.rubriqueId, editingRealisation.id, realisationData);
        message.success('Réalisation modifiée');
      } else {
        await rubriqueBudgetRealiseService.createRealisation(clubId, values.rubriqueId, realisationData);
        message.success('Réalisation ajoutée');
      }
      setModalVisible(false);
      setEditingRealisation(null);
      form.resetFields();
      // Mettre à jour la liste des réalisations avec la nouvelle rubrique sélectionnée
      setFilters(prev => ({ ...prev, rubriqueId: values.rubriqueId }));
      fetchRealisations(1, pagination.pageSize, dateRange ? dateRange[0] : null, dateRange ? dateRange[1] : null);
    } catch (error) {
      // Affiche le message du backend s'il existe (string ou objet)
      let backendMsg = error.response?.data;
      if (backendMsg && typeof backendMsg === 'object') {
        backendMsg = backendMsg.message || JSON.stringify(backendMsg);
      }
      message.error(backendMsg || error.message || "Erreur lors de l'enregistrement");
    }
  };

  const handleRubriqueChange = (value) => {
    setFilters(prev => ({ ...prev, rubriqueId: value }));
    setDateRange(null);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    if (filters.rubriqueId) {
      fetchRealisations(1, pagination.pageSize, dates ? dates[0] : null, dates ? dates[1] : null);
    }
  };

  // Filtrage des réalisations selon le champ de recherche
  const filteredRealisations = realisations.filter(r => {
    const rubriqueLibelle = rubriques.find(rb => rb.id === r.rubriqueId)?.libelle || '';
    return (
      rubriqueLibelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.commentaires || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Statistiques synthétiques calculées côté front
  const totalRealisations = filteredRealisations.length;
  const montantTotal = filteredRealisations.reduce((sum, r) => sum + (r.montant || 0), 0);
  const montantMoyen = totalRealisations > 0 ? montantTotal / totalRealisations : 0;
  const nombreRubriques = new Set(filteredRealisations.map(r => r.rubriqueId)).size;

  const columns = [
    {
      title: 'Rubrique',
      dataIndex: 'rubriqueId',
      key: 'rubriqueId',
      render: (rubriqueId) => {
        const libelle = rubriques.find(r => r.id === rubriqueId)?.libelle || 'N/A';
        return <span className="ellipsis-cell" title={libelle}>{libelle}</span>;
      },
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: 'Montant',
      dataIndex: 'montant',
      key: 'montant',
      render: (montant) => montant.toLocaleString('fr-FR') + ' FCFA',
      sorter: (a, b) => a.montant - b.montant,
    },
    {
      title: 'Commentaires',
      dataIndex: 'commentaires',
      key: 'commentaires',
      ellipsis: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => openViewModal(record)} />
          <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Popconfirm title="Supprimer cette réalisation ?" onConfirm={() => handleDelete(record.id)} okText="Oui" cancelText="Non">
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const openViewModal = (record) => {
    setViewingRealisation(record);
    setViewModalVisible(true);
  };

  const closeViewModal = () => {
    setViewModalVisible(false);
    setViewingRealisation(null);
  };

  // Pour éviter les re-créations inutiles
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
                  Réalisations Budgétaires par Rubrique
                </h1>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-full">
          {/* Statistiques synthétiques */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Nombre de réalisations"
                  value={totalRealisations}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Montant total réalisé"
                  value={montantTotal}
                  precision={0}
                  valueStyle={{ color: '#3f8600' }}
                  suffix=" FCFA"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Montant moyen"
                  value={montantMoyen}
                  precision={0}
                  valueStyle={{ color: '#1890ff' }}
                  suffix=" FCFA"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Nombre de rubriques"
                  value={nombreRubriques}
                />
              </Card>
            </Col>
          </Row>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-4">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              Ajouter une réalisation
            </Button>
            <Input
              placeholder="Rechercher par rubrique ou commentaire..."
              prefix={<SearchOutlined />}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', maxWidth: 300 }}
              allowClear
            />
          </div>

          <div className="w-full bg-white p-4 sm:p-6 rounded-lg shadow">
            <Table
              columns={columns}
              dataSource={filteredRealisations}
              rowKey="id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
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

            <Modal
              title={editingRealisation ? 'Modifier la réalisation' : 'Ajouter une réalisation'}
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
              >
                <Form.Item
                  name="rubriqueId"
                  label="Rubrique"
                  rules={[{ required: true, message: 'La rubrique est obligatoire' }]}
                >
                  <Select
                    placeholder="Sélectionnez une rubrique"
                    showSearch
                    optionFilterProp="children"
                    disabled={!!editingRealisation}
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {rubriques.map(r => (
                      <Option key={r.id} value={r.id}>{r.libelle}</Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="date"
                  label="Date de réalisation"
                  extra={(() => {
                    const rubriqueId = form.getFieldValue('rubriqueId');
                    const rubrique = rubriques.find(r => r.id === rubriqueId);
                    if (rubrique && rubrique.dateDebut && rubrique.dateFin) {
                      const debut = dayjs(rubrique.dateDebut).format('DD/MM/YYYY');
                      const fin = dayjs(rubrique.dateFin).format('DD/MM/YYYY');
                      return `Période autorisée : du ${debut} au ${fin}`;
                    }
                    return '';
                  })()}
                  rules={[
                    { required: true, message: 'La date est obligatoire' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const rubriqueId = getFieldValue('rubriqueId');
                        const rubrique = rubriques.find(r => r.id === rubriqueId);
                        if (!rubrique || !rubrique.dateDebut || !rubrique.dateFin || !value) {
                          return Promise.resolve();
                        }
                        const debut = dayjs(rubrique.dateDebut);
                        const fin = dayjs(rubrique.dateFin);
                        if (value.isBefore(debut) || value.isAfter(fin)) {
                          return Promise.reject(
                            new Error(
                              `La date de réalisation doit être comprise entre ${debut.format('DD/MM/YYYY')} et ${fin.format('DD/MM/YYYY')} (période du mandat ${rubrique.mandatAnnee || ''})`
                            )
                          );
                        }
                        return Promise.resolve();
                      }
                    })
                  ]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    disabledDate={current => {
                      const rubriqueId = form.getFieldValue('rubriqueId');
                      const rubrique = rubriques.find(r => r.id === rubriqueId);
                      if (!rubrique || !rubrique.dateDebut || !rubrique.dateFin) return false;
                      const debut = dayjs(rubrique.dateDebut);
                      const fin = dayjs(rubrique.dateFin);
                      return current && (current < debut || current > fin);
                    }}
                  />
                </Form.Item>
                <Form.Item
                  name="montant"
                  label="Montant (FCFA)"
                  rules={[
                    { required: true, message: 'Le montant est obligatoire' },
                    { type: 'number', min: 0.01, message: 'Le montant doit être supérieur à 0' }
                  ]}
                >
                  <InputNumber min={0.01} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                  name="commentaires"
                  label="Commentaires"
                  rules={[{ max: 500, message: 'Les commentaires ne peuvent pas dépasser 500 caractères' }]}
                >
                  <TextArea rows={4} />
                </Form.Item>
                <Form.Item>
                  <Space className="w-full justify-end">
                    <Button type="primary" htmlType="submit">
                      {editingRealisation ? 'Mettre à jour' : 'Ajouter'}
                    </Button>
                    <Button onClick={() => { setModalVisible(false); setEditingRealisation(null); form.resetFields(); }}>
                      Annuler
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Modal>

            {/* Modal de détails/visualisation */}
            <Modal
              title="Détails de la réalisation"
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
              {viewingRealisation && (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Rubrique">
                        <p>{rubriques.find(r => r.id === viewingRealisation.rubriqueId)?.libelle || 'N/A'}</p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Date">
                        <p>{dayjs(viewingRealisation.date).format('DD/MM/YYYY')}</p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Montant">
                        <p style={{ color: '#3f8600', fontWeight: 'bold' }}>
                          {viewingRealisation.montant.toLocaleString('fr-FR')} FCFA
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24}>
                      <Card size="small" title="Commentaires">
                        <p>{viewingRealisation.commentaires || 'Aucun commentaire'}</p>
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

export default RubriqueBudgetRealisePage; 