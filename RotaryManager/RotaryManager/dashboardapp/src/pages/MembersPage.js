import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Card, Row, Col, Statistic, DatePicker, Divider, Spin, Avatar } from 'antd';
import { PlusOutlined, DeleteOutlined, UserOutlined, MailOutlined, PhoneOutlined, CalendarOutlined, SearchOutlined, EyeOutlined, TeamOutlined, LockOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { getClubMembers, addMember, updateMember, deleteMember } from '../api/memberService';
import { getClub } from '../api/clubService';
import Sidebar from '../components/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import '../styles/table.css';
import moment from 'moment';

const MembersPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [form] = Form.useForm();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [clubInfo, setClubInfo] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Récupérer le clubId depuis le localStorage
  const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
  const clubId = userInfo?.clubId;
  
  // Ajouter des logs pour déboguer
  console.log('Informations utilisateur complètes:', userInfo);
  console.log('Club ID:', clubId);
  console.log('Nom du club (clubName):', userInfo.clubName);
  console.log('Nom du club (nom):', userInfo.nom);
  console.log('Nom du club (name):', userInfo.name);
  console.log('Nom du club (libelle):', userInfo.libelle);

  useEffect(() => {
    const fetchClubInfo = async () => {
      if (clubId) {
        try {
          const clubData = await getClub(clubId);
          console.log('Informations du club récupérées:', clubData);
          setClubInfo(clubData);
        } catch (error) {
          console.error('Erreur lors de la récupération des informations du club:', error);
          message.error('Erreur lors de la récupération des informations du club');
        }
      } else {
        message.error('Aucun club associé à votre compte');
      }
    };
    fetchClubInfo();
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
    // Récupérer le rôle de l'utilisateur depuis le localStorage
    const roles = userInfo?.roles || [];
    setUserRole(roles.includes('Admin') ? 'Admin' : 'Member');
  }, [userInfo]);

  const fetchMembers = useCallback(async () => {
    if (!clubId) {
      setMembers([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
      message.error('Aucun club associé à votre compte');
      return;
    }
    setLoading(true);
    try {
      const membersData = await getClubMembers(clubId);
      setMembers(membersData || []);
      setPagination(prev => ({
        ...prev,
        total: (membersData || []).length,
        current: 1,
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des membres:', error);
      message.error("Erreur lors du chargement des membres");
      setMembers([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Filtrage des membres selon le champ de recherche
  const filteredMembers = members.filter(member => {
    return (
      (member.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Statistiques calculées à partir des membres filtrés
  const totalMembers = filteredMembers.length;
  const recentMembers = filteredMembers.filter(m => {
    if (!m.joinedDate) return false;
    const joinDate = new Date(m.joinedDate);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return joinDate >= threeMonthsAgo;
  }).length;
  const membersWithPhone = filteredMembers.filter(m => m.phoneNumber).length;
  const phonePercentage = totalMembers > 0 ? ((membersWithPhone / totalMembers) * 100).toFixed(1) : 0;

  const openModal = () => {
    setModalVisible(true);
    form.resetFields();
    form.setFieldsValue({ 
      firstName: '', 
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      joinedDate: moment(),
    });
  };

  const openDetailModal = async (record) => {
    try {
      setSelectedMember(record);
      setDetailModalVisible(true);
    } catch (error) {
      message.error("Erreur lors du chargement des détails");
    }
  };

  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedMember(null);
  };

  const handleDelete = async (id) => {
    try {
      console.log('Début de la suppression du membre:', id);
      const response = await deleteMember(clubId, id);
      console.log('Réponse de suppression reçue:', response);
      
      if (response.success) {
        message.success(response.message || 'Membre supprimé avec succès');
        fetchMembers();
      } else {
        message.error(response.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error('Erreur complète:', error);
      let errorMessage = "Erreur lors de la suppression";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMessage = "Le membre ou le club n'a pas été trouvé";
      } else if (error.response?.status === 403) {
        errorMessage = "Vous n'avez pas les droits nécessaires pour supprimer ce membre";
      }
      
      message.error(errorMessage);
    }
  };

  const handleSubmit = async (values) => {
    if (!clubId) {
      message.error("Erreur d'authentification.");
      return;
    }
    try {
      const memberData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber || null,
        joinedDate: values.joinedDate ? values.joinedDate.format('YYYY-MM-DD') : null,
        clubId: clubId
      };

      if (values.password) {
        memberData.password = values.password;
      }

      await addMember(memberData);
      message.success('Membre ajouté');
      setModalVisible(false);
      form.resetFields();
      fetchMembers();
    } catch (error) {
      if (error.response?.data?.message === "Un utilisateur avec cet email existe déjà." || 
          (error.response?.data?.errors && error.response.data.errors.includes("Email déjà utilisé."))) {
        message.error("Cette adresse email est déjà utilisée par un autre membre du club.");
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

  // Largeur dynamique selon l'état du sidebar - MISE À JOUR pour 18rem
  const sidebarWidth = isCollapsed ? '4rem' : '18rem';

  const columns = [
    {
      title: 'Membre',
      key: 'member',
      render: (_, record) => (
        <div className="flex items-center">
          <Avatar 
            size={40} 
            icon={<UserOutlined />} 
            src={record.profilePictureUrl}
            style={{ marginRight: 12, backgroundColor: '#1890ff' }}
          />
          <div>
            <div className="font-medium text-gray-900">
              {record.firstName} {record.lastName}
            </div>
            <div className="text-sm text-gray-500">
              Membre depuis {record.joinedDate ? moment(record.joinedDate).format('MM/YYYY') : '-'}
            </div>
          </div>
        </div>
      ),
      sorter: (a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => (
        <span>
          <MailOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {text}
        </span>
      ),
      sorter: (a, b) => (a.email || '').localeCompare(b.email || ''),
    },
    {
      title: 'Téléphone',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (text) => (
        <span>
          <PhoneOutlined style={{ marginRight: 8, color: '#52c41a' }} />
          {text || <span style={{ color: '#d9d9d9', fontStyle: 'italic' }}>Non spécifié</span>}
        </span>
      ),
    },
    {
      title: 'Date d\'adhésion',
      dataIndex: 'joinedDate',
      key: 'joinedDate',
      render: (date) => (
        <span>
          <CalendarOutlined style={{ marginRight: 8, color: '#f59e0b' }} />
          {date ? moment(date).format('DD/MM/YYYY') : '-'}
        </span>
      ),
      sorter: (a, b) => {
        const dateA = a.joinedDate ? new Date(a.joinedDate) : new Date(0);
        const dateB = b.joinedDate ? new Date(b.joinedDate) : new Date(0);
        return dateA - dateB;
      },
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
          {userRole === 'Admin' && (
            <Popconfirm 
              title="Supprimer ce membre ?" 
              onConfirm={() => handleDelete(record.id)} 
              okText="Oui" 
              cancelText="Non"
            >
              <Button icon={<DeleteOutlined />} danger />
            </Popconfirm>
          )}
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
                  Gestion des Membres
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
                  title="Total membres"
                  value={totalMembers}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Nouveaux (3 mois)"
                  value={recentMembers}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Avec téléphone"
                  value={membersWithPhone}
                  prefix={<PhoneOutlined />}
                  valueStyle={{ color: '#f59e0b' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="% Téléphone"
                  value={phonePercentage}
                  suffix="%"
                  prefix={<PhoneOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-4">
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={openModal}
            >
              Ajouter un membre
            </Button>
            <Input
              placeholder="Rechercher par nom, prénom ou email..."
              prefix={<SearchOutlined />}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', maxWidth: 300 }}
              allowClear
            />
          </div>

          <div className="w-full bg-white p-4 sm:p-6 rounded-lg shadow">
            <Table
              columns={columns}
              dataSource={filteredMembers}
              rowKey="id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: filteredMembers.length,
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

            {/* Modal d'ajout */}
            <Modal
              title="Ajouter un membre"
              open={modalVisible}
              onCancel={() => { 
                setModalVisible(false); 
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
                initialValues={{
                  firstName: '',
                  lastName: '',
                  email: '',
                  phoneNumber: '',
                  password: '',
                  joinedDate: moment()
                }}
              >
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="firstName"
                      label="Prénom"
                      rules={[
                        { required: true, message: 'Le prénom est obligatoire' },
                        { max: 50, message: 'Le prénom ne peut pas dépasser 50 caractères' }
                      ]}
                    >
                      <Input 
                        placeholder="Prénom du membre"
                        prefix={<UserOutlined />}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="lastName"
                      label="Nom"
                      rules={[
                        { required: true, message: 'Le nom est obligatoire' },
                        { max: 50, message: 'Le nom ne peut pas dépasser 50 caractères' }
                      ]}
                    >
                      <Input 
                        placeholder="Nom du membre"
                        prefix={<UserOutlined />}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'L\'email est obligatoire' },
                    { type: 'email', message: 'Format d\'email invalide' }
                  ]}
                >
                  <Input 
                    placeholder="email@exemple.com"
                    prefix={<MailOutlined />}
                  />
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="phoneNumber"
                      label="Téléphone"
                    >
                      <Input 
                        placeholder="+33 6 12 34 56 78"
                        prefix={<PhoneOutlined />}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="joinedDate"
                      label="Date d'adhésion"
                      rules={[{ required: true, message: 'La date d\'adhésion est obligatoire' }]}
                    >
                      <DatePicker 
                        placeholder="Sélectionner une date"
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="password"
                  label="Mot de passe"
                  rules={[
                    { required: true, message: 'Le mot de passe est obligatoire' },
                    { min: 8, message: 'Le mot de passe doit contenir au moins 8 caractères' }
                  ]}
                >
                  <Input.Password 
                    placeholder="Mot de passe"
                    prefix={<LockOutlined />}
                    iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                  />
                </Form.Item>

                <Form.Item>
                  <Space className="w-full justify-end">
                    <Button type="primary" htmlType="submit">
                      Ajouter
                    </Button>
                    <Button onClick={() => { 
                      setModalVisible(false); 
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
              title="Détails du membre"
              open={detailModalVisible}
              onCancel={closeDetailModal}
              footer={[
                <Button key="close" onClick={closeDetailModal}>
                  Fermer
                </Button>
              ]}
              destroyOnHidden
              width={isMobile ? '95%' : 600}
              centered={isMobile}
            >
              {selectedMember && (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Nom complet">
                        <p style={{ fontWeight: 'bold', color: '#1890ff' }}>
                          <UserOutlined style={{ marginRight: 8 }} />
                          {selectedMember.firstName} {selectedMember.lastName}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Email">
                        <p>
                          <MailOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                          {selectedMember.email}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Téléphone">
                        <p>
                          <PhoneOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                          {selectedMember.phoneNumber || 'Non spécifié'}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Date d'adhésion">
                        <p style={{ fontWeight: 'bold', color: '#f59e0b' }}>
                          <CalendarOutlined style={{ marginRight: 8 }} />
                          {selectedMember.joinedDate ? moment(selectedMember.joinedDate).format('DD/MM/YYYY') : 'Non spécifiée'}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24}>
                      <Card size="small" title="Club">
                        <p>
                          <TeamOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                          {clubInfo?.name || clubInfo?.nom || clubInfo?.libelle || 'Club non spécifié'}
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

export default MembersPage;