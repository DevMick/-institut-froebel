import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Card, Row, Col, Statistic, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BankOutlined, SearchOutlined, EyeOutlined, UserOutlined, TeamOutlined, CrownOutlined, FileTextOutlined } from '@ant-design/icons';
import { getCommissionsByClub, createCommission, updateCommission, deleteCommission, getClubCommissionMembers } from '../api/commissionService';
import Sidebar from '../components/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import '../styles/table.css';

const { TextArea } = Input;
const { Option } = Select;

const CommissionsPage = () => {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingCommission, setEditingCommission] = useState(null);
  const [selectedCommission, setSelectedCommission] = useState(null);
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

  const fetchCommissions = useCallback(async () => {
    if (!clubId) {
      console.log('Pas de clubId trouvé dans le localStorage');
      setCommissions([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
      return;
    }
    console.log('Fetching commissions pour le clubId:', clubId);
    setLoading(true);
    try {
      const commissionsData = await getCommissionsByClub(clubId);
      console.log('Données reçues de l\'API:', commissionsData);

      // Récupérer le nombre de membres pour chaque commission
      const commissionsWithMembers = await Promise.all(
        commissionsData.map(async (commission) => {
          try {
            const response = await getClubCommissionMembers(clubId, commission.id);
            const membres = response.Membres || response.membres || [];
            return {
              ...commission,
              nombreMembres: membres.length,
              membres: membres
            };
          } catch (error) {
            console.error(`Erreur lors du chargement des membres de la commission ${commission.id}:`, error);
            return {
              ...commission,
              nombreMembres: 0,
              membres: []
            };
          }
        })
      );

      console.log('Commissions avec membres:', commissionsWithMembers);
      setCommissions(commissionsWithMembers || []);
      setPagination(prev => ({
        ...prev,
        total: (commissionsWithMembers || []).length,
        current: 1,
      }));
    } catch (error) {
      console.error('Erreur détaillée lors du chargement des commissions:', error);
      message.error("Erreur lors du chargement des commissions");
      setCommissions([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    console.log('useEffect triggered, userInfo:', userInfo);
    console.log('clubId actuel:', clubId);
    fetchCommissions();
  }, [fetchCommissions]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Filtrage des commissions selon le champ de recherche
  const filteredCommissions = commissions.filter(commission => {
    console.log('Filtrage de la commission:', commission);
    return (
      (commission.nom || commission.Nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (commission.description || commission.Description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Log temporaire pour debug
  console.log('État actuel des commissions:', {
    commissions,
    filteredCommissions,
    loading,
    pagination,
    searchTerm
  });

  // Statistiques calculées à partir des commissions filtrées
  const totalCommissions = filteredCommissions.length;
  const totalMembres = filteredCommissions.reduce((sum, c) => sum + (c.nombreMembres || 0), 0);
  const moyenneMembres = totalCommissions > 0 ? (totalMembres / totalCommissions).toFixed(1) : 0;
  const commissionsAvecMembres = filteredCommissions.filter(c => (c.nombreMembres || 0) > 0).length;

  const openModal = (record = null) => {
    setEditingCommission(record);
    setModalVisible(true);
    if (record) {
      form.setFieldsValue({
        nom: record.nom,
        description: record.description,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ 
        nom: '',
        description: ''
      });
    }
  };

  const openDetailModal = async (record) => {
    try {
      setSelectedCommission(record);
      setDetailModalVisible(true);
    } catch (error) {
      message.error("Erreur lors du chargement des détails");
    }
  };

  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedCommission(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteCommission(id);
      message.success('Commission supprimée');
      fetchCommissions();
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
      const commissionData = {
        nom: values.nom,
        description: values.description || '',
        clubId: clubId
      };

      if (editingCommission) {
        const response = await updateCommission(editingCommission.id, commissionData);
        if (response.success) {
          message.success('Commission modifiée');
        } else {
          message.error(response.error?.message || 'Erreur lors de la modification');
          return;
        }
      } else {
        try {
          const response = await createCommission(commissionData);
          if (response.success) {
            message.success('Commission créée');
            setModalVisible(false);
            setEditingCommission(null);
            form.resetFields();
            fetchCommissions();
          } else {
            message.error(response.error?.message || 'Erreur lors de la création');
          }
        } catch (createError) {
          // Afficher directement le message d'erreur du serveur
          if (createError.response?.data) {
            message.error(createError.response.data);
          } else {
            message.error("Erreur lors de la création de la commission");
          }
        }
      }
    } catch (error) {
      // Afficher directement le message d'erreur du serveur
      if (error.response?.data) {
        message.error(error.response.data);
      } else {
        message.error("Erreur lors de l'enregistrement");
      }
    }
  };

  const handleToggleCollapse = useCallback((collapsed) => {
    setIsCollapsed(collapsed);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Largeur dynamique selon l'état du sidebar - MISE À JOUR pour 18rem
  const sidebarWidth = isCollapsed ? '4rem' : '18rem';

  const columns = [
    {
      title: 'Commission',
      key: 'commission',
      render: (_, record) => (
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
            <BankOutlined />
          </div>
          <div>
            <div className="font-medium text-gray-900">{record.nom || record.Nom}</div>
          </div>
        </div>
      ),
      sorter: (a, b) => ((a.nom || a.Nom || '').localeCompare(b.nom || b.Nom || '')),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => (
        <span>
          <FileTextOutlined style={{ marginRight: 8, color: '#8c8c8c' }} />
          {text ? (
            <span title={text}>
              {text.length > 50 ? text.substring(0, 50) + '...' : text}
            </span>
          ) : (
            <span style={{ color: '#d9d9d9', fontStyle: 'italic' }}>Aucune description</span>
          )}
        </span>
      ),
    },
    {
      title: 'Membres',
      dataIndex: 'nombreMembres',
      key: 'nombreMembres',
      render: (count, record) => {
        console.log('Rendu de la colonne Membres:', {
          count,
          record,
          nombreMembres: record.nombreMembres,
          membres: record.membres,
          rawData: record
        });
        return (
          <span style={{ 
            color: count > 0 ? '#52c41a' : '#d9d9d9', 
            fontWeight: count > 0 ? 'bold' : 'normal' 
          }}>
            <TeamOutlined style={{ marginRight: 8 }} />
            {count || 0}
          </span>
        );
      },
      sorter: (a, b) => (a.nombreMembres || 0) - (b.nombreMembres || 0),
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
            title="Supprimer cette commission ?" 
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
                  Gestion des Commissions
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
                  title="Total commissions"
                  value={totalCommissions}
                  prefix={<BankOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Avec membres"
                  value={commissionsAvecMembres}
                  prefix={<CrownOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Total membres"
                  value={totalMembres}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Moyenne membres"
                  value={moyenneMembres}
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
            >
              Ajouter une commission
            </Button>
            <Input
              placeholder="Rechercher par nom ou description..."
              prefix={<SearchOutlined />}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', maxWidth: 300 }}
              allowClear
            />
          </div>

          <div className="w-full bg-white p-4 sm:p-6 rounded-lg shadow">
            <Table
              columns={columns}
              dataSource={filteredCommissions}
              rowKey="id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: filteredCommissions.length,
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
              title={editingCommission ? 'Modifier la commission' : 'Ajouter une commission'}
              open={modalVisible}
              onCancel={() => { 
                setModalVisible(false); 
                setEditingCommission(null); 
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
                initialValues={editingCommission ? undefined : {
                  nom: '',
                  description: ''
                }}
              >
                <Form.Item
                  name="nom"
                  label="Nom de la commission"
                  rules={[
                    { required: true, message: 'Le nom est obligatoire' },
                    { max: 100, message: 'Le nom ne peut pas dépasser 100 caractères' }
                  ]}
                >
                  <Input 
                    placeholder="Nom de la commission"
                    prefix={<BankOutlined />}
                  />
                </Form.Item>

                <Form.Item
                  name="description"
                  label="Description"
                >
                  <TextArea 
                    rows={4}
                    placeholder="Description de la commission..."
                    maxLength={1000}
                    showCount
                  />
                </Form.Item>

                <Form.Item>
                  <Space className="w-full justify-end">
                    <Button type="primary" htmlType="submit">
                      {editingCommission ? 'Mettre à jour' : 'Créer la commission'}
                    </Button>
                    <Button onClick={() => { 
                      setModalVisible(false); 
                      setEditingCommission(null); 
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
              title="Détails de la commission"
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
              {selectedCommission && (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Nom">
                        <p style={{ fontWeight: 'bold', color: '#1890ff' }}>
                          <BankOutlined style={{ marginRight: 8 }} />
                          {selectedCommission.nom || selectedCommission.Nom}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Membres">
                        <p style={{ fontWeight: 'bold', color: '#52c41a' }}>
                          <TeamOutlined style={{ marginRight: 8 }} />
                          {selectedCommission.nombreMembres || 0} membre(s)
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24}>
                      <Card size="small" title="Description">
                        <p>{selectedCommission.description || selectedCommission.Description || 'Aucune description fournie'}</p>
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

export default CommissionsPage;