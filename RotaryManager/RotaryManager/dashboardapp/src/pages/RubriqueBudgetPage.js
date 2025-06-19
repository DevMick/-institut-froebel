import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, InputNumber, Input, message, Space, Popconfirm, Card, Row, Col, Statistic, Select, Divider, Spin, Collapse } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DollarOutlined, FileTextOutlined, SearchOutlined, EyeOutlined, TagsOutlined, BarChartOutlined } from '@ant-design/icons';
import { rubriqueBudgetService } from '../api/rubriqueBudgetService';
import { sousCategoryBudgetService } from '../api/sousCategoryBudgetService';
import { getMandats } from '../api/mandatService';
import Sidebar from '../components/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import '../styles/table.css';
import dayjs from 'dayjs';
import { categoryBudgetService } from '../api/categoryBudgetService';
import { getTypesBudget } from '../api/typeBudgetService';

const { Option } = Select;
const { Panel } = Collapse;

const RubriqueBudgetPage = () => {
  const [rubriques, setRubriques] = useState([]);
  const [sousCategories, setSousCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingRubrique, setEditingRubrique] = useState(null);
  const [selectedRubrique, setSelectedRubrique] = useState(null);
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
  const [stats, setStats] = useState(null);
  const [mandats, setMandats] = useState([]);
  const [selectedMandatId, setSelectedMandatId] = useState(null);

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

  const fetchMandats = useCallback(async () => {
    if (!clubId) {
      console.log('Pas de clubId, impossible de charger les mandats');
      return;
    }
    try {
      console.log('Chargement des mandats pour le club:', clubId);
      const mandatsData = await getMandats(clubId);
      console.log('Mandats chargés:', mandatsData);
      setMandats(mandatsData);
      if (mandatsData.length > 0 && !selectedMandatId) {
        console.log('Sélection du premier mandat:', mandatsData[0].id);
        setSelectedMandatId(mandatsData[0].id);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des mandats:', error);
      message.error("Erreur lors du chargement des mandats");
    }
  }, [clubId, selectedMandatId]);

  const fetchRubriques = useCallback(async () => {
    if (!clubId || !selectedMandatId) {
      console.log('Pas de clubId ou de mandatId sélectionné, impossible de charger les rubriques');
      setRubriques([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
      return;
    }
    setLoading(true);
    try {
      console.log('Chargement des rubriques pour le club:', clubId, 'et le mandat:', selectedMandatId);
      const data = await rubriqueBudgetService.getRubriques(clubId, selectedMandatId);
      console.log('Rubriques chargées:', data);
      setRubriques(data);
      setPagination(prev => ({
        ...prev,
        total: data.length,
        current: 1,
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des rubriques:', error);
      message.error("Erreur lors du chargement des rubriques");
      setRubriques([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
    } finally {
      setLoading(false);
    }
  }, [clubId, selectedMandatId]);

  const fetchSousCategories = useCallback(async () => {
    if (!clubId) {
      console.log('Pas de clubId, impossible de charger les sous-catégories');
      return;
    }
    setLoading(true);
    try {
      console.log('Chargement des catégories...');
      // Récupérer tous les types de budget
      const types = await getTypesBudget();
      console.log('Types de budget chargés:', types);
      const allSousCategories = [];
      
      // Pour chaque type de budget, récupérer ses catégories
      for (const type of types) {
        try {
          const categories = await categoryBudgetService.getCategories(type.id);
          console.log(`Catégories chargées pour le type ${type.libelle}:`, categories);
          
          // Pour chaque catégorie, récupérer ses sous-catégories
          for (const cat of categories) {
            try {
              console.log(`Chargement des sous-catégories pour la catégorie ${cat.id} (${cat.libelle})...`);
              const sousCats = await sousCategoryBudgetService.getSousCategories(clubId, cat.id);
              console.log(`Sous-catégories trouvées pour ${cat.libelle}:`, sousCats);
              
              // Si aucune sous-catégorie n'existe, créer une sous-catégorie par défaut
              if (Array.isArray(sousCats) && sousCats.length === 0) {
                console.log(`Création d'une sous-catégorie par défaut pour ${cat.libelle}`);
                try {
                  const defaultSousCat = await sousCategoryBudgetService.createSousCategory(clubId, cat.id, {
                    libelle: `${cat.libelle} - Général`
                  });
                  console.log('Sous-catégorie par défaut créée:', defaultSousCat);
                  sousCats.push(defaultSousCat);
                } catch (error) {
                  console.error('Erreur lors de la création de la sous-catégorie par défaut:', error);
                }
              }
              
              if (Array.isArray(sousCats)) {
                const enriched = sousCats.map(sc => ({
                  ...sc,
                  categoryBudgetLibelle: cat.libelle,
                  typeBudgetLibelle: type.libelle
                }));
                allSousCategories.push(...enriched);
              }
            } catch (error) {
              console.error(`Erreur lors du chargement des sous-catégories pour la catégorie ${cat.id}:`, error);
              if (error.response) {
                console.error('Détails de l\'erreur:', {
                  status: error.response.status,
                  data: error.response.data
                });
              }
            }
          }
        } catch (error) {
          console.error(`Erreur lors du chargement des catégories pour le type ${type.id}:`, error);
          if (error.response) {
            console.error('Détails de l\'erreur:', {
              status: error.response.status,
              data: error.response.data
            });
          }
        }
      }
      
      console.log('Toutes les sous-catégories chargées:', allSousCategories);
      setSousCategories(allSousCategories);
    } catch (error) {
      console.error('Erreur lors du chargement des sous-catégories:', error);
      if (error.response) {
        console.error('Détails de l\'erreur:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      message.error("Erreur lors du chargement des sous-catégories");
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    fetchMandats();
  }, [fetchMandats]);

  useEffect(() => {
    if (mandats.length > 0 && !selectedMandatId) {
      // Trouver le mandat actuel
      const now = new Date();
      const currentMandat = mandats.find(m => {
        const dateDebut = new Date(m.dateDebut);
        const dateFin = new Date(m.dateFin);
        return now >= dateDebut && now <= dateFin;
      });
      
      if (currentMandat) {
        setSelectedMandatId(currentMandat.id);
      } else {
        // Si aucun mandat actuel n'est trouvé, sélectionner le plus récent
        setSelectedMandatId(mandats[0].id);
      }
    }
  }, [mandats, selectedMandatId]);

  useEffect(() => {
    fetchSousCategories();
  }, [fetchSousCategories]);

  useEffect(() => {
    if (selectedMandatId) {
      fetchRubriques();
    }
  }, [selectedMandatId, fetchRubriques]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Filtrage des rubriques selon le champ de recherche
  const filteredRubriques = rubriques.filter(r => {
    return (
      (r.libelle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.sousCategoryLibelle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.mandatAnnee || '').toString().includes(searchTerm.toLowerCase())
    );
  });

  // Grouper les rubriques par sous-catégorie
  const rubriquesGroupeesParSousCategory = filteredRubriques.reduce((acc, rubrique) => {
    const sousCategoryLibelle = rubrique.sousCategoryLibelle || 'Sous-catégorie non définie';
    if (!acc[sousCategoryLibelle]) {
      acc[sousCategoryLibelle] = [];
    }
    acc[sousCategoryLibelle].push(rubrique);
    return acc;
  }, {});

  // Statistiques calculées à partir des rubriques filtrées
  const totalRubriques = filteredRubriques.length;
  const totalBudget = filteredRubriques.reduce((sum, r) => sum + (r.montantTotal || 0), 0);
  const moyenneBudget = totalRubriques > 0 ? (totalBudget / totalRubriques) : 0;

  // Colonnes pour le tableau des rubriques dans chaque sous-catégorie
  const rubriquesColumns = [
    {
      title: 'Rubrique',
      key: 'rubrique',
      width: 250,
      render: (_, record) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-blue-100 text-blue-600">
            <FileTextOutlined />
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
      title: 'Prix Unitaire',
      dataIndex: 'prixUnitaire',
      key: 'prixUnitaire',
      render: (prix) => (
        <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
          <DollarOutlined style={{ marginRight: 8 }} />
          {prix != null ? prix.toLocaleString('fr-FR') + ' FCFA' : '0 FCFA'}
        </span>
      ),
      sorter: (a, b) => (a.prixUnitaire || 0) - (b.prixUnitaire || 0),
    },
    {
      title: 'Quantité',
      dataIndex: 'quantite',
      key: 'quantite',
      render: (quantite) => (
        <span style={{ fontWeight: 'bold' }}>
          <BarChartOutlined style={{ marginRight: 8, color: '#f59e0b' }} />
          {quantite || 0}
        </span>
      ),
      sorter: (a, b) => (a.quantite || 0) - (b.quantite || 0),
    },
    {
      title: 'Montant Total',
      dataIndex: 'montantTotal',
      key: 'montantTotal',
      render: (montant) => (
        <span style={{ 
          color: montant > 0 ? '#52c41a' : '#d9d9d9', 
          fontWeight: montant > 0 ? 'bold' : 'normal' 
        }}>
          <DollarOutlined style={{ marginRight: 8 }} />
          {montant != null ? montant.toLocaleString('fr-FR') + ' FCFA' : '0 FCFA'}
        </span>
      ),
      sorter: (a, b) => (a.montantTotal || 0) - (b.montantTotal || 0),
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
            title="Supprimer cette rubrique ?" 
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
    setEditingRubrique(record);
    setModalVisible(true);
    if (record) {
      form.setFieldsValue({
        ...record,
        mandatId: record.mandatId
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ 
        prixUnitaire: 0,
        quantite: 1
      });
    }
  };

  const openDetailModal = async (record) => {
    try {
      setSelectedRubrique(record);
      setDetailModalVisible(true);
    } catch (error) {
      message.error("Erreur lors du chargement des détails");
    }
  };

  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedRubrique(null);
  };

  const handleDelete = async (id) => {
    try {
      await rubriqueBudgetService.deleteRubrique(clubId, selectedMandatId, id);
      message.success('Rubrique supprimée');
      fetchRubriques();
    } catch (error) {
      message.error("Erreur lors de la suppression: " + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmit = async (values) => {
    if (!clubId) {
      console.log('Pas de clubId, impossible de soumettre la rubrique');
      message.error("Erreur d'authentification.");
      return;
    }
    try {
      console.log('Soumission des données de la rubrique:', values);
      const rubriqueData = {
        Libelle: values.libelle,
        PrixUnitaire: values.prixUnitaire,
        Quantite: values.quantite,
        SousCategoryBudgetId: values.sousCategoryBudgetId
      };
      console.log('Données formatées pour l\'API:', rubriqueData);

      if (editingRubrique) {
        console.log('Mise à jour de la rubrique:', editingRubrique.id);
        await rubriqueBudgetService.updateRubrique(clubId, values.mandatId, editingRubrique.id, rubriqueData);
        message.success('Rubrique modifiée');
      } else {
        console.log('Création d\'une nouvelle rubrique');
        await rubriqueBudgetService.createRubrique(clubId, values.mandatId, rubriqueData);
        message.success('Rubrique ajoutée');
      }
      setModalVisible(false);
      setEditingRubrique(null);
      form.resetFields();
      fetchRubriques();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la rubrique:', error);
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

  // Calculer les statistiques pour une sous-catégorie spécifique
  const getSousCategoryStats = (rubriques) => {
    const totalBudget = rubriques.reduce((sum, r) => sum + (r.montantTotal || 0), 0);
    const moyenneBudget = rubriques.length > 0 ? (totalBudget / rubriques.length) : 0;
    return { totalBudget, moyenneBudget, count: rubriques.length };
  };

  // Ajout de logs pour le rendu du Select des sous-catégories
  const renderSousCategoriesSelect = () => {
    console.log('Rendu du Select des sous-catégories. État actuel:', {
      sousCategories,
      loading,
      isArray: Array.isArray(sousCategories),
      length: sousCategories?.length
    });

    return (
      <Select
        placeholder="Sélectionnez une sous-catégorie de budget"
        showSearch
        optionFilterProp="children"
        filterOption={(input, option) =>
          (option?.children?.toLowerCase() || '').indexOf(input.toLowerCase()) >= 0
        }
        allowClear
        loading={loading}
        notFoundContent={loading ? <Spin size="small" /> : "Aucune sous-catégorie trouvée"}
      >
        {Array.isArray(sousCategories) && sousCategories.map(sc => {
          console.log('Rendu de l\'option:', sc);
          // Supprimer ' - Général' du libellé si présent
          let label = sc.libelle.replace(/\s*-\s*Général$/i, '');
          // Si le nom de la catégorie n'est pas déjà inclus, l'ajouter entre parenthèses
          if (!label.includes(sc.categoryBudgetLibelle)) {
            label = `${label} (${sc.categoryBudgetLibelle})`;
          }
          return (
            <Option key={sc.id} value={sc.id}>
              {label}
            </Option>
          );
        })}
      </Select>
    );
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
                  Rubriques Budget
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
                  title="Total Rubriques"
                  value={totalRubriques}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Budget Total"
                  value={totalBudget}
                  precision={0}
                  prefix={<DollarOutlined />}
                  suffix=" FCFA"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Budget Moyen"
                  value={moyenneBudget}
                  precision={0}
                  prefix={<BarChartOutlined />}
                  suffix=" FCFA"
                  valueStyle={{ color: '#f59e0b' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Sous-catégories"
                  value={sousCategories.length}
                  prefix={<TagsOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-4">
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => openModal()}
              disabled={!selectedMandatId}
            >
              Ajouter une rubrique
            </Button>
            <Select
              placeholder="Sélectionner un mandat"
              value={selectedMandatId}
              onChange={setSelectedMandatId}
              style={{ width: 200 }}
              allowClear
            >
              {mandats.map(mandat => {
                const anneeDebut = dayjs(mandat.dateDebut).year();
                const anneeFin = dayjs(mandat.dateFin).year();
                return (
                  <Option key={mandat.id} value={mandat.id}>
                    Mandat {anneeDebut} - {anneeFin}
                  </Option>
                );
              })}
            </Select>
            <Input
              placeholder="Rechercher par libellé, sous-catégorie ou mandat..."
              prefix={<SearchOutlined />}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', maxWidth: 300 }}
              allowClear
            />
          </div>

          {/* Affichage groupé par sous-catégorie */}
          <div className="w-full bg-white p-4 sm:p-6 rounded-lg shadow">
            {loading ? (
              <div className="text-center py-8">
                <Spin size="large" />
                <p className="mt-4">Chargement des rubriques...</p>
              </div>
            ) : Object.keys(rubriquesGroupeesParSousCategory).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucune rubrique trouvée</p>
              </div>
            ) : (
              <Collapse 
                defaultActiveKey={Object.keys(rubriquesGroupeesParSousCategory)} 
                className="rubrique-collapse"
              >
                {Object.entries(rubriquesGroupeesParSousCategory).map(([sousCategoryLibelle, rubriques]) => {
                  const stats = getSousCategoryStats(rubriques);
                  // Nettoyer le libellé de la sous-catégorie
                  const cleanSousCategoryLibelle = sousCategoryLibelle.replace(/\s*-\s*Général$/i, '');
                  
                  return (
                    <Panel 
                      header={
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <TagsOutlined style={{ marginRight: 12, color: '#1890ff', fontSize: '16px' }} />
                            <span className="font-semibold text-lg">{cleanSousCategoryLibelle}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                              {rubriques.length} rubrique{rubriques.length > 1 ? 's' : ''}
                            </span>
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                              {stats.totalBudget.toLocaleString('fr-FR')} FCFA
                            </span>
                          </div>
                        </div>
                      } 
                      key={sousCategoryLibelle}
                      className="mb-4"
                    >
                      <Table
                        columns={rubriquesColumns}
                        dataSource={rubriques}
                        rowKey="id"
                        pagination={false}
                        size="middle"
                        className="rubrique-table"
                        scroll={{ x: 'max-content' }}
                      />
                    </Panel>
                  );
                })}
              </Collapse>
            )}

            {/* Modal d'ajout/modification */}
            <Modal
              title={editingRubrique ? 'Modifier la rubrique' : 'Ajouter une rubrique'}
              open={modalVisible}
              onCancel={() => { 
                setModalVisible(false); 
                setEditingRubrique(null); 
                form.resetFields(); 
              }}
              footer={null}
              destroyOnHidden
              width={isMobile ? '95%' : 600}
              centered={isMobile}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={editingRubrique ? undefined : {
                  libelle: '',
                  sousCategoryBudgetId: undefined,
                  prixUnitaire: 0,
                  quantite: 1,
                  mandatId: selectedMandatId
                }}
              >
                <Form.Item
                  name="mandatId"
                  label="Mandat"
                  rules={[{ required: true, message: 'Le mandat est obligatoire' }]}
                >
                  <Select
                    placeholder="Sélectionnez un mandat"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    disabled={editingRubrique !== null}
                    allowClear
                    style={{ width: '100%', cursor: 'pointer' }}
                  >
                    {mandats.map(m => {
                      const anneeDebut = dayjs(m.dateDebut).year();
                      const anneeFin = dayjs(m.dateFin).year();
                      return (
                        <Option key={m.id} value={m.id}>
                          {anneeDebut} - {anneeFin}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="sousCategoryBudgetId"
                  label="Sous-catégorie de Budget"
                  rules={[{ required: true, message: 'La sous-catégorie de budget est obligatoire' }]}
                >
                  {renderSousCategoriesSelect()}
                </Form.Item>

                <Form.Item
                  name="libelle"
                  label="Libellé"
                  rules={[
                    { required: true, message: 'Le libellé est obligatoire' },
                    { max: 200, message: 'Le libellé ne peut pas dépasser 200 caractères' }
                  ]}
                >
                  <Input 
                    placeholder="Saisissez le libellé de la rubrique"
                    prefix={<FileTextOutlined />}
                  />
                </Form.Item>

                <Form.Item
                  name="prixUnitaire"
                  label="Prix Unitaire (FCFA)"
                  rules={[
                    { required: true, message: 'Le prix unitaire est obligatoire' },
                    { type: 'number', min: 0, message: 'Le prix unitaire doit être positif' }
                  ]}
                >
                  <InputNumber 
                    min={0} 
                    style={{ width: '100%' }} 
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    placeholder="0"
                  />
                </Form.Item>

                <Form.Item
                  name="quantite"
                  label="Quantité"
                  rules={[
                    { required: true, message: 'La quantité est obligatoire' },
                    { type: 'number', min: 1, message: 'La quantité doit être supérieure à 0' }
                  ]}
                >
                  <InputNumber 
                    min={1} 
                    style={{ width: '100%' }} 
                    placeholder="1"
                  />
                </Form.Item>

                <Form.Item>
                  <Space className="w-full justify-end">
                    <Button type="primary" htmlType="submit">
                      {editingRubrique ? 'Mettre à jour' : 'Ajouter'}
                    </Button>
                    <Button onClick={() => { 
                      setModalVisible(false); 
                      setEditingRubrique(null); 
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
              title="Détails de la rubrique"
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
              {selectedRubrique && (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Libellé">
                        <p style={{ fontWeight: 'bold', color: '#1890ff' }}>
                          <FileTextOutlined style={{ marginRight: 8 }} />
                          {selectedRubrique.libelle}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Sous-catégorie">
                        <p>
                          <TagsOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                          {selectedRubrique.sousCategoryLibelle}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Prix Unitaire">
                        <p style={{ fontWeight: 'bold', color: '#52c41a' }}>
                          <DollarOutlined style={{ marginRight: 8 }} />
                          {selectedRubrique.prixUnitaire?.toLocaleString('fr-FR')} FCFA
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Quantité">
                        <p style={{ fontWeight: 'bold' }}>
                          <BarChartOutlined style={{ marginRight: 8, color: '#f59e0b' }} />
                          {selectedRubrique.quantite}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Montant Total">
                        <p style={{ fontWeight: 'bold', color: '#1890ff' }}>
                          <DollarOutlined style={{ marginRight: 8 }} />
                          {selectedRubrique.montantTotal?.toLocaleString('fr-FR')} FCFA
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Mandat">
                        <p>
                          {(() => {
                            const mandat = mandats.find(m => m.annee === selectedRubrique?.mandatAnnee);
                            if (mandat?.dateDebut && mandat?.dateFin) {
                              const anneeDebut = dayjs(mandat.dateDebut).year();
                              const anneeFin = dayjs(mandat.dateFin).year();
                              return `${anneeDebut} - ${anneeFin}`;
                            }
                            return selectedRubrique?.mandatAnnee ? `Mandat ${selectedRubrique.mandatAnnee}` : 'Non spécifié';
                          })()}
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

export default RubriqueBudgetPage;