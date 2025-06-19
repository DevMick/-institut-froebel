import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Card, Row, Col, Statistic, Select, Avatar } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, EyeOutlined, TableOutlined, TeamOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import galaTableService from '../api/galaTableService';
import { getGalas } from '../api/galaService';
import Sidebar from '../components/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import '../styles/table.css';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import galaService from '../api/galaService';

const { Option } = Select;

const GalaTablesPage = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [form] = Form.useForm();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [galas, setGalas] = useState([]);
  const [selectedGalaFilter, setSelectedGalaFilter] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
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

  const fetchTables = async () => {
    try {
      setLoading(true);
      if (!selectedGalaFilter) {
        setTables([]);
        return;
      }
      const response = await galaTableService.getTablesByGala(selectedGalaFilter);
      if (response?.data) {
        const tablesData = Array.isArray(response.data) ? response.data : [];
        // Enrichir les données avec les informations du gala sélectionné
        const gala = galas.find(g => (g.id || g.Id) === selectedGalaFilter);
        const enrichedTables = tablesData.map(table => ({
          ...table,
          galaLibelle: gala?.libelle || gala?.Libelle,
          galaDate: gala?.date || gala?.Date,
          galaLieu: gala?.lieu || gala?.Lieu
        }));
        setTables(enrichedTables);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      message.error("Erreur lors du chargement des tables");
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedGalaFilter) {
      fetchTables();
    }
  }, [selectedGalaFilter]);

  useEffect(() => {
    if (clubId) {
      fetchGalas();
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

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Filtrage des tables selon le terme de recherche et le gala sélectionné
  const filteredTables = tables.filter(table => {
    const matchSearch = (
      (table.tableLibelle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (table.galaLibelle || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchGala = !selectedGalaFilter || table.galaId === selectedGalaFilter;
    
    return matchSearch && matchGala;
  });

  // Statistiques calculées à partir des tables filtrées
  const totalTables = filteredTables.length;
  const tablesVides = filteredTables.filter(t => (t.nombreInvites || 0) === 0).length;
  const tablesOccupees = filteredTables.filter(t => (t.nombreInvites || 0) > 0).length;
  const totalInvites = filteredTables.reduce((sum, t) => sum + (t.nombreInvites || 0), 0);

  const openModal = (record = null) => {
    setEditingTable(record);
    setModalVisible(true);
    if (record) {
      form.setFieldsValue({
        galaId: record.galaId,
        tableLibelle: record.tableLibelle,
      });
    } else {
      // Sélectionner le gala filtré ou le premier gala par défaut
      const defaultGalaId = selectedGalaFilter || (galas.length > 0 ? galas[0].id || galas[0].Id : undefined);
      form.resetFields();
      form.setFieldsValue({
        galaId: defaultGalaId,
      });
    }
  };

  const openDetailModal = async (record) => {
    try {
      setSelectedTable(record);
      setDetailModalVisible(true);
    } catch (error) {
      message.error("Erreur lors du chargement des détails");
    }
  };

  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedTable(null);
  };

  const handleDelete = async (id) => {
    try {
      await galaTableService.deleteTable(id);
      message.success('Table supprimée');
      fetchTables();
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
      const tableData = {
        galaId: values.galaId,
        tableLibelle: values.tableLibelle,
      };

      if (editingTable) {
        await galaTableService.updateTable(editingTable.id, tableData);
        message.success('Table modifiée');
      } else {
        await galaTableService.createTable(tableData);
        message.success('Table ajoutée');
      }
      setModalVisible(false);
      setEditingTable(null);
      form.resetFields();
      fetchTables();
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.includes('existe déjà')) {
        message.error('Une table avec ce libellé existe déjà pour ce gala. Veuillez choisir un autre libellé.');
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

  const columns = [
    {
      title: 'Table',
      key: 'table',
      render: (_, record) => (
        <div className="flex items-center">
          <Avatar 
            size={40} 
            icon={<TableOutlined />} 
            style={{ marginRight: 12, backgroundColor: '#1890ff' }}
          />
          <div>
            <div className="font-medium text-gray-900">
              {record.tableLibelle || 'N/A'}
            </div>
            <div className="text-sm text-gray-500">
              <TeamOutlined style={{ marginRight: 4, color: '#52c41a' }} />
              {record.nombreInvites || 0} invité(s)
            </div>
          </div>
        </div>
      ),
      sorter: (a, b) => (a.tableLibelle || '').localeCompare(b.tableLibelle || ''),
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
      title: 'Statut',
      key: 'statut',
      render: (_, record) => {
        const nombreInvites = record.nombreInvites || 0;
        const isOccupied = nombreInvites > 0;
        return (
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            isOccupied 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {isOccupied ? '✓ Occupée' : '○ Vide'}
          </div>
        );
      },
      sorter: (a, b) => (a.nombreInvites || 0) - (b.nombreInvites || 0),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const hasInvites = (record.nombreInvites || 0) > 0;
        return (
          <Space>
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => openDetailModal(record)} 
              title="Voir les détails"
            />
            <Button 
              icon={<EditOutlined />} 
              onClick={() => openModal(record)}
              title="Modifier la table"
            />
            <Popconfirm 
              title="Supprimer cette table ?" 
              onConfirm={() => handleDelete(record.id)} 
              okText="Oui" 
              cancelText="Non"
              disabled={hasInvites}
            >
              <Button 
                icon={<DeleteOutlined />} 
                danger 
                disabled={hasInvites}
                title={hasInvites ? "Impossible de supprimer : invités présents" : "Supprimer la table"}
              />
            </Popconfirm>
          </Space>
        );
      },
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
                  Gestion des Tables
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
                  title="Total tables"
                  value={totalTables}
                  prefix={<TableOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tables occupées"
                  value={tablesOccupees}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tables vides"
                  value={tablesVides}
                  prefix={<TableOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total invités"
                  value={totalInvites}
                  prefix={<UserOutlined />}
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
              disabled={!selectedGalaFilter}
            >
              Ajouter une table
            </Button>
            <Input
              placeholder="Rechercher par table ou gala..."
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
                  {gala.libelle || gala.Libelle} - {gala.date ? moment(gala.date).format('DD/MM/YYYY') : 'Date non spécifiée'}
                </Option>
              ))}
            </Select>
          </div>

          <div className="w-full bg-white p-4 sm:p-6 rounded-lg shadow">
            <Table
              columns={columns}
              dataSource={filteredTables}
              rowKey={(record) => record.id || record.Id}
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: filteredTables.length,
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
              locale={{
                emptyText: selectedGalaFilter 
                  ? 'Aucune table trouvée pour ce gala' 
                  : 'Veuillez sélectionner un gala pour voir les tables'
              }}
            />

            {/* Modal d'ajout/modification */}
            <Modal
              title={editingTable ? 'Modifier la table' : 'Ajouter une table'}
              open={modalVisible}
              onCancel={() => { 
                setModalVisible(false); 
                setEditingTable(null); 
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
                  name="tableLibelle"
                  label="Libellé de la table"
                  rules={[{ required: true, message: 'Veuillez saisir le libellé de la table' }]}
                >
                  <Input 
                    placeholder="Entrez le nom de la table"
                    maxLength={100}
                  />
                </Form.Item>

                <Form.Item>
                  <Space className="w-full justify-end">
                    <Button type="primary" htmlType="submit">
                      {editingTable ? 'Mettre à jour' : 'Ajouter'}
                    </Button>
                    <Button onClick={() => { 
                      setModalVisible(false); 
                      setEditingTable(null); 
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
              title="Détails de la table"
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
              {selectedTable && (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Table">
                        <p style={{ fontWeight: 'bold', color: '#1890ff' }}>
                          <TableOutlined style={{ marginRight: 8 }} />
                          {selectedTable.tableLibelle}
                        </p>
                        <p>
                          <TeamOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                          {selectedTable.nombreInvites || 0} invité(s)
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Gala">
                        <p>
                          <CalendarOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                          {selectedTable.galaLibelle}
                        </p>
                        <p>
                          {selectedTable.galaDate ? moment(selectedTable.galaDate).format('DD/MM/YYYY') : 'Date non spécifiée'}
                        </p>
                        {selectedTable.galaLieu && (
                          <p>
                            📍 {selectedTable.galaLieu}
                          </p>
                        )}
                      </Card>
                    </Col>
                    {selectedTable.invites && selectedTable.invites.length > 0 && (
                      <Col xs={24}>
                        <Card size="small" title="Liste des invités">
                          <div className="max-h-40 overflow-y-auto">
                            {selectedTable.invites.map(invite => (
                              <div key={invite.id} className="py-1 border-b border-gray-100 last:border-b-0">
                                <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                                {invite.nom_Prenom}
                              </div>
                            ))}
                          </div>
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

export default GalaTablesPage;