import React, { useState, useEffect } from 'react';
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
  ClockCircleOutlined
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
import { useAuth } from '../contexts/AuthContext';

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
  { key: 'communication', icon: <MessageOutlined />, label: 'Communication' },
  { key: 'cahier-liaison', icon: <BookOutlined />, label: 'Cahier de Liaison' },
  { key: 'paiements-scolarite', icon: <DollarOutlined />, label: 'Paiements Scolarité' },
];

// Composant StatCard responsive
const StatCard = ({ title, value, prefix, color, trend }) => (
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
  
  const { user, logout } = useAuth();

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
      onClick: logout
    }
  ];

  // Statistiques mockées
  const stats = [
    { title: 'Total Élèves', value: 245, prefix: <UserOutlined />, color: '#1890ff', trend: 12 },
    { title: 'Personnel', value: 28, prefix: <TeamOutlined />, color: '#52c41a', trend: 5 },
    { title: 'Classes', value: 12, prefix: <BookOutlined />, color: '#faad14', trend: -2 },
    { title: 'Revenus', value: '€45,230', prefix: <DollarOutlined />, color: '#722ed1', trend: 18 }
  ];

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
      case 'paiements-scolarite':
        return <PaiementsScolaritePage />;
      case 'communication':
        return <CommunicationPage />;
      case 'cahier-liaison':
        return <CahierLiaisonPage />;
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
              {stats.map((stat, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                  <StatCard {...stat} />
                </Col>
              ))}
            </Row>

            {/* Contenu supplémentaire */}
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={16}>
                <Card title="Activité Récente" style={{ height: '384px' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%', 
                    color: '#999' 
                  }}>
                    Graphiques et activités à venir...
                  </div>
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="Notifications" style={{ height: '384px' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%', 
                    color: '#999' 
                  }}>
                    Notifications à venir...
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
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      style={{ height: '100%', borderRight: 0 }}
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
        bodyStyle={{ padding: 0 }}
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
