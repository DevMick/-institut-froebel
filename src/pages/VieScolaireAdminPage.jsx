import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  message,
  Spin,
  Divider,
  Row,
  Col,
  Tag,
  Popconfirm,
  Alert
} from 'antd';
import {
  SaveOutlined,
  ReloadOutlined,
  EditOutlined,
  UndoOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import {
  fetchVieScolaireData,
  saveVieScolaireData,
  resetVieScolaireData
} from '../services/vieScolaireApi';

const { Title, Text } = Typography;
const { TextArea } = Input;

const VieScolaireAdminPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Charger les données au montage du composant
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchVieScolaireData();
      if (result.success) {
        setData(result.data);
        form.setFieldsValue({
          mainTitle: result.data.mainTitle,
          ...result.data.sections.reduce((acc, section) => {
            acc[`section_${section.id}_title`] = section.title;
            acc[`section_${section.id}_description`] = section.description;
            acc[`section_${section.id}_features`] = section.features.join('\n');
            return acc;
          }, {})
        });
        setHasChanges(false);
      } else {
        message.error('Erreur lors du chargement des données');
      }
    } catch (error) {
      message.error('Erreur lors du chargement des données');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = form.getFieldsValue();
      setLoading(true);

      // Construire les données à sauvegarder
      const updatedData = {
        mainTitle: values.mainTitle,
        sections: data.sections.map(section => ({
          ...section,
          title: values[`section_${section.id}_title`],
          description: values[`section_${section.id}_description`],
          features: values[`section_${section.id}_features`]
            .split('\n')
            .map(f => f.trim())
            .filter(f => f.length > 0)
        }))
      };

      const result = await saveVieScolaireData(updatedData);
      if (result.success) {
        message.success('Données sauvegardées avec succès !');
        setData(updatedData);
        setHasChanges(false);
        setEditingSection(null);
      } else {
        message.error('Erreur lors de la sauvegarde : ' + result.error);
      }
    } catch (error) {
      message.error('Veuillez vérifier les champs obligatoires');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      const result = await resetVieScolaireData();
      if (result.success) {
        message.success('Données réinitialisées aux valeurs par défaut');
        await loadData();
      } else {
        message.error('Erreur lors de la réinitialisation');
      }
    } catch (error) {
      message.error('Erreur lors de la réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = () => {
    setHasChanges(true);
  };

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* En-tête */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ marginBottom: '8px' }}>
          Gestion du Contenu - Vie Scolaire
        </Title>
        <Text style={{ color: '#666' }}>
          Modifiez les textes et contenus de la page Vie Scolaire
        </Text>
      </div>

      {/* Alerte pour les changements non sauvegardés */}
      {hasChanges && (
        <Alert
          message="Modifications non sauvegardées"
          description="Vous avez des modifications non sauvegardées. N'oubliez pas de cliquer sur 'Sauvegarder' pour les conserver."
          type="warning"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      {/* Boutons d'action */}
      <Card style={{ marginBottom: '24px' }}>
        <Space size="middle">
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={loading}
            disabled={!hasChanges}
          >
            Sauvegarder
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadData}
            loading={loading}
          >
            Recharger
          </Button>
          <Popconfirm
            title="Réinitialiser aux valeurs par défaut"
            description="Cette action supprimera toutes vos modifications. Êtes-vous sûr ?"
            onConfirm={handleReset}
            okText="Oui"
            cancelText="Non"
          >
            <Button
              danger
              icon={<UndoOutlined />}
              loading={loading}
            >
              Réinitialiser
            </Button>
          </Popconfirm>
        </Space>
      </Card>

      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleFormChange}
      >
        {/* Titre principal */}
        <Card title="Titre Principal" style={{ marginBottom: '24px' }}>
          <Form.Item
            name="mainTitle"
            label="Titre de la page"
          >
            <Input
              placeholder="Ex: Vie Scolaire"
              size="large"
            />
          </Form.Item>
        </Card>

        {/* Sections */}
        <Title level={3} style={{ marginBottom: '16px' }}>Sections</Title>
        
        {data?.sections?.map((section, index) => (
          <Card
            key={section.id}
            title={
              <Space>
                <span>Section {index + 1}: {section.title}</span>
                <Tag color="blue">{section.id}</Tag>
              </Space>
            }
            style={{ marginBottom: '24px' }}
            extra={
              <Button
                type="text"
                icon={editingSection === section.id ? <CheckOutlined /> : <EditOutlined />}
                onClick={() => setEditingSection(editingSection === section.id ? null : section.id)}
              >
                {editingSection === section.id ? 'Terminer' : 'Modifier'}
              </Button>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Form.Item
                  name={`section_${section.id}_title`}
                  label="Titre de la section"
                >
                  <Input placeholder="Titre de la section" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item
                  name={`section_${section.id}_description`}
                  label="Description"
                >
                  <TextArea
                    rows={4}
                    placeholder="Description de la section"
                  />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name={`section_${section.id}_features`}
                  label="Caractéristiques (une par ligne)"
                >
                  <TextArea
                    rows={3}
                    placeholder="Caractéristique 1&#10;Caractéristique 2&#10;Caractéristique 3"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        ))}
      </Form>

      {/* Bouton de sauvegarde fixe en bas */}
      {hasChanges && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000
        }}>
          <Button
            type="primary"
            size="large"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={loading}
            style={{
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              borderRadius: '8px'
            }}
          >
            Sauvegarder les modifications
          </Button>
        </div>
      )}
    </div>
  );
};

export default VieScolaireAdminPage;
