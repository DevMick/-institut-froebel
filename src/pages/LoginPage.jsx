import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import authApi from '../services/authApi';
import Logo from '../assets/images/Logo.png';
import { Form, Input, Button, Typography, Alert, Select, Spin, Card, Switch } from 'antd';
import { HomeOutlined, MailOutlined, LockOutlined, LoginOutlined, DownOutlined } from '@ant-design/icons';
import '../styles/LoginPage.css';

// Import du composant de test (optionnel)
const LoginTest = React.lazy(() => import('../components/LoginTest'));

const { Title, Text } = Typography;
const { Option } = Select;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [schools, setSchools] = useState([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [schoolsError, setSchoolsError] = useState('');
  const [form] = Form.useForm();

  // États pour le select personnalisé
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const dropdownRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/espace-parents';

  const [apiDebug, setApiDebug] = useState(null);
  const [showDevTools, setShowDevTools] = useState(false);

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        const roles = userData.roles || [];
        
        // Rediriger selon le rôle
        if (roles.includes("SuperAdmin")) {
          navigate("/superadmin", { replace: true });
        } else if (roles.includes("Admin")) {
          navigate("/admin", { replace: true });
        } else if (roles.includes("Teacher")) {
          navigate("/teacher", { replace: true });
        } else if (roles.includes("Parent")) {
          navigate("/espace-parents", { replace: true });
        }
      } catch (err) {
        console.error('Erreur lors de la vérification de l\'utilisateur connecté:', err);
        // Nettoyer les données corrompues
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, [navigate]);

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchSchools = async () => {
      setSchoolsLoading(true);
      try {
        const response = await authApi.getSchools();
        console.log('Réponse écoles:', response);
        if (Array.isArray(response)) {
          setSchools(response);
        } else if (response && Array.isArray(response.data)) {
          setSchools(response.data);
        } else {
          console.error('Format de réponse inattendu pour les écoles:', response);
          setSchools([]);
        }
      } catch (e) {
        console.error('Erreur lors de la récupération des écoles:', e);
        setSchools([]);
      } finally {
        setSchoolsLoading(false);
      }
    };
    fetchSchools();
  }, []);

  const onFinish = async (values) => {
    // Redirection immédiate vers l'interface super admin
    navigate("/superadmin", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-8 login-container">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src={Logo}
              alt="Institut Froebel"
              className="w-16 h-16 object-contain"
            />
          </div>
          <Title level={2} className="text-gray-800 mb-2">
            Connexion à votre espace
          </Title>
          <Text className="text-gray-600">
            Accédez à votre espace personnel Institut Froebel
          </Text>
        </div>

        {/* Carte de connexion */}
        <Card
          className="shadow-xl border-0 rounded-xl login-card"
          styles={{ body: { padding: '2rem' } }}
        >
          {schoolsLoading ? (
            <div className="text-center py-8">
              <Spin size="large" />
              <div className="mt-4 text-gray-600">
                Chargement des écoles...
              </div>
            </div>
          ) : (
            <div>
              {/* Messages d'erreur */}
              {error && (
                <Alert
                  message={error}
                  type="error"
                  showIcon
                  className="mb-6 rounded-lg"
                />
              )}

              {/* Messages de succès */}
              {success && (
                <Alert
                  message={success}
                  type="success"
                  showIcon
                  className="mb-6 rounded-lg"
                />
              )}

              {/* Formulaire de connexion moderne */}
              <Form
                form={form}
                name="login"
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
                requiredMark={false}
                className="modern-form"
              >
                <Form.Item
                  name="schoolId"
                  rules={[{ required: true, message: 'Veuillez sélectionner votre école' }]}
                >
                  <div className="form-group">
                    <label className="form-label">
                      <span className="required-asterisk">* </span>
                      École
                    </label>
                    <div className="select-with-icon-html">
                      <HomeOutlined className="select-icon-html" />
                      <select
                        className="modern-select-html"
                        value={selectedSchool ? String(selectedSchool.id) : ''}
                        onChange={e => {
                          const school = schools.find(s => String(s.id) === e.target.value);
                          setSelectedSchool(school);
                          form.setFieldsValue({ schoolId: e.target.value });
                        }}
                        required
                        disabled={schoolsLoading}
                      >
                        <option value="" disabled>Sélectionnez votre école</option>
                          {schools.map(school => (
                          <option key={school.id} value={school.id}>{school.nom}</option>
                          ))}
                      </select>
                    </div>
                  </div>
                </Form.Item>
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Veuillez saisir votre email' },
                    { type: 'email', message: 'Veuillez saisir un email valide' }
                  ]}
                >
                  <div className="form-group">
                    <label className="form-label">
                      <span className="required-asterisk">* </span>
                      Adresse email
                    </label>
                    <Input
                      placeholder="Saisissez votre adresse email"
                      size="large"
                      prefix={<MailOutlined style={{ color: '#3b82f6', marginRight: 8 }} />}
                      style={{
                        width: '100%',
                        borderRadius: '8px'
                      }}
                      className="modern-input"
                      autoComplete="email"
                    />
                  </div>
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: 'Veuillez saisir votre mot de passe' }]}
                >
                  <div className="form-group">
                    <label className="form-label">
                      <span className="required-asterisk">* </span>
                      Mot de passe
                    </label>
                    <Input.Password
                      placeholder="Saisissez votre mot de passe"
                      size="large"
                      prefix={<LockOutlined style={{ color: '#3b82f6', marginRight: 8 }} />}
                      style={{
                        width: '100%',
                        borderRadius: '8px'
                      }}
                      className="modern-input"
                      autoComplete="current-password"
                    />
                  </div>
                </Form.Item>

                <Form.Item className="mb-0">
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading}
                    disabled={schoolsLoading}
                    icon={<LoginOutlined />}
                    style={{
                      width: '100%',
                      height: '48px',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '500',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                      cursor: 'pointer'
                    }}
                    className="modern-button"
                  >
                    Se connecter
                  </Button>
                </Form.Item>
              </Form>
              {/* Affichage debug de la réponse API login */}
              {apiDebug && (
                <pre style={{ background: '#f3f4f6', color: '#1e293b', fontSize: 12, padding: 12, borderRadius: 8, marginTop: 16 }}>
                  {JSON.stringify(apiDebug, null, 2)}
                </pre>
              )}
              
              {/* Bouton de test pour simuler la connexion */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Text className="text-sm text-gray-500 mb-2 block">
                  Test avec les données de l'API :
                </Text>
                <div className="flex gap-2">
                  <Button
                    type="dashed"
                    size="small"
                    onClick={() => {
                      const testSchool = schools.find(s => s.id === 2);
                      setSelectedSchool(testSchool);
                      form.setFieldsValue({
                        schoolId: '2',
                        email: 'adjoua.kouassi@email.com',
                        password: 'Adjoua2024!'
                      });
                    }}
                  >
                    Remplir formulaire test
                  </Button>
                  <Button
                    type="text"
                    size="small"
                    onClick={() => {
                      setSelectedSchool(null);
                      form.resetFields();
                      setError('');
                      setApiDebug(null);
                    }}
                  >
                    Effacer
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Outils de développement */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Switch 
                checked={showDevTools} 
                onChange={setShowDevTools}
                size="small"
              />
              <Text className="text-sm text-gray-500">
                Afficher les outils de développement
              </Text>
            </div>
            
            {showDevTools && (
              <React.Suspense fallback={<div>Chargement des outils de test...</div>}>
                <LoginTest 
                  onTestLogin={async (testData) => {
                    try {
                      const response = await authApi.login(
                        testData.schoolId, 
                        testData.email, 
                        testData.password
                      );
                      return response;
                    } catch (error) {
                      return {
                        success: false,
                        message: error.message || 'Erreur de test'
                      };
                    }
                  }}
                />
              </React.Suspense>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .modern-form .form-label {
          display: block;
          margin-bottom: 0.25rem;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .modern-form .required-asterisk {
          color: #ef4444;
        }

        .select-with-icon {
          position: relative;
        }

        .select-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 1;
          color: #3b82f6;
          font-size: 16px;
          pointer-events: none;
        }

        .select-with-icon .modern-select .ant-select-selector {
          padding-left: 40px !important;
        }

        .select-with-icon .modern-select .ant-select-selection-search {
          margin-left: 0 !important;
        }

        .select-with-icon .modern-select .ant-select-selection-placeholder {
          margin-left: 0 !important;
        }

        .modern-select .ant-select-selector,
        .modern-input {
          border: 1px solid #e5e7eb !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
          transition: all 0.2s ease !important;
        }

        .modern-select .ant-select-selector:hover,
        .modern-input:hover {
          border-color: #3b82f6 !important;
          box-shadow: 0 1px 3px rgba(59, 130, 246, 0.1) !important;
        }

        .modern-select .ant-select-focused .ant-select-selector,
        .modern-input:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }

        /* Styles pour le select HTML moderne */
        .select-with-icon-html {
          position: relative;
        }

        .select-icon-html {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 1;
          color: #3b82f6;
          font-size: 16px;
          pointer-events: none;
        }

        .modern-select-html {
          width: 100%;
          height: 40px;
          padding: 8px 12px 8px 40px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          background-color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          appearance: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 12px center;
          background-repeat: no-repeat;
          background-size: 16px;
          padding-right: 40px;
        }

        .modern-select-html:hover {
          border-color: #3b82f6;
          box-shadow: 0 1px 3px rgba(59, 130, 246, 0.1);
        }

        .modern-select-html:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .modern-select-html option {
          padding: 8px 12px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
