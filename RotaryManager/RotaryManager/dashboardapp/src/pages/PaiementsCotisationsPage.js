import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, InputNumber, DatePicker, Input, message, Space, Popconfirm, Card, Row, Col, Statistic, Select, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DollarOutlined, CalendarOutlined, UserOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { paiementCotisationService } from '../api/paiementCotisationService';
import { getMembres } from '../api/membreService';
import Sidebar from '../components/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import dayjs from 'dayjs';
import '../styles/table.css';
import axios from 'axios';

const { TextArea } = Input;
const { Option } = Select;

const PaiementsCotisationsPage = () => {
  const [paiements, setPaiements] = useState([]);
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPaiement, setEditingPaiement] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingPaiement, setViewingPaiement] = useState(null);
  const [form] = Form.useForm();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Récupérer le clubId depuis le localStorage
  const clubId = JSON.parse(localStorage.getItem('user'))?.clubId;

  const fetchMembres = useCallback(async () => {
    if (!clubId) {
      console.log('fetchMembres: clubId is missing');
      return;
    }
    try {
      const membresData = await getMembres(clubId);
      console.log('Données reçues de getMembres:', membresData);
      setMembres(membresData);
    } catch (error) {
      console.error('Erreur lors du chargement des membres:', error);
      message.error("Erreur lors du chargement des membres");
    }
  }, [clubId]);

  const fetchPaiements = useCallback(async () => {
    if (!clubId) {
      setPaiements([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
      return;
    }
    setLoading(true);
    try {
      const data = await paiementCotisationService.getPaiements(clubId);
      console.log('Données reçues de getPaiements:', data);
      setPaiements(data);
      setPagination(prev => ({
        ...prev,
        total: data.length,
        current: 1,
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des paiements:', error);
      message.error("Erreur lors du chargement des paiements");
      setPaiements([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  const fetchStats = useCallback(async () => {
    if (!clubId) return;
    try {
      const statsData = await paiementCotisationService.getStatistiquesGlobales();
      console.log('Données reçues de getStatistiquesGlobales:', statsData);
      setStats(statsData);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      message.error("Erreur lors du chargement des statistiques");
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
      fetchMembres();
    }
  }, [clubId, fetchMembres]);

  useEffect(() => {
    fetchPaiements();
    fetchStats();
  }, [fetchPaiements, fetchStats]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const openModal = (record = null) => {
    setEditingPaiement(record);
    setModalVisible(true);
    if (record) {
      form.setFieldsValue({
        ...record,
        date: dayjs(record.date),
        membreId: record.membre?.id
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ date: dayjs() });
    }
  };

  const openViewModal = (record) => {
    setViewingPaiement(record);
    setViewModalVisible(true);
  };

  const closeViewModal = () => {
    setViewModalVisible(false);
    setViewingPaiement(null);
  };

  const handleDelete = async (id) => {
    try {
      await paiementCotisationService.deletePaiement(id);
      message.success('Paiement supprimé');
      fetchPaiements();
      fetchStats();
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
      const paiementData = {
        MembreId: values.membreId,
        ClubId: clubId,
        Date: values.date ? values.date.toISOString() : null,
        Montant: values.montant,
        Commentaires: values.commentaires || ""
      };

      if (editingPaiement) {
        await paiementCotisationService.updatePaiement(editingPaiement.id, paiementData);
        message.success('Paiement modifié');
      } else {
        await paiementCotisationService.createPaiement(paiementData);
        message.success('Paiement ajouté');
      }
      setModalVisible(false);
      setEditingPaiement(null);
      form.resetFields();
      fetchPaiements();
      fetchStats();
    } catch (error) {
      message.error(error.response?.data?.message || error.message || "Erreur lors de l'enregistrement");
    }
  };

  // Filtrage des paiements selon le champ de recherche
  const filteredPaiements = paiements.filter(p => {
    const membreNom = p.membre ? `${p.membre.firstName || ''} ${p.membre.lastName || ''}`.trim() : '';
    return (
      membreNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.commentaires || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const columns = [
    {
      title: 'Membre',
      key: 'membre',
      render: (_, record) => {
        if (record.membre) {
          const prenom = record.membre.firstName || '';
          const nom = record.membre.lastName || '';
          return (prenom + ' ' + nom).trim();
        }
        return 'N/A';
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
          <Popconfirm title="Supprimer ce paiement ?" onConfirm={() => handleDelete(record.id)} okText="Oui" cancelText="Non">
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

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
                  Paiements des Cotisations
                </h1>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-full">
          {/* Statistiques globales si disponibles */}
          {stats && (
            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card>
                  <Statistic
                    title="Total des Paiements"
                    value={stats.montantTotal}
                    precision={0}
                    valueStyle={{ color: '#3f8600' }}
                    prefix={<DollarOutlined />}
                    suffix=" FCFA"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card>
                  <Statistic
                    title="Paiements ce Mois"
                    value={stats.montantCeMois}
                    precision={0}
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<CalendarOutlined />}
                    suffix=" FCFA"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card>
                  <Statistic
                    title="Nombre de Paiements"
                    value={stats.nombrePaiementsTotal}
                    prefix={<UserOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card>
                  <Statistic
                    title="Moyenne par Paiement"
                    value={stats.montantMoyenParPaiement}
                    precision={0}
                    valueStyle={{ color: '#cf1322' }}
                    prefix={<DollarOutlined />}
                    suffix=" FCFA"
                  />
                </Card>
              </Col>
            </Row>
          )}

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-4">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              Ajouter un paiement
            </Button>
            <Input
              placeholder="Rechercher par membre ou commentaire..."
              prefix={<SearchOutlined />}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', maxWidth: 300 }}
              allowClear
            />
          </div>

          <div className="w-full bg-white p-4 sm:p-6 rounded-lg shadow">
            <Table
              columns={columns}
              dataSource={filteredPaiements}
              rowKey="id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: filteredPaiements.length,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                responsive: true,
                showQuickJumper: isMobile ? false : true,
                showTotal: (total, range) => isMobile ? `${range[0]}-${range[1]} / ${total}` : `${range[0]}-${range[1]} sur ${total} éléments`,
              }}
              onChange={(pagination, filters, sorter) => {
                handleTableChange(pagination);
                console.log('Données affichées dans le tableau:', paiements);
              }}
              scroll={{ x: 'max-content' }}
              size="middle"
              className="responsive-table"
            />

            <Modal
              title={editingPaiement ? 'Modifier le paiement' : 'Ajouter un paiement'}
              open={modalVisible}
              onCancel={() => { setModalVisible(false); setEditingPaiement(null); form.resetFields(); }}
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
                  name="membreId"
                  label="Membre"
                  rules={[{ required: true, message: 'Le membre est obligatoire' }]}
                >
                  <Select
                    placeholder="Sélectionnez un membre"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {membres.map(m => (
                      <Option key={m.id} value={m.id}>
                        {`${m.firstName} ${m.lastName}`}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="date"
                  label="Date"
                  rules={[{ required: true, message: 'La date est obligatoire' }]}
                >
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
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
                      {editingPaiement ? 'Mettre à jour' : 'Ajouter'}
                    </Button>
                    <Button onClick={() => { setModalVisible(false); setEditingPaiement(null); form.resetFields(); }}>
                      Annuler
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Modal>

            {/* Modal de détails/visualisation */}
            <Modal
              title="Détails du paiement"
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
              {viewingPaiement && (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Membre">
                        <p>
                          {viewingPaiement.membre 
                            ? `${viewingPaiement.membre.firstName || ''} ${viewingPaiement.membre.lastName || ''}`.trim()
                            : 'N/A'
                          }
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Date">
                        <p>{dayjs(viewingPaiement.date).format('DD/MM/YYYY')}</p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Montant">
                        <p style={{ color: '#3f8600', fontWeight: 'bold' }}>
                          {viewingPaiement.montant.toLocaleString('fr-FR')} FCFA
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24}>
                      <Card size="small" title="Commentaires">
                        <p>{viewingPaiement.commentaires || 'Aucun commentaire'}</p>
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

export default PaiementsCotisationsPage;