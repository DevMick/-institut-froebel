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
  Alert,
  Collapse
} from 'antd';
import {
  SaveOutlined,
  ReloadOutlined,
  EditOutlined,
  UndoOutlined,
  CheckOutlined,
  BookOutlined,
  SmileOutlined,
  UserOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import {
  fetchCyclesData,
  saveCyclesData,
  resetCyclesData
} from '../services/cyclesApi';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

const CyclesAdminPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Icônes pour chaque cycle
  const cycleIcons = {
    'creche-garderie': <SmileOutlined />,
    'maternelle': <UserOutlined />,
    'primaire': <BookOutlined />,
    'secondaire': <TrophyOutlined />
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchCyclesData();
      if (result.success) {
        setData(result.data);
        
        // Préparer les valeurs pour le formulaire
        const formValues = {
          mainTitle: result.data.mainTitle,
          ctaTitle: result.data.ctaSection.title,
          ctaDescription: result.data.ctaSection.description,
          ctaButtonText: result.data.ctaSection.buttonText,
          ...result.data.cycles.reduce((acc, cycle) => {
            acc[`cycle_${cycle.id}_titre`] = cycle.titre;
            acc[`cycle_${cycle.id}_description`] = cycle.description;
            acc[`cycle_${cycle.id}_points`] = cycle.points.join('\n');
            acc[`cycle_${cycle.id}_age`] = cycle.age;
            return acc;
          }, {})
        };
        
        form.setFieldsValue(formValues);
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
        cycles: data.cycles.map(cycle => ({
          ...cycle,
          titre: values[`cycle_${cycle.id}_titre`],
          description: values[`cycle_${cycle.id}_description`],
          points: values[`cycle_${cycle.id}_points`]
            .split('\n')
            .map(p => p.trim())
            .filter(p => p.length > 0),
          age: values[`cycle_${cycle.id}_age`]
        })),
        ctaSection: {
          title: values.ctaTitle,
          description: values.ctaDescription,
          buttonText: values.ctaButtonText
        }
      };

      const result = await saveCyclesData(updatedData);
      if (result.success) {
        message.success('Données sauvegardées avec succès !');
        setData(updatedData);
        setHasChanges(false);
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
      const result = await resetCyclesData();
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
          Gestion du Contenu - Nos Cycles
        </Title>
        <Text style={{ color: '#666' }}>
          Modifiez les textes et contenus de la page Nos Cycles Éducatifs
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
              placeholder="Ex: Nos Cycles Éducatifs"
              size="large"
            />
          </Form.Item>
        </Card>

        {/* Cycles */}
        <Title level={3} style={{ marginBottom: '16px' }}>Cycles Éducatifs</Title>
        
        <Collapse defaultActiveKey={['0']} style={{ marginBottom: '24px' }}>
          {data?.cycles?.map((cycle, index) => (
            <Panel
              header={
                <Space>
                  {cycleIcons[cycle.id]}
                  <span>{cycle.titre}</span>
                  <Tag color="blue">{cycle.age}</Tag>
                </Space>
              }
              key={index}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Form.Item
                    name={`cycle_${cycle.id}_titre`}
                    label="Titre du cycle"
                  >
                    <Input placeholder="Titre du cycle" />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={12}>
                  <Form.Item
                    name={`cycle_${cycle.id}_age`}
                    label="Tranche d'âge"
                  >
                    <Input placeholder="Ex: 0-3 ans" />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    name={`cycle_${cycle.id}_description`}
                    label="Description"
                  >
                    <TextArea
                      rows={4}
                      placeholder="Description du cycle"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    name={`cycle_${cycle.id}_points`}
                    label="Points clés (un par ligne)"
                  >
                    <TextArea
                      rows={4}
                      placeholder="Point clé 1&#10;Point clé 2&#10;Point clé 3"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Panel>
          ))}
        </Collapse>

        {/* Section CTA */}
        <Card title="Section d'Appel à l'Action" style={{ marginBottom: '24px' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Form.Item
                name="ctaTitle"
                label="Titre de la section"
              >
                <Input placeholder="Ex: Prêt à rejoindre notre famille éducative ?" />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item
                name="ctaButtonText"
                label="Texte du bouton"
              >
                <Input placeholder="Ex: Nous contacter" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="ctaDescription"
                label="Description"
              >
                <TextArea
                  rows={3}
                  placeholder="Description de l'appel à l'action"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
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

export default CyclesAdminPage;
