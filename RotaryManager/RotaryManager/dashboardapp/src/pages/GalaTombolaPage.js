import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Card, Row, Col, Statistic, Select, Spin, Avatar, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, MailOutlined, SearchOutlined, EyeOutlined, TeamOutlined, CalendarOutlined, TagOutlined, GiftOutlined, DownloadOutlined } from '@ant-design/icons';
import Sidebar from '../components/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import '../styles/table.css';
import moment from 'moment';
import { getGalas } from '../api/galaService';
import { getMembres } from '../api/membreService';
import galaTombolaService from '../api/galaTombolaService';
import { useNavigate } from 'react-router-dom';
import galaService from '../api/galaService';
import * as XLSX from 'xlsx';

const { Option } = Select;

const GalaTombolaPage = () => {
  const [tombolas, setTombolas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingTombola, setEditingTombola] = useState(null);
  const [selectedTombola, setSelectedTombola] = useState(null);
  const [form] = Form.useForm();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [galas, setGalas] = useState([]);
  const [membres, setMembres] = useState([]);
  const [selectedGalaFilter, setSelectedGalaFilter] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [exportLoading, setExportLoading] = useState(false);
  const navigate = useNavigate();

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

  useEffect(() => {
    if (clubId) {
      fetchGalas();
      fetchMembres();
    } else {
      message.error("Erreur d'authentification : clubId non trouvé");
      navigate('/login');
    }
  }, [clubId, navigate]);

  const fetchGalas = async () => {
    try {
      setLoading(true);
      const response = await galaService.getAllGalas(clubId);
      if (response?.data) {
        const galasData = Array.isArray(response.data) ? response.data : [];
        setGalas(galasData);
        
        // Sélectionner automatiquement le premier gala (le plus récent)
        if (galasData.length > 0) {
          const defaultGala = galasData[0].id || galasData[0].Id;
          setSelectedGalaFilter(defaultGala);
        }
      }
    } catch (error) {
      message.error("Erreur lors du chargement des galas");
      setGalas([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembres = async () => {
    try {
      const membresData = await getMembres(clubId);
      if (membresData) {
        setMembres(membresData);
      } else {
        setMembres([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des membres:', error);
      message.error('Erreur lors du chargement des membres');
      setMembres([]);
    }
  };

  const fetchAllTombolas = useCallback(async () => {
    if (!clubId) {
      setTombolas([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
      return;
    }

    setLoading(true);
    try {
      // Récupérer toutes les tombolas pour tous les galas
      const allTombolas = [];
      
      for (const gala of galas) {
        try {
          const response = await galaTombolaService.getTombolasByGala(gala.id || gala.Id);
          if (response?.data) {
            const tombolasData = Array.isArray(response.data) ? response.data : [];
            // Enrichir les données avec les informations du gala
            const enrichedTombolas = tombolasData.map(tombola => ({
              ...tombola,
              galaLibelle: gala.libelle || gala.Libelle,
              galaDate: gala.date || gala.Date,
              galaLieu: gala.lieu || gala.Lieu
            }));
            allTombolas.push(...enrichedTombolas);
          }
        } catch (error) {
          console.error(`Erreur lors du chargement des tombolas pour le gala ${gala.id}:`, error);
        }
      }

      setTombolas(allTombolas);
      setPagination(prev => ({
        ...prev,
        total: allTombolas.length,
        current: 1,
      }));
    } catch (error) {
      console.error('Error in fetchAllTombolas:', error);
      message.error("Erreur lors du chargement des tombolas");
      setTombolas([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
    } finally {
      setLoading(false);
    }
  }, [clubId, galas]);

  useEffect(() => {
    if (galas.length > 0) {
      fetchAllTombolas();
    }
  }, [galas, fetchAllTombolas]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Filtrage des tombolas selon le terme de recherche et le gala sélectionné
  const filteredTombolas = tombolas.filter(tombola => {
    const matchSearch = (
      (tombola.membreNom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tombola.membreEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tombola.galaLibelle || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchGala = !selectedGalaFilter || tombola.galaId === selectedGalaFilter;
    
    return matchSearch && matchGala;
  });

  // Statistiques calculées à partir des tombolas filtrées
  const totalTombolas = filteredTombolas.reduce((sum, tombola) => sum + tombola.quantite, 0);
  const nombreMembresAcheteurs = filteredTombolas.length;
  const nombreGalas = [...new Set(filteredTombolas.map(t => t.galaId))].length;
  const quantiteMoyenne = nombreMembresAcheteurs > 0 ? (totalTombolas / nombreMembresAcheteurs).toFixed(1) : 0;

  // Fonction d'export Excel
  const exportToExcel = () => {
    try {
      setExportLoading(true);
      
      // Préparer les données pour l'export (uniquement les données, pas de statistiques)
      const exportData = filteredTombolas.map(tombola => ({
        'Participant': tombola.membreNom || tombola.externe || 'N/A',
        'Email': tombola.membreEmail || '',
        'Type': tombola.membreNom ? 'Membre' : 'Externe',
        'Gala': tombola.galaLibelle || 'N/A',
        'Date du Gala': tombola.galaDate ? moment(tombola.galaDate).format('DD/MM/YYYY') : '',
        'Lieu du Gala': tombola.galaLieu || '',
        'Quantité': tombola.quantite
      }));

      // Créer le workbook
      const wb = XLSX.utils.book_new();
      
      // Créer la feuille directement avec les données
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Ajuster la largeur des colonnes
      const colWidths = [
        { wch: 25 }, // Participant
        { wch: 35 }, // Email
        { wch: 10 }, // Type
        { wch: 30 }, // Gala
        { wch: 15 }, // Date du Gala
        { wch: 30 }, // Lieu du Gala
        { wch: 10 }  // Quantité
      ];
      ws['!cols'] = colWidths;

      // Ajouter la feuille au workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Tombolas Gala');

      // Générer le nom du fichier
      const fileName = `tombolas_gala_${moment().format('YYYY-MM-DD_HH-mm')}.xlsx`;
      
      // Télécharger le fichier
      XLSX.writeFile(wb, fileName);
      
      message.success(`Fichier Excel exporté : ${fileName}`);
    } catch (error) {
      console.error('Erreur lors de l\'export Excel:', error);
      message.error('Erreur lors de l\'export Excel');
    } finally {
      setExportLoading(false);
    }
  };

  const openModal = (record = null) => {
    setEditingTombola(record);
    setModalVisible(true);
    if (record) {
      form.setFieldsValue({
        galaId: record.galaId,
        membreId: record.membreId,
        quantite: record.quantite,
      });
    } else {
      // Sélectionner le gala filtré ou le premier gala par défaut
      const defaultGalaId = selectedGalaFilter || (galas.length > 0 ? galas[0].id || galas[0].Id : undefined);
      form.resetFields();
      form.setFieldsValue({
        galaId: defaultGalaId,
        quantite: 1
      });
    }
  };

  const openDetailModal = async (record) => {
    try {
      setSelectedTombola(record);
      setDetailModalVisible(true);
    } catch (error) {
      message.error("Erreur lors du chargement des détails");
    }
  };

  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedTombola(null);
  };

  const handleDelete = async (id) => {
    try {
      await galaTombolaService.deleteTombola(id);
      message.success('Tombola supprimée');
      fetchAllTombolas();
    } catch (error) {
      message.error("Erreur lors de la suppression: " + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmit = async (values) => {
    if (!clubId) {
      message.error("Erreur d'authentification.");
      return;
    }

    // Vérifier qu'au moins un des deux champs est rempli
    if (!values.membreId && !values.externe) {
      message.error("Veuillez sélectionner un membre ou entrer un nom externe");
      return;
    }

    // Vérifier que les deux champs ne sont pas remplis en même temps
    if (values.membreId && values.externe) {
      message.error("Vous ne pouvez pas sélectionner un membre et entrer un nom externe en même temps");
      return;
    }

    try {
      const tombolaData = {
        galaId: values.galaId,
        quantite: values.quantite,
        // Si un membre est sélectionné, on utilise son ID, sinon on met null
        membreId: values.membreId || null,
        // Si un nom externe est entré, on l'utilise, sinon on met null
        externe: values.externe || null
      };

      if (editingTombola) {
        await galaTombolaService.updateTombola(editingTombola.id, tombolaData);
        message.success('Tombola modifiée');
      } else {
        await galaTombolaService.createTombola(tombolaData);
        message.success('Tombola ajoutée');
      }
      setModalVisible(false);
      setEditingTombola(null);
      form.resetFields();
      fetchAllTombolas();
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

  const columns = [
    {
      title: 'Participant',
      key: 'participant',
      render: (_, record) => (
        <div className="flex items-center">
          <Avatar 
            size={40} 
            icon={<UserOutlined />} 
            style={{ marginRight: 12, backgroundColor: '#1890ff' }}
          />
          <div>
            <div className="font-medium text-gray-900">
              {record.membreNom || record.externe || 'N/A'}
            </div>
            {record.membreEmail && (
              <div className="text-sm text-gray-500">
                <MailOutlined style={{ marginRight: 4, color: '#1890ff' }} />
                {record.membreEmail}
              </div>
            )}
          </div>
        </div>
      ),
      sorter: (a, b) => ((a.membreNom || a.externe || '') > (b.membreNom || b.externe || '')),
    },
    {
      title: 'Gala',
      key: 'gala',
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-900">
            <CalendarOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            {record.galaLibelle || 'N/A'}
          </div>
          <div className="text-sm text-gray-500">
            {record.galaDate ? moment(record.galaDate).format('DD/MM/YYYY') : 'Date non spécifiée'}
          </div>
          {record.galaLieu && (
            <div className="text-xs text-gray-400">
              📍 {record.galaLieu}
            </div>
          )}
        </div>
      ),
      sorter: (a, b) => (a.galaLibelle || '').localeCompare(b.galaLibelle || ''),
    },
    {
      title: 'Quantité',
      dataIndex: 'quantite',
      key: 'quantite',
      render: (text) => (
        <span>
          <GiftOutlined style={{ marginRight: 8, color: '#52c41a' }} />
          <span style={{ fontWeight: '500', color: '#52c41a' }}>{text} tombola(s)</span>
        </span>
      ),
      sorter: (a, b) => a.quantite - b.quantite,
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
            title="Supprimer cette tombola ?" 
            onConfirm={() => handleDelete(record.id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button icon={<DeleteOutlined />} danger title="Supprimer la tombola" />
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
                  Gestion des Souches Tombola
                </h1>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-full">
          {/* Statistiques */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total tombolas vendues"
                  value={totalTombolas}
                  prefix={<GiftOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Nombre d'acheteurs"
                  value={nombreMembresAcheteurs}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Quantité moyenne"
                  value={quantiteMoyenne}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#f59e0b' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Nombre de galas"
                  value={nombreGalas}
                  prefix={<CalendarOutlined />}
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
              Ajouter une tombola
            </Button>
            <Button 
              type="default" 
              icon={<DownloadOutlined />} 
              onClick={exportToExcel}
              loading={exportLoading}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', color: 'white' }}
            >
              Exporter Excel
            </Button>
            <Input
              placeholder="Rechercher par membre, email ou gala..."
              prefix={<SearchOutlined />}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', maxWidth: 300 }}
              allowClear
            />
            <Select
              placeholder="Filtrer par gala"
              value={selectedGalaFilter}
              onChange={setSelectedGalaFilter}
              style={{ width: '100%', maxWidth: 300 }}
              allowClear
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {galas.map(gala => (
                <Option key={gala.id || gala.Id} value={gala.id || gala.Id}>
                  {gala.libelle || gala.Libelle}
                </Option>
              ))}
            </Select>
          </div>

          <div className="w-full bg-white p-4 sm:p-6 rounded-lg shadow">
            <Table
              columns={columns}
              dataSource={filteredTombolas}
              rowKey={(record) => record.id || record.Id}
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: filteredTombolas.length,
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
              title={editingTombola ? 'Modifier la tombola' : 'Ajouter une tombola'}
              open={modalVisible}
              onCancel={() => { 
                setModalVisible(false); 
                setEditingTombola(null); 
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
              >
                <Form.Item
                  name="galaId"
                  label="Gala"
                  rules={[{ required: true, message: 'Veuillez sélectionner un gala' }]}
                >
                  <Select 
                    placeholder="Sélectionner un gala"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {galas.map(gala => (
                      <Option key={gala.id || gala.Id} value={gala.id || gala.Id}>
                        {gala.libelle || gala.Libelle} - {gala.date ? moment(gala.date).format('DD/MM/YYYY') : 'Date non spécifiée'}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="membreId"
                  label="Membre"
                  rules={[
                    { 
                      validator: (_, value) => {
                        const externe = form.getFieldValue('externe');
                        if (!value && !externe) {
                          return Promise.reject('Veuillez sélectionner un membre ou entrer un nom externe');
                        }
                        return Promise.resolve();
                      }
                    }
                  ]}
                >
                  <Select 
                    placeholder="Sélectionner un membre"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    allowClear
                    onChange={(value) => {
                      if (value) {
                        form.setFieldsValue({ externe: undefined });
                      }
                    }}
                  >
                    {membres.map(membre => {
                      const nom = membre.nom || membre.lastName || '';
                      const prenom = membre.prenom || membre.firstName || '';
                      return (
                        <Option key={membre.id} value={membre.id}>
                          {`${prenom} ${nom}`.trim()}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="externe"
                  label="Nom externe"
                  rules={[
                    { 
                      validator: (_, value) => {
                        const membreId = form.getFieldValue('membreId');
                        if (!value && !membreId) {
                          return Promise.reject('Veuillez entrer un nom externe ou sélectionner un membre');
                        }
                        return Promise.resolve();
                      }
                    }
                  ]}
                >
                  <Input 
                    placeholder="Entrez le nom de la personne externe"
                    maxLength={250}
                    onChange={(e) => {
                      if (e.target.value) {
                        form.setFieldsValue({ membreId: undefined });
                      }
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="quantite"
                  label="Quantité"
                  rules={[
                    { required: true, message: 'Veuillez entrer une quantité' },
                    { 
                      validator: (_, value) => {
                        const numValue = parseInt(value, 10);
                        if (isNaN(numValue) || numValue < 1) {
                          return Promise.reject(new Error('La quantité doit être supérieure à 0'));
                        }
                        return Promise.resolve();
                      }
                    }
                  ]}
                >
                  <InputNumber 
                    min={1} 
                    style={{ width: '100%' }} 
                    placeholder="Entrez la quantité"
                  />
                </Form.Item>

                <Form.Item>
                  <Space className="w-full justify-end">
                    <Button type="primary" htmlType="submit">
                      {editingTombola ? 'Mettre à jour' : 'Ajouter'}
                    </Button>
                    <Button onClick={() => { 
                      setModalVisible(false); 
                      setEditingTombola(null); 
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
              title="Détails de la tombola"
              open={detailModalVisible}
              onCancel={closeDetailModal}
              footer={[
                <Button key="close" onClick={closeDetailModal}>
                  Fermer
                </Button>
              ]}
              destroyOnClose
              width={isMobile ? '95%' : 600}
              centered={isMobile}
            >
              {selectedTombola && (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Participant">
                        <p style={{ fontWeight: 'bold', color: '#1890ff' }}>
                          <UserOutlined style={{ marginRight: 8 }} />
                          {selectedTombola.membreNom || selectedTombola.externe || 'N/A'}
                        </p>
                        {selectedTombola.membreEmail && (
                          <p>
                            <MailOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                            {selectedTombola.membreEmail}
                          </p>
                        )}
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Gala">
                        <p>
                          <CalendarOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                          {selectedTombola.galaLibelle}
                        </p>
                        <p>
                          {selectedTombola.galaDate ? moment(selectedTombola.galaDate).format('DD/MM/YYYY') : 'Date non spécifiée'}
                        </p>
                        {selectedTombola.galaLieu && (
                          <p>
                            <TeamOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                            {selectedTombola.galaLieu}
                          </p>
                        )}
                      </Card>
                    </Col>
                    <Col xs={24}>
                      <Card size="small" title="Quantité">
                        <p style={{ fontWeight: 'bold', color: '#f59e0b' }}>
                          <GiftOutlined style={{ marginRight: 8 }} />
                          {selectedTombola.quantite} tombola(s)
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

export default GalaTombolaPage;