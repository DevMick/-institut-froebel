import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Card, Row, Col, Statistic, Select, Divider, Spin, Collapse } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DollarOutlined, FolderOutlined, BarChartOutlined, SearchOutlined, EyeOutlined, TagsOutlined } from '@ant-design/icons';
import { sousCategoryBudgetService } from '../api/sousCategoryBudgetService';
import { categoryBudgetService } from '../api/categoryBudgetService';
import { getTypesBudget } from '../api/typeBudgetService';
import Sidebar from '../components/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import '../styles/table.css';
import { useParams } from 'react-router-dom';

const { Option } = Select;
const { Panel } = Collapse;

const SousCategoryBudgetPage = () => {
  const [sousCategories, setSousCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingSousCategory, setEditingSousCategory] = useState(null);
  const [selectedSousCategory, setSelectedSousCategory] = useState(null);
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
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  // Récupérer le clubId depuis le localStorage
  const clubId = JSON.parse(localStorage.getItem('user'))?.clubId;

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

  const fetchCategories = useCallback(async () => {
    if (!clubId) return;
    try {
      // Charger tous les types de budget
      const types = await getTypesBudget();
      const allCategories = [];
      for (const type of types) {
        const categoriesData = await categoryBudgetService.getCategories(type.id);
        // Ajoute le typeBudgetLibelle à chaque catégorie
        const enriched = categoriesData.map(cat => ({
          ...cat,
          typeBudgetLibelle: type.libelle
        }));
        allCategories.push(...enriched);
      }
      setCategories(allCategories);
      if (allCategories.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(allCategories[0].id);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      message.error("Erreur lors du chargement des catégories");
    }
  }, [clubId, selectedCategoryId]);

  const fetchSousCategories = useCallback(async () => {
    if (!clubId) {
      console.log('Pas de clubId, impossible de charger les sous-catégories');
      setSousCategories([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
      return;
    }

    setLoading(true);
    try {
      console.log('Début du chargement des sous-catégories...');
      const allSousCategories = [];
      
      // Vérifier si nous avons des catégories
      if (!Array.isArray(categories) || categories.length === 0) {
        console.log('Aucune catégorie disponible');
        setSousCategories([]);
        setPagination(prev => ({ ...prev, total: 0, current: 1 }));
        return;
      }

      // Charger les sous-catégories pour chaque catégorie
      for (const category of categories) {
        try {
          console.log(`Chargement des sous-catégories pour la catégorie ${category.id} (${category.libelle})...`);
          const data = await sousCategoryBudgetService.getSousCategories(clubId, category.id);
          
          if (Array.isArray(data)) {
            const enriched = data.map(sc => ({
              ...sc,
              categoryBudgetLibelle: category.libelle,
              typeBudgetLibelle: category.typeBudgetLibelle
            }));
            allSousCategories.push(...enriched);
            console.log(`${enriched.length} sous-catégories chargées pour ${category.libelle}`);
          } else {
            console.warn(`Format de données invalide pour la catégorie ${category.id}`);
          }
        } catch (error) {
          console.error(`Erreur lors du chargement des sous-catégories pour la catégorie ${category.id}:`, error);
          message.error(`Erreur lors du chargement des sous-catégories pour ${category.libelle}`);
        }
      }

      console.log(`Total des sous-catégories chargées: ${allSousCategories.length}`);
      setSousCategories(allSousCategories);
      setPagination(prev => ({
        ...prev,
        total: allSousCategories.length,
        current: 1,
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des sous-catégories:', error);
      message.error("Erreur lors du chargement des sous-catégories");
      setSousCategories([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
    } finally {
      setLoading(false);
    }
  }, [clubId, categories]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (categories.length > 0) {
      fetchSousCategories();
    }
  }, [categories, fetchSousCategories]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Filtrage des sous-catégories selon le champ de recherche
  const filteredSousCategories = sousCategories.filter(s => {
    return (
      (s.libelle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.categoryBudgetLibelle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.typeBudgetLibelle || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Groupement à deux niveaux : d'abord par Type Budget, puis par Catégorie Budget
  const sousCategoriesGroupeesParType = filteredSousCategories.reduce((acc, sousCategory) => {
    const typeBudget = sousCategory.typeBudgetLibelle || 'Type non défini';
    
    if (!acc[typeBudget]) {
      acc[typeBudget] = {};
    }
    
    const categoryBudget = sousCategory.categoryBudgetLibelle || 'Catégorie non définie';
    
    if (!acc[typeBudget][categoryBudget]) {
      acc[typeBudget][categoryBudget] = [];
    }
    
    acc[typeBudget][categoryBudget].push(sousCategory);
    return acc;
  }, {});

  // Statistiques calculées à partir des sous-catégories filtrées
  const totalSousCategories = filteredSousCategories.length;
  const totalRubriques = filteredSousCategories.reduce((sum, s) => sum + (s.nombreRubriques || 0), 0);
  const moyenneRubriques = totalSousCategories > 0 ? (totalRubriques / totalSousCategories).toFixed(1) : 0;

  // Colonnes pour le tableau des sous-catégories
  const sousCategoriesColumns = [
    {
      title: 'Sous-catégorie',
      key: 'sousCategory',
      width: 250,
      render: (_, record) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-purple-100 text-purple-600">
            <TagsOutlined />
          </div>
          <div style={{ maxWidth: 200 }}>
            <div className="font-medium text-gray-900 ellipsis-cell" style={{ maxWidth: 200 }} title={record.libelle}>
              {record.libelle}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Nombre de Rubriques',
      dataIndex: 'nombreRubriques',
      key: 'nombreRubriques',
      render: (count) => (
        <span style={{ 
          color: count > 0 ? '#52c41a' : '#d9d9d9', 
          fontWeight: count > 0 ? 'bold' : 'normal' 
        }}>
          <BarChartOutlined style={{ marginRight: 8 }} />
          {count || 0}
        </span>
      ),
      sorter: (a, b) => (a.nombreRubriques || 0) - (b.nombreRubriques || 0),
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
            title="Supprimer cette sous-catégorie ?" 
            onConfirm={() => handleDelete(record.id, record.categoryBudgetId)} 
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
    setEditingSousCategory(record);
    setModalVisible(true);
    if (record) {
      form.setFieldsValue({
        libelle: record.libelle,
        categoryBudgetId: record.categoryBudgetId || undefined,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ 
        libelle: '', 
        categoryBudgetId: undefined 
      });
    }
  };

  const openDetailModal = async (record) => {
    try {
      const detailData = await sousCategoryBudgetService.getSousCategory(clubId, record.categoryBudgetId, record.id);
      setSelectedSousCategory(detailData);
      setDetailModalVisible(true);
    } catch (error) {
      message.error("Erreur lors du chargement des détails");
    }
  };

  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedSousCategory(null);
  };

  const handleDelete = async (id, categoryBudgetId) => {
    try {
      await sousCategoryBudgetService.deleteSousCategory(clubId, categoryBudgetId, id);
      message.success('Sous-catégorie supprimée');
      fetchSousCategories();
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
      const sousCategoryData = {
        libelle: values.libelle,
        categoryBudgetId: values.categoryBudgetId,
      };

      if (editingSousCategory) {
        await sousCategoryBudgetService.updateSousCategory(clubId, values.categoryBudgetId, editingSousCategory.id, sousCategoryData);
        message.success('Sous-catégorie modifiée');
      } else {
        await sousCategoryBudgetService.createSousCategory(clubId, values.categoryBudgetId, sousCategoryData);
        message.success('Sous-catégorie ajoutée');
      }
      setModalVisible(false);
      setEditingSousCategory(null);
      form.resetFields();
      fetchSousCategories();
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

  // Largeur dynamique selon l'état du sidebar
  const sidebarWidth = isCollapsed ? '4rem' : '18rem';

  // Calculer les statistiques pour une catégorie spécifique
  const getCategoryStats = (sousCategories) => {
    const totalRubriques = sousCategories.reduce((sum, sc) => sum + (sc.nombreRubriques || 0), 0);
    return { totalRubriques, count: sousCategories.length };
  };

  // Calculer les statistiques pour un type spécifique
  const getTypeStats = (categories) => {
    let totalSousCategories = 0;
    let totalRubriques = 0;
    
    Object.values(categories).forEach(sousCategories => {
      totalSousCategories += sousCategories.length;
      totalRubriques += sousCategories.reduce((sum, sc) => sum + (sc.nombreRubriques || 0), 0);
    });
    
    return { totalSousCategories, totalRubriques };
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
                  Sous-Catégories de Budget
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
                  title="Sous-catégories"
                  value={totalSousCategories}
                  prefix={<TagsOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Total rubriques"
                  value={totalRubriques}
                  prefix={<BarChartOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Moyenne par sous-catégorie"
                  value={moyenneRubriques}
                  prefix={<FolderOutlined />}
                  valueStyle={{ color: '#f59e0b' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Catégories parentes"
                  value={categories.length}
                  prefix={<FolderOutlined />}
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
              Ajouter une sous-catégorie
            </Button>
            <Input
              placeholder="Rechercher par libellé, catégorie ou type..."
              prefix={<SearchOutlined />}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', maxWidth: 300 }}
              allowClear
            />
          </div>

          {/* Affichage groupé par Type Budget puis par Catégorie Budget */}
          <div className="w-full bg-white p-4 sm:p-6 rounded-lg shadow">
            {loading ? (
              <div className="text-center py-8">
                <Spin size="large" />
                <p className="mt-4">Chargement des sous-catégories...</p>
              </div>
            ) : Object.keys(sousCategoriesGroupeesParType).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucune sous-catégorie trouvée</p>
              </div>
            ) : (
              <Collapse 
                defaultActiveKey={Object.keys(sousCategoriesGroupeesParType)} 
                className="type-collapse"
              >
                {Object.entries(sousCategoriesGroupeesParType).map(([typeBudget, categories]) => {
                  const typeStats = getTypeStats(categories);
                  
                  return (
                    <Panel 
                      header={
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <DollarOutlined style={{ marginRight: 12, color: '#1890ff', fontSize: '18px' }} />
                            <span className="font-bold text-xl text-gray-800">{typeBudget}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                              {typeStats.totalSousCategories} sous-catégorie{typeStats.totalSousCategories > 1 ? 's' : ''}
                            </span>
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                              {typeStats.totalRubriques} rubrique{typeStats.totalRubriques > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      } 
                      key={typeBudget}
                      className="mb-4"
                    >
                      {/* Collapse imbriqué pour les catégories */}
                      <Collapse 
                        defaultActiveKey={Object.keys(categories)} 
                        className="category-collapse ml-4"
                        size="small"
                      >
                        {Object.entries(categories).map(([categoryBudget, sousCategories]) => {
                          const categoryStats = getCategoryStats(sousCategories);
                          
                          return (
                            <Panel 
                              header={
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <FolderOutlined style={{ marginRight: 8, color: '#f59e0b', fontSize: '16px' }} />
                                    <span className="font-semibold text-lg">{categoryBudget}</span>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                                      {sousCategories.length} sous-catégorie{sousCategories.length > 1 ? 's' : ''}
                                    </span>
                                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                                      {categoryStats.totalRubriques} rubrique{categoryStats.totalRubriques > 1 ? 's' : ''}
                                    </span>
                                  </div>
                                </div>
                              } 
                              key={`${typeBudget}-${categoryBudget}`}
                              className="mb-2"
                            >
                              <Table
                                columns={sousCategoriesColumns}
                                dataSource={sousCategories}
                                rowKey="id"
                                pagination={false}
                                size="small"
                                className="sous-category-table"
                                scroll={{ x: 'max-content' }}
                              />
                            </Panel>
                          );
                        })}
                      </Collapse>
                    </Panel>
                  );
                })}
              </Collapse>
            )}

            {/* Modal d'ajout/modification */}
            <Modal
              title={editingSousCategory ? 'Modifier la sous-catégorie' : 'Ajouter une sous-catégorie'}
              open={modalVisible}
              onCancel={() => { 
                setModalVisible(false); 
                setEditingSousCategory(null); 
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
                initialValues={editingSousCategory ? undefined : {
                  libelle: '',
                  categoryBudgetId: undefined,
                }}
              >
                <Form.Item
                  name="categoryBudgetId"
                  label="Catégorie de Budget"
                  rules={[{ required: true, message: 'La catégorie de budget est obligatoire' }]}
                >
                  <Select
                    placeholder="Sélectionnez une catégorie de budget"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    disabled={editingSousCategory !== null}
                    allowClear
                  >
                    {categories.map(category => (
                      <Option key={category.id} value={category.id}>
                        {category.libelle} ({category.typeBudgetLibelle})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="libelle"
                  label="Libellé"
                  rules={[
                    { required: true, message: 'Le libellé est obligatoire' },
                    { max: 150, message: 'Le libellé ne peut pas dépasser 150 caractères' }
                  ]}
                >
                  <Input 
                    placeholder="Saisissez le libellé de la sous-catégorie"
                    prefix={<TagsOutlined />}
                  />
                </Form.Item>

                <Form.Item>
                  <Space className="w-full justify-end">
                    <Button type="primary" htmlType="submit">
                      {editingSousCategory ? 'Mettre à jour' : 'Ajouter'}
                    </Button>
                    <Button onClick={() => { 
                      setModalVisible(false); 
                      setEditingSousCategory(null); 
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
              title="Détails de la sous-catégorie"
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
              {selectedSousCategory && (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Libellé">
                        <p style={{ fontWeight: 'bold', color: '#1890ff' }}>
                          <TagsOutlined style={{ marginRight: 8 }} />
                          {selectedSousCategory.libelle}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Catégorie">
                        <p>
                          <FolderOutlined style={{ marginRight: 8, color: '#f59e0b' }} />
                          {selectedSousCategory.categoryBudgetLibelle}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Type Budget">
                        <p>
                          <DollarOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                          {selectedSousCategory.typeBudgetLibelle}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Nombre de rubriques">
                        <p style={{ fontWeight: 'bold', color: '#52c41a' }}>
                          <BarChartOutlined style={{ marginRight: 8 }} />
                          {selectedSousCategory.nombreRubriques || 0} rubrique(s)
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24}>
                      <Card size="small" title="Club">
                        <p>{selectedSousCategory.clubNom}</p>
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

export default SousCategoryBudgetPage;