import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Space, Popconfirm, Tag, Card, Row, Col, Statistic, Collapse, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DollarOutlined, CalendarOutlined, SearchOutlined, EyeOutlined, RiseOutlined, FallOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { evenementService } from '../services/evenementService';
import { evenementBudgetService } from '../services/evenementBudgetService';
import Sidebar from '../components/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import '../styles/table.css';

const { Panel } = Collapse;

const EvenementBudget = () => {
  const [budgets, setBudgets] = useState([]);
  const [evenements, setEvenements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [selectedBudget, setSelectedBudget] = useState(null);
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleToggleCollapse = useCallback((collapsed) => {
    setIsCollapsed(collapsed);
  }, []);

  const sidebarWidth = isCollapsed ? '4rem' : '18rem';

  const fetchEvenements = useCallback(async () => {
    try {
      const response = await evenementService.getEvenements();
      setEvenements(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
      message.error("Erreur lors du chargement des événements");
    }
  }, []);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
      };
      const { budgets, totalCount } = await evenementBudgetService.getBudgets(params);
      setBudgets(budgets);
      setPagination(prev => ({
        ...prev,
        total: totalCount,
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des budgets:', error);
      message.error("Erreur lors du chargement des budgets");
      setBudgets([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    fetchEvenements();
  }, [fetchEvenements]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Filtrage des budgets selon le champ de recherche
  const filteredBudgets = budgets.filter(budget => {
    return (
      (budget.libelle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (budget.evenementLibelle || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Grouper les budgets par événement
  const budgetsGroupesParEvenement = filteredBudgets.reduce((acc, budget) => {
    const evenementLibelle = budget.evenementLibelle || 'Événement non défini';
    if (!acc[evenementLibelle]) {
      acc[evenementLibelle] = [];
    }
    acc[evenementLibelle].push(budget);
    return acc;
  }, {});

  // Statistiques calculées à partir des budgets filtrés
  const totalBudgets = filteredBudgets.length;
  const totalMontantBudget = filteredBudgets.reduce((sum, b) => sum + (b.montantBudget || 0), 0);
  const totalMontantRealise = filteredBudgets.reduce((sum, b) => sum + (b.montantRealise || 0), 0);
  const totalEcart = totalMontantRealise - totalMontantBudget;
  const budgetsDepassement = filteredBudgets.filter(b => b.estDepassement).length;
  const budgetsSousConsomme = filteredBudgets.filter(b => b.estSousConsomme).length;
  const budgetsOK = totalBudgets - budgetsDepassement - budgetsSousConsomme;

  // Colonnes pour le tableau des budgets dans chaque événement
  const budgetsColumns = [
    {
      title: 'Budget',
      key: 'budget',
      width: 200,
      render: (_, record) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-blue-100 text-blue-600">
            <DollarOutlined />
          </div>
          <div style={{ maxWidth: 160 }}>
            <div className="font-medium text-gray-900 ellipsis-cell" style={{ maxWidth: 160 }} title={record.libelle}>
              {record.libelle}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Montant Budget',
      dataIndex: 'montantBudget',
      key: 'montantBudget',
      render: (v) => (
        <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
          <DollarOutlined style={{ marginRight: 8 }} />
          {v != null ? v.toLocaleString('fr-FR') + ' FCFA' : '0 FCFA'}
        </span>
      ),
    },
    {
      title: 'Montant Réalisé',
      dataIndex: 'montantRealise',
      key: 'montantRealise',
      render: (v) => (
        <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
          <DollarOutlined style={{ marginRight: 8 }} />
          {v != null ? v.toLocaleString('fr-FR') + ' FCFA' : '0 FCFA'}
        </span>
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'estDepassement',
      key: 'estDepassement',
      render: (v, record) => {
        if (v) return <Tag color="red" icon={<RiseOutlined />}>Dépassement</Tag>;
        if (record.estSousConsomme) return <Tag color="blue" icon={<FallOutlined />}>Sous-consommé</Tag>;
        return <Tag color="green" icon={<CheckCircleOutlined />}>Conforme</Tag>;
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
          <Button 
            icon={<EditOutlined />} 
            onClick={() => openModal(record)} 
            title="Modifier"
          />
          <Popconfirm 
            title="Supprimer ce budget ?" 
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

  const openModal = (record = null) => {
    setEditingBudget(record);
    setModalVisible(true);
    if (record) {
      form.setFieldsValue({
        ...record,
        evenementId: record.evenementId,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ 
        libelle: '',
        evenementId: undefined,
        montantBudget: 0,
        montantRealise: 0
      });
    }
  };

  const openDetailModal = async (record) => {
    try {
      setSelectedBudget(record);
      setDetailModalVisible(true);
    } catch (error) {
      message.error("Erreur lors du chargement des détails");
    }
  };

  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedBudget(null);
  };

  const handleDelete = async (id) => {
    try {
      await evenementBudgetService.deleteBudget(id);
      message.success('Budget supprimé');
      fetchBudgets();
    } catch (error) {
      message.error("Erreur lors de la suppression: " + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingBudget) {
        await evenementBudgetService.updateBudget(editingBudget.id, values);
        message.success('Budget modifié');
      } else {
        await evenementBudgetService.createBudget(values);
        message.success('Budget ajouté');
      }
      setModalVisible(false);
      setEditingBudget(null);
      form.resetFields();
      fetchBudgets();
    } catch (error) {
      message.error(error.response?.data?.message || error.message || "Erreur lors de l'enregistrement");
    }
  };

  const getStatusColor = (budget) => {
    if (budget.estDepassement) return '#cf1322';
    if (budget.estSousConsomme) return '#1890ff';
    return '#52c41a';
  };

  const getStatusIcon = (budget) => {
    if (budget.estDepassement) return <RiseOutlined />;
    if (budget.estSousConsomme) return <FallOutlined />;
    return <CheckCircleOutlined />;
  };

  // Calculer les statistiques pour un événement spécifique
  const getEvenementStats = (budgets) => {
    const totalBudget = budgets.reduce((sum, b) => sum + (b.montantBudget || 0), 0);
    const totalRealise = budgets.reduce((sum, b) => sum + (b.montantRealise || 0), 0);
    const ecart = totalRealise - totalBudget;
    const nbDepassement = budgets.filter(b => b.estDepassement).length;
    const nbSousConsomme = budgets.filter(b => b.estSousConsomme).length;
    const nbConforme = budgets.length - nbDepassement - nbSousConsomme;
    
    return { totalBudget, totalRealise, ecart, nbDepassement, nbSousConsomme, nbConforme };
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
                  Budgets d'Événements
                </h1>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-full">
          {/* Statistiques principales */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} md={8} lg={8}>
              <Card>
                <Statistic
                  title="Total Budgets"
                  value={totalBudgets}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={8}>
              <Card>
                <Statistic
                  title="Budget Total"
                  value={totalMontantBudget}
                  precision={0}
                  prefix={<DollarOutlined />}
                  suffix=" FCFA"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={8}>
              <Card>
                <Statistic
                  title="Réalisé Total"
                  value={totalMontantRealise}
                  precision={0}
                  prefix={<DollarOutlined />}
                  suffix=" FCFA"
                  valueStyle={{ color: '#1890ff' }}
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
              Ajouter un budget
            </Button>
            <Input
              placeholder="Rechercher par libellé ou événement..."
              prefix={<SearchOutlined />}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', maxWidth: 300 }}
              allowClear
            />
          </div>

          {/* Affichage groupé par événement */}
          <div className="w-full bg-white p-4 sm:p-6 rounded-lg shadow">
            {loading ? (
              <div className="text-center py-8">
                <Spin size="large" />
                <p className="mt-4">Chargement des budgets...</p>
              </div>
            ) : Object.keys(budgetsGroupesParEvenement).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucun budget trouvé</p>
              </div>
            ) : (
              <Collapse 
                defaultActiveKey={Object.keys(budgetsGroupesParEvenement)} 
                className="budget-collapse"
              >
                {Object.entries(budgetsGroupesParEvenement).map(([evenementLibelle, budgets]) => {
                  const stats = getEvenementStats(budgets);
                  const evenementDate = budgets[0]?.evenementDate;
                  
                  return (
                    <Panel 
                      header={
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <CalendarOutlined style={{ marginRight: 12, color: '#1890ff', fontSize: '16px' }} />
                            <div>
                              <span className="font-semibold text-lg">{evenementLibelle}</span>
                              {evenementDate && (
                                <div className="text-sm text-gray-500">
                                  {new Date(evenementDate).toLocaleDateString('fr-FR')}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                              {budgets.length} budget{budgets.length > 1 ? 's' : ''}
                            </span>
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                              Budget: {stats.totalBudget.toLocaleString('fr-FR')} FCFA
                            </span>
                            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                              Réalisé: {stats.totalRealise.toLocaleString('fr-FR')} FCFA
                            </span>
                          </div>
                        </div>
                      } 
                      key={evenementLibelle}
                      className="mb-4"
                    >
                      <Table
                        columns={budgetsColumns}
                        dataSource={budgets}
                        rowKey="id"
                        pagination={false}
                        size="middle"
                        className="budget-table"
                        scroll={{ x: 'max-content' }}
                      />
                    </Panel>
                  );
                })}
              </Collapse>
            )}

            {/* Modal d'ajout/modification */}
            <Modal
              title={editingBudget ? 'Modifier le budget' : 'Ajouter un budget'}
              open={modalVisible}
              onCancel={() => { 
                setModalVisible(false); 
                setEditingBudget(null); 
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
                initialValues={editingBudget ? undefined : { 
                  montantRealise: 0,
                  montantBudget: 0,
                  libelle: '',
                  evenementId: undefined
                }}
              >
                <Form.Item
                  name="evenementId"
                  label="Événement"
                  rules={[{ required: true, message: 'L\'événement est obligatoire' }]}
                >
                  <Select
                    placeholder="Sélectionner un événement"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    allowClear
                    disabled={editingBudget !== null}
                    style={{ cursor: editingBudget === null ? 'pointer' : 'not-allowed' }}
                  >
                    {evenements.map((evenement) => (
                      <Select.Option key={evenement.id} value={evenement.id}>
                        {evenement.libelle}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="libelle"
                  label="Libellé"
                  rules={[
                    { required: true, message: 'Saisissez un libellé' },
                    { max: 200, message: 'Le libellé ne peut pas dépasser 200 caractères' }
                  ]}
                >
                  <Input 
                    placeholder="Saisissez le libellé du budget"
                    prefix={<DollarOutlined />}
                  />
                </Form.Item>

                <Form.Item
                  name="montantBudget"
                  label="Montant budget (FCFA)"
                  rules={[
                    { required: true, message: 'Saisissez le montant du budget' },
                    { type: 'number', min: 0.01, message: 'Le montant doit être supérieur à 0' }
                  ]}
                >
                  <InputNumber 
                    min={0.01} 
                    step={100} 
                    style={{ width: '100%' }} 
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    placeholder="0"
                  />
                </Form.Item>

                <Form.Item
                  name="montantRealise"
                  label="Montant réalisé (FCFA)"
                  rules={[
                    { required: true, message: 'Saisissez le montant réalisé' },
                    { type: 'number', min: 0, message: 'Le montant doit être positif ou nul' }
                  ]}
                >
                  <InputNumber 
                    min={0} 
                    step={100} 
                    style={{ width: '100%' }} 
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    placeholder="0"
                  />
                </Form.Item>

                <Form.Item>
                  <Space className="w-full justify-end">
                    <Button type="primary" htmlType="submit">
                      {editingBudget ? 'Mettre à jour' : 'Ajouter'}
                    </Button>
                    <Button onClick={() => { 
                      setModalVisible(false); 
                      setEditingBudget(null); 
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
              title="Détails du Budget"
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
              {selectedBudget && (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Libellé">
                        <p style={{ fontWeight: 'bold', color: '#1890ff' }}>
                          <DollarOutlined style={{ marginRight: 8 }} />
                          {selectedBudget.libelle}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Événement">
                        <p>
                          <CalendarOutlined style={{ marginRight: 8, color: '#f59e0b' }} />
                          {selectedBudget.evenementLibelle}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Date de l'événement">
                        <p>
                          {selectedBudget.evenementDate ? 
                            new Date(selectedBudget.evenementDate).toLocaleDateString('fr-FR') : 
                            'Non spécifiée'
                          }
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Statut">
                        <p>
                          {selectedBudget.estDepassement ? 
                            <Tag color="red" icon={<RiseOutlined />}>Dépassement</Tag> :
                            selectedBudget.estSousConsomme ? 
                            <Tag color="blue" icon={<FallOutlined />}>Sous-consommé</Tag> :
                            <Tag color="green" icon={<CheckCircleOutlined />}>Conforme</Tag>
                          }
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={8}>
                      <Card size="small" title="Budget prévu">
                        <p style={{ fontWeight: 'bold', color: '#52c41a' }}>
                          <DollarOutlined style={{ marginRight: 8 }} />
                          {selectedBudget.montantBudget?.toLocaleString('fr-FR')} FCFA
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={8}>
                      <Card size="small" title="Montant réalisé">
                        <p style={{ fontWeight: 'bold', color: '#1890ff' }}>
                          <DollarOutlined style={{ marginRight: 8 }} />
                          {selectedBudget.montantRealise?.toLocaleString('fr-FR')} FCFA
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24}>
                      <Card size="small" title="Actions disponibles">
                        <Space>
                          <Button 
                            icon={<EditOutlined />}
                            onClick={() => {
                              closeDetailModal();
                              openModal(selectedBudget);
                            }}
                          >
                            Modifier
                          </Button>
                        </Space>
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

export default EvenementBudget;