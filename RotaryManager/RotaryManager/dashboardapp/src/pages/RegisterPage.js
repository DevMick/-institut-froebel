import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, getClubs } from '../api/authService';
import { Spin, Alert, Form, Select, Input, Button } from 'antd';
import { BankOutlined, UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, UserAddOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const { Option } = Select;

const RegisterPage = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

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

  const handleSubmit = async (values) => {
    console.log('Valeurs du formulaire:', values);
    setError(null);
    setMessage(null);
    setSubmitting(true);
    
    // Mapping des champs pour l'API
    const payload = {
      clubId: values.clubId,
      LastName: values.nom,
      FirstName: values.prenom,
      Email: values.email,
      Password: values.motDePasse,
      PhoneNumber: values.telephone
    };
    try {
      const result = await register(payload);
      
      if (result.success || result.Success) {
        setMessage('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        form.resetFields();
      } else {
        if (result.errors) {
          const errorMessages = Object.entries(result.errors)
            .map(([field, messages]) => {
              const messageArray = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${messageArray.join(', ')}`;
            })
            .join('\n');
          setError(errorMessages);
        } else {
          setError(result.message || result.Message || 'Erreur lors de l\'inscription.');
        }
      }
    } catch (e) {
      if (e.response?.data?.errors) {
        const errorMessages = Object.entries(e.response.data.errors)
          .map(([field, messages]) => {
            const messageArray = Array.isArray(messages) ? messages : [messages];
            return `${field}: ${messageArray.join(', ')}`;
          })
          .join('\n');
        setError(errorMessages);
      } else {
        setError('Erreur réseau ou serveur.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-8">
      <div className="w-full max-w-xl">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="https://rotaryclubabidjandeuxplateaux.org/wp-content/uploads/2023/09/Logo_II_Plateaux_Abidjan_v2.png" 
              alt="Rotary Club Abidjan Deux Plateaux"
              className="w-50 h-10 object-contain"
            />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Inscription
          </h2>
          <p className="text-gray-600">
            Créez votre compte Rotary Manager
          </p>
        </div>

        {/* Carte d'inscription */}
        <div className="bg-white shadow-xl border-0 rounded-xl p-8">
          {loading ? (
            <div className="text-center py-12">
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
                  message="Erreurs de validation"
                  description={
                    <div>
                      {error.split('\n').map((line, index) => (
                        <div key={index} className="text-sm">{line}</div>
                      ))}
                    </div>
                  }
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

              {/* Formulaire */}
              <Form
                form={form}
                onFinish={handleSubmit}
                layout="vertical"
                requiredMark={false}
                className="modern-form"
              >
                {/* Club */}
                <Form.Item
                  name="clubId"
                  label="Club"
                  rules={[{ required: true, message: 'Veuillez sélectionner votre club' }]}
                >
                  <Select
                    placeholder="Sélectionnez votre club"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    onChange={value => {
                      console.log('Club sélectionné:', value);
                      form.setFieldsValue({ clubId: value });
                    }}
                  >
                    {clubs.map(club => (
                      <Select.Option key={club.id} value={club.id}>
                        {club.nom || club.name || club.libelle || 'Nom inconnu'}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* Nom et Prénom */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Form.Item
                    name="nom"
                    rules={[{ required: true, message: 'Veuillez saisir votre nom' }]}
                  >
                    <div className="form-group">
                      <label className="form-label">
                        <span className="required-asterisk">* </span>
                        Nom
                      </label>
                      <Input
                        placeholder="Votre nom"
                        size="large"
                        prefix={<UserOutlined style={{ color: '#3b82f6', marginRight: 8 }} />}
                        style={{ 
                          width: '100%',
                          borderRadius: '8px'
                        }}
                        className="modern-input"
                        disabled={submitting}
                      />
                    </div>
                  </Form.Item>

                  <Form.Item
                    name="prenom"
                    rules={[{ required: true, message: 'Veuillez saisir votre prénom' }]}
                  >
                    <div className="form-group">
                      <label className="form-label">
                        <span className="required-asterisk">* </span>
                        Prénom
                      </label>
                      <Input
                        placeholder="Votre prénom"
                        size="large"
                        prefix={<UserOutlined style={{ color: '#3b82f6', marginRight: 8 }} />}
                        style={{ 
                          width: '100%',
                          borderRadius: '8px'
                        }}
                        className="modern-input"
                        disabled={submitting}
                      />
                    </div>
                  </Form.Item>
                </div>

                {/* Email */}
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Veuillez saisir votre email' },
                    { type: 'email', message: 'Format d\'email invalide' }
                  ]}
                >
                  <div className="form-group">
                    <label className="form-label">
                      <span className="required-asterisk">* </span>
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="votre.email@exemple.com"
                      size="large"
                      prefix={<MailOutlined style={{ color: '#3b82f6', marginRight: 8 }} />}
                      style={{ 
                        width: '100%',
                        borderRadius: '8px'
                      }}
                      className="modern-input"
                      disabled={submitting}
                    />
                  </div>
                </Form.Item>

                {/* Téléphone */}
                <Form.Item
                  name="telephone"
                  rules={[{ required: true, message: 'Veuillez saisir votre téléphone' }]}
                >
                  <div className="form-group">
                    <label className="form-label">
                      <span className="required-asterisk">* </span>
                      Téléphone
                    </label>
                    <Input
                      type="tel"
                      placeholder="+225 XX XX XX XX"
                      size="large"
                      prefix={<PhoneOutlined style={{ color: '#3b82f6', marginRight: 8 }} />}
                      style={{ 
                        width: '100%',
                        borderRadius: '8px'
                      }}
                      className="modern-input"
                      disabled={submitting}
                    />
                  </div>
                </Form.Item>

                {/* Mots de passe */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Form.Item
                    name="motDePasse"
                    rules={[
                      { required: true, message: 'Veuillez saisir votre mot de passe' },
                      { min: 8, message: 'Le mot de passe doit contenir au moins 8 caractères' },
                      { 
                        pattern: /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/,
                        message: 'Le mot de passe doit contenir au moins un chiffre et un caractère spécial'
                      }
                    ]}
                  >
                    <div className="form-group">
                      <label className="form-label">
                        <span className="required-asterisk">* </span>
                        Mot de passe
                      </label>
                      <Input.Password
                        placeholder="••••••••••"
                        size="large"
                        prefix={<LockOutlined style={{ color: '#3b82f6', marginRight: 8 }} />}
                        style={{ 
                          width: '100%',
                          borderRadius: '8px'
                        }}
                        className="modern-input"
                        disabled={submitting}
                      />
                     
                    </div>
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    dependencies={['motDePasse']}
                    rules={[
                      { required: true, message: 'Veuillez confirmer votre mot de passe' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('motDePasse') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Les mots de passe ne correspondent pas'));
                        },
                      }),
                    ]}
                  >
                    <div className="form-group">
                      <label className="form-label">
                        <span className="required-asterisk">* </span>
                        Confirmer le mot de passe
                      </label>
                      <Input.Password
                        placeholder="••••••••••"
                        size="large"
                        prefix={<LockOutlined style={{ color: '#3b82f6', marginRight: 8 }} />}
                        style={{ 
                          width: '100%',
                          borderRadius: '8px'
                        }}
                        className="modern-input"
                        disabled={submitting}
                      />
                    </div>
                  </Form.Item>
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-4 mt-6">
                  <Form.Item className="flex-1 mb-0">
                    <Button
                      type="default"
                      size="large"
                      icon={<ArrowLeftOutlined />}
                      onClick={handleGoBack}
                      disabled={submitting}
                      style={{
                        width: '100%',
                        height: '48px',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '500',
                        border: '1px solid #d1d5db',
                        color: '#6b7280',
                        background: 'white',
                        cursor: 'pointer'
                      }}
                      className="back-button"
                    >
                      Retour
                    </Button>
                  </Form.Item>

                  <Form.Item className="flex-1 mb-0">
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      loading={submitting}
                      icon={<UserAddOutlined />}
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
                      S'inscrire
                    </Button>
                  </Form.Item>
                </div>
              </Form>
            </div>
          )}
        </div>

       
      </div>

      <style jsx>{`
        .modern-form .form-label {
          display: block;
          margin-bottom: 0.5rem;
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
        
        .back-button:hover {
          border-color: #9ca3af !important;
          color: #374151 !important;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
        }
        
        .back-button:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;