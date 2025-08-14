import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, DatePicker, Checkbox, Card, message, Spin } from 'antd';
import { UserOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;

const PreInscriptionForm = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);

  // Charger l'école par défaut (ID: 2)
  useEffect(() => {
    const defaultSchool = {
      id: 2,
      nom: "Institut Froebel LA TULIPE"
    };
    setSelectedSchool(defaultSchool);
  }, []);

  // Charger dynamiquement les classes de l'école 2 depuis l'API
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/ecoles/2/classes');
        if (response.ok) {
          const classesData = await response.json();
          setClasses(classesData);
        } else {
          setClasses([]);
        }
      } catch (error) {
        setClasses([]);
      }
    };
    fetchClasses();
  }, []);

  const onFinish = async (values) => {
    if (!selectedSchool) {
      message.error('Veuillez sélectionner une école');
      return;
    }

    setLoading(true);
    try {
      // Préparer les données pour l'API
      const requestData = {
        parent: {
          nom: values.parent.nom,
          prenom: values.parent.prenom,
          email: values.parent.email,
          telephone: values.parent.telephone,
          adresse: values.parent.adresse,
          sexe: values.parent.sexe,
          dateNaissance: values.parent.dateNaissance ? new Date(values.parent.dateNaissance).toISOString() : null,
          motDePasse: values.parent.motDePasse
        },
        enfants: values.enfants.map(enfant => ({
          nom: enfant.nom,
          prenom: enfant.prenom,
          dateNaissance: enfant.dateNaissance ? new Date(enfant.dateNaissance).toISOString() : null,
          sexe: enfant.sexe,
          classeId: enfant.classeId
        }))
      };

      // Appel à l'API
      const response = await fetch(`/api/ecoles/${selectedSchool.id}/preinscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const result = await response.json();
        message.success('Pré-inscription effectuée avec succès !');
        form.resetFields();
        console.log('Pré-inscription réussie:', result);

        // Appeler la fonction de callback si fournie
        if (onSuccess) {
          onSuccess();
        }
      } else {
        const errorData = await response.json();
        message.error(errorData.message || 'Erreur lors de la pré-inscription');
      }
    } catch (error) {
      console.error('Erreur:', error);
      message.error('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-emerald-700 mb-2">
            Pré-inscription en ligne
          </h2>
          <p className="text-gray-600">
            Remplissez ce formulaire pour pré-inscrire votre/vos enfant(s)
          </p>
        </div>

        {selectedSchool && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
            <p className="text-emerald-700 font-semibold">
              École sélectionnée : {selectedSchool.nom}
            </p>
          </div>
        )}

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
          initialValues={{
            enfants: [{}]
          }}
        >
          {/* Informations du parent */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-emerald-700 mb-4 flex items-center gap-2">
              <UserOutlined />
              Informations du parent
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name={['parent', 'nom']}
                label="Nom"
                rules={[{ required: true, message: 'Le nom est obligatoire' }]}
              >
                <Input placeholder="Nom de famille" />
              </Form.Item>

              <Form.Item
                name={['parent', 'prenom']}
                label="Prénom"
                rules={[{ required: true, message: 'Le prénom est obligatoire' }]}
              >
                <Input placeholder="Prénom" />
              </Form.Item>

              <Form.Item
                name={['parent', 'email']}
                label="Email"
                rules={[
                  { required: true, message: 'L\'email est obligatoire' },
                  { type: 'email', message: 'Email invalide' }
                ]}
              >
                <Input placeholder="email@exemple.com" />
              </Form.Item>

              <Form.Item
                name={['parent', 'telephone']}
                label="Téléphone"
              >
                <Input placeholder="+225 07 12 34 56 78" />
              </Form.Item>

              <Form.Item
                name={['parent', 'adresse']}
                label="Adresse"
                className="md:col-span-2"
              >
                <Input.TextArea rows={2} placeholder="Adresse complète" />
              </Form.Item>

              <Form.Item
                name={['parent', 'sexe']}
                label="Sexe"
                rules={[{ required: true, message: 'Le sexe est obligatoire' }]}
              >
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400">
                  <option value="">Sélectionner</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </Form.Item>

              <Form.Item
                name={['parent', 'dateNaissance']}
                label="Date de naissance"
              >
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                />
              </Form.Item>

          <Form.Item
                name={['parent', 'motDePasse']}
                label="Mot de passe"
                rules={[
                  { required: true, message: 'Le mot de passe est obligatoire' },
                  { min: 6, message: 'Le mot de passe doit contenir au moins 6 caractères' }
                ]}
                className="md:col-span-2"
              >
                <Input.Password placeholder="Mot de passe" />
          </Form.Item>
            </div>
          </div>

          {/* Informations des enfants */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-emerald-700 mb-4 flex items-center gap-2">
              <UserOutlined />
              Informations des enfants
            </h3>

            <Form.List name="enfants">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card key={key} className="mb-4 border-emerald-200">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-medium text-emerald-600">
                          Enfant {key + 1}
                        </h4>
                        {fields.length > 1 && (
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
                          >
                            Supprimer
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                          {...restField}
                          name={[name, 'nom']}
                          label="Nom"
                          rules={[{ required: true, message: 'Le nom est obligatoire' }]}
                        >
                          <Input placeholder="Nom de famille" />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, 'prenom']}
                          label="Prénom"
                          rules={[{ required: true, message: 'Le prénom est obligatoire' }]}
                        >
                          <Input placeholder="Prénom" />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, 'dateNaissance']}
                          label="Date de naissance"
                          rules={[{ required: true, message: 'La date de naissance est obligatoire' }]}
                        >
                          <input 
                            type="date" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                          />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, 'sexe']}
                          label="Sexe"
                          rules={[{ required: true, message: 'Le sexe est obligatoire' }]}
                        >
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400">
                            <option value="">Sélectionner</option>
                            <option value="M">Masculin</option>
                            <option value="F">Féminin</option>
                          </select>
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, 'classeId']}
                          label="Classe souhaitée"
                          rules={[{ required: true, message: 'La classe est obligatoire' }]}
                        >
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400">
                            <option value="">Sélectionner une classe</option>
                            {classes.map(classe => (
                              <option key={classe.id} value={classe.id}>
                                {classe.nom}
                              </option>
                            ))}
                          </select>
                        </Form.Item>


            </div>
                    </Card>
                  ))}

                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                    className="mb-4"
                  >
                    Ajouter un enfant
                  </Button>
          </>
        )}
            </Form.List>
        </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
              icon={<UserOutlined />}
            >
              {loading ? 'Envoi en cours...' : 'Soumettre la pré-inscription'}
            </Button>
          </Form.Item>
      </Form>
      </Card>
    </div>
  );
};

export default PreInscriptionForm; 