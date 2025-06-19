import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button, Card, Row, Col, Statistic, message, Space, Modal, Form, Input, TimePicker, DatePicker, Popconfirm, Select, Divider, List, Typography, Spin, Calendar, Badge, Tooltip, Collapse } from 'antd';
import { PlusOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, AppstoreOutlined, EyeOutlined, EditOutlined, DeleteOutlined, UserOutlined, FileTextOutlined, TeamOutlined, FileOutlined, SearchOutlined, TableOutlined, UserAddOutlined, MailOutlined, UsergroupAddOutlined, DownloadOutlined } from '@ant-design/icons';
import Sidebar from '../components/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import '../styles/table.css';
import dayjs from 'dayjs';

// Styles CSS pour le calendrier
const calendarStyles = `
  .custom-calendar .ant-picker-calendar-date-content {
    height: 60px;
    overflow: hidden;
  }
  
  .custom-calendar .ant-picker-cell-inner {
    height: 60px;
  }
  
  .custom-calendar .ant-badge {
    width: 100%;
    max-width: none;
  }
  
  .custom-calendar .ant-badge-status-text {
    font-size: 11px;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .custom-calendar .ant-picker-calendar-date {
    border: 1px solid #f0f0f0;
  }
  
  .custom-calendar .ant-picker-calendar-date:hover {
    background-color: #f8f9fa;
  }
  
  .custom-calendar .ant-picker-calendar-date-today {
    border-color: #1890ff;
  }
`;

const { Option } = Select;
const { Panel } = Collapse;

const ReunionPage = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [reunions, setReunions] = useState([]);
  const [reunionsDetaillees, setReunionsDetaillees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingReunion, setEditingReunion] = useState(null);
  const [form] = Form.useForm();
  const [typesReunion, setTypesReunion] = useState([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reunionDetail, setReunionDetail] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [descriptionCount, setDescriptionCount] = useState(1);
  const [viewMode, setViewMode] = useState('table'); // 'table' ou 'calendar'
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchTypesReunion = useCallback(async () => {
    if (!clubId) {
      console.log('fetchTypesReunion: clubId is missing');
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/api/clubs/${clubId}/types-reunion`);
      setTypesReunion(response.data.typesReunion || response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des types de réunion:', error);
      message.error("Erreur lors du chargement des types de réunion");
    }
  }, [clubId]);

  const fetchReunions = useCallback(async () => {
    if (!clubId) {
      setReunions([]);
      setReunionsDetaillees([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/clubs/${clubId}/reunions`);
      setReunions(response.data);
      
      // Charger les détails de chaque réunion pour avoir les membres
      const reunionsAvecDetails = [];
      for (const reunion of response.data) {
        try {
          const detailResponse = await axios.get(`${API_BASE_URL}/api/clubs/${clubId}/reunions/${reunion.id}`);
          reunionsAvecDetails.push({
            ...reunion,
            details: detailResponse.data
          });
        } catch (error) {
          console.error(`Erreur lors du chargement des détails de la réunion ${reunion.id}:`, error);
          reunionsAvecDetails.push({
            ...reunion,
            details: null
          });
        }
      }
      
      setReunionsDetaillees(reunionsAvecDetails);
      setPagination(prev => ({
        ...prev,
        total: response.data.length,
        current: 1,
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des réunions:', error);
      message.error("Erreur lors du chargement des réunions");
      setReunions([]);
      setReunionsDetaillees([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
    } finally {
      setLoading(false);
    }
  }, [clubId]);

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
      fetchReunions();
      fetchTypesReunion();
    }
  }, [clubId, fetchReunions, fetchTypesReunion]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Filtrage des réunions selon le champ de recherche
  const filteredReunions = reunions.filter(r => {
    return (
      (r.typeReunionLibelle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      new Date(r.date).toLocaleDateString('fr-FR').includes(searchTerm)
    );
  });

  const filteredReunionsDetaillees = reunionsDetaillees.filter(r => {
    return (
      (r.typeReunionLibelle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      new Date(r.date).toLocaleDateString('fr-FR').includes(searchTerm)
    );
  });

  // Statistiques calculées à partir des réunions filtrées
  const now = new Date();
  const totalReunions = filteredReunions.length;
  const reunionsPassees = filteredReunions.filter(r => new Date(r.date) < now).length;
  const reunionsFutures = totalReunions - reunionsPassees;
  const typesUtilises = new Set(filteredReunions.map(r => r.typeReunionId)).size;

  // Colonnes pour le tableau des membres dans chaque réunion
  const membersColumns = [
    {
      title: 'Membre',
      key: 'membre',
      render: (_, record) => (
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
            record.type === 'presence' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
          }`}>
            {record.type === 'presence' ? <UserOutlined /> : <UsergroupAddOutlined />}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {record.type === 'presence' ? record.nomCompletMembre : `${record.prenom} ${record.nom}`}
            </div>
            <div className="text-sm text-gray-500">
              {record.type === 'presence' ? record.emailMembre : record.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Type',
      key: 'type',
      render: (_, record) => (
        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
          record.type === 'presence' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {record.type === 'presence' ? (
            <>
              <UserOutlined style={{ marginRight: 4 }} />
              Membre présent
            </>
          ) : (
            <>
              <UsergroupAddOutlined style={{ marginRight: 4 }} />
              Invité
            </>
          )}
        </span>
      ),
    },
    {
      title: 'Email',
      key: 'email',
      render: (_, record) => (
        <span>
          <MailOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {record.type === 'presence' ? record.emailMembre : record.email}
        </span>
      ),
    },
  ];

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString('fr-FR'),
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: 'Heure',
      dataIndex: 'heure',
      key: 'heure',
      render: (heure) => heure ? heure.substring(0,5) : '',
    },
    {
      title: 'Type',
      dataIndex: 'typeReunionLibelle',
      key: 'typeReunionLibelle',
    },
    {
      title: 'Ordres du jour',
      dataIndex: 'nombreOrdresDuJour',
      key: 'nombreOrdresDuJour',
      sorter: (a, b) => (a.nombreOrdresDuJour || 0) - (b.nombreOrdresDuJour || 0),
    },
    {
      title: 'Présences',
      dataIndex: 'nombrePresences',
      key: 'nombrePresences',
      sorter: (a, b) => (a.nombrePresences || 0) - (b.nombrePresences || 0),
    },
    {
      title: 'Invités',
      dataIndex: 'nombreInvites',
      key: 'nombreInvites',
      sorter: (a, b) => (a.nombreInvites || 0) - (b.nombreInvites || 0),
    },
    {
      title: 'Documents',
      dataIndex: 'nombreDocuments',
      key: 'nombreDocuments',
      sorter: (a, b) => (a.nombreDocuments || 0) - (b.nombreDocuments || 0),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => openDetailModal(record.id)} />
          <Popconfirm title="Supprimer cette réunion ?" onConfirm={() => handleDelete(record.id)} okText="Oui" cancelText="Non">
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const openModal = (record = null) => {
    setEditingReunion(record);
    setModalVisible(true);
    if (record) {
      form.setFieldsValue({
        ...record,
        date: dayjs(record.date),
        heure: dayjs(record.heure, 'HH:mm:ss')
      });
    } else {
      form.resetFields();
      // Définir les valeurs par défaut pour une nouvelle réunion
      const statutaireType = typesReunion.find(t => t.libelle === 'Statutaire');
      form.setFieldsValue({
        heure: dayjs('19:00', 'HH:mm'),
        typeReunionId: statutaireType?.id
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/clubs/${clubId}/reunions/${id}`);
      message.success('Réunion supprimée');
      fetchReunions();
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
      const payload = {
        Date: values.date.toISOString(),
        Heure: values.heure.format('HH:mm:ss'),
        TypeReunionId: values.typeReunionId,
        OrdresDuJour: Array.from({ length: descriptionCount }, (_, i) => values[`description${i + 1}`] || '')
          .filter(desc => desc.trim() !== '') // Filtrer les descriptions vides
      };

      if (editingReunion) {
        await axios.put(`${API_BASE_URL}/api/clubs/${clubId}/reunions/${editingReunion.id}`, payload);
        message.success('Réunion modifiée');
      } else {
        const response = await axios.post(`${API_BASE_URL}/api/clubs/${clubId}/reunions/complete`, payload);
        message.success('Réunion créée avec succès');
      }
      setModalVisible(false);
      setEditingReunion(null);
      form.resetFields();
      setDescriptionCount(1);
      fetchReunions();
    } catch (error) {
      if (error.response?.status === 400) {
        message.error(error.response.data || "Erreur lors de la création de la réunion");
      } else {
        message.error(error.response?.data?.message || error.message || "Erreur lors de l'enregistrement");
      }
    }
  };

  const openDetailModal = async (reunionId) => {
    setDetailModalVisible(true);
    setDetailLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/clubs/${clubId}/reunions/${reunionId}`);
      setReunionDetail(response.data);
    } catch (error) {
      message.error("Erreur lors du chargement des détails de la réunion");
    } finally {
      setDetailLoading(false);
    }
  };

  // Pour éviter les re-créations inutiles
  const handleToggleCollapse = useCallback((collapsed) => {
    setIsCollapsed(collapsed);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Fonction pour obtenir les données du calendrier
  const getCalendarData = useCallback((value) => {
    const dateStr = value.format('YYYY-MM-DD');
    const reunionsOfDay = filteredReunions.filter(reunion =>
      dayjs(reunion.date).format('YYYY-MM-DD') === dateStr
    );
    return reunionsOfDay;
  }, [filteredReunions]);

  // Fonction pour afficher les réunions sur le calendrier
  const dateCellRender = useCallback((value) => {
    const reunionsOfDay = getCalendarData(value);
    return (
      <div className="h-full">
        {reunionsOfDay.map((reunion, index) => (
          <div key={reunion.id} className="mb-1">
            <Tooltip title={`${reunion.typeReunionLibelle} - ${reunion.heure ? reunion.heure.substring(0,5) : ''}`}>
              <Badge
                status={new Date(reunion.date) < new Date() ? 'default' : 'processing'}
                text={
                  <span className="text-xs cursor-pointer hover:text-blue-600" 
                        onClick={() => openDetailModal(reunion.id)}>
                    {reunion.typeReunionLibelle}
                  </span>
                }
              />
            </Tooltip>
          </div>
        ))}
      </div>
    );
  }, [getCalendarData]);

  // Largeur dynamique selon l'état du sidebar
  const sidebarWidth = isCollapsed ? '4rem' : '18rem';

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Injection des styles CSS pour le calendrier */}
      <style dangerouslySetInnerHTML={{ __html: calendarStyles }} />
      
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
                  Gestion des Réunions
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
                  title="Total des réunions"
                  value={totalReunions}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Réunions passées"
                  value={reunionsPassees}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Réunions à venir"
                  value={reunionsFutures}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Types utilisés"
                  value={typesUtilises}
                  prefix={<AppstoreOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-4">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              Nouvelle réunion
            </Button>
            <Button 
              icon={<TableOutlined />} 
              onClick={() => setViewMode('table')}
              className={viewMode === 'table' ? 'bg-blue-500 text-white border-blue-500' : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'}
            >
              Vue Tableau
            </Button>
            <Button 
              icon={<CalendarOutlined />} 
              onClick={() => setViewMode('calendar')}
              className={viewMode === 'calendar' ? 'bg-blue-500 text-white border-blue-500' : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'}
            >
              Vue Calendrier
            </Button>
            <Input
              placeholder="Rechercher par type ou date..."
              prefix={<SearchOutlined />}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', maxWidth: 300 }}
              allowClear
            />
          </div>

          <div className="w-full bg-white p-4 sm:p-6 rounded-lg shadow">
            {viewMode === 'table' ? (
              loading ? (
                <div className="text-center py-8">
                  <Spin size="large" />
                  <p className="mt-4">Chargement des réunions...</p>
                </div>
              ) : filteredReunionsDetaillees.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Aucune réunion trouvée</p>
                </div>
              ) : (
                <Collapse 
                  defaultActiveKey={filteredReunionsDetaillees.map(r => r.id.toString())} 
                  className="reunion-collapse"
                >
                  {filteredReunionsDetaillees.map((reunion) => {
                    const participants = [];
                    
                    // Ajouter les présences (membres)
                    if (reunion.details?.presences) {
                      reunion.details.presences.forEach(presence => {
                        participants.push({
                          ...presence,
                          type: 'presence',
                          key: `presence-${presence.id || presence.membreId}`
                        });
                      });
                    }
                    
                    // Ajouter les invités
                    if (reunion.details?.invites) {
                      reunion.details.invites.forEach(invite => {
                        participants.push({
                          ...invite,
                          type: 'invite',
                          key: `invite-${invite.id}`
                        });
                      });
                    }

                    return (
                      <Panel 
                        header={
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <CalendarOutlined style={{ marginRight: 12, color: '#1890ff', fontSize: '16px' }} />
                              <div>
                                <span className="font-semibold text-lg">
                                  {reunion.typeReunionLibelle} - {new Date(reunion.date).toLocaleDateString('fr-FR')}
                                </span>
                                <div className="text-sm text-gray-500">
                                  {reunion.heure ? reunion.heure.substring(0,5) : ''} - {reunion.nombreOrdresDuJour || 0} ordre(s) du jour
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                {participants.filter(p => p.type === 'presence').length} membre(s)
                              </span>
                              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                {participants.filter(p => p.type === 'invite').length} invité(s)
                              </span>
                              <Space>
                                <Button 
                                  icon={<EyeOutlined />} 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDetailModal(reunion.id);
                                  }}
                                  title="Voir les détails"
                                  size="small"
                                />
                                <Popconfirm 
                                  title="Supprimer cette réunion ?" 
                                  onConfirm={(e) => {
                                    e?.stopPropagation();
                                    handleDelete(reunion.id);
                                  }}
                                  okText="Oui" 
                                  cancelText="Non"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Button 
                                    icon={<DeleteOutlined />} 
                                    danger 
                                    title="Supprimer"
                                    size="small"
                                  />
                                </Popconfirm>
                              </Space>
                            </div>
                          </div>
                        } 
                        key={reunion.id}
                        className="mb-4"
                      >
                        {participants.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-gray-500">Aucun membre pour cette réunion</p>
                          </div>
                        ) : (
                          <Table
                            columns={membersColumns}
                            dataSource={participants}
                            rowKey="key"
                            pagination={false}
                            size="middle"
                            className="reunion-table"
                            scroll={{ x: 'max-content' }}
                          />
                        )}
                        
                        {/* Ordres du jour */}
                        {reunion.details?.ordresDuJour && reunion.details.ordresDuJour.length > 0 && (
                          <div className="mt-4">
                            <Divider orientation="left">
                              <FileTextOutlined style={{ marginRight: 8 }} />
                              Ordres du jour
                            </Divider>
                            <List
                              dataSource={reunion.details.ordresDuJour}
                              renderItem={(item, index) => (
                                <List.Item>
                                  <span className="font-medium text-gray-700">{index + 1}.</span>
                                  <span className="ml-2">{item.description}</span>
                                </List.Item>
                              )}
                              size="small"
                            />
                          </div>
                        )}

                        {/* Documents */}
                        {reunion.details?.documents && reunion.details.documents.length > 0 && (
                          <div className="mt-4">
                            <Divider orientation="left">
                              <FileOutlined style={{ marginRight: 8 }} />
                              Documents
                            </Divider>
                            <List
                              dataSource={reunion.details.documents}
                              renderItem={(item, index) => (
                                <List.Item>
                                  <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center">
                                      <FileOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                                      <span className="font-medium text-gray-700">{item.libelle}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      <span className="text-sm text-gray-500">
                                        {(item.tailleEnOctets/1024).toFixed(1)} Ko
                                      </span>
                                    </div>
                                  </div>
                                </List.Item>
                              )}
                              size="small"
                            />
                          </div>
                        )}
                      </Panel>
                    );
                  })}
                </Collapse>
              )
            ) : (
              <div>
                <div className="mb-4 text-center">
                  <h3 className="text-lg font-semibold text-gray-800">Calendrier des Réunions</h3>
                  <p className="text-sm text-gray-600">Cliquez sur une réunion pour voir les détails</p>
                </div>
                <Calendar
                  cellRender={dateCellRender}
                  className="custom-calendar"
                  onSelect={(date) => {
                    const reunionsOfDay = getCalendarData(date);
                    if (reunionsOfDay.length === 1) {
                      openDetailModal(reunionsOfDay[0].id);
                    }
                  }}
                />
              </div>
            )}

            <Modal
              title={editingReunion ? 'Modifier la réunion' : 'Nouvelle réunion'}
              open={modalVisible}
              onCancel={() => { setModalVisible(false); setEditingReunion(null); form.resetFields(); setDescriptionCount(1); }}
              footer={null}
              destroyOnClose
              width={isMobile ? '95%' : 800}
              centered={isMobile}
              className="modern-modal"
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="p-4"
              >
                <div className="bg-white rounded-lg">
                  <div className="p-6">
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="date"
                          label="Date"
                          rules={[{ required: true, message: 'Veuillez sélectionner une date' }]}
                        >
                          <DatePicker 
                            style={{ width: '100%' }} 
                            format="DD/MM/YYYY"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="heure"
                          label="Heure"
                          rules={[{ required: true, message: 'Veuillez sélectionner une heure' }]}
                        >
                          <TimePicker 
                            style={{ width: '100%' }} 
                            format="HH:mm"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="typeReunionId"
                          label="Type de réunion"
                          rules={[{ required: true, message: 'Veuillez sélectionner un type de réunion' }]}
                        >
                          <Select
                            placeholder="Sélectionnez le type de réunion"
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            {typesReunion.map(tr => (
                              <Option key={tr.id} value={tr.id}>{tr.libelle}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Nombre d'ordres du jour">
                          <Input
                            type="number"
                            min={1}
                            value={descriptionCount}
                            onChange={(e) => setDescriptionCount(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <div className="mt-4 space-y-4">
                      {Array.from({ length: descriptionCount }, (_, i) => (
                        <Form.Item
                          key={i}
                          name={`description${i + 1}`}
                          label={`Ordre du jour ${i + 1}`}
                        >
                          <Input 
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Entrez l'ordre du jour..."
                          />
                        </Form.Item>
                      ))}
                    </div>

                    <div className="mt-6 flex justify-end space-x-4">
                      <Button 
                        onClick={() => { setModalVisible(false); setEditingReunion(null); form.resetFields(); setDescriptionCount(1); }}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Annuler
                      </Button>
                      <Button 
                        type="primary" 
                        htmlType="submit"
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {editingReunion ? 'Mettre à jour' : 'Créer'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Form>
            </Modal>

            {/* Modal de détails */}
            <Modal
              title="Détails de la réunion"
              open={detailModalVisible}
              onCancel={() => { setDetailModalVisible(false); setReunionDetail(null); }}
              footer={[
                <Button key="close" onClick={() => { setDetailModalVisible(false); setReunionDetail(null); }}>
                  Fermer
                </Button>,
              ]}
              width={isMobile ? '95%' : 600}
              centered={isMobile}
            >
              {detailLoading ? (
                <div style={{ textAlign: 'center', padding: 32 }}><Spin size="large" /></div>
              ) : reunionDetail ? (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Type de réunion">
                        <p>{reunionDetail.typeReunionLibelle}</p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Date et heure">
                        <p>{new Date(reunionDetail.date).toLocaleDateString('fr-FR')} à {reunionDetail.heure.substring(0,5)}</p>
                      </Card>
                    </Col>
                    <Col xs={24}>
                      <Card size="small" title="Ordres du jour">
                        {reunionDetail.ordresDuJour && reunionDetail.ordresDuJour.length > 0 ? (
                          <List
                            dataSource={reunionDetail.ordresDuJour}
                            renderItem={item => <List.Item>{item.description}</List.Item>}
                            size="small"
                          />
                        ) : (
                          <p>Aucun ordre du jour</p>
                        )}
                      </Card>
                    </Col>
                    <Col xs={24}>
                      <Card size="small" title="Présences">
                        {reunionDetail.presences && reunionDetail.presences.length > 0 ? (
                          <List
                            dataSource={reunionDetail.presences}
                            renderItem={item => (
                              <List.Item>
                                {item.nomCompletMembre} 
                                <span style={{ color: '#888', marginLeft: 8 }}>{item.emailMembre}</span>
                              </List.Item>
                            )}
                            size="small"
                          />
                        ) : (
                          <p>Aucune présence</p>
                        )}
                      </Card>
                    </Col>
                    <Col xs={24}>
                      <Card size="small" title="Invités">
                        {reunionDetail.invites && reunionDetail.invites.length > 0 ? (
                          <List
                            dataSource={reunionDetail.invites}
                            renderItem={item => (
                              <List.Item>
                                {item.prenom} {item.nom} 
                                <span style={{ color: '#888', marginLeft: 8 }}>{item.email}</span>
                              </List.Item>
                            )}
                            size="small"
                          />
                        ) : (
                          <p>Aucun invité</p>
                        )}
                      </Card>
                    </Col>
                    <Col xs={24}>
                      <Card size="small" title="Documents">
                        {reunionDetail.documents && reunionDetail.documents.length > 0 ? (
                          <List
                            dataSource={reunionDetail.documents}
                            renderItem={item => (
                              <List.Item>
                                {item.libelle} 
                                <span style={{ color: '#888', marginLeft: 8 }}>
                                  {(item.tailleEnOctets/1024).toFixed(1)} Ko
                                </span>
                              </List.Item>
                            )}
                            size="small"
                          />
                        ) : (
                          <p>Aucun document</p>
                        )}
                      </Card>
                    </Col>
                  </Row>
                </div>
              ) : (
                <Typography.Text type="danger">Aucune donnée</Typography.Text>
              )}
            </Modal>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReunionPage;