import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Space, Popconfirm, Card, Row, Col, Statistic, Collapse, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DollarOutlined, CalendarOutlined, SearchOutlined, EyeOutlined, LineChartOutlined, FolderOutlined } from '@ant-design/icons';
import { evenementService } from '../services/evenementService';
import { evenementRecetteService } from '../services/evenementRecetteService';
import Sidebar from '../components/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import '../styles/table.css';

const { Panel } = Collapse;

const EvenementRecette = () => {
  const [recettes, setRecettes] = useState([]);
  const [evenements, setEvenements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingRecette, setEditingRecette] = useState(null);
  const [selectedRecette, setSelectedRecette] = useState(null);
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

  const fetchRecettes = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
      };
      const { recettes, totalCount } = await evenementRecetteService.getRecettes(params);
      setRecettes(recettes);
      setPagination(prev => ({
        ...prev,
        total: totalCount,
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des recettes:', error);
      message.error("Erreur lors du chargement des recettes");
      setRecettes([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    fetchEvenements();
  }, [fetchEvenements]);

  useEffect(() => {
    fetchRecettes();
  }, [fetchRecettes]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Filtrage des recettes selon le champ de recherche
  const filteredRecettes = recettes.filter(recette => {
    return (
      (recette.libelle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (recette.evenementLibelle || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Grouper les recettes par événement
  const recettesGroupeesParEvenement = filteredRecettes.reduce((acc, recette) => {
    const evenementLibelle = recette.evenementLibelle || 'Événement non défini';
    if (!acc[evenementLibelle]) {
      acc[evenementLibelle] = [];
    }
    acc[evenementLibelle].push(recette);
    return acc;
  }, {});

  // Statistiques calculées à partir des recettes filtrées
  const totalRecettes = filteredRecettes.length;
  const totalMontant = filteredRecettes.reduce((sum, r) => sum + (r.montant || 0), 0);
  const moyenneMontant = totalRecettes > 0 ? (totalMontant / totalRecettes) : 0;
  const uniqueEvenements = new Set(filteredRecettes.map(r => r.evenementId)).size;

  // Colonnes pour le tableau des recettes dans chaque événement
  const recettesColumns = [
    {
      title: 'Recette',
      key: 'recette',
      width: 200,
      render: (_, record) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-green-100 text-green-600">
            <LineChartOutlined />
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
      title: 'Montant',
      dataIndex: 'montant',
      key: 'montant',
      render: (v) => (
        <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
          <DollarOutlined style={{ marginRight: 8 }} />
          {v != null ? v.toLocaleString('fr-FR') + ' FCFA' : '0 FCFA'}
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
          <Button 
            icon={<EditOutlined />} 
            onClick={() => openModal(record)} 
            title="Modifier"
          />
          <Popconfirm 
            title="Supprimer cette recette ?" 
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
    setEditingRecette(record);
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
        montant: 0
      });
    }
  };

  const openDetailModal = async (record) => {
    try {
      setSelectedRecette(record);
      setDetailModalVisible(true);
    } catch (error) {
      message.error("Erreur lors du chargement des détails");
    }
  };

  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedRecette(null);
  };

  const handleDelete = async (id) => {
    try {
      await evenementRecetteService.deleteRecette(id);
      message.success('Recette supprimée');
      fetchRecettes();
    } catch (error) {
      message.error("Erreur lors de la suppression: " + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingRecette) {
        await evenementRecetteService.updateRecette(editingRecette.id, values);
        message.success('Recette modifiée');
      } else {
        await evenementRecetteService.createRecette(values);
        message.success('Recette ajoutée');
      }
      setModalVisible(false);
      setEditingRecette(null);
      form.resetFields();
      fetchRecettes();
    } catch (error) {
      message.error(error.response?.data?.message || error.message || "Erreur lors de l'enregistrement");
    }
  };

  // Calculer le total des montants pour un événement spécifique
  const getTotalMontantEvenement = (recettes) => {
    return recettes.reduce((sum, r) => sum + (r.montant || 0), 0);
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
                  Recettes d'Événements
                </h1>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-full">
          {/* Statistiques principales */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={6} md={6} lg={6}>
              <Card>
                <Statistic
                  title="Total Recettes"
                  value={totalRecettes}
                  prefix={<LineChartOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6} md={6} lg={6}>
              <Card>
                <Statistic
                  title="Montant Total"
                  value={totalMontant}
                  precision={0}
                  prefix={<DollarOutlined />}
                  suffix=" FCFA"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6} md={6} lg={6}>
              <Card>
                <Statistic
                  title="Montant Moyen"
                  value={moyenneMontant}
                  precision={0}
                  prefix={<DollarOutlined />}
                  suffix=" FCFA"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6} md={6} lg={6}>
              <Card>
                <Statistic
                  title="Événements"
                  value={uniqueEvenements}
                  prefix={<CalendarOutlined />}
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
              Ajouter une recette
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
                <p className="mt-4">Chargement des recettes...</p>
              </div>
            ) : Object.keys(recettesGroupeesParEvenement).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucune recette trouvée</p>
              </div>
            ) : (
              <Collapse 
                defaultActiveKey={Object.keys(recettesGroupeesParEvenement)} 
                className="recette-collapse"
              >
                {Object.entries(recettesGroupeesParEvenement).map(([evenementLibelle, recettes]) => {
                  const totalMontantEvenement = getTotalMontantEvenement(recettes);
                  const evenementDate = recettes[0]?.evenementDate;
                  
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
                              {recettes.length} recette{recettes.length > 1 ? 's' : ''}
                            </span>
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                              Total: {totalMontantEvenement.toLocaleString('fr-FR')} FCFA
                            </span>
                          </div>
                        </div>
                      } 
                      key={evenementLibelle}
                      className="mb-4"
                    >
                      <Table
                        columns={recettesColumns}
                        dataSource={recettes}
                        rowKey="id"
                        pagination={false}
                        size="middle"
                        className="recette-table"
                        scroll={{ x: 'max-content' }}
                      />
                    </Panel>
                  );
                })}
              </Collapse>
            )}

            {/* Modal d'ajout/modification */}
            <Modal
              title={editingRecette ? 'Modifier la recette' : 'Ajouter une recette'}
              open={modalVisible}
              onCancel={() => { 
                setModalVisible(false); 
                setEditingRecette(null); 
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
                initialValues={editingRecette ? undefined : { 
                  montant: 0,
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
                    disabled={editingRecette !== null}
                    style={{ cursor: editingRecette === null ? 'pointer' : 'not-allowed' }}
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
                    placeholder="Saisissez le libellé de la recette"
                    prefix={<LineChartOutlined />}
                  />
                </Form.Item>

                <Form.Item
                  name="montant"
                  label="Montant (FCFA)"
                  rules={[
                    { required: true, message: 'Saisissez le montant' },
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

                <Form.Item>
                  <Space className="w-full justify-end">
                    <Button type="primary" htmlType="submit">
                      {editingRecette ? 'Mettre à jour' : 'Ajouter'}
                    </Button>
                    <Button onClick={() => { 
                      setModalVisible(false); 
                      setEditingRecette(null); 
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
              title="Détails de la Recette"
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
              {selectedRecette && (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Libellé">
                        <p style={{ fontWeight: 'bold', color: '#1890ff' }}>
                          <LineChartOutlined style={{ marginRight: 8 }} />
                          {selectedRecette.libelle}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Événement">
                        <p>
                          <CalendarOutlined style={{ marginRight: 8, color: '#f59e0b' }} />
                          {selectedRecette.evenementLibelle}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Date de l'événement">
                        <p>
                          {selectedRecette.evenementDate ? 
                            new Date(selectedRecette.evenementDate).toLocaleDateString('fr-FR') : 
                            'Non spécifiée'
                          }
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Montant">
                        <p style={{ fontWeight: 'bold', color: '#52c41a' }}>
                          <DollarOutlined style={{ marginRight: 8 }} />
                          {selectedRecette.montant?.toLocaleString('fr-FR')} FCFA
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
                              openModal(selectedRecette);
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

export default EvenementRecette;