import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Menu,
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Typography,
  Avatar,
  Dropdown,
  Space,
  Badge,
  Spin,
  Drawer,
  Progress,
  List,
  Tag,
  Alert,
  Divider
} from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  FileTextOutlined,
  MessageOutlined,
  DollarOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  RiseOutlined,
  FallOutlined,
  CheckCircleOutlined,
  FolderOutlined,
  QuestionCircleOutlined,
  EyeOutlined,
  CalendarOutlined,
  TrophyOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  ReadOutlined,
  EditOutlined
} from '@ant-design/icons';

import PersonnelPage from './PersonnelPage';
import ClassesPage from './ClassesPage';
import PreinscriptionsPage from './PreinscriptionsPage';
import TarifsPage from './TarifsPage';
import ConditionsAdmissionPage from './ConditionsAdmissionPage';
import DossierAFournirPage from './DossierAFournirPage';
import FAQAdmissionsPage from './FAQAdmissionsPage';
import PaiementsScolaritePage from './PaiementsScolaritePage';
import CommunicationPage from './CommunicationPage';
import CahierLiaisonPage from './CahierLiaisonPage';
// IMPORTS TEMPORAIREMENT CACHÉS - EN DÉVELOPPEMENT
import VieScolaireAdminPage from './VieScolaireAdminPage';
import CyclesAdminPage from './CyclesAdminPage';
// import HomeAdminPage from './HomeAdminPage';
import { useAuth } from '../contexts/AuthContext';
import { fetchDashboardStats, fetchRecentCommunications } from '../services/superAdminApi';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

// Menu items
const menuItems = [
  { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: 'personnel', icon: <TeamOutlined />, label: 'Personnel' },
  { key: 'classes', icon: <BookOutlined />, label: 'Classes' },
  { key: 'preinscriptions', icon: <FileTextOutlined />, label: 'Préinscriptions' },
  { key: 'conditions-admission', icon: <CheckCircleOutlined />, label: 'Conditions d\'Admission' },
  { key: 'dossier-a-fournir', icon: <FolderOutlined />, label: 'Dossiers à Fournir' },
  { key: 'faq-admissions', icon: <QuestionCircleOutlined />, label: 'FAQ Admissions' },
  { key: 'tarifs', icon: <DollarOutlined />, label: 'Tarifs' },
  // MENUS TEMPORAIREMENT CACHÉS - EN DÉVELOPPEMENT
  // { key: 'home-admin', icon: <HomeOutlined />, label: 'Gestion Page d\'Accueil' },
  { key: 'vie-scolaire-admin', icon: <EyeOutlined />, label: 'Gestion Vie Scolaire' },
  { key: 'cycles-admin', icon: <ReadOutlined />, label: 'Gestion Cycles' },
  // { key: 'communication', icon: <MessageOutlined />, label: 'Communication' },
  // { key: 'cahier-liaison', icon: <EditOutlined />, label: 'Cahier de Liaison' },
  // { key: 'paiements-scolarite', icon: <DollarOutlined />, label: 'Paiements Scolarité' },
];

// Composant StatCard responsive
const StatCard = ({ title, value, prefix, color, trend, subtitle }) => (
  <Card 
    hoverable
    style={{ 
      borderRadius: '12px',
      border: 'none',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease'
    }}
    bodyStyle={{ padding: '1.5rem' }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ flex: 1 }}>
        <div style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>{title}</div>
        <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px', color: color || '#1890ff' }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ color: '#999', fontSize: '12px', marginTop: '4px' }}>
            {subtitle}
          </div>
        )}
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
            {trend > 0 ? (
              <RiseOutlined style={{ color: '#52c41a', marginRight: '4px' }} />
            ) : (
              <FallOutlined style={{ color: '#ff4d4f', marginRight: '4px' }} />
            )}
            <Text style={{ fontSize: '12px', color: trend > 0 ? '#52c41a' : '#ff4d4f' }}>
              {Math.abs(trend)}% ce mois
            </Text>
          </div>
        )}
      </div>
      <div 
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '8px',
          backgroundColor: `${color || '#1890ff'}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          color: color || '#1890ff'
        }}
      >
        {prefix}
      </div>
    </div>
  </Card>
);

export default function SuperAdminDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [recentCommunications, setRecentCommunications] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Fonction de déconnexion avec redirection
  const handleLogout = () => {
    logout(); // Nettoyer les données d'authentification
    navigate('/'); // Rediriger vers la page d'accueil
  };

  // Charger les données du dashboard
  const loadDashboardData = async () => {
    setStatsLoading(true);
    try {
      console.log('Chargement des données du dashboard...');

      // Charger les statistiques et communications en parallèle
      const [statsResult, communicationsResult] = await Promise.all([
        fetchDashboardStats(),
        fetchRecentCommunications()
      ]);

      if (statsResult.success) {
        setDashboardStats(statsResult.data);
        console.log('Statistiques chargées:', statsResult.data);
      } else {
        console.error('Erreur lors du chargement des statistiques:', statsResult.error);
      }

      if (communicationsResult.success) {
        setRecentCommunications(communicationsResult.data);
        console.log('Communications récentes chargées:', communicationsResult.data);
      } else {
        console.error('Erreur lors du chargement des communications:', communicationsResult.error);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données du dashboard:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Détecter si on est sur mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Charger les données au montage du composant
  useEffect(() => {
    if (selectedKey === 'dashboard') {
      loadDashboardData();
    }
  }, [selectedKey]);

  // Menu utilisateur
  const userMenuItems = [
    {
      key: 'profile',
      label: 'Mon Profil',
      icon: <UserOutlined />
    },
    {
      key: 'settings',
      label: 'Paramètres',
      icon: <SettingOutlined />
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      label: 'Déconnexion',
      icon: <LogoutOutlined />,
      onClick: handleLogout
    }
  ];

  // Statistiques dynamiques basées sur les vraies données
  const getStats = () => {
    if (!dashboardStats) {
      return [
        { title: 'Total Élèves', value: '-', prefix: <UserOutlined />, color: '#1890ff' },
        { title: 'Personnel', value: '-', prefix: <TeamOutlined />, color: '#52c41a' },
        { title: 'Classes', value: '-', prefix: <BookOutlined />, color: '#faad14' },
        { title: 'Préinscriptions', value: '-', prefix: <FileTextOutlined />, color: '#722ed1' }
      ];
    }

    return [
      {
        title: 'Total Élèves',
        value: dashboardStats.totalEleves,
        prefix: <UserOutlined />,
        color: '#1890ff'
      },
      {
        title: 'Personnel',
        value: dashboardStats.totalPersonnel,
        prefix: <TeamOutlined />,
        color: '#52c41a'
      },
      {
        title: 'Classes',
        value: dashboardStats.totalClasses,
        prefix: <BookOutlined />,
        color: '#faad14'
      },
      {
        title: 'Préinscriptions',
        value: dashboardStats.totalPreInscriptions,
        prefix: <FileTextOutlined />,
        color: '#722ed1',
        subtitle: `${dashboardStats.preInscriptionsEnAttente} en attente`
      }
    ];
  };

  const stats = getStats();

  // Rendu du contenu selon la page sélectionnée
  const renderContent = () => {
    switch (selectedKey) {
      case 'personnel':
        return <PersonnelPage />;
      case 'classes':
        return <ClassesPage />;
      case 'preinscriptions':
        return <PreinscriptionsPage />;
      case 'conditions-admission':
        return <ConditionsAdmissionPage />;
      case 'dossier-a-fournir':
        return <DossierAFournirPage />;
      case 'faq-admissions':
        return <FAQAdmissionsPage />;
      case 'tarifs':
        return <TarifsPage />;
      // CASES TEMPORAIREMENT CACHÉS - EN DÉVELOPPEMENT
      // case 'home-admin':
      //   return <HomeAdminPage />;
      case 'vie-scolaire-admin':
        return <VieScolaireAdminPage />;
      case 'cycles-admin':
        return <CyclesAdminPage />;
      // case 'paiements-scolarite':
      //   return <PaiementsScolaritePage />;
      // case 'communication':
      //   return <CommunicationPage />;
      // case 'cahier-liaison':
      //   return <CahierLiaisonPage />;
      case 'dashboard':
      default:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* En-tête */}
            <div style={{ marginBottom: '24px' }}>
              <Title level={2} style={{ marginBottom: '8px' }}>Dashboard</Title>
              <Text style={{ color: '#666' }}>
                Bienvenue, {user?.prenom} {user?.nom}
              </Text>
            </div>

            {/* Statistiques */}
            <Row gutter={[16, 16]}>
              {statsLoading ? (
                <Col span={24}>
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: '16px', color: '#666' }}>
                      Chargement des statistiques...
                    </div>
                  </div>
                </Col>
              ) : (
                stats.map((stat, index) => (
                  <Col xs={24} sm={12} lg={6} key={index}>
                    <StatCard {...stat} />
                  </Col>
                ))
              )}
            </Row>

            {/* Contenu supplémentaire */}
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={16}>
                <Card title="Communications Récentes" style={{ height: '400px' }}>
                  {statsLoading ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%'
                    }}>
                      <Spin />
                    </div>
                  ) : recentCommunications.length > 0 ? (
                    <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                      {recentCommunications.map((communication, index) => (
                        <div key={communication.id} style={{
                          padding: '16px 0',
                          borderBottom: index < recentCommunications.length - 1 ? '1px solid #f0f0f0' : 'none'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <div style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              backgroundColor: communication.type === 'annonce' ? '#1890ff' : '#52c41a',
                              marginTop: '6px',
                              flexShrink: 0
                            }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <span style={{ fontWeight: '500', fontSize: '14px' }}>
                                  {communication.title}
                                </span>
                                <span style={{
                                  backgroundColor: communication.type === 'annonce' ? '#e6f7ff' : '#f6ffed',
                                  color: communication.type === 'annonce' ? '#1890ff' : '#52c41a',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  fontWeight: '500'
                                }}>
                                  {communication.type === 'annonce' ? 'Annonce' : 'Cahier'}
                                </span>
                              </div>
                              <div style={{ color: '#666', fontSize: '12px', marginBottom: '6px', lineHeight: '1.4' }}>
                                {communication.description}
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ color: '#999', fontSize: '11px' }}>
                                  Par {communication.author}
                                </div>
                                <div style={{ color: '#999', fontSize: '11px' }}>
                                  {new Date(communication.date).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      color: '#999'
                    }}>
                      Aucune communication récente
                    </div>
                  )}
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="Actions Rapides" style={{ height: '400px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Button
                      type="primary"
                      icon={<TeamOutlined />}
                      onClick={() => setSelectedKey('personnel')}
                      block
                    >
                      Gérer le Personnel
                    </Button>
                    <Button
                      icon={<BookOutlined />}
                      onClick={() => setSelectedKey('classes')}
                      block
                    >
                      Gérer les Classes
                    </Button>
                    <Button
                      icon={<FileTextOutlined />}
                      onClick={() => setSelectedKey('preinscriptions')}
                      block
                    >
                      Voir les Préinscriptions
                    </Button>
                    {/* BOUTON TEMPORAIREMENT CACHÉ - EN DÉVELOPPEMENT
                    <Button
                      icon={<MessageOutlined />}
                      onClick={() => setSelectedKey('communication')}
                      block
                    >
                      Communication
                    </Button>
                    */}
                    <Divider />
                    <div style={{ color: '#666', fontSize: '12px' }}>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Préinscriptions en attente:</strong>
                      </div>
                      <div style={{ fontSize: '24px', color: '#faad14', fontWeight: 'bold' }}>
                        {dashboardStats?.preInscriptionsEnAttente || 0}
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        );
    }
  };

  // Menu sidebar
  const sidebarMenu = (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        style={{ flex: 1, borderRight: 0 }}
        items={menuItems.map(item => ({
          ...item,
          onClick: () => {
            setSelectedKey(item.key);
            if (isMobile) {
              setMobileDrawerOpen(false);
            }
          }
        }))}
      />

      {/* Bouton de déconnexion en bas du sidebar */}
      <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0' }}>
        <Button
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          block
          size="large"
        >
          Déconnexion
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar pour desktop */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          style={{
            boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
            height: '100vh',
            overflow: 'auto'
          }}
          width={250}
        >
          <div style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>
            <Title level={4} style={{ color: 'white', margin: 0 }}>
              {collapsed ? 'IF' : 'Institut Froebel'}
            </Title>
          </div>
          {sidebarMenu}
        </Sider>
      )}

      {/* Drawer pour mobile */}
      <Drawer
        title="Institut Froebel"
        placement="left"
        onClose={() => setMobileDrawerOpen(false)}
        open={mobileDrawerOpen}
        styles={{ body: { padding: 0 } }}
        width={250}
      >
        {sidebarMenu}
      </Drawer>

      <Layout style={{
        marginLeft: !isMobile ? (collapsed ? 80 : 250) : 0,
        transition: 'margin-left 0.2s'
      }}>
        {/* Header */}
        <Header style={{
          background: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'fixed',
          top: 0,
          right: 0,
          left: !isMobile ? (collapsed ? 80 : 250) : 0,
          zIndex: 99,
          transition: 'left 0.2s'
        }}>
          <Button
            type="text"
            icon={isMobile ? <MenuFoldOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
            onClick={() => {
              if (isMobile) {
                setMobileDrawerOpen(true);
              } else {
                setCollapsed(!collapsed);
              }
            }}
            style={{ fontSize: '18px' }}
          />
          
          <Space size="middle">
            <Badge count={5}>
              <Button type="text" icon={<BellOutlined />} />
            </Badge>
            
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px'
              }}>
                <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: '8px' }} />
                <span style={{ display: window.innerWidth > 640 ? 'inline' : 'none' }}>
                  {user?.prenom}
                </span>
              </div>
            </Dropdown>
          </Space>
        </Header>

        {/* Content */}
        <Content style={{
          padding: window.innerWidth > 768 ? '24px' : '16px',
          background: '#f5f5f5',
          minHeight: '100vh',
          marginTop: '64px' // Compenser le header fixe
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {renderContent()}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
