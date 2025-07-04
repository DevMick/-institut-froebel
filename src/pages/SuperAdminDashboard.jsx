import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Row, Col, Statistic, Table, Button, Input, Space, Tag, Drawer, Descriptions, Modal, Form, Select, DatePicker, message, Alert, Tabs, Spin, List, Progress, Avatar, Badge, Divider, Typography } from 'antd';
import { 
  DashboardOutlined, 
  BankOutlined, 
  UserOutlined, 
  TeamOutlined, 
  BookOutlined, 
  FileTextOutlined, 
  MessageOutlined, 
  CalendarOutlined, 
  DollarOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  RiseOutlined,
  FallOutlined,
  EyeOutlined,
  PlusOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  TrophyOutlined,
  StarOutlined,
  HeartOutlined,
  FireOutlined,
  ThunderboltOutlined,
  CrownOutlined,
  ReadOutlined,
  BellOutlined,
  MailOutlined,
  FileOutlined,
  ScheduleOutlined,
  GiftOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  HomeOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';
// import { 
//   fetchSchools, 
//   fetchSchoolStats, 
//   exportSchoolsExcel, 
//   fetchSchoolDetails, 
//   fetchUsers, 
//   exportUsersExcel, 
//   fetchUserDetails, 
//   createUser,
//   updateUser,
//   deleteUser,
//   fetchClasses, 
//   exportClassesExcel, 
//   fetchClassDetails, 
//   createClass,
//   updateClass,
//   deleteClass,
//   fetchStudents, 
//   exportStudentsExcel, 
//   fetchStudentDetails, 
//   createStudent,
//   updateStudent,
//   deleteStudent,
//   fetchBulletins,
//   fetchBulletinDetails,
//   createBulletin,
//   updateBulletin,
//   deleteBulletin,
//   exportBulletinsExcel,
//   fetchEmplois,
//   fetchEmploiDetails,
//   createEmploi,
//   updateEmploi,
//   deleteEmploi,
//   exportEmploisExcel,
//   fetchCahiers,
//   fetchCahierDetails,
//   createCahier,
//   updateCahier,
//   deleteCahier,
//   exportCahiersExcel,
//   fetchAnnonces,
//   fetchAnnonceDetails,
//   createAnnonce,
//   updateAnnonce,
//   deleteAnnonce,
//   exportAnnoncesExcel,
//   fetchMessages,
//   fetchMessageDetails,
//   createMessage,
//   updateMessage,
//   deleteMessage,
//   exportMessagesExcel,
//   fetchNotifications,
//   fetchNotificationDetails,
//   createNotification,
//   updateNotification,
//   deleteNotification,
//   exportNotificationsExcel,
//   fetchActivities, 
//   fetchActivityDetails, 
//   createActivity,
//   updateActivity,
//   deleteActivity,
//   exportActivitiesExcel,
//   fetchPayments, 
//   exportPaymentsExcel, 
//   fetchPaymentDetails,
//   createPayment,
//   updatePayment,
//   deletePayment,
//   fetchInvoices,
//   fetchInvoiceDetails,
//   createInvoice,
//   updateInvoice,
//   deleteInvoice,
//   exportInvoicesExcel,
//   fetchFinancialReports,
//   fetchReportDetails,
//   createReport,
//   updateReport,
//   deleteReport,
//   exportReportsExcel,
//   fetchClassSchedules, 
//   fetchStudentBulletins, 
//   fetchStudentLiaison, 
//   fetchAnnouncements, 
//   fetchAnnouncementDetails 
// } from '../services/superAdminApi';
import { staticClasses, classStats } from '../data/staticClasses';
import { staticStudents, studentStats } from '../data/staticStudents';
import { staticBulletins, staticEmplois, staticCahiers, pedagogyStats } from '../data/staticPedagogy';
import { staticAnnonces, staticMessages, staticNotifications, communicationStats } from '../data/staticCommunication';
import { staticActivities, activityStats } from '../data/staticActivities';
import { staticPayments, paymentStats } from '../data/staticPayments';
import { staticPersonnel, personnelStats } from '../data/staticPersonnel';
import PaymentsPage from './PaymentsPage';
import PersonnelPage from './PersonnelPage';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const menuItems = [
  { key: 'home', icon: <HomeOutlined />, label: 'Accueil', link: '/' },
  { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: 'personnel', icon: <TeamOutlined />, label: 'Personnel' },
  { key: 'classes', icon: <BookOutlined />, label: 'Classes' },
  { key: 'students', icon: <UserOutlined />, label: 'Élèves' },
  { key: 'pedagogy', icon: <FileTextOutlined />, label: 'Pédagogie' },
  { key: 'communication', icon: <MessageOutlined />, label: 'Communication' },
  { key: 'activities', icon: <CalendarOutlined />, label: 'Activités' },
  { key: 'payments', icon: <DollarOutlined />, label: 'Paiements' },
];

// Composant pour les cartes de statistiques avec animations
const StatCard = ({ title, value, prefix, suffix, color, icon, trend, subtitle }) => (
  <Card 
    hoverable 
    style={{ 
      borderRadius: 12, 
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      border: 'none',
      transition: 'all 0.3s ease'
    }}
    bodyStyle={{ padding: 24 }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ flex: 1 }}>
        <div style={{ color: '#666', fontSize: 14, marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 28, fontWeight: 'bold', color: color || '#1890ff', marginBottom: 4 }}>
          {value}{suffix}
        </div>
        {subtitle && (
          <div style={{ fontSize: 12, color: '#999' }}>{subtitle}</div>
        )}
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
            {trend > 0 ? (
              <RiseOutlined style={{ color: '#52c41a', marginRight: 4 }} />
            ) : (
              <FallOutlined style={{ color: '#ff4d4f', marginRight: 4 }} />
            )}
            <Text style={{ fontSize: 12, color: trend > 0 ? '#52c41a' : '#ff4d4f' }}>
              {Math.abs(trend)}% ce mois
            </Text>
          </div>
        )}
      </div>
      <div style={{ 
        width: 60, 
        height: 60, 
        borderRadius: 12, 
        backgroundColor: `${color || '#1890ff'}15`, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: 24,
        color: color || '#1890ff'
      }}>
        {icon}
      </div>
    </div>
  </Card>
);

// Composant pour les cartes d'activité récente
const ActivityCard = ({ title, description, time, icon, color, status }) => (
  <Card 
    size="small" 
    style={{ 
      marginBottom: 12, 
      borderRadius: 8,
      border: 'none',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ 
        width: 40, 
        height: 40, 
        borderRadius: 8, 
        backgroundColor: `${color}15`, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginRight: 12,
        color: color
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>{description}</div>
        <div style={{ fontSize: 11, color: '#999' }}>{time}</div>
      </div>
      {status && (
        <Tag color={status === 'success' ? 'green' : status === 'warning' ? 'orange' : 'blue'}>
          {status}
        </Tag>
      )}
    </div>
  </Card>
);

// Composant pour les graphiques en barres simples
const SimpleBarChart = ({ data, title, color = '#1890ff' }) => (
  <Card title={title} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
    <div style={{ padding: '20px 0' }}>
      {data.map((item, index) => (
        <div key={index} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text>{item.label}</Text>
            <Text strong>{item.value}</Text>
          </div>
          <Progress 
            percent={item.percentage} 
            strokeColor={color}
            showInfo={false}
            strokeWidth={8}
            style={{ borderRadius: 4 }}
          />
        </div>
      ))}
    </div>
  </Card>
);

const SuperAdminDashboard = () => {
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [schools, setSchools] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schoolSearch, setSchoolSearch] = useState('');
  const [schoolDrawerOpen, setSchoolDrawerOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedSchoolStats, setSelectedSchoolStats] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userExporting, setUserExporting] = useState(false);
  const [classes, setClasses] = useState([]);
  const [classSearch, setClassSearch] = useState('');
  const [classDrawerOpen, setClassDrawerOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classExporting, setClassExporting] = useState(false);
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [classForm] = Form.useForm();
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentDrawerOpen, setStudentDrawerOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentExporting, setStudentExporting] = useState(false);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentForm] = Form.useForm();
  const [bulletins, setBulletins] = useState([]);
  const [emplois, setEmplois] = useState([]);
  const [cahiers, setCahiers] = useState([]);
  const [bulletinSearch, setBulletinSearch] = useState('');
  const [emploiSearch, setEmploiSearch] = useState('');
  const [cahierSearch, setCahierSearch] = useState('');
  const [bulletinDrawerOpen, setBulletinDrawerOpen] = useState(false);
  const [emploiDrawerOpen, setEmploiDrawerOpen] = useState(false);
  const [cahierDrawerOpen, setCahierDrawerOpen] = useState(false);
  const [selectedBulletin, setSelectedBulletin] = useState(null);
  const [selectedEmploi, setSelectedEmploi] = useState(null);
  const [selectedCahier, setSelectedCahier] = useState(null);
  const [bulletinExporting, setBulletinExporting] = useState(false);
  const [emploiExporting, setEmploiExporting] = useState(false);
  const [cahierExporting, setCahierExporting] = useState(false);
  const [bulletinModalOpen, setBulletinModalOpen] = useState(false);
  const [emploiModalOpen, setEmploiModalOpen] = useState(false);
  const [cahierModalOpen, setCahierModalOpen] = useState(false);
  const [editingBulletin, setEditingBulletin] = useState(null);
  const [editingEmploi, setEditingEmploi] = useState(null);
  const [editingCahier, setEditingCahier] = useState(null);
  const [bulletinForm] = Form.useForm();
  const [emploiForm] = Form.useForm();
  const [cahierForm] = Form.useForm();
  const [annonces, setAnnonces] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [annonceSearch, setAnnonceSearch] = useState('');
  const [messageSearch, setMessageSearch] = useState('');
  const [notificationSearch, setNotificationSearch] = useState('');
  const [annonceDrawerOpen, setAnnonceDrawerOpen] = useState(false);
  const [messageDrawerOpen, setMessageDrawerOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [selectedAnnonce, setSelectedAnnonce] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [annonceExporting, setAnnonceExporting] = useState(false);
  const [messageExporting, setMessageExporting] = useState(false);
  const [notificationExporting, setNotificationExporting] = useState(false);
  const [annonceModalOpen, setAnnonceModalOpen] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [editingAnnonce, setEditingAnnonce] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editingNotification, setEditingNotification] = useState(null);
  const [annonceForm] = Form.useForm();
  const [messageForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  const [activities, setActivities] = useState([]);
  const [activitySearch, setActivitySearch] = useState('');
  const [activityDrawerOpen, setActivityDrawerOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activityExporting, setActivityExporting] = useState(false);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [activityForm] = Form.useForm();
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [financialReports, setFinancialReports] = useState([]);
  const [paymentSearch, setPaymentSearch] = useState('');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [reportSearch, setReportSearch] = useState('');
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const [invoiceDrawerOpen, setInvoiceDrawerOpen] = useState(false);
  const [reportDrawerOpen, setReportDrawerOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [paymentExporting, setPaymentExporting] = useState(false);
  const [invoiceExporting, setInvoiceExporting] = useState(false);
  const [reportExporting, setReportExporting] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [editingReport, setEditingReport] = useState(null);
  const [paymentForm] = Form.useForm();
  const [invoiceForm] = Form.useForm();
  const [reportForm] = Form.useForm();

  useEffect(() => {
    if (selectedKey === 'dashboard') {
      setLoading(true);
      // fetchSchools()
      //   .then(res => {
      //     setSchools(res.data);
      //     // Pour les stats globales, on additionne les stats de chaque école
      //     Promise.all(res.data.map(school => fetchSchoolStats(school.id)))
      //       .then(statsArr => {
      //         const globalStats = statsArr.reduce((acc, s) => {
      //           const st = s.data;
      //           acc.ecoles = (acc.ecoles || 0) + 1;
      //           acc.eleves = (acc.eleves || 0) + (st.nombreTotalEleves || 0);
      //           acc.enseignants = (acc.enseignants || 0) + (st.nombreEnseignants || 0);
      //           acc.admins = (acc.admins || 0) + (st.nombreAdmins || 0);
      //           acc.parents = (acc.parents || 0) + (st.nombreParents || 0);
      //           return acc;
      //         }, {});
      //         setStats(globalStats);
      //         setLoading(false);
      //       });
      //   })
      //   .catch(err => {
      //     setError('Erreur lors du chargement des données');
      //     setLoading(false);
      //   });
      
      // Données statiques pour le dashboard
      setTimeout(() => {
        setSchools([
          {
            id: 1,
            nom: "Institut Froebel LA TULIPE",
            code: "IFT001",
            commune: "Antananarivo",
            adresse: "Lot 67B Andoharanofotsy",
            telephone: "+261 20 22 123 45",
            email: "contact@institut-froebel-tulipe.mg",
            anneeScolaire: "2024-2025",
            createdAt: "2024-09-01T08:00:00.000Z"
          }
        ]);
        setStats({
          ecoles: 1,
          eleves: 224,
          enseignants: 8,
          admins: 2,
          parents: 180,
          communications: communicationStats.general.totalCommunications,
          annonces: communicationStats.annonces.total,
          messages: communicationStats.messages.total,
          notifications: communicationStats.notifications.total,
          activities: activityStats.general.totalActivities
        });
          setLoading(false);
      }, 500);
    }
  }, [selectedKey]);

  // Charger les utilisateurs
  useEffect(() => {
    if (selectedKey === 'users') {
      setLoading(true);
      // fetchUsers()
      //   .then(res => setUsers(res.data))
      //   .catch(err => setError(err.message))
      //   .finally(() => setLoading(false));
      
      // Données statiques pour les utilisateurs
      setTimeout(() => {
        setUsers([
          {
            id: 1,
            nom: "Rakoto",
            prenom: "Marie",
            email: "marie.rakoto@institut-froebel.mg",
            role: "Enseignant",
            telephone: "+261 34 12 345 67",
            isActive: true,
            createdAt: "2024-09-01T08:00:00.000Z",
            ecole: { nom: "Institut Froebel LA TULIPE" }
          },
          {
            id: 2,
            nom: "Razafindrakoto",
            prenom: "Jean-Pierre",
            email: "jeanpierre.razafindrakoto@institut-froebel.mg",
            role: "Enseignant",
            telephone: "+261 34 23 456 78",
            isActive: true,
            createdAt: "2024-09-01T08:00:00.000Z",
            ecole: { nom: "Institut Froebel LA TULIPE" }
          }
        ]);
        setLoading(false);
      }, 500);
    }
  }, [selectedKey]);

  // Charger les classes
  useEffect(() => {
    if (selectedKey === 'classes') {
      setLoading(true);
      // Utiliser les données statiques au lieu de l'API
      setTimeout(() => {
        setClasses(staticClasses);
        setLoading(false);
      }, 500); // Simulation d'un délai de chargement
    }
  }, [selectedKey]);

  // Charger les élèves
  useEffect(() => {
    if (selectedKey === 'students') {
      setLoading(true);
      // fetchStudents()
      //   .then(res => setStudents(res.data))
      //   .catch(err => setError(err.message))
      //   .finally(() => setLoading(false));
      
      // Données statiques pour les élèves
      setTimeout(() => {
        setStudents(staticStudents);
        setLoading(false);
      }, 500);
    }
  }, [selectedKey]);

  // Charger les données pédagogiques
  useEffect(() => {
    if (selectedKey === 'pedagogy') {
      setLoading(true);
      // Promise.all([
      //   fetchBulletins().then(res => setBulletins(res.data)),
      //   fetchEmplois().then(res => setEmplois(res.data)),
      //   fetchCahiers().then(res => setCahiers(res.data))
      // ])
      //   .catch(err => setError(err.message))
      //   .finally(() => setLoading(false));
      
      // Données statiques pour la pédagogie
      setTimeout(() => {
        setBulletins([
          {
            id: 1,
            eleve: { nom: "Andriamanjato", prenom: "Sofia" },
            classe: { nom: "6ème A" },
            ecole: { nom: "Institut Froebel LA TULIPE" },
            trimestre: "1er Trimestre",
            anneeScolaire: "2024-2025",
            createdAt: "2024-12-15T08:00:00.000Z"
          }
        ]);
        setEmplois([
          {
            id: 1,
            classe: { nom: "6ème A" },
            ecole: { nom: "Institut Froebel LA TULIPE" },
            jour: "Lundi",
            heureDebut: "08:00",
            heureFin: "09:00",
            matiere: "Mathématiques"
          }
        ]);
        setCahiers([
          {
            id: 1,
            eleve: { nom: "Andriamanjato", prenom: "Sofia" },
            classe: { nom: "6ème A" },
            ecole: { nom: "Institut Froebel LA TULIPE" },
            type: "Communication",
            date: "2024-12-15T08:00:00.000Z",
            auteur: "Marie Rakoto"
          }
        ]);
        setLoading(false);
      }, 500);
    }
  }, [selectedKey]);

  // Charger les données de pédagogie
  useEffect(() => {
    if (selectedKey === 'pedagogy') {
      setLoading(true);
      // Promise.all([
      //   fetchBulletins().then(res => setBulletins(res.data)),
      //   fetchEmplois().then(res => setEmplois(res.data)),
      //   fetchCahiers().then(res => setCahiers(res.data))
      // ])
      //   .catch(err => setError(err.message))
      //   .finally(() => setLoading(false));
      
      // Données statiques pour la pédagogie
      setTimeout(() => {
        setBulletins(staticBulletins);
        setEmplois(staticEmplois);
        setCahiers(staticCahiers);
        setLoading(false);
      }, 500);
    }
  }, [selectedKey]);

  // Charger les données de communication
  useEffect(() => {
    if (selectedKey === 'communication') {
      setLoading(true);
      // Promise.all([
      //   fetchAnnonces().then(res => setAnnonces(res.data)),
      //   fetchMessages().then(res => setMessages(res.data)),
      //   fetchNotifications().then(res => setNotifications(res.data))
      // ])
      //   .catch(err => setError(err.message))
      //   .finally(() => setLoading(false));
      
      // Données statiques pour la communication
      setTimeout(() => {
        setAnnonces(staticAnnonces);
        setMessages(staticMessages);
        setNotifications(staticNotifications);
        setLoading(false);
      }, 500);
    }
  }, [selectedKey]);

  // Charger les activités
  useEffect(() => {
    if (selectedKey === 'activities') {
      setLoading(true);
      // fetchActivities()
      //   .then(res => setActivities(res.data))
      //   .catch(err => setError(err.message))
      //   .finally(() => setLoading(false));
      
      // Données statiques pour les activités
      setTimeout(() => {
        setActivities(staticActivities);
        setLoading(false);
      }, 500);
    }
  }, [selectedKey]);

  // Charger les paiements
  useEffect(() => {
    if (selectedKey === 'payments') {
      setLoading(true);
      // fetchPayments()
      //   .then(res => setPayments(res.data))
      //   .catch(err => setError(err.message))
      //   .finally(() => setLoading(false));
      
      // Données statiques pour les paiements
      setTimeout(() => {
        setPayments(staticPayments);
        setLoading(false);
      }, 500);
    }
  }, [selectedKey]);

  // Charger les données financières
  useEffect(() => {
    if (selectedKey === 'finances') {
      setLoading(true);
      // Promise.all([
      //   fetchPayments().then(res => setPayments(res.data)),
      //   fetchInvoices().then(res => setInvoices(res.data)),
      //   fetchFinancialReports().then(res => setFinancialReports(res.data))
      // ])
      //   .catch(err => setError(err.message))
      //   .finally(() => setLoading(false));
      
      // Données statiques pour les finances
      setTimeout(() => {
        setPayments([
          {
            id: 1,
            montant: 500000,
            type: "Frais de scolarité",
            statut: "Payé",
            date: "2024-12-01T08:00:00.000Z"
          }
        ]);
        setInvoices([
          {
            id: 1,
            numero: "FACT-2024-001",
            montant: 500000,
            statut: "Payée",
            date: "2024-12-01T08:00:00.000Z"
          }
        ]);
        setFinancialReports([
          {
            id: 1,
            titre: "Rapport financier décembre 2024",
            type: "Mensuel",
            date: "2024-12-31T08:00:00.000Z"
          }
        ]);
        setLoading(false);
      }, 500);
    }
  }, [selectedKey]);

  // Gestion de la recherche et pagination écoles
  const filteredSchools = schools.filter(s =>
    s.nom.toLowerCase().includes(schoolSearch.toLowerCase()) ||
    s.code.toLowerCase().includes(schoolSearch.toLowerCase()) ||
    s.commune.toLowerCase().includes(schoolSearch.toLowerCase())
  );

  // Gestion de la recherche utilisateurs
  const filteredUsers = users.filter(u =>
    u.nom.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.prenom.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Gestion de la recherche classes
  const filteredClasses = classes.filter(c =>
    c.nom.toLowerCase().includes(classSearch.toLowerCase()) ||
    c.niveau.toLowerCase().includes(classSearch.toLowerCase()) ||
    c.ecole?.nom.toLowerCase().includes(classSearch.toLowerCase()) ||
    c.enseignant?.nom.toLowerCase().includes(classSearch.toLowerCase())
  );

  // Gestion de la recherche élèves
  const filteredStudents = students.filter(s =>
    s.nom.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.prenom.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.classe?.nom.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.ecole?.nom.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.parent?.nom.toLowerCase().includes(studentSearch.toLowerCase())
  );

  // Gestion de la recherche bulletins
  const filteredBulletins = bulletins.filter(b =>
    b.eleve?.nom.toLowerCase().includes(bulletinSearch.toLowerCase()) ||
    b.eleve?.prenom.toLowerCase().includes(bulletinSearch.toLowerCase()) ||
    b.classe?.nom.toLowerCase().includes(bulletinSearch.toLowerCase()) ||
    b.ecole?.nom.toLowerCase().includes(bulletinSearch.toLowerCase())
  );

  // Gestion de la recherche emplois
  const filteredEmplois = emplois.filter(e =>
    e.classe?.nom.toLowerCase().includes(emploiSearch.toLowerCase()) ||
    e.ecole?.nom.toLowerCase().includes(emploiSearch.toLowerCase()) ||
    e.responsable?.nom.toLowerCase().includes(emploiSearch.toLowerCase()) ||
    e.responsable?.prenom.toLowerCase().includes(emploiSearch.toLowerCase()) ||
    e.anneeScolaire.toLowerCase().includes(emploiSearch.toLowerCase()) ||
    e.trimestre.toLowerCase().includes(emploiSearch.toLowerCase())
  );

  // Gestion de la recherche cahiers
  const filteredCahiers = cahiers.filter(c =>
    c.eleve?.nom.toLowerCase().includes(cahierSearch.toLowerCase()) ||
    c.eleve?.prenom.toLowerCase().includes(cahierSearch.toLowerCase()) ||
    c.classe?.nom.toLowerCase().includes(cahierSearch.toLowerCase()) ||
    c.ecole?.nom.toLowerCase().includes(cahierSearch.toLowerCase())
  );

  // Gestion de la recherche annonces
  const filteredAnnonces = annonces.filter(a =>
    a.titre.toLowerCase().includes(annonceSearch.toLowerCase()) ||
    a.contenu.toLowerCase().includes(annonceSearch.toLowerCase()) ||
    a.ecole?.nom.toLowerCase().includes(annonceSearch.toLowerCase()) ||
    a.auteur?.nom.toLowerCase().includes(annonceSearch.toLowerCase())
  );

  // Gestion de la recherche messages
  const filteredMessages = messages.filter(m =>
    m.sujet.toLowerCase().includes(messageSearch.toLowerCase()) ||
    m.contenu.toLowerCase().includes(messageSearch.toLowerCase()) ||
    m.expediteur?.nom.toLowerCase().includes(messageSearch.toLowerCase()) ||
    m.destinataire?.nom.toLowerCase().includes(messageSearch.toLowerCase())
  );

  // Gestion de la recherche notifications
  const filteredNotifications = notifications.filter(n =>
    n.titre.toLowerCase().includes(notificationSearch.toLowerCase()) ||
    n.contenu.toLowerCase().includes(notificationSearch.toLowerCase()) ||
    n.type.toLowerCase().includes(notificationSearch.toLowerCase())
  );

  // Gestion de la recherche activités
  const filteredActivities = activities.filter(a =>
    a.nom.toLowerCase().includes(activitySearch.toLowerCase()) ||
    a.description.toLowerCase().includes(activitySearch.toLowerCase()) ||
    a.classe?.nom.toLowerCase().includes(activitySearch.toLowerCase()) ||
    a.ecole?.nom.toLowerCase().includes(activitySearch.toLowerCase()) ||
    a.type.toLowerCase().includes(activitySearch.toLowerCase()) ||
    a.lieu?.toLowerCase().includes(activitySearch.toLowerCase()) ||
    a.responsable?.toLowerCase().includes(activitySearch.toLowerCase()) ||
    a.categorie?.toLowerCase().includes(activitySearch.toLowerCase())
  );

  // Gestion de la recherche paiements
  const filteredPayments = payments.filter(p =>
    p.eleve?.nom.toLowerCase().includes(paymentSearch.toLowerCase()) ||
    p.eleve?.prenom.toLowerCase().includes(paymentSearch.toLowerCase()) ||
    p.ecole?.nom.toLowerCase().includes(paymentSearch.toLowerCase()) ||
    p.modePaiement.toLowerCase().includes(paymentSearch.toLowerCase()) ||
    p.statut.toLowerCase().includes(paymentSearch.toLowerCase())
  );

  // Gestion de la recherche factures
  const filteredInvoices = invoices.filter(i =>
    i.eleve?.nom.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
    i.eleve?.prenom.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
    i.ecole?.nom.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
    i.numero.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
    i.statut.toLowerCase().includes(invoiceSearch.toLowerCase())
  );

  // Gestion de la recherche rapports
  const filteredReports = financialReports.filter(r =>
    r.titre.toLowerCase().includes(reportSearch.toLowerCase()) ||
    r.ecole?.nom.toLowerCase().includes(reportSearch.toLowerCase()) ||
    r.type.toLowerCase().includes(reportSearch.toLowerCase())
  );

  // Colonnes du tableau des écoles (ajout bouton détails)
  const columns = [
    { title: 'Nom', dataIndex: 'nom', key: 'nom' },
    { title: 'Code', dataIndex: 'code', key: 'code' },
    { title: 'Commune', dataIndex: 'commune', key: 'commune' },
    { title: 'Téléphone', dataIndex: 'telephone', key: 'telephone' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Année scolaire', dataIndex: 'anneeScolaire', key: 'anneeScolaire' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button type="link" onClick={() => handleShowSchoolDetails(record.id)}>Détails</Button>
      )
    }
  ];

  // Colonnes du tableau des utilisateurs
  const userColumns = [
    { title: 'Nom', dataIndex: 'nom', key: 'nom' },
    { title: 'Prénom', dataIndex: 'prenom', key: 'prenom' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { 
      title: 'Rôle', 
      dataIndex: 'role', 
      key: 'role',
      render: (role) => {
        const colors = {
          'SuperAdmin': 'red',
          'Admin': 'orange',
          'Enseignant': 'blue',
          'Parent': 'green'
        };
        return <Tag color={colors[role] || 'default'}>{role}</Tag>;
      }
    },
    { title: 'École', dataIndex: 'ecole', key: 'ecole', render: (ecole) => ecole?.nom || '-' },
    { title: 'Téléphone', dataIndex: 'telephone', key: 'telephone' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleShowUserDetails(record.id)}>Détails</Button>
          <Button 
            type="link" 
            onClick={() => handleToggleUserStatus(record.id, !record.isActive)}
            style={{ color: record.isActive ? '#ff4d4f' : '#52c41a' }}
          >
            {record.isActive ? 'Désactiver' : 'Activer'}
          </Button>
          <Button 
            type="link" 
            danger 
            onClick={() => handleDeleteUser(record.id)}
          >
            Supprimer
          </Button>
        </Space>
      )
    }
  ];

  // Colonnes du tableau des classes
  const classColumns = [
    { 
      title: 'Nom', 
      dataIndex: 'nom', 
      key: 'nom',
      render: (nom, record) => (
        <div>
          <div style={{ fontWeight: 'bold', color: '#1890ff' }}>{nom}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Institut Froebel LA TULIPE</div>
        </div>
      )
    },
    { 
      title: 'Niveau', 
      dataIndex: 'niveau', 
      key: 'niveau',
      render: (niveau) => {
        const colors = {
          '6ème': '#52c41a',
          '5ème': '#1890ff',
          '4ème': '#faad14',
          '3ème': '#722ed1'
        };
        return <Tag color={colors[niveau]} style={{ fontWeight: 'bold' }}>{niveau}</Tag>;
      }
    },
    { 
      title: 'Enseignant', 
      dataIndex: 'enseignant', 
      key: 'enseignant', 
      render: (enseignant) => (
        <div>
          {enseignant ? (
            <>
              <div style={{ fontWeight: 'bold' }}>{enseignant.prenom} {enseignant.nom}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{enseignant.email}</div>
            </>
          ) : '-'}
        </div>
      )
    },
    { 
      title: 'Élèves', 
      dataIndex: 'nombreEleves', 
      key: 'nombreEleves',
      render: (nombreEleves) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>{nombreEleves}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>élèves</div>
        </div>
      )
    },
    { 
      title: 'Année scolaire', 
      dataIndex: 'anneeScolaire', 
      key: 'anneeScolaire',
      render: (anneeScolaire) => (
        <Tag color="blue">{anneeScolaire}</Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleShowClassDetails(record.id)}>Détails</Button>
          <Button type="link" onClick={() => handleEditClass(record)}>Modifier</Button>
          <Button 
            type="link" 
            danger 
            onClick={() => handleDeleteClass(record.id)}
          >
            Supprimer
          </Button>
        </Space>
      )
    }
  ];

  // Colonnes du tableau des élèves
  const studentColumns = [
    { 
      title: 'Élève', 
      dataIndex: 'nom', 
      key: 'nom',
      render: (nom, record) => (
        <div>
          <div style={{ fontWeight: 'bold', color: '#1890ff' }}>{record.prenom} {nom}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.email || '-'}</div>
        </div>
      )
    },
    { 
      title: 'Date de naissance', 
      dataIndex: 'dateNaissance', 
      key: 'dateNaissance', 
      render: (date) => (
        <div>
          {date ? (
            <>
              <div>{new Date(date).toLocaleDateString()}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {Math.floor((new Date() - new Date(date)) / (365.25 * 24 * 60 * 60 * 1000))} ans
              </div>
            </>
          ) : '-'}
        </div>
      )
    },
    { 
      title: 'Classe', 
      dataIndex: 'classe', 
      key: 'classe', 
      render: (classe) => {
        const colors = {
          '6ème A': '#52c41a',
          '6ème B': '#52c41a',
          '5ème A': '#1890ff',
          '5ème B': '#1890ff',
          '4ème A': '#faad14',
          '4ème B': '#faad14',
          '3ème A': '#722ed1',
          '3ème B': '#722ed1'
        };
        return classe?.nom ? (
          <Tag color={colors[classe.nom]} style={{ fontWeight: 'bold' }}>{classe.nom}</Tag>
        ) : '-';
      }
    },
    { 
      title: 'Genre', 
      dataIndex: 'genre', 
      key: 'genre',
      render: (genre) => {
        const colors = {
          'Masculin': '#1890ff',
          'Féminin': '#eb2f96'
        };
        return genre ? (
          <Tag color={colors[genre]}>{genre}</Tag>
        ) : '-';
      }
    },
    { 
      title: 'Parent', 
      dataIndex: 'parent', 
      key: 'parent', 
      render: (parent) => (
        <div>
          {parent ? (
            <>
              <div style={{ fontWeight: 'bold' }}>{parent.prenom} {parent.nom}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{parent.telephone || '-'}</div>
            </>
          ) : '-'}
        </div>
      )
    },
    { 
      title: 'Statut', 
      dataIndex: 'statut', 
      key: 'statut',
      render: (statut) => {
        const colors = {
          'Actif': 'green',
          'Inactif': 'red',
          'En attente': 'orange'
        };
        return <Tag color={colors[statut] || 'default'} style={{ fontWeight: 'bold' }}>{statut}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleShowStudentDetails(record.id)}>Détails</Button>
          <Button type="link" onClick={() => handleEditStudent(record)}>Modifier</Button>
          <Button 
            type="link" 
            danger 
            onClick={() => handleDeleteStudent(record.id)}
          >
            Supprimer
          </Button>
        </Space>
      )
    }
  ];

  // Colonnes du tableau des bulletins
  const bulletinColumns = [
    { 
      title: 'Élève', 
      dataIndex: 'eleve', 
      key: 'eleve', 
      render: (eleve) => eleve ? (
        <div>
          <div style={{ fontWeight: 'bold' }}>{eleve.prenom} {eleve.nom}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>ID: {eleve.id}</div>
        </div>
      ) : '-' 
    },
    { 
      title: 'Classe', 
      dataIndex: 'classe', 
      key: 'classe', 
      render: (classe) => classe?.nom || '-' 
    },
    { 
      title: 'Moyenne', 
      dataIndex: 'moyenneGenerale', 
      key: 'moyenneGenerale', 
      render: (moyenne) => (
        <Tag color={moyenne >= 16 ? 'green' : moyenne >= 14 ? 'orange' : 'red'}>
          {moyenne}/20
        </Tag>
      )
    },
    { 
      title: 'Rang', 
      dataIndex: 'rang', 
      key: 'rang', 
      render: (rang, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{rang}ème</div>
          <div style={{ fontSize: '12px', color: '#666' }}>sur {record.effectif}</div>
        </div>
      )
    },
    { 
      title: 'Trimestre', 
      dataIndex: 'trimestre', 
      key: 'trimestre',
      render: (trimestre) => (
        <Tag color="#1890ff">{trimestre}</Tag>
      )
    },
    { 
      title: 'Statut', 
      dataIndex: 'statut', 
      key: 'statut',
      render: (statut) => (
        <Tag color={statut === 'Publié' ? 'green' : 'orange'}>{statut}</Tag>
      )
    },
    { 
      title: 'Date création', 
      dataIndex: 'dateCreation', 
      key: 'dateCreation', 
      render: (date) => new Date(date).toLocaleDateString() 
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleShowBulletinDetails(record.id)}>Détails</Button>
          <Button type="link" onClick={() => window.open(record.pdfUrl, '_blank')}>PDF</Button>
          <Button type="link" onClick={() => handleEditBulletin(record)}>Modifier</Button>
          <Button type="link" danger onClick={() => handleDeleteBulletin(record.id)}>Supprimer</Button>
        </Space>
      )
    }
  ];

  // Colonnes du tableau des emplois
  const emploiColumns = [
    { 
      title: 'Classe', 
      dataIndex: 'classe', 
      key: 'classe', 
      render: (classe) => (
        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
          {classe?.nom || '-'}
        </div>
      )
    },
    { 
      title: 'Année Scolaire', 
      dataIndex: 'anneeScolaire', 
      key: 'anneeScolaire',
      render: (annee) => (
        <Tag color="#1890ff" style={{ fontSize: '14px' }}>{annee}</Tag>
      )
    },
    { 
      title: 'Responsable', 
      dataIndex: 'responsable', 
      key: 'responsable',
      render: (responsable) => (
        <div style={{ fontWeight: 'bold' }}>
          {responsable ? `${responsable.prenom} ${responsable.nom}` : '-'}
        </div>
      )
    },
    { 
      title: 'Détails', 
      dataIndex: 'description', 
      key: 'description',
      render: (description) => (
        <div style={{ maxWidth: 300, fontSize: '12px', color: '#666' }}>
          {description}
        </div>
      )
    },
    {
      title: 'Emploi du temps',
      key: 'pdf',
      render: (_, record) => (
        <Button 
          type="primary" 
          onClick={() => window.open(record.documentPdfUrl, '_blank')}
          icon={<FileTextOutlined />}
        >
          Voir PDF
        </Button>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleShowEmploiDetails(record.id)}>Détails</Button>
          <Button type="link" onClick={() => handleEditEmploi(record)}>Modifier</Button>
          <Button type="link" danger onClick={() => handleDeleteEmploi(record.id)}>Supprimer</Button>
        </Space>
      )
    }
  ];

  // Colonnes du tableau des cahiers
  const cahierColumns = [
    { 
      title: 'Élève', 
      dataIndex: 'eleve', 
      key: 'eleve',
      width: 120,
      render: (eleve) => eleve ? (
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{eleve.prenom} {eleve.nom}</div>
          <div style={{ fontSize: '10px', color: '#666' }}>ID: {eleve.id}</div>
        </div>
      ) : '-' 
    },
    { 
      title: 'Classe', 
      dataIndex: 'classe', 
      key: 'classe',
      width: 80,
      render: (classe) => (
        <div style={{ fontSize: '12px' }}>{classe?.nom || '-'}</div>
      )
    },
    { 
      title: 'Type', 
      dataIndex: 'type', 
      key: 'type',
      width: 100,
      render: (type) => {
        const colors = {
          'Communication': '#1890ff',
          'Absence': '#faad14',
          'Félicitations': '#52c41a',
          'Information': '#722ed1',
          'Orientation': '#eb2f96'
        };
        return <Tag color={colors[type] || '#666'} style={{ fontSize: '11px' }}>{type}</Tag>;
      }
    },
    { 
      title: 'Sujet', 
      dataIndex: 'sujet', 
      key: 'sujet',
      width: 150,
      render: (sujet) => (
        <div style={{ 
          maxWidth: 140, 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          fontSize: '12px'
        }}>
          {sujet}
        </div>
      )
    },
    { 
      title: 'Auteur', 
      dataIndex: 'auteur', 
      key: 'auteur',
      width: 100,
      render: (auteur) => (
        <div style={{ fontSize: '12px' }}>
          {auteur ? `${auteur.prenom} ${auteur.nom}` : '-'}
        </div>
      )
    },
    { 
      title: 'Statut', 
      dataIndex: 'statut', 
      key: 'statut',
      width: 80,
      render: (statut) => (
        <Tag color={statut === 'Lu' ? 'green' : 'orange'} style={{ fontSize: '11px' }}>{statut}</Tag>
      )
    },
    { 
      title: 'Date', 
      dataIndex: 'date', 
      key: 'date',
      width: 90,
      render: (date) => (
        <div style={{ fontSize: '12px' }}>
          {new Date(date).toLocaleDateString()}
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleShowCahierDetails(record.id)}>Détails</Button>
          <Button type="link" size="small" onClick={() => window.open(record.pdfUrl, '_blank')}>PDF</Button>
        </Space>
      )
    }
  ];

  // Colonnes du tableau des annonces
  const annonceColumns = [
    { 
      title: 'Titre', 
      dataIndex: 'titre', 
      key: 'titre',
      width: 200,
      render: (titre) => (
        <div style={{ 
          maxWidth: 180, 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {titre}
        </div>
      )
    },
    { 
      title: 'Catégorie', 
      dataIndex: 'categorie', 
      key: 'categorie',
      width: 100,
      render: (categorie) => {
        const colors = {
          'Réunion': '#1890ff',
          'Sortie': '#52c41a',
          'Fermeture': '#faad14',
          'Activité': '#722ed1',
          'Résultats': '#eb2f96'
        };
        return <Tag color={colors[categorie] || '#666'} style={{ fontSize: '11px' }}>{categorie}</Tag>;
      }
    },
    { 
      title: 'Priorité', 
      dataIndex: 'priorite', 
      key: 'priorite',
      width: 80,
      render: (priorite) => {
        const colors = {
          'Haute': 'red',
          'Normale': 'blue',
          'Basse': 'green'
        };
        return <Tag color={colors[priorite] || 'default'} style={{ fontSize: '11px' }}>{priorite}</Tag>;
      }
    },
    { 
      title: 'Auteur', 
      dataIndex: 'auteur', 
      key: 'auteur',
      width: 120,
      render: (auteur) => (
        <div style={{ fontSize: '12px' }}>
          {auteur ? `${auteur.prenom} ${auteur.nom}` : '-'}
        </div>
      )
    },
    { 
      title: 'Destinataires', 
      dataIndex: 'destinataires', 
      key: 'destinataires',
      width: 120,
      render: (destinataires) => (
        <div style={{ 
          maxWidth: 110, 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          fontSize: '11px',
          color: '#666'
        }}>
          {destinataires}
        </div>
      )
    },
    { 
      title: 'Date publication', 
      dataIndex: 'datePublication', 
      key: 'datePublication',
      width: 100,
      render: (date) => (
        <div style={{ fontSize: '11px' }}>
          {new Date(date).toLocaleDateString()}
        </div>
      )
    },
    { 
      title: 'Statut', 
      dataIndex: 'statut', 
      key: 'statut',
      width: 80,
      render: (statut) => {
        const colors = {
          'Publié': 'green',
          'Brouillon': 'orange',
          'Archivé': 'gray'
        };
        return <Tag color={colors[statut] || 'default'} style={{ fontSize: '11px' }}>{statut}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleShowAnnonceDetails(record.id)}>Détails</Button>
          <Button type="link" size="small" onClick={() => handleEditAnnonce(record)}>Modifier</Button>
        </Space>
      )
    }
  ];

  // Colonnes du tableau des messages
  const messageColumns = [
    { 
      title: 'Sujet', 
      dataIndex: 'sujet', 
      key: 'sujet',
      width: 200,
      render: (sujet) => (
        <div style={{ 
          maxWidth: 180, 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {sujet}
        </div>
      )
    },
    { 
      title: 'Type', 
      dataIndex: 'type', 
      key: 'type',
      width: 100,
      render: (type) => {
        const colors = {
          'Absence': '#faad14',
          'Rendez-vous': '#1890ff',
          'Devoirs': '#52c41a',
          'Félicitations': '#722ed1',
          'Question': '#eb2f96'
        };
        return <Tag color={colors[type] || '#666'} style={{ fontSize: '11px' }}>{type}</Tag>;
      }
    },
    { 
      title: 'Priorité', 
      dataIndex: 'priorite', 
      key: 'priorite',
      width: 80,
      render: (priorite) => {
        const colors = {
          'Haute': 'red',
          'Normale': 'blue',
          'Basse': 'green'
        };
        return <Tag color={colors[priorite] || 'default'} style={{ fontSize: '11px' }}>{priorite}</Tag>;
      }
    },
    { 
      title: 'Expéditeur', 
      dataIndex: 'expediteur', 
      key: 'expediteur',
      width: 120,
      render: (expediteur) => (
        <div style={{ fontSize: '12px' }}>
          {expediteur ? `${expediteur.prenom} ${expediteur.nom}` : '-'}
        </div>
      )
    },
    { 
      title: 'Destinataire', 
      dataIndex: 'destinataire', 
      key: 'destinataire',
      width: 120,
      render: (destinataire) => (
        <div style={{ fontSize: '12px' }}>
          {destinataire ? `${destinataire.prenom} ${destinataire.nom}` : '-'}
        </div>
      )
    },
    { 
      title: 'Date envoi', 
      dataIndex: 'dateEnvoi', 
      key: 'dateEnvoi',
      width: 100,
      render: (date) => (
        <div style={{ fontSize: '11px' }}>
          {new Date(date).toLocaleDateString()}
        </div>
      )
    },
    { 
      title: 'Statut', 
      dataIndex: 'statut', 
      key: 'statut',
      width: 80,
      render: (statut) => {
        const colors = {
          'Envoyé': 'green',
          'Lu': 'blue',
          'Non lu': 'orange'
        };
        return <Tag color={colors[statut] || 'default'} style={{ fontSize: '11px' }}>{statut}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleShowMessageDetails(record.id)}>Détails</Button>
          <Button type="link" size="small" onClick={() => handleEditMessage(record)}>Modifier</Button>
        </Space>
      )
    }
  ];

  // Colonnes du tableau des notifications
  const notificationColumns = [
    { 
      title: 'Titre', 
      dataIndex: 'titre', 
      key: 'titre',
      width: 200,
      render: (titre) => (
        <div style={{ 
          maxWidth: 180, 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {titre}
        </div>
      )
    },
    { 
      title: 'Type', 
      dataIndex: 'type', 
      key: 'type',
      width: 100,
      render: (type) => {
        const colors = {
          'Bulletin': '#1890ff',
          'Rappel': '#faad14',
          'Message': '#52c41a',
          'Annonce': '#722ed1',
          'Mise à jour': '#eb2f96'
        };
        return <Tag color={colors[type] || '#666'} style={{ fontSize: '11px' }}>{type}</Tag>;
      }
    },
    { 
      title: 'Catégorie', 
      dataIndex: 'categorie', 
      key: 'categorie',
      width: 100,
      render: (categorie) => {
        const colors = {
          'Résultats': '#1890ff',
          'Réunion': '#faad14',
          'Communication': '#52c41a',
          'Sortie': '#722ed1',
          'Emploi du temps': '#eb2f96'
        };
        return <Tag color={colors[categorie] || '#666'} style={{ fontSize: '11px' }}>{categorie}</Tag>;
      }
    },
    { 
      title: 'Priorité', 
      dataIndex: 'priorite', 
      key: 'priorite',
      width: 80,
      render: (priorite) => {
        const colors = {
          'Haute': 'red',
          'Normale': 'blue',
          'Basse': 'green'
        };
        return <Tag color={colors[priorite] || 'default'} style={{ fontSize: '11px' }}>{priorite}</Tag>;
      }
    },
    { 
      title: 'Destinataire', 
      dataIndex: 'destinataire', 
      key: 'destinataire',
      width: 120,
      render: (destinataire) => (
        <div style={{ 
          maxWidth: 110, 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          fontSize: '11px',
          color: '#666'
        }}>
          {destinataire}
        </div>
      )
    },
    { 
      title: 'Date envoi', 
      dataIndex: 'dateEnvoi', 
      key: 'dateEnvoi',
      width: 100,
      render: (date) => (
        <div style={{ fontSize: '11px' }}>
          {new Date(date).toLocaleDateString()}
        </div>
      )
    },
    { 
      title: 'Statut', 
      dataIndex: 'statut', 
      key: 'statut',
      width: 80,
      render: (statut) => {
        const colors = {
          'Lu': 'green',
          'Non lu': 'orange',
          'Envoyée': 'blue'
        };
        return <Tag color={colors[statut] || 'default'} style={{ fontSize: '11px' }}>{statut}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleShowNotificationDetails(record.id)}>Détails</Button>
          <Button type="link" size="small" onClick={() => handleEditNotification(record)}>Modifier</Button>
        </Space>
      )
    }
  ];

  // Colonnes du tableau des activités
  const activityColumns = [
    { 
      title: 'Nom', 
      dataIndex: 'nom', 
      key: 'nom',
      width: 180,
      fixed: 'left',
      render: (nom) => (
        <div style={{ 
          maxWidth: 160, 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          {nom}
        </div>
      )
    },
    { 
      title: 'Type', 
      dataIndex: 'type', 
      key: 'type',
      width: 90,
      render: (type) => {
        const colors = {
          'Sortie': '#1890ff',
          'Atelier': '#52c41a',
          'Compétition': '#faad14',
          'Projet': '#722ed1',
          'Événement': '#eb2f96'
        };
        return <Tag color={colors[type] || '#666'} style={{ fontSize: '11px' }}>{type}</Tag>;
      }
    },
    { 
      title: 'Classe', 
      dataIndex: 'classe', 
      key: 'classe', 
      width: 70,
      render: (classe) => (
        <div style={{ fontSize: '11px' }}>
          {classe?.nom || '-'}
        </div>
      )
    },
    { 
      title: 'Lieu', 
      dataIndex: 'lieu', 
      key: 'lieu',
      width: 130,
      render: (lieu) => (
        <div style={{ 
          maxWidth: 120, 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          fontSize: '11px',
          color: '#666'
        }}>
          {lieu}
        </div>
      )
    },
    { 
      title: 'Responsable', 
      dataIndex: 'responsable', 
      key: 'responsable',
      width: 110,
      render: (responsable) => (
        <div style={{ 
          maxWidth: 100, 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          fontSize: '11px'
        }}>
          {responsable}
        </div>
      )
    },
    { 
      title: 'Date début', 
      dataIndex: 'dateDebut', 
      key: 'dateDebut', 
      width: 90,
      render: (date) => (
        <div style={{ fontSize: '11px' }}>
          {date ? new Date(date).toLocaleDateString() : '-'}
        </div>
      )
    },
    { 
      title: 'Budget', 
      dataIndex: 'budget', 
      key: 'budget',
      width: 90,
      render: (budget) => (
        <div style={{ fontSize: '11px', fontWeight: '500' }}>
          {budget ? `${budget.toLocaleString()} Ar` : '-'}
        </div>
      )
    },
    { 
      title: 'Participants', 
      dataIndex: 'nombreParticipants', 
      key: 'nombreParticipants',
      width: 80,
      render: (nombre) => (
        <div style={{ fontSize: '11px' }}>
          {nombre || '-'}
        </div>
      )
    },
    { 
      title: 'Priorité', 
      dataIndex: 'priorite', 
      key: 'priorite',
      width: 80,
      render: (priorite) => {
        const colors = {
          'Haute': 'red',
          'Normale': 'blue',
          'Basse': 'green'
        };
        return <Tag color={colors[priorite] || 'default'} style={{ fontSize: '11px' }}>{priorite}</Tag>;
      }
    },
    { 
      title: 'Statut', 
      dataIndex: 'statut', 
      key: 'statut',
      width: 80,
      render: (statut) => {
        const colors = {
          'Planifiée': 'blue',
          'En cours': 'orange',
          'Terminée': 'green',
          'Annulée': 'red'
        };
        return <Tag color={colors[statut] || 'default'} style={{ fontSize: '11px' }}>{statut}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleShowActivityDetails(record.id)}>Détails</Button>
          <Button type="link" size="small" onClick={() => handleEditActivity(record)}>Modifier</Button>
        </Space>
      )
    }
  ];

  // Colonnes du tableau des paiements
  const paymentColumns = [
    { title: 'Élève', dataIndex: 'eleve', key: 'eleve', render: (eleve) => eleve ? `${eleve.prenom} ${eleve.nom}` : '-' },
    { title: 'École', dataIndex: 'ecole', key: 'ecole', render: (ecole) => ecole?.nom || '-' },
    { title: 'Montant', dataIndex: 'montant', key: 'montant', render: (montant) => `${montant} €` },
    { title: 'Mode paiement', dataIndex: 'modePaiement', key: 'modePaiement' },
    { title: 'Date paiement', dataIndex: 'datePaiement', key: 'datePaiement', render: (date) => date ? new Date(date).toLocaleDateString() : '-' },
    { 
      title: 'Statut', 
      dataIndex: 'statut', 
      key: 'statut',
      render: (statut) => {
        const colors = {
          'Payé': 'green',
          'En attente': 'orange',
          'Annulé': 'red',
          'Remboursé': 'gray'
        };
        return <Tag color={colors[statut] || 'default'}>{statut}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleShowPaymentDetails(record.id)}>Détails</Button>
          <Button type="link" onClick={() => handleEditPayment(record)}>Modifier</Button>
          <Button type="link" danger onClick={() => handleDeletePayment(record.id)}>Supprimer</Button>
        </Space>
      )
    }
  ];

  // Colonnes du tableau des factures
  const invoiceColumns = [
    { title: 'Numéro', dataIndex: 'numero', key: 'numero' },
    { title: 'Élève', dataIndex: 'eleve', key: 'eleve', render: (eleve) => eleve ? `${eleve.prenom} ${eleve.nom}` : '-' },
    { title: 'École', dataIndex: 'ecole', key: 'ecole', render: (ecole) => ecole?.nom || '-' },
    { title: 'Montant HT', dataIndex: 'montantHT', key: 'montantHT', render: (montant) => `${montant} €` },
    { title: 'Montant TTC', dataIndex: 'montantTTC', key: 'montantTTC', render: (montant) => `${montant} €` },
    { title: 'Date émission', dataIndex: 'dateEmission', key: 'dateEmission', render: (date) => new Date(date).toLocaleDateString() },
    { 
      title: 'Statut', 
      dataIndex: 'statut', 
      key: 'statut',
      render: (statut) => {
        const colors = {
          'Payée': 'green',
          'En attente': 'orange',
          'En retard': 'red',
          'Annulée': 'gray'
        };
        return <Tag color={colors[statut] || 'default'}>{statut}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleShowInvoiceDetails(record.id)}>Détails</Button>
          <Button type="link" onClick={() => handleEditInvoice(record)}>Modifier</Button>
          <Button type="link" danger onClick={() => handleDeleteInvoice(record.id)}>Supprimer</Button>
        </Space>
      )
    }
  ];

  // Colonnes du tableau des rapports
  const reportColumns = [
    { title: 'Titre', dataIndex: 'titre', key: 'titre' },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'École', dataIndex: 'ecole', key: 'ecole', render: (ecole) => ecole?.nom || '-' },
    { title: 'Période', dataIndex: 'periode', key: 'periode' },
    { title: 'Date création', dataIndex: 'createdAt', key: 'createdAt', render: (date) => new Date(date).toLocaleDateString() },
    { 
      title: 'Statut', 
      dataIndex: 'statut', 
      key: 'statut',
      render: (statut) => {
        const colors = {
          'Généré': 'green',
          'En cours': 'orange',
          'Erreur': 'red'
        };
        return <Tag color={colors[statut] || 'default'}>{statut}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleShowReportDetails(record.id)}>Détails</Button>
          <Button type="link" onClick={() => handleEditReport(record)}>Modifier</Button>
          <Button type="link" danger onClick={() => handleDeleteReport(record.id)}>Supprimer</Button>
        </Space>
      )
    }
  ];

  // Afficher le drawer de détails école
  const handleShowSchoolDetails = async (id) => {
    setSchoolDrawerOpen(true);
    // setSelectedSchool(null);
    // setSelectedSchoolStats(null);
    // const [schoolRes, statsRes] = await Promise.all([
    //   fetchSchoolDetails(id),
    //   fetchSchoolStats(id)
    // ]);
    // setSelectedSchool(schoolRes.data);
    // setSelectedSchoolStats(statsRes.data);
    
    // Données statiques pour les détails de l'école
    setSelectedSchool({
      id: 1,
      nom: "Institut Froebel LA TULIPE",
      code: "IFT001",
      commune: "Antananarivo",
      adresse: "Lot 67B Andoharanofotsy",
      telephone: "+261 20 22 123 45",
      email: "contact@institut-froebel-tulipe.mg",
      anneeScolaire: "2024-2025",
      createdAt: "2024-09-01T08:00:00.000Z"
    });
    setSelectedSchoolStats({
      nombreTotalUtilisateurs: 190,
      nombreAdmins: 2,
      nombreEnseignants: 8,
      nombreParents: 180,
      nombreClasses: 8,
      nombreTotalEleves: 224,
      nombreAnnonces: 5,
      nombreActivites: 3
    });
  };

  // Export Excel
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      // const res = await exportSchoolsExcel();
      // const url = window.URL.createObjectURL(new Blob([res.data]));
      // const link = document.createElement('a');
      // link.href = url;
      // link.setAttribute('download', 'ecoles.xlsx');
      // document.body.appendChild(link);
      // link.click();
      // link.remove();
      
      // Simulation d'export Excel avec les données statiques
      const csvContent = [
        ['Nom', 'Code', 'Commune', 'Adresse', 'Téléphone', 'Email', 'Année scolaire'],
        ...schools.map(school => [
          school.nom,
          school.code,
          school.commune,
          school.adresse,
          school.telephone,
          school.email,
          school.anneeScolaire
        ])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'ecoles_institut_froebel_tulipe.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('Export réussi !');
    } catch (error) {
      message.error('Erreur lors de l\'export');
    } finally {
      setExporting(false);
    }
  };

  // Afficher le drawer de détails utilisateur
  const handleShowUserDetails = async (id) => {
    setUserDrawerOpen(true);
    // setSelectedUser(null);
    // const res = await fetchUserDetails(id);
    // setSelectedUser(res.data);
    
    // Données statiques pour les détails utilisateur
    const selectedUserData = users.find(user => user.id === id);
    setSelectedUser(selectedUserData);
  };

  // Toggle statut utilisateur
  const handleToggleUserStatus = async (id, isActive) => {
    try {
      // await updateUser(id, isActive);
      // message.success(`Utilisateur ${isActive ? 'activé' : 'désactivé'} avec succès`);
      // // Recharger les utilisateurs
      // const res = await fetchUsers();
      // setUsers(res.data);
      
      // Mise à jour locale du statut utilisateur
      const updatedUsers = users.map(user => 
        user.id === id ? { ...user, isActive } : user
      );
      setUsers(updatedUsers);
      message.success(`Utilisateur ${isActive ? 'activé' : 'désactivé'} avec succès`);
    } catch (err) {
      message.error('Erreur lors de la modification du statut');
    }
  };

  // Supprimer utilisateur
  const handleDeleteUser = (id) => {
    Modal.confirm({
      title: 'Confirmer la suppression',
      content: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk: async () => {
        try {
          // await deleteUser(id);
          // message.success('Utilisateur supprimé avec succès');
          // // Recharger les utilisateurs
          // const res = await fetchUsers();
          // setUsers(res.data);
          
          // Supprimer de la liste locale
          const updatedUsers = users.filter(user => user.id !== id);
          setUsers(updatedUsers);
          message.success('Utilisateur supprimé avec succès');
        } catch (err) {
          message.error('Erreur lors de la suppression');
        }
      }
    });
  };

  // Export Excel utilisateurs
  const handleExportUsersExcel = async () => {
    setUserExporting(true);
    try {
      // const res = await exportUsersExcel();
      // const url = window.URL.createObjectURL(new Blob([res.data]));
      // const link = document.createElement('a');
      // link.href = url;
      // link.setAttribute('download', 'utilisateurs.xlsx');
      // document.body.appendChild(link);
      // link.click();
      // link.remove();
      
      // Simulation d'export Excel avec les données statiques
      const csvContent = [
        ['Nom', 'Prénom', 'Email', 'Rôle', 'Téléphone', 'Statut', 'École'],
        ...users.map(user => [
          user.nom,
          user.prenom,
          user.email,
          user.role,
          user.telephone || '',
          user.isActive ? 'Actif' : 'Inactif',
          user.ecole?.nom || ''
        ])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'utilisateurs_institut_froebel_tulipe.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('Export réussi !');
    } catch (error) {
      message.error('Erreur lors de l\'export');
    } finally {
      setUserExporting(false);
    }
  };

  // Afficher le drawer de détails classe
  const handleShowClassDetails = async (id) => {
    setClassDrawerOpen(true);
    const selectedClassData = classes.find(classe => classe.id === id);
    setSelectedClass(selectedClassData);
  };

  // Ouvrir modal pour créer/modifier classe
  const handleEditClass = (classe = null) => {
    setEditingClass(classe);
    setClassModalOpen(true);
    if (classe) {
      classForm.setFieldsValue(classe);
    } else {
      classForm.resetFields();
    }
  };

  // Sauvegarder classe
  const handleSaveClass = async (values) => {
    try {
      if (editingClass) {
        // Mise à jour d'une classe existante
        const updatedClasses = classes.map(classe => 
          classe.id === editingClass.id 
            ? { ...classe, ...values }
            : classe
        );
        setClasses(updatedClasses);
        message.success('Classe modifiée avec succès');
      } else {
        // Création d'une nouvelle classe
        const newClass = {
          id: Date.now(), // ID temporaire
          ...values,
          ecole: {
            id: 1,
            nom: "Institut Froebel LA TULIPE",
            code: "IFT001",
            commune: "Antananarivo",
            adresse: "Lot 67B Andoharanofotsy",
            telephone: "+261 20 22 123 45",
            email: "contact@institut-froebel-tulipe.mg"
          },
          enseignant: null,
          nombreEleves: 0,
          anneeScolaire: "2024-2025",
          createdAt: new Date().toISOString(),
          eleves: []
        };
        setClasses([...classes, newClass]);
        message.success('Classe créée avec succès');
      }
      setClassModalOpen(false);
      setEditingClass(null);
      classForm.resetFields();
    } catch (err) {
      message.error('Erreur lors de la sauvegarde');
    }
  };

  // Supprimer classe
  const handleDeleteClass = (id) => {
    Modal.confirm({
      title: 'Confirmer la suppression',
      content: 'Êtes-vous sûr de vouloir supprimer cette classe ?',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk: async () => {
        try {
          // Supprimer de la liste locale
          const updatedClasses = classes.filter(classe => classe.id !== id);
          setClasses(updatedClasses);
          message.success('Classe supprimée avec succès');
        } catch (err) {
          message.error('Erreur lors de la suppression');
        }
      }
    });
  };

  // Export Excel classes
  const handleExportClassesExcel = async () => {
    setClassExporting(true);
    try {
      // Simulation d'export Excel avec les données statiques
      const csvContent = [
        ['Nom', 'Niveau', 'École', 'Enseignant', 'Nombre d\'élèves', 'Année scolaire'],
        ...classes.map(classe => [
          classe.nom,
          classe.niveau,
          classe.ecole?.nom || '',
          classe.enseignant ? `${classe.enseignant.prenom} ${classe.enseignant.nom}` : '',
          classe.nombreEleves,
          classe.anneeScolaire
        ])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'classes_institut_froebel_tulipe.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('Export réussi !');
    } catch (error) {
      message.error('Erreur lors de l\'export');
    } finally {
      setClassExporting(false);
    }
  };

  // Afficher le drawer de détails élève
  const handleShowStudentDetails = async (id) => {
    setStudentDrawerOpen(true);
    // setSelectedStudent(null);
    // const res = await fetchStudentDetails(id);
    // setSelectedStudent(res.data);
    
    // Données statiques pour les détails élève
    const selectedStudentData = students.find(student => student.id === id);
    setSelectedStudent(selectedStudentData);
  };

  // Ouvrir modal pour créer/modifier élève
  const handleEditStudent = (student = null) => {
    setEditingStudent(student);
    setStudentModalOpen(true);
    if (student) {
      studentForm.setFieldsValue({
        ...student,
        dateNaissance: student.dateNaissance ? new Date(student.dateNaissance) : null
      });
    } else {
      studentForm.resetFields();
    }
  };

  // Sauvegarder élève
  const handleSaveStudent = async (values) => {
    try {
      const dataToSend = {
        ...values,
        dateNaissance: values.dateNaissance ? values.dateNaissance.toISOString() : null
      };
      
      if (editingStudent) {
        // Mise à jour d'un élève existant
        const updatedStudents = students.map(student => 
          student.id === editingStudent.id 
            ? { ...student, ...dataToSend }
            : student
        );
        setStudents(updatedStudents);
        message.success('Élève modifié avec succès');
      } else {
        // Création d'un nouvel élève
        const newStudent = {
          id: Date.now(), // ID temporaire
          ...dataToSend,
          classe: { id: 1, nom: "6ème A" },
          ecole: { id: 1, nom: "Institut Froebel LA TULIPE" },
          parent: { id: Date.now(), nom: "Parent", prenom: "Nouveau", telephone: "" },
          statut: "Actif",
          genre: "Masculin",
          adresse: "",
          telephone: "",
          email: "",
          createdAt: new Date().toISOString(),
          notes: ""
        };
        setStudents([...students, newStudent]);
        message.success('Élève créé avec succès');
      }
      setStudentModalOpen(false);
      setEditingStudent(null);
      studentForm.resetFields();
    } catch (err) {
      message.error('Erreur lors de la sauvegarde');
    }
  };

  // Supprimer élève
  const handleDeleteStudent = (id) => {
    Modal.confirm({
      title: 'Confirmer la suppression',
      content: 'Êtes-vous sûr de vouloir supprimer cet élève ?',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk: async () => {
        try {
          // await deleteStudent(id);
          // message.success('Élève supprimé avec succès');
          // // Recharger les élèves
          // const res = await fetchStudents();
          // setStudents(res.data);
          
          // Supprimer de la liste locale
          const updatedStudents = students.filter(student => student.id !== id);
          setStudents(updatedStudents);
          message.success('Élève supprimé avec succès');
        } catch (err) {
          message.error('Erreur lors de la suppression');
        }
      }
    });
  };

  // Export Excel élèves
  const handleExportStudentsExcel = async () => {
    setStudentExporting(true);
    try {
      // const res = await exportStudentsExcel();
      // const url = window.URL.createObjectURL(new Blob([res.data]));
      // const link = document.createElement('a');
      // link.href = url;
      // link.setAttribute('download', 'eleves.xlsx');
      // document.body.appendChild(link);
      // link.click();
      // link.remove();
      
      // Simulation d'export Excel avec les données statiques
      const csvContent = [
        ['Nom', 'Prénom', 'Date de naissance', 'Classe', 'École', 'Genre', 'Parent', 'Statut', 'Adresse', 'Téléphone', 'Email'],
        ...students.map(student => [
          student.nom,
          student.prenom,
          student.dateNaissance ? new Date(student.dateNaissance).toLocaleDateString() : '',
          student.classe?.nom || '',
          student.ecole?.nom || '',
          student.genre || '',
          student.parent ? `${student.parent.prenom} ${student.parent.nom}` : '',
          student.statut || '',
          student.adresse || '',
          student.telephone || '',
          student.email || ''
        ])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'eleves_institut_froebel_tulipe.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('Export réussi !');
    } catch (error) {
      message.error('Erreur lors de l\'export');
    } finally {
      setStudentExporting(false);
    }
  };

  // Handlers pour bulletins
  const handleShowBulletinDetails = async (id) => {
    setBulletinDrawerOpen(true);
    setSelectedBulletin(null);
    const res = await fetchBulletinDetails(id);
    setSelectedBulletin(res.data);
  };

  const handleEditBulletin = (bulletin = null) => {
    setEditingBulletin(bulletin);
    setBulletinModalOpen(true);
    if (bulletin) {
      bulletinForm.setFieldsValue(bulletin);
    } else {
      bulletinForm.resetFields();
    }
  };

  const handleSaveBulletin = async (values) => {
    try {
      if (editingBulletin) {
        await updateBulletin(editingBulletin.id, values);
        message.success('Bulletin modifié avec succès');
      } else {
        await createBulletin(values);
        message.success('Bulletin créé avec succès');
      }
      setBulletinModalOpen(false);
      const res = await fetchBulletins();
      setBulletins(res.data);
    } catch (err) {
      message.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteBulletin = (id) => {
    Modal.confirm({
      title: 'Confirmer la suppression',
      content: 'Êtes-vous sûr de vouloir supprimer ce bulletin ?',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk: async () => {
        try {
          await deleteBulletin(id);
          message.success('Bulletin supprimé avec succès');
          const res = await fetchBulletins();
          setBulletins(res.data);
        } catch (err) {
          message.error('Erreur lors de la suppression');
        }
      }
    });
  };

  const handleExportBulletinsExcel = async () => {
    setBulletinExporting(true);
    try {
      const res = await exportBulletinsExcel();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'bulletins.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setBulletinExporting(false);
    }
  };

  // Handlers pour emplois
  const handleShowEmploiDetails = async (id) => {
    setEmploiDrawerOpen(true);
    setSelectedEmploi(null);
    const res = await fetchEmploiDetails(id);
    setSelectedEmploi(res.data);
  };

  const handleEditEmploi = (emploi = null) => {
    setEditingEmploi(emploi);
    setEmploiModalOpen(true);
    if (emploi) {
      emploiForm.setFieldsValue(emploi);
    } else {
      emploiForm.resetFields();
    }
  };

  const handleSaveEmploi = async (values) => {
    try {
      if (editingEmploi) {
        await updateEmploi(editingEmploi.id, values);
        message.success('Emploi du temps modifié avec succès');
      } else {
        await createEmploi(values);
        message.success('Emploi du temps créé avec succès');
      }
      setEmploiModalOpen(false);
      const res = await fetchEmplois();
      setEmplois(res.data);
    } catch (err) {
      message.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteEmploi = (id) => {
    Modal.confirm({
      title: 'Confirmer la suppression',
      content: 'Êtes-vous sûr de vouloir supprimer cet emploi du temps ?',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk: async () => {
        try {
          await deleteEmploi(id);
          message.success('Emploi du temps supprimé avec succès');
          const res = await fetchEmplois();
          setEmplois(res.data);
        } catch (err) {
          message.error('Erreur lors de la suppression');
        }
      }
    });
  };

  const handleExportEmploisExcel = async () => {
    setEmploiExporting(true);
    try {
      const res = await exportEmploisExcel();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'emplois.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setEmploiExporting(false);
    }
  };

  // Handlers pour cahiers
  const handleShowCahierDetails = async (id) => {
    setCahierDrawerOpen(true);
    setSelectedCahier(null);
    const res = await fetchCahierDetails(id);
    setSelectedCahier(res.data);
  };

  const handleEditCahier = (cahier = null) => {
    setEditingCahier(cahier);
    setCahierModalOpen(true);
    if (cahier) {
      cahierForm.setFieldsValue({
        ...cahier,
        date: cahier.date ? new Date(cahier.date) : null
      });
    } else {
      cahierForm.resetFields();
    }
  };

  const handleSaveCahier = async (values) => {
    try {
      const dataToSend = {
        ...values,
        date: values.date ? values.date.toISOString() : null
      };
      
      if (editingCahier) {
        await updateCahier(editingCahier.id, dataToSend);
        message.success('Cahier de liaison modifié avec succès');
      } else {
        await createCahier(dataToSend);
        message.success('Cahier de liaison créé avec succès');
      }
      setCahierModalOpen(false);
      const res = await fetchCahiers();
      setCahiers(res.data);
    } catch (err) {
      message.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteCahier = (id) => {
    Modal.confirm({
      title: 'Confirmer la suppression',
      content: 'Êtes-vous sûr de vouloir supprimer ce cahier de liaison ?',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk: async () => {
        try {
          await deleteCahier(id);
          message.success('Cahier de liaison supprimé avec succès');
          const res = await fetchCahiers();
          setCahiers(res.data);
        } catch (err) {
          message.error('Erreur lors de la suppression');
        }
      }
    });
  };

  const handleExportCahiersExcel = async () => {
    setCahierExporting(true);
    try {
      const res = await exportCahiersExcel();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'cahiers.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setCahierExporting(false);
    }
  };

  // Handlers pour annonces
  const handleShowAnnonceDetails = async (id) => {
    setAnnonceDrawerOpen(true);
    setSelectedAnnonce(null);
    const res = await fetchAnnonceDetails(id);
    setSelectedAnnonce(res.data);
  };

  const handleEditAnnonce = (annonce = null) => {
    setEditingAnnonce(annonce);
    setAnnonceModalOpen(true);
    if (annonce) {
      annonceForm.setFieldsValue(annonce);
    } else {
      annonceForm.resetFields();
    }
  };

  const handleSaveAnnonce = async (values) => {
    try {
      if (editingAnnonce) {
        await updateAnnonce(editingAnnonce.id, values);
        message.success('Annonce modifiée avec succès');
      } else {
        await createAnnonce(values);
        message.success('Annonce créée avec succès');
      }
      setAnnonceModalOpen(false);
      const res = await fetchAnnonces();
      setAnnonces(res.data);
    } catch (err) {
      message.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteAnnonce = (id) => {
    Modal.confirm({
      title: 'Confirmer la suppression',
      content: 'Êtes-vous sûr de vouloir supprimer cette annonce ?',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk: async () => {
        try {
          await deleteAnnonce(id);
          message.success('Annonce supprimée avec succès');
          const res = await fetchAnnonces();
          setAnnonces(res.data);
        } catch (err) {
          message.error('Erreur lors de la suppression');
        }
      }
    });
  };

  const handleExportAnnoncesExcel = async () => {
    setAnnonceExporting(true);
    try {
      const res = await exportAnnoncesExcel();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'annonces.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setAnnonceExporting(false);
    }
  };

  // Handlers pour messages
  const handleShowMessageDetails = async (id) => {
    setMessageDrawerOpen(true);
    setSelectedMessage(null);
    const res = await fetchMessageDetails(id);
    setSelectedMessage(res.data);
  };

  const handleEditMessage = (message = null) => {
    setEditingMessage(message);
    setMessageModalOpen(true);
    if (message) {
      messageForm.setFieldsValue(message);
    } else {
      messageForm.resetFields();
    }
  };

  const handleSaveMessage = async (values) => {
    try {
      if (editingMessage) {
        await updateMessage(editingMessage.id, values);
        message.success('Message modifié avec succès');
      } else {
        await createMessage(values);
        message.success('Message créé avec succès');
      }
      setMessageModalOpen(false);
      const res = await fetchMessages();
      setMessages(res.data);
    } catch (err) {
      message.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteMessage = (id) => {
    Modal.confirm({
      title: 'Confirmer la suppression',
      content: 'Êtes-vous sûr de vouloir supprimer ce message ?',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk: async () => {
        try {
          await deleteMessage(id);
          message.success('Message supprimé avec succès');
          const res = await fetchMessages();
          setMessages(res.data);
        } catch (err) {
          message.error('Erreur lors de la suppression');
        }
      }
    });
  };

  const handleExportMessagesExcel = async () => {
    setMessageExporting(true);
    try {
      const res = await exportMessagesExcel();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'messages.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setMessageExporting(false);
    }
  };

  // Handlers pour notifications
  const handleShowNotificationDetails = async (id) => {
    setNotificationDrawerOpen(true);
    setSelectedNotification(null);
    const res = await fetchNotificationDetails(id);
    setSelectedNotification(res.data);
  };

  const handleEditNotification = (notification = null) => {
    setEditingNotification(notification);
    setNotificationModalOpen(true);
    if (notification) {
      notificationForm.setFieldsValue(notification);
    } else {
      notificationForm.resetFields();
    }
  };

  const handleSaveNotification = async (values) => {
    try {
      if (editingNotification) {
        await updateNotification(editingNotification.id, values);
        message.success('Notification modifiée avec succès');
      } else {
        await createNotification(values);
        message.success('Notification créée avec succès');
      }
      setNotificationModalOpen(false);
      const res = await fetchNotifications();
      setNotifications(res.data);
    } catch (err) {
      message.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteNotification = (id) => {
    Modal.confirm({
      title: 'Confirmer la suppression',
      content: 'Êtes-vous sûr de vouloir supprimer cette notification ?',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk: async () => {
        try {
          await deleteNotification(id);
          message.success('Notification supprimée avec succès');
          const res = await fetchNotifications();
          setNotifications(res.data);
        } catch (err) {
          message.error('Erreur lors de la suppression');
        }
      }
    });
  };

  const handleExportNotificationsExcel = async () => {
    setNotificationExporting(true);
    try {
      const res = await exportNotificationsExcel();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'notifications.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setNotificationExporting(false);
    }
  };

  // Handlers pour activités
  const handleShowActivityDetails = async (id) => {
    setActivityDrawerOpen(true);
    setSelectedActivity(null);
    const res = await fetchActivityDetails(id);
    setSelectedActivity(res.data);
  };

  const handleEditActivity = (activity = null) => {
    setEditingActivity(activity);
    setActivityModalOpen(true);
    if (activity) {
      activityForm.setFieldsValue({
        ...activity,
        dateDebut: activity.dateDebut ? new Date(activity.dateDebut) : null,
        dateFin: activity.dateFin ? new Date(activity.dateFin) : null
      });
    } else {
      activityForm.resetFields();
    }
  };

  const handleSaveActivity = async (values) => {
    try {
      const dataToSend = {
        ...values,
        dateDebut: values.dateDebut ? values.dateDebut.toISOString() : null,
        dateFin: values.dateFin ? values.dateFin.toISOString() : null
      };
      
      if (editingActivity) {
        await updateActivity(editingActivity.id, dataToSend);
        message.success('Activité modifiée avec succès');
      } else {
        await createActivity(dataToSend);
        message.success('Activité créée avec succès');
      }
      setActivityModalOpen(false);
      const res = await fetchActivities();
      setActivities(res.data);
    } catch (err) {
      message.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteActivity = (id) => {
    Modal.confirm({
      title: 'Confirmer la suppression',
      content: 'Êtes-vous sûr de vouloir supprimer cette activité ?',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk: async () => {
        try {
          await deleteActivity(id);
          message.success('Activité supprimée avec succès');
          const res = await fetchActivities();
          setActivities(res.data);
        } catch (err) {
          message.error('Erreur lors de la suppression');
        }
      }
    });
  };

  const handleExportActivitiesExcel = async () => {
    setActivityExporting(true);
    try {
      const res = await exportActivitiesExcel();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'activites.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setActivityExporting(false);
    }
  };

  // Handlers pour paiements
  const handleShowPaymentDetails = async (id) => {
    setPaymentDrawerOpen(true);
    setSelectedPayment(null);
    const res = await fetchPaymentDetails(id);
    setSelectedPayment(res.data);
  };

  const handleEditPayment = (payment = null) => {
    setEditingPayment(payment);
    setPaymentModalOpen(true);
    if (payment) {
      paymentForm.setFieldsValue({
        ...payment,
        datePaiement: payment.datePaiement ? new Date(payment.datePaiement) : null
      });
    } else {
      paymentForm.resetFields();
    }
  };

  const handleSavePayment = async (values) => {
    try {
      const dataToSend = {
        ...values,
        datePaiement: values.datePaiement ? values.datePaiement.toISOString() : null
      };
      
      if (editingPayment) {
        await updatePayment(editingPayment.id, dataToSend);
        message.success('Paiement modifié avec succès');
      } else {
        await createPayment(dataToSend);
        message.success('Paiement créé avec succès');
      }
      setPaymentModalOpen(false);
      const res = await fetchPayments();
      setPayments(res.data);
    } catch (err) {
      message.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDeletePayment = (id) => {
    Modal.confirm({
      title: 'Confirmer la suppression',
      content: 'Êtes-vous sûr de vouloir supprimer ce paiement ?',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk: async () => {
        try {
          await deletePayment(id);
          message.success('Paiement supprimé avec succès');
          const res = await fetchPayments();
          setPayments(res.data);
        } catch (err) {
          message.error('Erreur lors de la suppression');
        }
      }
    });
  };

  const handleExportPaymentsExcel = async () => {
    setPaymentExporting(true);
    try {
      const res = await exportPaymentsExcel();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'paiements.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setPaymentExporting(false);
    }
  };

  // Handlers pour factures
  const handleShowInvoiceDetails = async (id) => {
    setInvoiceDrawerOpen(true);
    setSelectedInvoice(null);
    const res = await fetchInvoiceDetails(id);
    setSelectedInvoice(res.data);
  };

  const handleEditInvoice = (invoice = null) => {
    setEditingInvoice(invoice);
    setInvoiceModalOpen(true);
    if (invoice) {
      invoiceForm.setFieldsValue({
        ...invoice,
        dateEmission: invoice.dateEmission ? new Date(invoice.dateEmission) : null
      });
    } else {
      invoiceForm.resetFields();
    }
  };

  const handleSaveInvoice = async (values) => {
    try {
      const dataToSend = {
        ...values,
        dateEmission: values.dateEmission ? values.dateEmission.toISOString() : null
      };
      
      if (editingInvoice) {
        await updateInvoice(editingInvoice.id, dataToSend);
        message.success('Facture modifiée avec succès');
      } else {
        await createInvoice(dataToSend);
        message.success('Facture créée avec succès');
      }
      setInvoiceModalOpen(false);
      const res = await fetchInvoices();
      setInvoices(res.data);
    } catch (err) {
      message.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteInvoice = (id) => {
    Modal.confirm({
      title: 'Confirmer la suppression',
      content: 'Êtes-vous sûr de vouloir supprimer cette facture ?',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk: async () => {
        try {
          await deleteInvoice(id);
          message.success('Facture supprimée avec succès');
          const res = await fetchInvoices();
          setInvoices(res.data);
        } catch (err) {
          message.error('Erreur lors de la suppression');
        }
      }
    });
  };

  const handleExportInvoicesExcel = async () => {
    setInvoiceExporting(true);
    try {
      const res = await exportInvoicesExcel();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'factures.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setInvoiceExporting(false);
    }
  };

  // Handlers pour rapports
  const handleShowReportDetails = async (id) => {
    setReportDrawerOpen(true);
    setSelectedReport(null);
    const res = await fetchFinancialReportDetails(id);
    setSelectedReport(res.data);
  };

  const handleEditReport = (report = null) => {
    setEditingReport(report);
    setReportModalOpen(true);
    if (report) {
      reportForm.setFieldsValue(report);
    } else {
      reportForm.resetFields();
    }
  };

  const handleSaveReport = async (values) => {
    try {
      if (editingReport) {
        await updateFinancialReport(editingReport.id, values);
        message.success('Rapport modifié avec succès');
      } else {
        await createFinancialReport(values);
        message.success('Rapport créé avec succès');
      }
      setReportModalOpen(false);
      const res = await fetchFinancialReports();
      setFinancialReports(res.data);
    } catch (err) {
      message.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteReport = (id) => {
    Modal.confirm({
      title: 'Confirmer la suppression',
      content: 'Êtes-vous sûr de vouloir supprimer ce rapport ?',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk: async () => {
        try {
          await deleteFinancialReport(id);
          message.success('Rapport supprimé avec succès');
          const res = await fetchFinancialReports();
          setFinancialReports(res.data);
        } catch (err) {
          message.error('Erreur lors de la suppression');
        }
      }
    });
  };

  const handleExportReportsExcel = async () => {
    setReportExporting(true);
    try {
      const res = await exportFinancialReportsExcel();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'rapports_financiers.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setReportExporting(false);
    }
  };

  // Données pour les graphiques
  const personnelData = [
    { label: 'Administrateurs', value: personnelStats.administrateurs.total, percentage: 25 },
    { label: 'Professeurs', value: personnelStats.professeurs.total, percentage: 75 },
  ];

  const studentData = [
    { label: 'Élèves Actifs', value: studentStats.activeStudents, percentage: 85 },
    { label: 'Total Élèves', value: studentStats.totalStudents, percentage: 100 },
  ];

  const paymentData = [
    { label: 'Paiements Reçus', value: paymentStats.totalPaiements - paymentStats.enAttente - paymentStats.rembourses, percentage: 60 },
    { label: 'En Attente', value: paymentStats.enAttente, percentage: 20 },
    { label: 'Remboursés', value: paymentStats.rembourses, percentage: 20 },
  ];

  // Activités récentes simulées
  const recentActivities = [
    {
      title: 'Nouveau professeur ajouté',
      description: 'Marie Dubois - Mathématiques',
      time: 'Il y a 2 heures',
      icon: <UserOutlined />,
      color: '#52c41a',
      status: 'success'
    },
    {
      title: 'Paiement reçu',
      description: 'Famille Martin - 500€',
      time: 'Il y a 3 heures',
      icon: <DollarOutlined />,
      color: '#1890ff',
      status: 'success'
    },
    {
      title: 'Nouvelle annonce publiée',
      description: 'Réunion parents-professeurs',
      time: 'Il y a 5 heures',
      icon: <BellOutlined />,
      color: '#faad14',
      status: 'warning'
    },
    {
      title: 'Activité créée',
      description: 'Sortie au musée - CM2',
      time: 'Il y a 1 jour',
      icon: <CalendarOutlined />,
      color: '#722ed1',
      status: 'success'
    }
  ];

  const renderDashboard = () => (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header du Dashboard */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ margin: 0, color: '#1a1a1a' }}>
          <DashboardOutlined style={{ marginRight: 12, color: '#1890ff' }} />
          Tableau de Bord
        </Title>
        <Text type="secondary">Bienvenue dans votre espace d'administration</Text>
      </div>

      {/* Statistiques principales */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Personnel"
            value={personnelStats.general.totalPersonnel}
            icon={<TeamOutlined />}
            color="#1890ff"
            trend={5}
            subtitle="Administrateurs et professeurs"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Élèves Actifs"
            value={studentStats.activeStudents}
            icon={<UserOutlined />}
            color="#52c41a"
            trend={12}
            subtitle="Inscrits cette année"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Classes"
            value={classStats.totalClasses}
            icon={<BookOutlined />}
            color="#faad14"
            trend={0}
            subtitle="Tous niveaux confondus"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Paiements du Mois"
            value={paymentStats.montantTotal}
            suffix=" Ar"
            icon={<DollarOutlined />}
            color="#722ed1"
            trend={-3}
            subtitle="Revenus mensuels"
          />
        </Col>
      </Row>

      {/* Graphiques et Activités */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <SimpleBarChart 
            data={personnelData} 
            title="Répartition du Personnel" 
            color="#1890ff"
          />
        </Col>
        <Col xs={24} lg={8}>
          <SimpleBarChart 
            data={studentData} 
            title="Statut des Élèves" 
            color="#52c41a"
          />
        </Col>
        <Col xs={24} lg={8}>
          <SimpleBarChart 
            data={paymentData} 
            title="État des Paiements" 
            color="#722ed1"
          />
        </Col>
      </Row>

      {/* Activités récentes et Statistiques détaillées */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span>
                <ClockCircleOutlined style={{ marginRight: 8 }} />
                Activités Récentes
              </span>
            }
            style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          >
            {recentActivities.map((activity, index) => (
              <ActivityCard key={index} {...activity} />
            ))}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span>
                <BarChartOutlined style={{ marginRight: 8 }} />
                Statistiques Détaillées
              </span>
            }
            style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Annonces Publiées"
                  value={communicationStats.annonces.publiees}
                  prefix={<BellOutlined style={{ color: '#faad14' }} />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Activités en Cours"
                  value={activityStats.general.activitiesEnCours}
                  prefix={<CalendarOutlined style={{ color: '#722ed1' }} />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Messages Non Lus"
                  value={communicationStats.messages.nonLus}
                  prefix={<MailOutlined style={{ color: '#1890ff' }} />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Bulletins Publiés"
                  value={pedagogyStats.bulletins.publies}
                  prefix={<FileOutlined style={{ color: '#52c41a' }} />}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Cartes d'accès rapide */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card 
            title={
              <span>
                <ThunderboltOutlined style={{ marginRight: 8 }} />
                Accès Rapide
              </span>
            }
            style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          >
            <Row gutter={[16, 16]}>
              {menuItems.slice(1).map((item) => (
                <Col xs={12} sm={8} md={6} lg={3} key={item.key}>
                  <Card
                    hoverable
                    style={{ 
                      textAlign: 'center', 
                      borderRadius: 8,
                      border: '1px solid #f0f0f0'
                    }}
                    onClick={() => setSelectedKey(item.key)}
                  >
                    <div style={{ fontSize: 24, marginBottom: 8, color: '#1890ff' }}>
                      {item.icon}
                    </div>
                    <Text strong>{item.label}</Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Overlay pour mobile */}
      {sidebarCollapsed === false && (
        <div 
          className="sidebar-overlay" 
          style={{ 
            display: window.innerWidth <= 768 ? 'block' : 'none',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999
          }}
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
      
      <Sider 
        breakpoint="lg" 
        collapsedWidth="0"
        width={200}
        collapsed={sidebarCollapsed}
        style={{
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
          overflow: 'auto'
        }}
        onCollapse={(collapsed) => {
          setSidebarCollapsed(collapsed);
        }}
      >
        <div className="logo" style={{ color: '#389e5f', fontWeight: 'bold', fontSize: 22, textAlign: 'center', margin: '16px 0' }}>
          Interface SuperAdmin
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={({ key }) => {
            if (key === 'home') {
              window.open('/', '_blank');
            } else {
              setSelectedKey(key);
            }
          }}
          items={menuItems}
        />
      </Sider>
      <Layout style={{ 
        marginLeft: window.innerWidth <= 768 ? 0 : (sidebarCollapsed ? 80 : 200), 
        transition: 'margin-left 0.2s' 
      }}>
        <Header style={{ background: '#fff', padding: 0, fontWeight: 'bold', fontSize: 18, paddingLeft: 24, display: 'flex', alignItems: 'center' }}>
          <Button
            type="text"
            icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{ fontSize: '16px', width: 64, height: 64, marginRight: 16 }}
          />
          {menuItems.find(item => item.key === selectedKey)?.label}
        </Header>
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
            {selectedKey === 'dashboard' && (
              loading ? <Spin /> : renderDashboard()
            )}
            {selectedKey === 'schools' && (
              <>
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={12}>
                    <Input.Search
                      placeholder="Rechercher une école (nom, code, commune)"
                      value={schoolSearch}
                      onChange={e => setSchoolSearch(e.target.value)}
                      allowClear
                    />
                  </Col>
                  <Col span={12} style={{ textAlign: 'right' }}>
                    <Button type="primary" onClick={handleExportExcel} loading={exporting}>
                      Exporter Excel
                    </Button>
                  </Col>
                </Row>
                <Table
                  columns={columns}
                  dataSource={filteredSchools}
                  rowKey="id"
                  pagination={{ pageSize: 8 }}
                  loading={loading}
                />
                <Drawer
                  title={selectedSchool?.nom || 'Détails École'}
                  placement="right"
                  width={500}
                  onClose={() => setSchoolDrawerOpen(false)}
                  open={schoolDrawerOpen}
                >
                  {selectedSchool ? (
                    <>
                      <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label="Nom">{selectedSchool.nom}</Descriptions.Item>
                        <Descriptions.Item label="Code">{selectedSchool.code}</Descriptions.Item>
                        <Descriptions.Item label="Commune">{selectedSchool.commune}</Descriptions.Item>
                        <Descriptions.Item label="Adresse">{selectedSchool.adresse}</Descriptions.Item>
                        <Descriptions.Item label="Téléphone">{selectedSchool.telephone}</Descriptions.Item>
                        <Descriptions.Item label="Email">{selectedSchool.email}</Descriptions.Item>
                        <Descriptions.Item label="Année scolaire">{selectedSchool.anneeScolaire}</Descriptions.Item>
                        <Descriptions.Item label="Créée le">{new Date(selectedSchool.createdAt).toLocaleString()}</Descriptions.Item>
                        <Descriptions.Item label="Statistiques">
                          {selectedSchoolStats ? (
                            <ul style={{ paddingLeft: 16 }}>
                              <li>Utilisateurs : {selectedSchoolStats.nombreTotalUtilisateurs}</li>
                              <li>Admins : {selectedSchoolStats.nombreAdmins}</li>
                              <li>Enseignants : {selectedSchoolStats.nombreEnseignants}</li>
                              <li>Parents : {selectedSchoolStats.nombreParents}</li>
                              <li>Classes : {selectedSchoolStats.nombreClasses}</li>
                              <li>Élèves : {selectedSchoolStats.nombreTotalEleves}</li>
                              <li>Annonces : {selectedSchoolStats.nombreAnnonces}</li>
                              <li>Activités : {selectedSchoolStats.nombreActivites}</li>
                            </ul>
                          ) : <Spin />}
                        </Descriptions.Item>
                      </Descriptions>
                    </>
                  ) : <Spin />}
                </Drawer>
              </>
            )}
            {selectedKey === 'users' && (
              <>
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={12}>
                    <Input.Search
                      placeholder="Rechercher un utilisateur (nom, prénom, email, rôle)"
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                      allowClear
                    />
                  </Col>
                  <Col span={12} style={{ textAlign: 'right' }}>
                    <Button type="primary" onClick={handleExportUsersExcel} loading={userExporting}>
                      Exporter Excel
                    </Button>
                  </Col>
                </Row>
                <Table
                  columns={userColumns}
                  dataSource={filteredUsers}
                  rowKey="id"
                  pagination={{ pageSize: 8 }}
                  loading={loading}
                />
                <Drawer
                  title={selectedUser ? `${selectedUser.prenom} ${selectedUser.nom}` : 'Détails Utilisateur'}
                  placement="right"
                  width={500}
                  onClose={() => setUserDrawerOpen(false)}
                  open={userDrawerOpen}
                >
                  {selectedUser ? (
                    <>
                      <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label="Nom">{selectedUser.nom}</Descriptions.Item>
                        <Descriptions.Item label="Prénom">{selectedUser.prenom}</Descriptions.Item>
                        <Descriptions.Item label="Email">{selectedUser.email}</Descriptions.Item>
                        <Descriptions.Item label="Rôle">
                          <Tag color={
                            selectedUser.role === 'SuperAdmin' ? 'red' :
                            selectedUser.role === 'Admin' ? 'orange' :
                            selectedUser.role === 'Enseignant' ? 'blue' : 'green'
                          }>
                            {selectedUser.role}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="École">{selectedUser.ecole?.nom || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Téléphone">{selectedUser.telephone || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Statut">
                          <Tag color={selectedUser.isActive ? 'green' : 'red'}>
                            {selectedUser.isActive ? 'Actif' : 'Inactif'}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Créé le">{new Date(selectedUser.createdAt).toLocaleString()}</Descriptions.Item>
                        {selectedUser.lastLoginAt && (
                          <Descriptions.Item label="Dernière connexion">
                            {new Date(selectedUser.lastLoginAt).toLocaleString()}
                          </Descriptions.Item>
                        )}
                      </Descriptions>
                    </>
                  ) : <Spin />}
                </Drawer>
              </>
            )}
            {selectedKey === 'classes' && (
              <>
                {/* Tableau de bord personnalisé pour les classes */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="Total Classes" 
                        value={classStats.totalClasses} 
                        prefix={<BookOutlined style={{ color: '#1890ff' }} />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="Total Élèves" 
                        value={classStats.totalStudents} 
                        prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="Moyenne/Classe" 
                        value={classStats.averageStudentsPerClass} 
                        prefix={<UserOutlined style={{ color: '#faad14' }} />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="Enseignants" 
                        value={classStats.teachers} 
                        prefix={<BankOutlined style={{ color: '#722ed1' }} />}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* Informations sur l'école */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={24}>
                    <Card title="Institut Froebel LA TULIPE" style={{ marginBottom: 16 }}>
                      <Row gutter={16}>
                        <Col span={8}>
                          <div style={{ textAlign: 'center' }}>
                            <BankOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
                            <div style={{ fontWeight: 'bold' }}>École</div>
                            <div style={{ color: '#666' }}>Institut Froebel LA TULIPE</div>
                          </div>
                        </Col>
                        <Col span={8}>
                          <div style={{ textAlign: 'center' }}>
                            <CalendarOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
                            <div style={{ fontWeight: 'bold' }}>Année Scolaire</div>
                            <div style={{ color: '#666' }}>2024-2025</div>
                          </div>
                        </Col>
                        <Col span={8}>
                          <div style={{ textAlign: 'center' }}>
                            <TeamOutlined style={{ fontSize: '24px', color: '#faad14', marginBottom: '8px' }} />
                            <div style={{ fontWeight: 'bold' }}>Niveaux</div>
                            <div style={{ color: '#666' }}>6ème à 3ème</div>
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>

                {/* Répartition par niveau */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={24}>
                    <Card title="Répartition par niveau" style={{ marginBottom: 16 }}>
                      <Row gutter={16}>
                        {Object.entries(classStats.levels).map(([level, count]) => (
                          <Col span={6} key={level}>
                            <Card size="small" style={{ textAlign: 'center' }}>
                              <Statistic 
                                title={level} 
                                value={count} 
                                suffix="classes"
                                valueStyle={{ color: '#1890ff' }}
                              />
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </Card>
                  </Col>
                </Row>



                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={12}>
                    <Input.Search
                      placeholder="Rechercher une classe (nom, niveau, école, enseignant)"
                      value={classSearch}
                      onChange={e => setClassSearch(e.target.value)}
                      allowClear
                    />
                  </Col>
                  <Col span={12} style={{ textAlign: 'right' }}>
                    <Button type="primary" onClick={() => handleEditClass()} style={{ marginRight: 8 }}>
                      Nouvelle Classe
                    </Button>
                    <Button type="primary" onClick={handleExportClassesExcel} loading={classExporting}>
                      Exporter Excel
                    </Button>
                  </Col>
                </Row>
                <Table
                  columns={classColumns}
                  dataSource={filteredClasses}
                  rowKey="id"
                  pagination={{ pageSize: 8 }}
                  loading={loading}
                />
                <Drawer
                  title={selectedClass?.nom || 'Détails Classe'}
                  placement="right"
                  width={500}
                  onClose={() => setClassDrawerOpen(false)}
                  open={classDrawerOpen}
                >
                  {selectedClass ? (
                    <>
                      <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label="Nom">{selectedClass.nom}</Descriptions.Item>
                        <Descriptions.Item label="Niveau">{selectedClass.niveau}</Descriptions.Item>
                        <Descriptions.Item label="École">{selectedClass.ecole?.nom || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Enseignant">
                          {selectedClass.enseignant ? `${selectedClass.enseignant.prenom} ${selectedClass.enseignant.nom}` : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Nombre d'élèves">{selectedClass.nombreEleves || 0}</Descriptions.Item>
                        <Descriptions.Item label="Année scolaire">{selectedClass.anneeScolaire}</Descriptions.Item>
                        <Descriptions.Item label="Créée le">{new Date(selectedClass.createdAt).toLocaleString()}</Descriptions.Item>
                        {selectedClass.eleves && selectedClass.eleves.length > 0 && (
                          <Descriptions.Item label="Élèves">
                            <ul style={{ paddingLeft: 16 }}>
                              {selectedClass.eleves.map(eleve => (
                                <li key={eleve.id}>{eleve.prenom} {eleve.nom}</li>
                              ))}
                            </ul>
                          </Descriptions.Item>
                        )}
                      </Descriptions>
                    </>
                  ) : <Spin />}
                </Drawer>
                <Modal
                  title={editingClass ? 'Modifier la classe' : 'Nouvelle classe'}
                  open={classModalOpen}
                  onCancel={() => setClassModalOpen(false)}
                  footer={null}
                >
                  <Form
                    form={classForm}
                    layout="vertical"
                    onFinish={handleSaveClass}
                  >
                    <Form.Item
                      name="nom"
                      label="Nom de la classe"
                      rules={[{ required: true, message: 'Le nom est requis' }]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      name="niveau"
                      label="Niveau"
                      rules={[{ required: true, message: 'Le niveau est requis' }]}
                    >
                      <Select>
                        <Select.Option value="6ème">6ème</Select.Option>
                        <Select.Option value="5ème">5ème</Select.Option>
                        <Select.Option value="4ème">4ème</Select.Option>
                        <Select.Option value="3ème">3ème</Select.Option>
                        <Select.Option value="Maternelle">Maternelle</Select.Option>
                        <Select.Option value="CP">CP</Select.Option>
                        <Select.Option value="CE1">CE1</Select.Option>
                        <Select.Option value="CE2">CE2</Select.Option>
                        <Select.Option value="CM1">CM1</Select.Option>
                        <Select.Option value="CM2">CM2</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      name="anneeScolaire"
                      label="Année scolaire"
                      rules={[{ required: true, message: 'L\'année scolaire est requise' }]}
                    >
                      <Input placeholder="2024-2025" />
                    </Form.Item>
                    <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                      <Button type="default" onClick={() => setClassModalOpen(false)} style={{ marginRight: 8 }}>
                        Annuler
                      </Button>
                      <Button type="primary" htmlType="submit">
                        {editingClass ? 'Modifier' : 'Créer'}
                      </Button>
                    </Form.Item>
                  </Form>
                </Modal>
              </>
            )}
            {selectedKey === 'students' && (
              <>
                {/* Tableau de bord personnalisé pour les élèves */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="Total Élèves" 
                        value={studentStats.totalStudents} 
                        prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="Élèves Actifs" 
                        value={studentStats.activeStudents} 
                        prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="Âge Moyen" 
                        value={studentStats.averageAge} 
                        suffix="ans"
                        prefix={<CalendarOutlined style={{ color: '#faad14' }} />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="Élèves Inactifs" 
                        value={studentStats.inactiveStudents} 
                        prefix={<UserOutlined style={{ color: '#ff4d4f' }} />}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* Répartition par genre */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={12}>
                    <Card title="Répartition par genre" style={{ marginBottom: 16 }}>
                      <Row gutter={16}>
                        <Col span={12}>
                          <div style={{ textAlign: 'center' }}>
                            <Statistic 
                              title="Masculin" 
                              value={studentStats.genderDistribution.masculin} 
                              suffix="élèves"
                              valueStyle={{ color: '#1890ff' }}
                            />
                          </div>
                        </Col>
                        <Col span={12}>
                          <div style={{ textAlign: 'center' }}>
                            <Statistic 
                              title="Féminin" 
                              value={studentStats.genderDistribution.feminin} 
                              suffix="élèves"
                              valueStyle={{ color: '#eb2f96' }}
                            />
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="Répartition par niveau" style={{ marginBottom: 16 }}>
                      <Row gutter={16}>
                        {Object.entries(studentStats.levelDistribution).map(([level, count]) => (
                          <Col span={6} key={level}>
                            <div style={{ textAlign: 'center' }}>
                              <Statistic 
                                title={level} 
                                value={count} 
                                suffix="élèves"
                                valueStyle={{ color: '#52c41a' }}
                              />
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </Card>
                  </Col>
                </Row>

                {/* Informations sur l'école */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={24}>
                    <Card title="Institut Froebel LA TULIPE - Gestion des Élèves" style={{ marginBottom: 16 }}>
                      <Row gutter={16}>
                        <Col span={8}>
                          <div style={{ textAlign: 'center' }}>
                            <BankOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
                            <div style={{ fontWeight: 'bold' }}>École</div>
                            <div style={{ color: '#666' }}>{studentStats.schoolName}</div>
                          </div>
                        </Col>
                        <Col span={8}>
                          <div style={{ textAlign: 'center' }}>
                            <CalendarOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
                            <div style={{ fontWeight: 'bold' }}>Année Scolaire</div>
                            <div style={{ color: '#666' }}>{studentStats.academicYear}</div>
                          </div>
                        </Col>
                        <Col span={8}>
                          <div style={{ textAlign: 'center' }}>
                            <TeamOutlined style={{ fontSize: '24px', color: '#faad14', marginBottom: '8px' }} />
                            <div style={{ fontWeight: 'bold' }}>Classes</div>
                            <div style={{ color: '#666' }}>6ème à 3ème</div>
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>

                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={12}>
                    <Input.Search
                      placeholder="Rechercher un élève (nom, prénom, classe, école, parent)"
                      value={studentSearch}
                      onChange={e => setStudentSearch(e.target.value)}
                      allowClear
                    />
                  </Col>
                  <Col span={12} style={{ textAlign: 'right' }}>
                    <Button type="primary" onClick={() => handleEditStudent()} style={{ marginRight: 8 }}>
                      Nouvel Élève
                    </Button>
                    <Button type="primary" onClick={handleExportStudentsExcel} loading={studentExporting}>
                      Exporter Excel
                    </Button>
                  </Col>
                </Row>
                <Table
                  columns={studentColumns}
                  dataSource={filteredStudents}
                  rowKey="id"
                  pagination={{ pageSize: 8 }}
                  loading={loading}
                />
                <Drawer
                  title={selectedStudent ? `${selectedStudent.prenom} ${selectedStudent.nom}` : 'Détails Élève'}
                  placement="right"
                  width={500}
                  onClose={() => setStudentDrawerOpen(false)}
                  open={studentDrawerOpen}
                >
                  {selectedStudent ? (
                    <>
                      <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label="Nom">{selectedStudent.nom}</Descriptions.Item>
                        <Descriptions.Item label="Prénom">{selectedStudent.prenom}</Descriptions.Item>
                        <Descriptions.Item label="Date de naissance">
                          {selectedStudent.dateNaissance ? new Date(selectedStudent.dateNaissance).toLocaleDateString() : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Âge">
                          {selectedStudent.dateNaissance ? 
                            `${Math.floor((new Date() - new Date(selectedStudent.dateNaissance)) / (365.25 * 24 * 60 * 60 * 1000))} ans` : 
                            '-'
                          }
                        </Descriptions.Item>
                        <Descriptions.Item label="Genre">
                          {selectedStudent.genre ? (
                            <Tag color={selectedStudent.genre === 'Masculin' ? '#1890ff' : '#eb2f96'}>
                              {selectedStudent.genre}
                            </Tag>
                          ) : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Classe">{selectedStudent.classe?.nom || '-'}</Descriptions.Item>
                        <Descriptions.Item label="École">{selectedStudent.ecole?.nom || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Parent">
                          {selectedStudent.parent ? `${selectedStudent.parent.prenom} ${selectedStudent.parent.nom}` : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Téléphone Parent">
                          {selectedStudent.parent?.telephone || '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Statut">
                          <Tag color={
                            selectedStudent.statut === 'Actif' ? 'green' :
                            selectedStudent.statut === 'Inactif' ? 'red' : 'orange'
                          }>
                            {selectedStudent.statut}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Adresse">{selectedStudent.adresse || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Téléphone">{selectedStudent.telephone || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Email">{selectedStudent.email || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Notes">{selectedStudent.notes || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Créé le">{new Date(selectedStudent.createdAt).toLocaleString()}</Descriptions.Item>
                      </Descriptions>
                    </>
                  ) : <Spin />}
                </Drawer>
                <Modal
                  title={editingStudent ? 'Modifier l\'élève' : 'Nouvel élève'}
                  open={studentModalOpen}
                  onCancel={() => setStudentModalOpen(false)}
                  footer={null}
                >
                  <Form
                    form={studentForm}
                    layout="vertical"
                    onFinish={handleSaveStudent}
                  >
                    <Form.Item
                      name="nom"
                      label="Nom"
                      rules={[{ required: true, message: 'Le nom est requis' }]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      name="prenom"
                      label="Prénom"
                      rules={[{ required: true, message: 'Le prénom est requis' }]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      name="dateNaissance"
                      label="Date de naissance"
                    >
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                      name="statut"
                      label="Statut"
                      rules={[{ required: true, message: 'Le statut est requis' }]}
                    >
                      <Select>
                        <Select.Option value="Actif">Actif</Select.Option>
                        <Select.Option value="Inactif">Inactif</Select.Option>
                        <Select.Option value="En attente">En attente</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      name="adresse"
                      label="Adresse"
                    >
                      <Input.TextArea rows={2} />
                    </Form.Item>
                    <Form.Item
                      name="telephone"
                      label="Téléphone"
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                      <Button type="default" onClick={() => setStudentModalOpen(false)} style={{ marginRight: 8 }}>
                        Annuler
                      </Button>
                      <Button type="primary" htmlType="submit">
                        {editingStudent ? 'Modifier' : 'Créer'}
                      </Button>
                    </Form.Item>
                  </Form>
                </Modal>
              </>
            )}
            {selectedKey === 'pedagogy' && (
              <>
                {/* Tableau de bord personnalisé pour la pédagogie */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="Total Bulletins" 
                        value={pedagogyStats.bulletins.total} 
                        prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="Emplois du Temps" 
                        value={pedagogyStats.emplois.total} 
                        prefix={<CalendarOutlined style={{ color: '#52c41a' }} />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="Cahiers de Liaison" 
                        value={pedagogyStats.cahiers.total} 
                        prefix={<MessageOutlined style={{ color: '#faad14' }} />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="Moyenne Générale" 
                        value={pedagogyStats.bulletins.moyenneGenerale} 
                        precision={1}
                        prefix={<BookOutlined style={{ color: '#722ed1' }} />}
                      />
                    </Card>
                  </Col>
                </Row>



                {/* Informations sur l'école */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={24}>
                    <Card title="Institut Froebel LA TULIPE - Gestion Pédagogique" style={{ marginBottom: 16 }}>
                      <Row gutter={16}>
                        <Col span={6}>
                          <div style={{ textAlign: 'center' }}>
                            <BankOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
                            <div style={{ fontWeight: 'bold' }}>École</div>
                            <div style={{ color: '#666' }}>{pedagogyStats.schoolName}</div>
                          </div>
                        </Col>
                        <Col span={6}>
                          <div style={{ textAlign: 'center' }}>
                            <CalendarOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
                            <div style={{ fontWeight: 'bold' }}>Année Scolaire</div>
                            <div style={{ color: '#666' }}>{pedagogyStats.academicYear}</div>
                          </div>
                        </Col>
                        <Col span={6}>
                          <div style={{ textAlign: 'center' }}>
                            <FileTextOutlined style={{ fontSize: '24px', color: '#faad14', marginBottom: '8px' }} />
                            <div style={{ fontWeight: 'bold' }}>Bulletins</div>
                            <div style={{ color: '#666' }}>{pedagogyStats.bulletins.total} publiés</div>
                          </div>
                        </Col>
                        <Col span={6}>
                          <div style={{ textAlign: 'center' }}>
                            <MessageOutlined style={{ fontSize: '24px', color: '#722ed1', marginBottom: '8px' }} />
                            <div style={{ fontWeight: 'bold' }}>Cahiers</div>
                            <div style={{ color: '#666' }}>{pedagogyStats.cahiers.total} échangés</div>
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>

                <Tabs
                  defaultActiveKey="bulletins"
                  items={[
                    {
                      key: 'bulletins',
                      label: 'Bulletins',
                      children: (
                        <>
                          <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={12}>
                              <Input.Search
                                placeholder="Rechercher un bulletin (élève, classe, école)"
                                value={bulletinSearch}
                                onChange={e => setBulletinSearch(e.target.value)}
                                allowClear
                              />
                            </Col>
                            <Col span={12} style={{ textAlign: 'right' }}>
                              <Button type="primary" onClick={() => handleEditBulletin()} style={{ marginRight: 8 }}>
                                Nouveau Bulletin
                              </Button>
                              <Button type="primary" onClick={handleExportBulletinsExcel} loading={bulletinExporting}>
                                Exporter Excel
                              </Button>
                            </Col>
                          </Row>
                                                  <Table
                          columns={bulletinColumns}
                          dataSource={filteredBulletins}
                          rowKey="id"
                          pagination={{ pageSize: 8 }}
                          loading={loading}
                          scroll={{ x: 800 }}
                          size="small"
                        />
                        </>
                      )
                    },
                    {
                      key: 'emplois',
                      label: 'Emplois du temps',
                      children: (
                        <>
                          <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={12}>
                              <Input.Search
                                placeholder="Rechercher un emploi (classe, école, jour)"
                                value={emploiSearch}
                                onChange={e => setEmploiSearch(e.target.value)}
                                allowClear
                              />
                            </Col>
                            <Col span={12} style={{ textAlign: 'right' }}>
                              <Button type="primary" onClick={() => handleEditEmploi()} style={{ marginRight: 8 }}>
                                Nouvel Emploi
                              </Button>
                              <Button type="primary" onClick={handleExportEmploisExcel} loading={emploiExporting}>
                                Exporter Excel
                              </Button>
                            </Col>
                          </Row>
                          <Table
                            columns={emploiColumns}
                            dataSource={filteredEmplois}
                            rowKey="id"
                            pagination={{ pageSize: 8 }}
                            loading={loading}
                            scroll={{ x: 800 }}
                            size="small"
                          />
                        </>
                      )
                    },
                    {
                      key: 'cahiers',
                      label: 'Cahiers de liaison',
                      children: (
                        <>
                          <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={12}>
                              <Input.Search
                                placeholder="Rechercher un cahier (élève, classe, école)"
                                value={cahierSearch}
                                onChange={e => setCahierSearch(e.target.value)}
                                allowClear
                              />
                            </Col>
                            <Col span={12} style={{ textAlign: 'right' }}>
                              <Button type="primary" onClick={() => handleEditCahier()} style={{ marginRight: 8 }}>
                                Nouveau Cahier
                              </Button>
                              <Button type="primary" onClick={handleExportCahiersExcel} loading={cahierExporting}>
                                Exporter Excel
                              </Button>
                            </Col>
                          </Row>
                                                  <Table
                          columns={cahierColumns}
                          dataSource={filteredCahiers}
                          rowKey="id"
                          pagination={{ pageSize: 8 }}
                          loading={loading}
                          scroll={{ x: 800 }}
                          size="small"
                        />
                        </>
                      )
                    }
                  ]}
                />
              </>
            )}
            {selectedKey === 'communication' && (
              <>
                {/* Tableau de bord personnalisé pour la communication */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="Total Communications" 
                        value={communicationStats.general.totalCommunications} 
                        prefix={<MessageOutlined style={{ color: '#1890ff' }} />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="Annonces" 
                        value={communicationStats.annonces.total} 
                        prefix={<FileTextOutlined style={{ color: '#52c41a' }} />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="Messages" 
                        value={communicationStats.messages.total} 
                        prefix={<MessageOutlined style={{ color: '#faad14' }} />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="Notifications" 
                        value={communicationStats.notifications.total} 
                        prefix={<MessageOutlined style={{ color: '#722ed1' }} />}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* Statistiques détaillées */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={8}>
                    <Card title="Statistiques des Annonces" style={{ marginBottom: 16 }}>
                      <Row gutter={16}>
                        <Col span={12}>
                          <div style={{ textAlign: 'center' }}>
                            <Statistic 
                              title="Publiées" 
                              value={communicationStats.annonces.publiees} 
                              valueStyle={{ color: '#52c41a' }}
                            />
                          </div>
                        </Col>
                        <Col span={12}>
                          <div style={{ textAlign: 'center' }}>
                            <Statistic 
                              title="Priorité Haute" 
                              value={communicationStats.annonces.parPriorite.Haute} 
                              valueStyle={{ color: '#ff4d4f' }}
                            />
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card title="Statistiques des Messages" style={{ marginBottom: 16 }}>
                      <Row gutter={16}>
                        <Col span={12}>
                          <div style={{ textAlign: 'center' }}>
                            <Statistic 
                              title="Lus" 
                              value={communicationStats.messages.lus} 
                              valueStyle={{ color: '#52c41a' }}
                            />
                          </div>
                        </Col>
                        <Col span={12}>
                          <div style={{ textAlign: 'center' }}>
                            <Statistic 
                              title="Non lus" 
                              value={communicationStats.messages.nonLus} 
                              valueStyle={{ color: '#faad14' }}
                            />
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card title="Statistiques des Notifications" style={{ marginBottom: 16 }}>
                      <Row gutter={16}>
                        <Col span={12}>
                          <div style={{ textAlign: 'center' }}>
                            <Statistic 
                              title="Lues" 
                              value={communicationStats.notifications.lues} 
                              valueStyle={{ color: '#52c41a' }}
                            />
                          </div>
                        </Col>
                        <Col span={12}>
                          <div style={{ textAlign: 'center' }}>
                            <Statistic 
                              title="Non lues" 
                              value={communicationStats.notifications.nonLues} 
                              valueStyle={{ color: '#faad14' }}
                            />
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>

                {/* Informations générales */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={24}>
                    <Card title="Institut Froebel LA TULIPE - Gestion de la Communication" style={{ marginBottom: 16 }}>
                      <Row gutter={16}>
                        <Col span={6}>
                          <div style={{ textAlign: 'center' }}>
                            <MessageOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
                            <div style={{ fontWeight: 'bold' }}>Taux de Lecture</div>
                            <div style={{ color: '#666' }}>{communicationStats.general.tauxLecture}%</div>
                          </div>
                        </Col>
                        <Col span={6}>
                          <div style={{ textAlign: 'center' }}>
                            <CalendarOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
                            <div style={{ fontWeight: 'bold' }}>Communications ce mois</div>
                            <div style={{ color: '#666' }}>{communicationStats.general.communicationsCeMois}</div>
                          </div>
                        </Col>
                        <Col span={6}>
                          <div style={{ textAlign: 'center' }}>
                            <MessageOutlined style={{ fontSize: '24px', color: '#faad14', marginBottom: '8px' }} />
                            <div style={{ fontWeight: 'bold' }}>Communications urgentes</div>
                            <div style={{ color: '#666' }}>{communicationStats.general.communicationsUrgentes}</div>
                          </div>
                        </Col>
                        <Col span={6}>
                          <div style={{ textAlign: 'center' }}>
                            <MessageOutlined style={{ fontSize: '24px', color: '#722ed1', marginBottom: '8px' }} />
                            <div style={{ fontWeight: 'bold' }}>Moyenne réponse</div>
                            <div style={{ color: '#666' }}>{communicationStats.general.moyenneReponse}</div>
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>

                <Tabs
                  defaultActiveKey="annonces"
                  items={[
                    {
                      key: 'annonces',
                      label: 'Annonces',
                      children: (
                        <>
                          <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={12}>
                              <Input.Search
                                placeholder="Rechercher une annonce (titre, contenu, école, auteur)"
                                value={annonceSearch}
                                onChange={e => setAnnonceSearch(e.target.value)}
                                allowClear
                              />
                            </Col>
                            <Col span={12} style={{ textAlign: 'right' }}>
                              <Button type="primary" onClick={() => handleEditAnnonce()} style={{ marginRight: 8 }}>
                                Nouvelle Annonce
                              </Button>
                              <Button type="primary" onClick={handleExportAnnoncesExcel} loading={annonceExporting}>
                                Exporter Excel
                              </Button>
                            </Col>
                          </Row>
                          <Table
                            columns={annonceColumns}
                            dataSource={filteredAnnonces}
                            rowKey="id"
                            pagination={{ pageSize: 8 }}
                            loading={loading}
                            scroll={{ x: 800 }}
                            size="small"
                          />
                        </>
                      )
                    },
                  {
                    key: 'messages',
                    label: 'Messages',
                    children: (
                      <>
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                          <Col span={12}>
                            <Input.Search
                              placeholder="Rechercher un message (sujet, contenu, expéditeur, destinataire)"
                              value={messageSearch}
                              onChange={e => setMessageSearch(e.target.value)}
                              allowClear
                            />
                          </Col>
                          <Col span={12} style={{ textAlign: 'right' }}>
                            <Button type="primary" onClick={() => handleEditMessage()} style={{ marginRight: 8 }}>
                              Nouveau Message
                            </Button>
                            <Button type="primary" onClick={handleExportMessagesExcel} loading={messageExporting}>
                              Exporter Excel
                            </Button>
                          </Col>
                        </Row>
                        <Table
                          columns={messageColumns}
                          dataSource={filteredMessages}
                          rowKey="id"
                          pagination={{ pageSize: 8 }}
                          loading={loading}
                          scroll={{ x: 800 }}
                          size="small"
                        />
                      </>
                    )
                  },
                  {
                    key: 'notifications',
                    label: 'Notifications',
                    children: (
                      <>
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                          <Col span={12}>
                            <Input.Search
                              placeholder="Rechercher une notification (titre, contenu, type)"
                              value={notificationSearch}
                              onChange={e => setNotificationSearch(e.target.value)}
                              allowClear
                            />
                          </Col>
                          <Col span={12} style={{ textAlign: 'right' }}>
                            <Button type="primary" onClick={() => handleEditNotification()} style={{ marginRight: 8 }}>
                              Nouvelle Notification
                            </Button>
                            <Button type="primary" onClick={handleExportNotificationsExcel} loading={notificationExporting}>
                              Exporter Excel
                            </Button>
                          </Col>
                        </Row>
                        <Table
                          columns={notificationColumns}
                          dataSource={filteredNotifications}
                          rowKey="id"
                          pagination={{ pageSize: 8 }}
                          loading={loading}
                          scroll={{ x: 800 }}
                          size="small"
                        />
                      </>
                    )
                  }
                ]}
              />
              </>
            )}
            {selectedKey === 'activities' && (
              <>
                {/* Tableau de bord personnalisé pour les activités */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="Total Activités" 
                        value={activityStats.general.totalActivities} 
                        prefix={<CalendarOutlined style={{ color: '#1890ff' }} />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="Activités ce Mois" 
                        value={activityStats.general.activitiesCeMois} 
                        prefix={<ClockCircleOutlined style={{ color: '#52c41a' }} />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="Budget Total" 
                        value={activityStats.budget.total.toLocaleString()} 
                        suffix="Ar"
                        prefix={<DollarOutlined style={{ color: '#faad14' }} />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="Participants Total" 
                        value={activityStats.general.participantsTotal} 
                        prefix={<TeamOutlined style={{ color: '#722ed1' }} />}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* Statistiques détaillées par type et catégorie */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={8}>
                    <Card title="Activités par Type" size="small">
                      <List
                        size="small"
                        dataSource={Object.entries(activityStats.parType)}
                        renderItem={([type, count]) => (
                          <List.Item>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                              <span style={{ fontSize: '12px' }}>{type}</span>
                              <Tag color="blue">{count}</Tag>
                            </div>
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card title="Activités par Statut" size="small">
                      <List
                        size="small"
                        dataSource={Object.entries(activityStats.parStatut)}
                        renderItem={([statut, count]) => (
                          <List.Item>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                              <span style={{ fontSize: '12px' }}>{statut}</span>
                              <Tag color={
                                statut === 'Planifiée' ? 'blue' :
                                statut === 'En cours' ? 'orange' :
                                statut === 'Terminée' ? 'green' : 'red'
                              }>{count}</Tag>
                            </div>
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card title="Activités par Catégorie" size="small">
                      <List
                        size="small"
                        dataSource={Object.entries(activityStats.parCategorie)}
                        renderItem={([categorie, count]) => (
                          <List.Item>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                              <span style={{ fontSize: '12px' }}>{categorie}</span>
                              <Tag color="green">{count}</Tag>
                            </div>
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>
                </Row>

                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={12}>
                    <Input.Search
                      placeholder="Rechercher une activité (nom, description, classe, école, type)"
                      value={activitySearch}
                      onChange={e => setActivitySearch(e.target.value)}
                      allowClear
                    />
                  </Col>
                  <Col span={12} style={{ textAlign: 'right' }}>
                    <Button type="primary" onClick={() => handleEditActivity()} style={{ marginRight: 8 }}>
                      Nouvelle Activité
                    </Button>
                    <Button type="primary" onClick={handleExportActivitiesExcel} loading={activityExporting}>
                      Exporter Excel
                    </Button>
                  </Col>
                </Row>
                <div style={{ overflowX: 'auto' }}>
                  <Table
                    columns={activityColumns}
                    dataSource={filteredActivities}
                    rowKey="id"
                    pagination={{ pageSize: 8 }}
                    loading={loading}
                    scroll={{ x: 1200 }}
                    size="small"
                  />
                </div>
                <Drawer
                  title={selectedActivity ? `Activité - ${selectedActivity.nom}` : 'Détails Activité'}
                  placement="right"
                  width={500}
                  onClose={() => setActivityDrawerOpen(false)}
                  open={activityDrawerOpen}
                >
                  {selectedActivity ? (
                    <>
                      <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label="Nom">{selectedActivity.nom}</Descriptions.Item>
                        <Descriptions.Item label="Description">{selectedActivity.description}</Descriptions.Item>
                        <Descriptions.Item label="Type">
                          <Tag color={
                            selectedActivity.type === 'Sortie' ? '#1890ff' :
                            selectedActivity.type === 'Atelier' ? '#52c41a' :
                            selectedActivity.type === 'Compétition' ? '#faad14' :
                            selectedActivity.type === 'Projet' ? '#722ed1' :
                            selectedActivity.type === 'Événement' ? '#eb2f96' : '#666'
                          }>
                            {selectedActivity.type}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Catégorie">
                          <Tag color="green">{selectedActivity.categorie}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Classe">{selectedActivity.classe?.nom || '-'}</Descriptions.Item>
                        <Descriptions.Item label="École">{selectedActivity.ecole?.nom || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Lieu">{selectedActivity.lieu || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Responsable">{selectedActivity.responsable || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Date début">
                          {selectedActivity.dateDebut ? new Date(selectedActivity.dateDebut).toLocaleString() : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Date fin">
                          {selectedActivity.dateFin ? new Date(selectedActivity.dateFin).toLocaleString() : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Budget">
                          {selectedActivity.budget ? `${selectedActivity.budget.toLocaleString()} Ar` : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Nombre de participants">
                          {selectedActivity.nombreParticipants || '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Priorité">
                          <Tag color={
                            selectedActivity.priorite === 'Haute' ? 'red' :
                            selectedActivity.priorite === 'Normale' ? 'blue' : 'green'
                          }>
                            {selectedActivity.priorite}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Statut">
                          <Tag color={
                            selectedActivity.statut === 'Planifiée' ? 'blue' :
                            selectedActivity.statut === 'En cours' ? 'orange' :
                            selectedActivity.statut === 'Terminée' ? 'green' : 'red'
                          }>
                            {selectedActivity.statut}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Matières concernées">
                          {selectedActivity.matieres && selectedActivity.matieres.length > 0 ? (
                            <div>
                              {selectedActivity.matieres.map((matiere, index) => (
                                <Tag key={index} color="blue" style={{ marginBottom: '4px' }}>{matiere}</Tag>
                              ))}
                            </div>
                          ) : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Objectifs">
                          {selectedActivity.objectifs && selectedActivity.objectifs.length > 0 ? (
                            <ul style={{ margin: 0, paddingLeft: '16px' }}>
                              {selectedActivity.objectifs.map((objectif, index) => (
                                <li key={index} style={{ fontSize: '12px', marginBottom: '4px' }}>{objectif}</li>
                              ))}
                            </ul>
                          ) : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Matériel nécessaire">
                          {selectedActivity.materiel && selectedActivity.materiel.length > 0 ? (
                            <div>
                              {selectedActivity.materiel.map((item, index) => (
                                <Tag key={index} color="orange" style={{ marginBottom: '4px' }}>{item}</Tag>
                              ))}
                            </div>
                          ) : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Créée le">{new Date(selectedActivity.createdAt).toLocaleString()}</Descriptions.Item>
                        <Descriptions.Item label="Modifiée le">{new Date(selectedActivity.updatedAt).toLocaleString()}</Descriptions.Item>
                      </Descriptions>
                    </>
                  ) : <Spin />}
                </Drawer>
                <Modal
                  title={editingActivity ? 'Modifier l\'activité' : 'Nouvelle activité'}
                  open={activityModalOpen}
                  onCancel={() => setActivityModalOpen(false)}
                  footer={null}
                >
                  <Form form={activityForm} layout="vertical" onFinish={handleSaveActivity}>
                    <Form.Item name="nom" label="Nom" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                      <Input.TextArea rows={3} />
                    </Form.Item>
                    <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                      <Select>
                        <Select.Option value="Sortie">Sortie</Select.Option>
                        <Select.Option value="Atelier">Atelier</Select.Option>
                        <Select.Option value="Événement">Événement</Select.Option>
                        <Select.Option value="Projet">Projet</Select.Option>
                        <Select.Option value="Animation">Animation</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item name="dateDebut" label="Date début" rules={[{ required: true }]}>
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="dateFin" label="Date fin">
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="statut" label="Statut" rules={[{ required: true }]}>
                      <Select>
                        <Select.Option value="Planifiée">Planifiée</Select.Option>
                        <Select.Option value="En cours">En cours</Select.Option>
                        <Select.Option value="Terminée">Terminée</Select.Option>
                        <Select.Option value="Annulée">Annulée</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item name="lieu" label="Lieu">
                      <Input />
                    </Form.Item>
                    <Form.Item name="responsable" label="Responsable">
                      <Input />
                    </Form.Item>
                    <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                      <Button type="default" onClick={() => setActivityModalOpen(false)} style={{ marginRight: 8 }}>
                        Annuler
                      </Button>
                      <Button type="primary" htmlType="submit">
                        {editingActivity ? 'Modifier' : 'Créer'}
                      </Button>
                    </Form.Item>
                  </Form>
                </Modal>
              </>
            )}
            {selectedKey === 'payments' && (
              <PaymentsPage />
            )}
            {selectedKey === 'finances' && (
              <Tabs
                defaultActiveKey="payments"
                items={[
                  {
                    key: 'payments',
                    label: 'Paiements',
                    children: (
                      <>
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                          <Col span={12}>
                            <Input.Search
                              placeholder="Rechercher un paiement (élève, école, mode, statut)"
                              value={paymentSearch}
                              onChange={e => setPaymentSearch(e.target.value)}
                              allowClear
                            />
                          </Col>
                          <Col span={12} style={{ textAlign: 'right' }}>
                            <Button type="primary" onClick={() => handleEditPayment()} style={{ marginRight: 8 }}>
                              Nouveau Paiement
                            </Button>
                            <Button type="primary" onClick={handleExportPaymentsExcel} loading={paymentExporting}>
                              Exporter Excel
                            </Button>
                          </Col>
                        </Row>
                        <Table
                          columns={paymentColumns}
                          dataSource={filteredPayments}
                          rowKey="id"
                          pagination={{ pageSize: 8 }}
                          loading={loading}
                        />
                      </>
                    )
                  },
                  {
                    key: 'invoices',
                    label: 'Factures',
                    children: (
                      <>
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                          <Col span={12}>
                            <Input.Search
                              placeholder="Rechercher une facture (numéro, élève, école, statut)"
                              value={invoiceSearch}
                              onChange={e => setInvoiceSearch(e.target.value)}
                              allowClear
                            />
                          </Col>
                          <Col span={12} style={{ textAlign: 'right' }}>
                            <Button type="primary" onClick={() => handleEditInvoice()} style={{ marginRight: 8 }}>
                              Nouvelle Facture
                            </Button>
                            <Button type="primary" onClick={handleExportInvoicesExcel} loading={invoiceExporting}>
                              Exporter Excel
                            </Button>
                          </Col>
                        </Row>
                        <Table
                          columns={invoiceColumns}
                          dataSource={filteredInvoices}
                          rowKey="id"
                          pagination={{ pageSize: 8 }}
                          loading={loading}
                        />
                      </>
                    )
                  },
                  {
                    key: 'reports',
                    label: 'Rapports financiers',
                    children: (
                      <>
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                          <Col span={12}>
                            <Input.Search
                              placeholder="Rechercher un rapport (titre, école, type)"
                              value={reportSearch}
                              onChange={e => setReportSearch(e.target.value)}
                              allowClear
                            />
                          </Col>
                          <Col span={12} style={{ textAlign: 'right' }}>
                            <Button type="primary" onClick={() => handleEditReport()} style={{ marginRight: 8 }}>
                              Nouveau Rapport
                            </Button>
                            <Button type="primary" onClick={handleExportReportsExcel} loading={reportExporting}>
                              Exporter Excel
                            </Button>
                          </Col>
                        </Row>
                        <Table
                          columns={reportColumns}
                          dataSource={filteredReports}
                          rowKey="id"
                          pagination={{ pageSize: 8 }}
                          loading={loading}
                        />
                      </>
                    )
                  }
                ]}
              />
            )}

            {/* Drawers pour Pédagogie */}
            <Drawer
              title={selectedBulletin ? `Bulletin - ${selectedBulletin.eleve?.prenom} ${selectedBulletin.eleve?.nom}` : 'Détails Bulletin'}
              placement="right"
              width={600}
              onClose={() => setBulletinDrawerOpen(false)}
              open={bulletinDrawerOpen}
            >
              {selectedBulletin ? (
                <>
                  <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
                    <Descriptions.Item label="Élève">
                      {selectedBulletin.eleve ? `${selectedBulletin.eleve.prenom} ${selectedBulletin.eleve.nom}` : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Classe">{selectedBulletin.classe?.nom || '-'}</Descriptions.Item>
                    <Descriptions.Item label="École">{selectedBulletin.ecole?.nom || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Trimestre">
                      <Tag color="#1890ff">{selectedBulletin.trimestre}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Année scolaire">{selectedBulletin.anneeScolaire}</Descriptions.Item>
                    <Descriptions.Item label="Moyenne générale">
                      <Tag color={selectedBulletin.moyenneGenerale >= 16 ? 'green' : selectedBulletin.moyenneGenerale >= 14 ? 'orange' : 'red'}>
                        {selectedBulletin.moyenneGenerale}/20
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Rang">
                      {selectedBulletin.rang}ème sur {selectedBulletin.effectif}
                    </Descriptions.Item>
                    <Descriptions.Item label="Statut">
                      <Tag color={selectedBulletin.statut === 'Publié' ? 'green' : 'orange'}>{selectedBulletin.statut}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Date création">{new Date(selectedBulletin.dateCreation).toLocaleDateString()}</Descriptions.Item>
                  </Descriptions>

                  <Card title="Notes par matière" style={{ marginBottom: 16 }}>
                    <Row gutter={16}>
                      {Object.entries(selectedBulletin.moyennes).map(([matiere, note]) => (
                        <Col span={12} key={matiere} style={{ marginBottom: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold' }}>{matiere}:</span>
                            <Tag color={note >= 16 ? 'green' : note >= 14 ? 'orange' : 'red'}>
                              {note}/20
                            </Tag>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </Card>

                  <Card title="Appréciation générale">
                    <p>{selectedBulletin.appreciation}</p>
                  </Card>

                  <div style={{ marginTop: 16, textAlign: 'center' }}>
                    <Button type="primary" onClick={() => window.open(selectedBulletin.pdfUrl, '_blank')}>
                      Télécharger PDF
                    </Button>
                  </div>
                </>
              ) : <Spin />}
            </Drawer>

            <Drawer
              title={selectedEmploi ? `Emploi du temps - ${selectedEmploi.classe?.nom}` : 'Détails Emploi du temps'}
              placement="right"
              width={500}
              onClose={() => setEmploiDrawerOpen(false)}
              open={emploiDrawerOpen}
            >
              {selectedEmploi ? (
                <>
                  <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
                    <Descriptions.Item label="Classe">
                      <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{selectedEmploi.classe?.nom || '-'}</div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Année scolaire">
                      <Tag color="#1890ff" style={{ fontSize: '14px' }}>{selectedEmploi.anneeScolaire}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Responsable">
                      <div style={{ fontWeight: 'bold' }}>
                        {selectedEmploi.responsable ? `${selectedEmploi.responsable.prenom} ${selectedEmploi.responsable.nom}` : '-'}
                      </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Description">
                      <div style={{ fontSize: '14px' }}>{selectedEmploi.description}</div>
                    </Descriptions.Item>
                  </Descriptions>

                  <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <Button 
                      type="primary" 
                      size="large"
                      onClick={() => window.open(selectedEmploi.documentPdfUrl, '_blank')}
                      icon={<FileTextOutlined />}
                      style={{ fontSize: '16px', padding: '8px 24px' }}
                    >
                      Voir l'emploi du temps en PDF
                    </Button>
                  </div>
                </>
              ) : <Spin />}
            </Drawer>

            <Drawer
              title={selectedCahier ? `Cahier de liaison - ${selectedCahier.eleve?.prenom} ${selectedCahier.eleve?.nom}` : 'Détails Cahier de liaison'}
              placement="right"
              width={600}
              onClose={() => setCahierDrawerOpen(false)}
              open={cahierDrawerOpen}
            >
              {selectedCahier ? (
                <>
                  <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
                    <Descriptions.Item label="Élève">
                      {selectedCahier.eleve ? `${selectedCahier.eleve.prenom} ${selectedCahier.eleve.nom}` : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Classe">{selectedCahier.classe?.nom || '-'}</Descriptions.Item>
                    <Descriptions.Item label="École">{selectedCahier.ecole?.nom || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Type">
                      <Tag color={
                        selectedCahier.type === 'Communication' ? '#1890ff' :
                        selectedCahier.type === 'Absence' ? '#faad14' :
                        selectedCahier.type === 'Félicitations' ? '#52c41a' :
                        selectedCahier.type === 'Information' ? '#722ed1' :
                        selectedCahier.type === 'Orientation' ? '#eb2f96' : '#666'
                      }>
                        {selectedCahier.type}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Sujet">{selectedCahier.sujet}</Descriptions.Item>
                    <Descriptions.Item label="Auteur">
                      {selectedCahier.auteur ? `${selectedCahier.auteur.prenom} ${selectedCahier.auteur.nom}` : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Destinataire">
                      {selectedCahier.destinataire ? `${selectedCahier.destinataire.prenom} ${selectedCahier.destinataire.nom}` : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Statut">
                      <Tag color={selectedCahier.statut === 'Lu' ? 'green' : 'orange'}>{selectedCahier.statut}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Date">{new Date(selectedCahier.date).toLocaleDateString()}</Descriptions.Item>
                  </Descriptions>

                  <Card title="Contenu du message">
                    <p style={{ whiteSpace: 'pre-wrap' }}>{selectedCahier.contenu}</p>
                  </Card>

                  <div style={{ marginTop: 16, textAlign: 'center' }}>
                    <Button type="primary" onClick={() => window.open(selectedCahier.pdfUrl, '_blank')}>
                      Télécharger PDF
                    </Button>
                  </div>
                </>
              ) : <Spin />}
            </Drawer>

            {/* Drawers et Modals pour Finances */}
            <Drawer
              title={selectedPayment ? `Paiement - ${selectedPayment.eleve?.prenom} ${selectedPayment.eleve?.nom}` : 'Détails Paiement'}
              placement="right"
              width={500}
              onClose={() => setPaymentDrawerOpen(false)}
              open={paymentDrawerOpen}
            >
              {selectedPayment ? (
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="Élève">{selectedPayment.eleve ? `${selectedPayment.eleve.prenom} ${selectedPayment.eleve.nom}` : '-'}</Descriptions.Item>
                  <Descriptions.Item label="École">{selectedPayment.ecole?.nom || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Montant">{selectedPayment.montant} €</Descriptions.Item>
                  <Descriptions.Item label="Mode paiement">{selectedPayment.modePaiement}</Descriptions.Item>
                  <Descriptions.Item label="Date paiement">
                    {selectedPayment.datePaiement ? new Date(selectedPayment.datePaiement).toLocaleDateString() : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Statut">
                    <Tag color={
                      selectedPayment.statut === 'Payé' ? 'green' :
                      selectedPayment.statut === 'En attente' ? 'orange' :
                      selectedPayment.statut === 'Annulé' ? 'red' : 'gray'
                    }>
                      {selectedPayment.statut}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Référence">{selectedPayment.reference || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Créé le">{new Date(selectedPayment.createdAt).toLocaleString()}</Descriptions.Item>
                </Descriptions>
              ) : <Spin />}
            </Drawer>

            <Drawer
              title={selectedInvoice ? `Facture - ${selectedInvoice.numero}` : 'Détails Facture'}
              placement="right"
              width={500}
              onClose={() => setInvoiceDrawerOpen(false)}
              open={invoiceDrawerOpen}
            >
              {selectedInvoice ? (
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="Numéro">{selectedInvoice.numero}</Descriptions.Item>
                  <Descriptions.Item label="Élève">{selectedInvoice.eleve ? `${selectedInvoice.eleve.prenom} ${selectedInvoice.eleve.nom}` : '-'}</Descriptions.Item>
                  <Descriptions.Item label="École">{selectedInvoice.ecole?.nom || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Montant HT">{selectedInvoice.montantHT} €</Descriptions.Item>
                  <Descriptions.Item label="Montant TTC">{selectedInvoice.montantTTC} €</Descriptions.Item>
                  <Descriptions.Item label="Date émission">{new Date(selectedInvoice.dateEmission).toLocaleDateString()}</Descriptions.Item>
                  <Descriptions.Item label="Statut">
                    <Tag color={
                      selectedInvoice.statut === 'Payée' ? 'green' :
                      selectedInvoice.statut === 'En attente' ? 'orange' :
                      selectedInvoice.statut === 'En retard' ? 'red' : 'gray'
                    }>
                      {selectedInvoice.statut}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Créée le">{new Date(selectedInvoice.createdAt).toLocaleString()}</Descriptions.Item>
                </Descriptions>
              ) : <Spin />}
            </Drawer>

            <Drawer
              title={selectedReport ? `Rapport - ${selectedReport.titre}` : 'Détails Rapport'}
              placement="right"
              width={500}
              onClose={() => setReportDrawerOpen(false)}
              open={reportDrawerOpen}
            >
              {selectedReport ? (
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="Titre">{selectedReport.titre}</Descriptions.Item>
                  <Descriptions.Item label="Type">{selectedReport.type}</Descriptions.Item>
                  <Descriptions.Item label="École">{selectedReport.ecole?.nom || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Période">{selectedReport.periode}</Descriptions.Item>
                  <Descriptions.Item label="Statut">
                    <Tag color={
                      selectedReport.statut === 'Généré' ? 'green' :
                      selectedReport.statut === 'En cours' ? 'orange' : 'red'
                    }>
                      {selectedReport.statut}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Créé le">{new Date(selectedReport.createdAt).toLocaleString()}</Descriptions.Item>
                </Descriptions>
              ) : <Spin />}
            </Drawer>

            {/* Modals pour Finances */}
            <Modal
              title={editingPayment ? 'Modifier le paiement' : 'Nouveau paiement'}
              open={paymentModalOpen}
              onCancel={() => setPaymentModalOpen(false)}
              footer={null}
            >
              <Form form={paymentForm} layout="vertical" onFinish={handleSavePayment}>
                <Form.Item name="montant" label="Montant (€)" rules={[{ required: true }]}>
                  <Input type="number" step="0.01" />
                </Form.Item>
                <Form.Item name="modePaiement" label="Mode de paiement" rules={[{ required: true }]}>
                  <Select>
                    <Select.Option value="Carte bancaire">Carte bancaire</Select.Option>
                    <Select.Option value="Espèces">Espèces</Select.Option>
                    <Select.Option value="Chèque">Chèque</Select.Option>
                    <Select.Option value="Virement">Virement</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item name="datePaiement" label="Date de paiement" rules={[{ required: true }]}>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="statut" label="Statut" rules={[{ required: true }]}>
                  <Select>
                    <Select.Option value="Payé">Payé</Select.Option>
                    <Select.Option value="En attente">En attente</Select.Option>
                    <Select.Option value="Annulé">Annulé</Select.Option>
                    <Select.Option value="Remboursé">Remboursé</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item name="reference" label="Référence">
                  <Input />
                </Form.Item>
                <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                  <Button type="default" onClick={() => setPaymentModalOpen(false)} style={{ marginRight: 8 }}>
                    Annuler
                  </Button>
                  <Button type="primary" htmlType="submit">
                    {editingPayment ? 'Modifier' : 'Créer'}
                  </Button>
                </Form.Item>
              </Form>
            </Modal>

            <Modal
              title={editingInvoice ? 'Modifier la facture' : 'Nouvelle facture'}
              open={invoiceModalOpen}
              onCancel={() => setInvoiceModalOpen(false)}
              footer={null}
            >
              <Form form={invoiceForm} layout="vertical" onFinish={handleSaveInvoice}>
                <Form.Item name="numero" label="Numéro" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="montantHT" label="Montant HT (€)" rules={[{ required: true }]}>
                  <Input type="number" step="0.01" />
                </Form.Item>
                <Form.Item name="montantTTC" label="Montant TTC (€)" rules={[{ required: true }]}>
                  <Input type="number" step="0.01" />
                </Form.Item>
                <Form.Item name="dateEmission" label="Date d'émission" rules={[{ required: true }]}>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="statut" label="Statut" rules={[{ required: true }]}>
                  <Select>
                    <Select.Option value="Payée">Payée</Select.Option>
                    <Select.Option value="En attente">En attente</Select.Option>
                    <Select.Option value="En retard">En retard</Select.Option>
                    <Select.Option value="Annulée">Annulée</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                  <Button type="default" onClick={() => setInvoiceModalOpen(false)} style={{ marginRight: 8 }}>
                    Annuler
                  </Button>
                  <Button type="primary" htmlType="submit">
                    {editingInvoice ? 'Modifier' : 'Créer'}
                  </Button>
                </Form.Item>
              </Form>
            </Modal>

            <Modal
              title={editingReport ? 'Modifier le rapport' : 'Nouveau rapport'}
              open={reportModalOpen}
              onCancel={() => setReportModalOpen(false)}
              footer={null}
            >
              <Form form={reportForm} layout="vertical" onFinish={handleSaveReport}>
                <Form.Item name="titre" label="Titre" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                  <Select>
                    <Select.Option value="Mensuel">Mensuel</Select.Option>
                    <Select.Option value="Trimestriel">Trimestriel</Select.Option>
                    <Select.Option value="Annuel">Annuel</Select.Option>
                    <Select.Option value="Spécial">Spécial</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item name="periode" label="Période" rules={[{ required: true }]}>
                  <Input placeholder="ex: Janvier 2024" />
                </Form.Item>
                <Form.Item name="statut" label="Statut" rules={[{ required: true }]}>
                  <Select>
                    <Select.Option value="Généré">Généré</Select.Option>
                    <Select.Option value="En cours">En cours</Select.Option>
                    <Select.Option value="Erreur">Erreur</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                  <Button type="default" onClick={() => setReportModalOpen(false)} style={{ marginRight: 8 }}>
                    Annuler
                  </Button>
                  <Button type="primary" htmlType="submit">
                    {editingReport ? 'Modifier' : 'Créer'}
                  </Button>
                </Form.Item>
              </Form>
            </Modal>
            {/* Placeholders pour les autres sections */}
            {selectedKey !== 'dashboard' && selectedKey !== 'schools' && selectedKey !== 'users' && selectedKey !== 'classes' && selectedKey !== 'students' && selectedKey !== 'pedagogy' && selectedKey !== 'communication' && selectedKey !== 'activities' && selectedKey !== 'finances' && (
              <Alert message={`Section "${menuItems.find(item => item.key === selectedKey)?.label}" à implémenter...`} type="info" showIcon />
            )}
            {error && <Alert message={error} type="error" showIcon style={{ marginTop: 16 }} />}
            {selectedKey === 'personnel' && <PersonnelPage />}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default SuperAdminDashboard; 