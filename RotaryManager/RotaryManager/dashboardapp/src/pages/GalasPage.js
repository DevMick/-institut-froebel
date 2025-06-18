import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Card, Row, Col, Statistic, DatePicker, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined, SearchOutlined, EyeOutlined, ClockCircleOutlined, CheckCircleOutlined, StarOutlined, TagsOutlined, TeamOutlined, EnvironmentOutlined, TableOutlined, TagOutlined, GiftOutlined } from '@ant-design/icons';
import galaService from '../api/galaService';
import Sidebar from '../components/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import '../styles/table.css';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const { TextArea } = Input;

const GalasPage = () => {
  const [galas, setGalas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingGala, setEditingGala] = useState(null);
  const [selectedGala, setSelectedGala] = useState(null);
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

  const navigate = useNavigate();

  // Fonction pour calculer le statut automatiquement selon la date
  const calculateStatus = (date) => {
    if (!date) return 'Indéterminé';
    
    const now = new Date();
    const galaDate = new Date(date);
    
    // Réinitialiser les heures pour comparaison par date uniquement
    now.setHours(0, 0, 0, 0);
    galaDate.setHours(0, 0, 0, 0);
    
    if (now < galaDate) return 'À venir';
    if (now.getTime() === galaDate.getTime()) return 'Aujourd\'hui';
    return 'Passé';
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'Aujourd\'hui': return { bg: 'bg-green-100', text: 'text-green-800', dot: 'text-green-600' };
      case 'À venir': return { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'text-blue-600' };
      case 'Passé': return { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'text-gray-500' };
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

  const fetchGalas = async () => {
    try {
      setLoading(true);
      const response = await galaService.getAllGalas(clubId, searchTerm);
      setGalas(response.data);
    } catch (error) {
      message.error("Erreur lors du chargement des galas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalas();
  }, [searchTerm]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Filtrage des galas selon le champ de recherche
  const filteredGalas = galas.filter(gala => {
    return (
      (gala.libelle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (gala.lieu || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (gala.statusCalcule || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Statistiques calculées à partir des galas filtrés
  const totalGalas = filteredGalas.length;
  const galasAujourdhui = filteredGalas.filter(g => g.statusCalcule === 'Aujourd\'hui').length;
  const galasAVenir = filteredGalas.filter(g => g.statusCalcule === 'À venir').length;
  const galasPasses = filteredGalas.filter(g => g.statusCalcule === 'Passé').length;
  const totalInvites = filteredGalas.reduce((sum, g) => sum + (g.nombreInvites || 0), 0);
  const totalTickets = filteredGalas.reduce((sum, g) => sum + (g.nombreTicketsVendus || 0), 0);
  const totalTombolas = filteredGalas.reduce((sum, g) => sum + (g.nombreTombolasVendues || 0), 0);

  const openModal = (record = null) => {
    console.log('Record reçu dans openModal:', record);
    setEditingGala(record);
    setModalVisible(true);
    if (record) {
      const formValues = {
        libelle: record.libelle,
        date: record.date ? moment(record.date) : null,
        lieu: record.lieu,
        nombreTables: record.nombreTables,
        nombreSouchesTickets: record.nombreSouchesTickets,
        quantiteParSoucheTickets: record.quantiteParSoucheTickets,
        nombreSouchesTombola: record.nombreSouchesTombola,
        quantiteParSoucheTombola: record.quantiteParSoucheTombola
      };
      console.log('Valeurs à définir dans le formulaire:', formValues);
      form.setFieldsValue(formValues);
    } else {
      form.resetFields();
      form.setFieldsValue({ 
        libelle: '',
        date: null,
        lieu: '',
        nombreTables: 1,
        nombreSouchesTickets: 1,
        quantiteParSoucheTickets: 1,
        nombreSouchesTombola: 1,
        quantiteParSoucheTombola: 1
      });
    }
  };

  const openDetailModal = async (record) => {
    try {
      setSelectedGala(record);
      setDetailModalVisible(true);
    } catch (error) {
      message.error("Erreur lors du chargement des détails");
    }
  };

  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedGala(null);
  };

  const handleDelete = async (id) => {
    try {
      await galaService.deleteGala(id);
      message.success("Gala supprimé avec succès");
      fetchGalas();
    } catch (error) {
      message.error("Erreur lors de la suppression du gala");
    }
  };

  const handleSubmit = async (values) => {
    try {
      const galaData = {
        ...values,
        date: values.date.toISOString(),
        clubId: clubId
      };

      if (editingGala) {
        await galaService.updateGala(editingGala.id, galaData);
        message.success("Gala mis à jour avec succès");
      } else {
        await galaService.createGala(galaData);
        message.success("Gala créé avec succès");
      }

      setModalVisible(false);
      fetchGalas();
    } catch (error) {
      message.error("Erreur lors de l'enregistrement du gala");
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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return moment(dateString).format('DD/MM/YYYY');
  };

  const columns = [
    {
      title: 'Libellé',
      dataIndex: 'libelle',
      key: 'libelle',
      render: (text, record) => {
        const statusColor = getStatusColor(record.statusCalcule);
        return (
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
              record.statusCalcule === 'Aujourd\'hui' ? 'bg-green-100 text-green-600' : 
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
      sorter: (a, b) => a.libelle.localeCompare(b.libelle),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => (
        <span>
          <ClockCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />
          {formatDate(date)}
        </span>
      ),
      sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix(),
    },
    {
      title: 'Lieu',
      dataIndex: 'lieu',
      key: 'lieu',
      render: (lieu) => (
        <span>
          <EnvironmentOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {lieu || 'Non défini'}
        </span>
      ),
    },
    {
      title: 'Tables',
      dataIndex: 'nombreTables',
      key: 'nombreTables',
      render: (nombre) => (
        <span>
          <TableOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {nombre}
        </span>
      ),
      sorter: (a, b) => a.nombreTables - b.nombreTables,
    },
    {
      title: 'Invités',
      dataIndex: 'nombreInvites',
      key: 'nombreInvites',
      render: (nombre) => (
        <span>
          <TeamOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {nombre || 0}
        </span>
      ),
      sorter: (a, b) => (a.nombreInvites || 0) - (b.nombreInvites || 0),
    },
    {
      title: 'Tickets',
      dataIndex: 'nombreTicketsVendus',
      key: 'nombreTicketsVendus',
      render: (nombre) => (
        <span>
          <TagOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {nombre || 0}
        </span>
      ),
      sorter: (a, b) => (a.nombreTicketsVendus || 0) - (b.nombreTicketsVendus || 0),
    },
    {
      title: 'Tombolas',
      dataIndex: 'nombreTombolasVendues',
      key: 'nombreTombolasVendues',
      render: (nombre) => (
        <span>
          <GiftOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {nombre || 0}
        </span>
      ),
      sorter: (a, b) => (a.nombreTombolasVendues || 0) - (b.nombreTombolasVendues || 0),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const hasAssociatedData = (record.nombreInvites > 0) || (record.nombreTicketsVendus > 0) || (record.nombreTombolasVendues > 0);
        return (
          <Space>
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => openDetailModal(record)} 
              title="Voir les détails"
            />
            <Popconfirm 
              title="Supprimer ce gala ?" 
              onConfirm={() => handleDelete(record.id)} 
              okText="Oui" 
              cancelText="Non"
              disabled={hasAssociatedData}
            >
              <Button 
                icon={<DeleteOutlined />} 
                danger 
                disabled={hasAssociatedData}
                title={hasAssociatedData ? "Impossible de supprimer : données associées" : "Supprimer le gala"}
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
                  Gestion des Galas
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
                  title="Total galas"
                  value={totalGalas}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Galas aujourd'hui"
                  value={galasAujourdhui}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Galas à venir"
                  value={galasAVenir}
                  prefix={<StarOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Galas passés"
                  value={galasPasses}
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
              Ajouter un gala
            </Button>
            <Input
              placeholder="Rechercher par libellé, lieu ou statut..."
              prefix={<SearchOutlined />}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', maxWidth: 300 }}
              allowClear
            />
          </div>

          <div className="w-full bg-white p-4 sm:p-6 rounded-lg shadow">
            <Table
              columns={columns}
              dataSource={filteredGalas}
              rowKey="id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: filteredGalas.length,
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
              title={editingGala ? 'Modifier le gala' : 'Ajouter un gala'}
              open={modalVisible}
              onCancel={() => { 
                setModalVisible(false); 
                setEditingGala(null); 
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
                initialValues={editingGala ? undefined : {
                  libelle: '',
                  date: null,
                  lieu: '',
                  nombreTables: 1,
                  nombreSouchesTickets: 1,
                  quantiteParSoucheTickets: 1,
                  nombreSouchesTombola: 1,
                  quantiteParSoucheTombola: 1
                }}
              >
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="libelle"
                      label="Libellé"
                      rules={[{ required: true, message: 'Le libellé est obligatoire' }]}
                    >
                      <Input 
                        placeholder="Ex: Gala annuel 2024"
                        prefix={<CalendarOutlined />}
                        maxLength={200}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="date"
                      label="Date"
                      rules={[{ required: true, message: 'La date est obligatoire' }]}
                    >
                      <DatePicker 
                        placeholder="Sélectionner la date"
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="lieu"
                      label="Lieu"
                      rules={[{ required: true, message: 'Le lieu est obligatoire' }]}
                    >
                      <Input 
                        placeholder="Ex: Salle des fêtes"
                        prefix={<EnvironmentOutlined />}
                        maxLength={300}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="nombreTables"
                      label="Nombre de tables"
                      rules={[{ required: true, message: 'Le nombre de tables est obligatoire' }]}
                    >
                      <InputNumber 
                        min={1}
                        max={100}
                        style={{ width: '100%' }}
                        prefix={<TableOutlined />}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="nombreSouchesTickets"
                      label="Nombre de souches de tickets"
                      rules={[{ required: true, message: 'Le nombre de souches est obligatoire' }]}
                    >
                      <InputNumber 
                        min={1}
                        style={{ width: '100%' }}
                        prefix={<TagOutlined />}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="quantiteParSoucheTickets"
                      label="Quantité par souche de tickets"
                      rules={[{ required: true, message: 'La quantité est obligatoire' }]}
                    >
                      <InputNumber 
                        min={1}
                        style={{ width: '100%' }}
                        prefix={<TagOutlined />}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="nombreSouchesTombola"
                      label="Nombre de souches de tombola"
                      rules={[{ required: true, message: 'Le nombre de souches est obligatoire' }]}
                    >
                      <InputNumber 
                        min={1}
                        style={{ width: '100%' }}
                        prefix={<GiftOutlined />}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="quantiteParSoucheTombola"
                      label="Quantité par souche de tombola"
                      rules={[{ required: true, message: 'La quantité est obligatoire' }]}
                    >
                      <InputNumber 
                        min={1}
                        style={{ width: '100%' }}
                        prefix={<GiftOutlined />}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item>
                  <Space className="w-full justify-end">
                    <Button type="primary" htmlType="submit">
                      {editingGala ? 'Mettre à jour' : 'Créer le gala'}
                    </Button>
                    <Button onClick={() => { 
                      setModalVisible(false); 
                      setEditingGala(null); 
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
              title="Détails du gala"
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
              {selectedGala && (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Libellé">
                        <p style={{ fontWeight: 'bold', color: '#1890ff' }}>
                          <CalendarOutlined style={{ marginRight: 8 }} />
                          {selectedGala.libelle}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Statut">
                        <p style={{ 
                          fontWeight: 'bold', 
                          color: selectedGala.statusCalcule === 'Aujourd\'hui' ? '#52c41a' :
                                 selectedGala.statusCalcule === 'À venir' ? '#1890ff' : '#8c8c8c'
                        }}>
                          <CheckCircleOutlined style={{ marginRight: 8 }} />
                          {selectedGala.statusCalcule}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Date">
                        <p>
                          <ClockCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                          {formatDate(selectedGala.date)}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Lieu">
                        <p>
                          <EnvironmentOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                          {selectedGala.lieu}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Nombre de tables">
                        <p>
                          <TableOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                          {selectedGala.nombreTables}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Nombre d'invités">
                        <p>
                          <TeamOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                          {selectedGala.nombreInvites || 0}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Tickets vendus">
                        <p>
                          <TagOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                          {selectedGala.nombreTicketsVendus || 0}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Tombolas vendues">
                        <p>
                          <GiftOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                          {selectedGala.nombreTombolasVendues || 0}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Souches de tickets">
                        <p>
                          <TagOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                          {selectedGala.nombreSouchesTickets} souches de {selectedGala.quantiteParSoucheTickets} tickets
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Souches de tombola">
                        <p>
                          <GiftOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                          {selectedGala.nombreSouchesTombola} souches de {selectedGala.quantiteParSoucheTombola} tombolas
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

export default GalasPage; 