import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Card, Row, Col, Statistic, DatePicker, Switch, Select, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined, SearchOutlined, EyeOutlined, EnvironmentOutlined, CheckCircleOutlined, GlobalOutlined, TeamOutlined, FileTextOutlined } from '@ant-design/icons';
import { getEvenements, createEvenement, updateEvenement, deleteEvenement } from '../api/evenementService';
import Sidebar from '../components/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import '../styles/table.css';
import moment from 'moment';

const { TextArea } = Input;
const { Option } = Select;

const EvenementsPage = () => {
  const [evenements, setEvenements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingEvenement, setEditingEvenement] = useState(null);
  const [selectedEvenement, setSelectedEvenement] = useState(null);
  const [form] = Form.useForm();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
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

  const fetchEvenements = useCallback(async () => {
    setLoading(true);
    try {
      const evenementsResponse = await getEvenements();
      
      let evenementsData = [];
      if (evenementsResponse && evenementsResponse.data) {
        evenementsData = Array.isArray(evenementsResponse.data) ? evenementsResponse.data : [];
      } else if (Array.isArray(evenementsResponse)) {
        evenementsData = evenementsResponse;
      }
      
      setEvenements(evenementsData);
      setPagination(prev => ({
        ...prev,
        total: evenementsData.length,
        current: 1,
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
      message.error("Erreur lors du chargement des événements");
      setEvenements([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvenements();
  }, [fetchEvenements]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Filtrage des événements selon le champ de recherche et le filtre de type
  const filteredEvenements = evenements.filter(evenement => {
    const matchesSearch = (
      (evenement.libelle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (evenement.lieu || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (evenement.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesType = typeFilter === 'all' || 
      (typeFilter === 'interne' && evenement.estInterne) ||
      (typeFilter === 'externe' && !evenement.estInterne);
    
    return matchesSearch && matchesType;
  });

  // Statistiques calculées à partir des événements filtrés
  const totalEvenements = filteredEvenements.length;
  const evenementsInternes = filteredEvenements.filter(e => e.estInterne).length;
  const evenementsExternes = filteredEvenements.filter(e => !e.estInterne).length;
  const evenementsFuturs = filteredEvenements.filter(e => {
    if (!e.date) return false;
    return new Date(e.date) > new Date();
  }).length;

  const openModal = (record = null) => {
    setEditingEvenement(record);
    setModalVisible(true);
    if (record) {
      console.log('record complet passé à openModal:', record);
      console.log('Valeur de estInterne dans record:', record?.estInterne, typeof record?.estInterne);
      const estInterneBool = record.estInterne === true || record.estInterne === 'true' || record.estInterne === 1;
      console.log('Valeur booléenne calculée pour estInterne:', estInterneBool);
      form.setFieldsValue({
        libelle: record.libelle,
        date: record.date ? moment(record.date) : null,
        lieu: record.lieu,
        description: record.description,
        estInterne: estInterneBool,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ 
        libelle: '',
        date: null,
        lieu: '',
        description: '',
        estInterne: false
      });
    }
  };

  const openDetailModal = async (record) => {
    try {
      setSelectedEvenement(record);
      setDetailModalVisible(true);
    } catch (error) {
      message.error("Erreur lors du chargement des détails");
    }
  };

  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedEvenement(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteEvenement(id);
      message.success('Événement supprimé');
      fetchEvenements();
    } catch (error) {
      message.error("Erreur lors de la suppression: " + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmit = async (values) => {
    try {
      console.log('Valeurs du formulaire avant soumission:', values);
      
      // S'assurer que estInterne est un booléen
      const estInterne = Boolean(values.estInterne);
      console.log('Valeur de estInterne après conversion:', estInterne);
      
      const evenementData = {
        libelle: values.libelle,
        date: values.date ? moment.utc(values.date).format() : null,
        lieu: values.lieu,
        description: values.description || '',
        estInterne: estInterne
      };
      
      console.log('Données à envoyer:', JSON.stringify(evenementData, null, 2));

      if (editingEvenement) {
        console.log('Mise à jour de l\'événement:', editingEvenement.id);
        console.log('Valeur actuelle de estInterne:', editingEvenement.estInterne);
        console.log('Nouvelle valeur de estInterne:', estInterne);
        
        await updateEvenement(editingEvenement.id, evenementData);
        message.success('Événement modifié');
      } else {
        console.log('Création d\'un nouvel événement');
        await createEvenement(evenementData);
        message.success('Événement créé');
      }
      setModalVisible(false);
      setEditingEvenement(null);
      form.resetFields();
      fetchEvenements();
    } catch (error) {
      console.error('Erreur détaillée:', error);
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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return moment(dateString).format('DD/MM/YYYY');
  };

  const isEventPast = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  const columns = [
    {
      title: 'Événement',
      key: 'evenement',
      width: 220,
      render: (_, record) => (
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-3">
            <CalendarOutlined />
          </div>
          <div>
            <div className="font-medium text-gray-900 ellipsis-cell" style={{maxWidth: 180}} title={record.libelle}>
              {record.libelle}
            </div>
          </div>
        </div>
      ),
      sorter: (a, b) => (a.libelle || '').localeCompare(b.libelle || ''),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 150,
      render: (date) => (
        <div className="flex items-center">
          <CalendarOutlined style={{ marginRight: 8, color: isEventPast(date) ? '#8c8c8c' : '#52c41a' }} />
          <div>
            <div className="font-medium ellipsis-cell" style={{maxWidth: 100}} title={formatDate(date)}>
              {formatDate(date)}
            </div>
            <div className={`text-xs ${isEventPast(date) ? 'text-gray-500' : 'text-green-600'}`}>
              {isEventPast(date) ? 'Passé' : 'À venir'}
            </div>
          </div>
        </div>
      ),
      sorter: (a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateA - dateB;
      },
    },
    {
      title: 'Lieu',
      dataIndex: 'lieu',
      key: 'lieu',
      width: 180,
      render: (text) => (
        <span className="ellipsis-cell" style={{maxWidth: 180}} title={text}>
          <EnvironmentOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {text}
        </span>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      render: (text) => (
        <span className="ellipsis-cell" style={{maxWidth: 200}} title={text}>
          <FileTextOutlined style={{ marginRight: 8, color: '#8c8c8c' }} />
          {text ? text : <span style={{ color: '#d9d9d9', fontStyle: 'italic' }}>Aucune description</span>}
        </span>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'estInterne',
      key: 'estInterne',
      width: 120,
      render: (estInterne) => (
        <Tag color={estInterne ? 'green' : 'blue'} icon={estInterne ? <TeamOutlined /> : <GlobalOutlined />}>
          {estInterne ? 'Interne' : 'Externe'}
        </Tag>
      ),
      filters: [
        { text: 'Interne', value: true },
        { text: 'Externe', value: false },
      ],
      onFilter: (value, record) => record.estInterne === value,
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
            title="Supprimer cet événement ?" 
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
                  Gestion des Événements
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
                  title="Total événements"
                  value={totalEvenements}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Événements internes"
                  value={evenementsInternes}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Événements externes"
                  value={evenementsExternes}
                  prefix={<GlobalOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="À venir"
                  value={evenementsFuturs}
                  prefix={<CheckCircleOutlined />}
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
              Ajouter un événement
            </Button>
            <Input
              placeholder="Rechercher par libellé, lieu ou description..."
              prefix={<SearchOutlined />}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', maxWidth: 300 }}
              allowClear
            />
            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: 150 }}
            >
              <Option value="all">Tous les types</Option>
              <Option value="interne">Internes</Option>
              <Option value="externe">Externes</Option>
            </Select>
                  </div>

          <div className="w-full bg-white p-4 sm:p-6 rounded-lg shadow">
            <Table
              columns={columns}
              dataSource={filteredEvenements}
              rowKey="id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: filteredEvenements.length,
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
              title={editingEvenement ? 'Modifier l\'événement' : 'Ajouter un événement'}
              open={modalVisible}
              onCancel={() => { 
                setModalVisible(false); 
                setEditingEvenement(null); 
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
                initialValues={editingEvenement ? undefined : {
                  libelle: '',
                  date: null,
                  lieu: '',
                  description: '',
                  estInterne: false
                }}
              >
                <Form.Item
                  name="libelle"
                  label="Libellé"
                  rules={[
                    { required: true, message: 'Le libellé est obligatoire' },
                    { max: 200, message: 'Le libellé ne peut pas dépasser 200 caractères' }
                  ]}
                >
                  <Input 
                    placeholder="Nom de l'événement"
                    prefix={<CalendarOutlined />}
                  />
                </Form.Item>

                <Row gutter={16}>
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
                        onChange={(date) => {
                          if (date) {
                            // Forcer la date en UTC
                            const utcDate = moment.utc(date);
                            form.setFieldsValue({ date: utcDate });
                          }
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="lieu"
                      label="Lieu"
                      rules={[{ required: true, message: 'Le lieu est obligatoire' }]}
                    >
                      <Input 
                        placeholder="Lieu de l'événement"
                        prefix={<EnvironmentOutlined />}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="description"
                  label="Description"
                >
                  <TextArea 
                    rows={4}
                    placeholder="Description de l'événement..."
                    maxLength={1000}
                    showCount
                  />
                </Form.Item>

                <Form.Item name="estInterne" valuePropName="checked">
                  <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Form.Item name="estInterne" valuePropName="checked" noStyle>
                      <Switch size="default" />
                    </Form.Item>
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">Événement interne</div>
                      <div className="text-sm text-gray-500">Cet événement est réservé aux membres du club</div>
                    </div>
                  </div>
                </Form.Item>

                <Form.Item>
                  <Space className="w-full justify-end">
                    <Button type="primary" htmlType="submit">
                      {editingEvenement ? 'Mettre à jour' : 'Créer l\'événement'}
                    </Button>
                    <Button onClick={() => { 
                      setModalVisible(false); 
                      setEditingEvenement(null); 
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
              title="Détails de l'événement"
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
              {selectedEvenement && (
                  <div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Libellé">
                        <p style={{ fontWeight: 'bold', color: '#1890ff' }}>
                          <CalendarOutlined style={{ marginRight: 8 }} />
                          {selectedEvenement.libelle}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Type">
                        <p style={{ 
                          fontWeight: 'bold', 
                          color: selectedEvenement.estInterne ? '#52c41a' : '#1890ff' 
                        }}>
                          {selectedEvenement.estInterne ? <TeamOutlined style={{ marginRight: 8 }} /> : <GlobalOutlined style={{ marginRight: 8 }} />}
                          {selectedEvenement.estInterne ? 'Événement interne' : 'Événement externe'}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Date">
                        <p>
                          <CalendarOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                          {formatDate(selectedEvenement.date)}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Lieu">
                        <p>
                          <EnvironmentOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                          {selectedEvenement.lieu}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Statut">
                        <p style={{ 
                          fontWeight: 'bold', 
                          color: isEventPast(selectedEvenement.date) ? '#8c8c8c' : '#52c41a' 
                        }}>
                          <CheckCircleOutlined style={{ marginRight: 8 }} />
                          {isEventPast(selectedEvenement.date) ? 'Événement passé' : 'Événement à venir'}
                        </p>
                      </Card>
                    </Col>
                    {selectedEvenement.description && (
                      <Col xs={24}>
                        <Card size="small" title="Description">
                          <p style={{ whiteSpace: 'pre-wrap' }}>
                            <FileTextOutlined style={{ marginRight: 8, color: '#8c8c8c' }} />
                            {selectedEvenement.description}
                          </p>
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

export default EvenementsPage; 