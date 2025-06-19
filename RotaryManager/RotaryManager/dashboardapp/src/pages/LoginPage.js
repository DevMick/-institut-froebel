import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Spin, Alert, Typography, Form, Select, Input, Button } from 'antd';
import { HomeOutlined, MailOutlined, LockOutlined, LoginOutlined, UserAddOutlined } from '@ant-design/icons';
import { getClubs, login } from '../api/authService';
import { getCurrentProfile } from '../api/memberService';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

const LoginPage = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const data = await getClubs();
        setClubs(data);
      } catch (e) {
        setError('Erreur lors du chargement des clubs.');
      } finally {
        setLoading(false);
      }
    };
    fetchClubs();
  }, []);

  const handleLogin = async (values) => {
    setError(null);
    setMessage(null);
    setLoginLoading(true);
    
    try {
      const result = await login(values);
      if (result.success || result.Success) {
        const token = result.token || result.accessToken;
        if (!token) {
          setError('Token d\'authentification manquant');
          return;
        }
        // Récupérer le profil complet du membre après login
        let profile = null;
        try {
          // Stocker le token d'abord pour que l'appel soit authentifié
          localStorage.setItem('token', token);
          profile = await getCurrentProfile();
          
          // S'assurer que le profil contient les informations du club
          if (profile && !profile.clubId) {
            // Si le clubId n'est pas dans le profil, essayer de le récupérer du token
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            profile.clubId = tokenData.ClubId;
          }
          
          // Stocker le profil complet dans localStorage
          localStorage.setItem('user', JSON.stringify(profile));
        } catch (e) {
          setError("Impossible de récupérer le profil utilisateur après connexion.");
          setLoginLoading(false);
          return;
        }
        if (!profile) {
          setError("Profil utilisateur introuvable.");
          setLoginLoading(false);
          return;
        }
        // Utiliser le contexte d'authentification avec le profil complet
        authLogin(profile, token);
        setMessage('Connexion réussie !');
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.message || result.Message || 'Erreur lors de la connexion.');
      }
    } catch (e) {
      setError('Erreur réseau ou serveur.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleGoToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="https://rotaryclubabidjandeuxplateaux.org/wp-content/uploads/2023/09/Logo_II_Plateaux_Abidjan_v2.png" 
              alt="Rotary Club Abidjan Deux Plateaux"
              className="w-50 h-10 object-contain"
            />
          </div>
          <Title level={2} className="text-gray-800 mb-2">
            Connexion
          </Title>
          <Text className="text-gray-600">
            Accédez à votre espace Rotary Manager
          </Text>
        </div>

        {/* Carte de connexion */}
        <Card 
          className="shadow-xl border-0 rounded-xl"
          bodyStyle={{ padding: '2rem' }}
        >
          {loading ? (
            <div className="text-center py-8">
              <Spin size="large" />
              <div className="mt-4 text-gray-600">
                Chargement des clubs...
              </div>
            </div>
          ) : (
            <div>
              {/* Messages d'erreur et de succès */}
              {error && (
                <Alert
                  message={error}
                  type="error"
                  showIcon
                  className="mb-6 rounded-lg"
                />
              )}
              
              {message && (
                <Alert
                  message={message}
                  type="success"
                  showIcon
                  className="mb-6 rounded-lg"
                />
              )}

              {/* Formulaire de connexion moderne */}
              <Form
                form={form}
                onFinish={handleLogin}
                layout="vertical"
                requiredMark={false}
                className="modern-form"
              >
                <Form.Item
                  name="clubId"
                  rules={[{ required: true, message: 'Veuillez sélectionner votre club' }]}
                >
                  <div className="form-group">
                    <label className="form-label">
                      <span className="required-asterisk">* </span>
                      Club
                    </label>
                    <div className="select-with-icon">
                      <HomeOutlined className="select-icon" />
                      <Select
                        placeholder="Sélectionnez votre club"
                        size="large"
                        style={{ 
                          width: '100%', 
                          cursor: 'pointer',
                          borderRadius: '8px'
                        }}
                        className="modern-select"
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        allowClear
                        onChange={value => {
                          console.log('Club sélectionné:', value);
                          form.setFieldsValue({ clubId: value });
                        }}
                      >
                        {clubs.map(club => (
                          <Option key={club.id} value={club.id}>
                            {club.nom || club.name || club.libelle || 'Nom inconnu'}
                          </Option>
                        ))}
                      </Select>
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
                      Email
                    </label>
                    <Input
                      placeholder="Saisissez votre email"
                      size="large"
                      prefix={<MailOutlined style={{ color: '#3b82f6', marginRight: 8 }} />}
                      style={{ 
                        width: '100%',
                        borderRadius: '8px'
                      }}
                      className="modern-input"
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
                    />
                  </div>
                </Form.Item>

                <Form.Item className="mb-0">
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loginLoading}
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

                {/* Lien d'inscription */}
                <div className="text-center mt-6">
                  <span className="text-sm text-gray-600">
                    Pas encore membre ?{' '}
                  </span>
                  <button
                    type="button"
                    onClick={handleGoToRegister}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer border-none bg-transparent underline hover:no-underline transition-all duration-200"
                  >
                    Créer un compte
                  </button>
                </div>
              </Form>
            </div>
          )}
        </Card>

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
        
        .modern-button:hover {
          background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%) !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4) !important;
        }
        
        .modern-button:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

export default LoginPage;