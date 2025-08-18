import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ecolesApi from '../services/ecolesApi';
import authApi from '../services/authApi';
import Logo from '../assets/images/Logo.png';
import { Form, Input, Button, Typography, Alert, Spin, Card } from 'antd';
import { HomeOutlined, MailOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import '../styles/LoginPage.css';

const { Title, Text } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [schools, setSchools] = useState([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [schoolsError, setSchoolsError] = useState('');
  const [form] = Form.useForm();

  // État pour l'école sélectionnée
  const [selectedSchool, setSelectedSchool] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/espace-parents';

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {tu 
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



  useEffect(() => {
    const fetchSchools = async () => {
      setSchoolsLoading(true);
      setSchoolsError('');
      try {
        console.log('Récupération des écoles depuis le nouvel endpoint...');
        const response = await ecolesApi.getEcoles(1, 20); // page=1, pageSize=20
        console.log('Réponse écoles:', response);

        if (Array.isArray(response)) {
          setSchools(response);
          console.log('Écoles définies (array):', response);
          console.log(`${response.length} écoles chargées avec succès`);
        } else if (response && Array.isArray(response.data)) {
          setSchools(response.data);
          console.log('Écoles définies (response.data):', response.data);
          console.log(`${response.data.length} écoles chargées avec succès`);
        } else {
          console.error('Format de réponse inattendu pour les écoles:', response);
          setSchools([]);
          setSchoolsError('Format de données inattendu');
        }
      } catch (e) {
        console.error('Erreur lors de la récupération des écoles:', e);
        setSchoolsError('Erreur lors du chargement des écoles depuis l\'API');
        setSchools([]);
      } finally {
        setSchoolsLoading(false);
      }
    };
    fetchSchools();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Tentative de connexion avec les valeurs:', values);

      // Appeler l'API de connexion avec les bons paramètres
      const response = await authApi.login(
        values.schoolId,  // ecoleId
        values.email,     // email
        values.password   // password
      );

      console.log('Réponse de connexion:', response);

      if (response && response.success) {
        // Connexion réussie
        setSuccess('Connexion réussie !');

        // Extraire les données de la réponse API
        const userData = response.data?.user;
        const token = response.data?.token;

        console.log('Données utilisateur extraites:', userData);
        console.log('Token extrait:', token);

        if (userData && token) {
          // Utiliser la fonction login du contexte d'authentification
          login(userData, token);

          // Rediriger selon le rôle de l'utilisateur
          const roles = userData.roles || [];
          console.log('Rôles utilisateur:', roles);

          if (roles.includes("SuperAdmin")) {
            console.log('Redirection vers SuperAdmin');
            navigate("/superadmin", { replace: true });
          } else if (roles.includes("Admin")) {
            console.log('Redirection vers SuperAdmin (Admin)');
            navigate("/superadmin", { replace: true });
          } else if (roles.includes("Teacher")) {
            console.log('Redirection vers Teacher');
            navigate("/teacher", { replace: true });
          } else if (roles.includes("Parent")) {
            console.log('Redirection vers Espace Parents');
            navigate("/espace-parents", { replace: true });
          } else {
            console.log('Rôle non reconnu, redirection par défaut vers Espace Parents');
            navigate("/espace-parents", { replace: true });
          }
        } else {
          setError('Données utilisateur ou token manquants dans la réponse.');
        }
      } else {
        // Connexion échouée
        setError(response?.message || 'Identifiants incorrects. Veuillez vérifier votre email et mot de passe.');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-8 login-container">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex items-center">
              <img
                src={Logo}
                alt="Institut Froebel"
                className="w-16 h-16 object-contain"
              />
              <span className="ml-3 text-2xl font-bold text-green-700">INSTITUT FROEBEL</span>
            </div>
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
          ) : schoolsError ? (
            <div className="text-center py-8">
              <Alert
                message="Erreur de chargement"
                description={schoolsError}
                type="error"
                showIcon
                className="mb-4"
              />
              <Button
                onClick={() => window.location.reload()}
                type="primary"
              >
                Recharger la page
              </Button>
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
                        disabled={schoolsLoading}
                        onChange={(e) => {
                          const value = e.target.value;
                          console.log('École sélectionnée:', value);
                          const school = schools.find(s => String(s.id) === String(value));
                          setSelectedSchool(school);
                          console.log('École trouvée:', school);
                          // Mettre à jour la valeur du formulaire
                          form.setFieldsValue({ schoolId: value });
                        }}
                      >
                        <option value="">Sélectionnez votre école</option>
                        {schools.length === 0 ? (
                          <option disabled value="">
                            Aucune école disponible
                          </option>
                        ) : (
                          schools.map(school => (
                            <option key={school.id} value={school.id}>
                              {school.nom}
                            </option>
                          ))
                        )}
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

            </div>
          )}
        </Card>


      </div>


    </div>
  );
};

export default LoginPage;
