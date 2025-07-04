import React, { useState } from 'react';
import { Row, Col, Card, Statistic, Table, Button, Input, Tag, Space, Drawer, Descriptions, Modal, Form, Select, Tabs, Divider } from 'antd';
import { 
  TeamOutlined, 
  UserOutlined, 
  BookOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  PlusOutlined,
  CrownOutlined,
  ReadOutlined
} from '@ant-design/icons';
import { staticPersonnel, personnelStats } from '../data/staticPersonnel';

const { TabPane } = Tabs;

// Colonnes pour les administrateurs
const adminColumns = [
  { 
    title: 'Nom', 
    dataIndex: 'nom', 
    key: 'nom',
    width: 120,
    render: (nom, record) => (
      <div>
        <div style={{ fontWeight: 'bold' }}>{record.prenom} {nom}</div>
        <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
      </div>
    )
  },
  { 
    title: 'Poste', 
    dataIndex: 'poste', 
    key: 'poste',
    width: 150,
    render: (poste) => <Tag color="orange" style={{ fontWeight: 'bold' }}>{poste}</Tag>
  },
  { 
    title: 'Téléphone', 
    dataIndex: 'telephone', 
    key: 'telephone',
    width: 130
  },
  { 
    title: 'Date d\'embauche', 
    dataIndex: 'dateEmbauche', 
    key: 'dateEmbauche',
    width: 120,
    render: (date) => new Date(date).toLocaleDateString()
  },
  { 
    title: 'Statut', 
    dataIndex: 'statut', 
    key: 'statut',
    width: 90,
    render: (statut) => <Tag color={statut === 'Actif' ? 'green' : 'red'}>{statut}</Tag>
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 120,
    render: (_, record) => (
      <Space size="small">
        <Button type="link" size="small" onClick={() => record.onDetails(record)}>Détails</Button>
        <Button type="link" size="small" onClick={() => record.onEdit(record)}>Modifier</Button>
      </Space>
    )
  }
];

// Colonnes pour les professeurs
const profColumns = [
  { 
    title: 'Nom', 
    dataIndex: 'nom', 
    key: 'nom',
    width: 120,
    render: (nom, record) => (
      <div>
        <div style={{ fontWeight: 'bold' }}>{record.prenom} {nom}</div>
        <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
      </div>
    )
  },
  { 
    title: 'Matières', 
    dataIndex: 'matieres', 
    key: 'matieres',
    width: 150,
    render: (matieres) => (
      <div>
        {matieres.map((matiere, index) => (
          <Tag key={index} color="blue" style={{ marginBottom: 2 }}>{matiere}</Tag>
        ))}
      </div>
    )
  },
  { 
    title: 'Classes', 
    dataIndex: 'classes', 
    key: 'classes',
    width: 150,
    render: (classes) => (
      <div>
        {classes.map((classe, index) => (
          <Tag key={index} color="green" style={{ marginBottom: 2 }}>{classe}</Tag>
        ))}
      </div>
    )
  },
  { 
    title: 'Niveau', 
    dataIndex: 'niveau', 
    key: 'niveau',
    width: 180,
    render: (niveau) => <Tag color="purple">{niveau}</Tag>
  },
  { 
    title: 'Expérience', 
    dataIndex: 'experience', 
    key: 'experience',
    width: 100
  },
  { 
    title: 'Statut', 
    dataIndex: 'statut', 
    key: 'statut',
    width: 90,
    render: (statut) => <Tag color={statut === 'Actif' ? 'green' : 'red'}>{statut}</Tag>
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 120,
    render: (_, record) => (
      <Space size="small">
        <Button type="link" size="small" onClick={() => record.onDetails(record)}>Détails</Button>
        <Button type="link" size="small" onClick={() => record.onEdit(record)}>Modifier</Button>
      </Space>
    )
  }
];



export default function PersonnelPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('1');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState(null);
  const [form] = Form.useForm();

  // Ajout des handlers sur chaque ligne pour les actions
  const adminsWithHandlers = staticPersonnel.administrateurs.map(a => ({
    ...a,
    onDetails: (rec) => {
      setSelectedPersonnel({ ...rec, type: 'admin' });
      setDrawerOpen(true);
    },
    onEdit: (rec) => {
      setEditingPersonnel({ ...rec, type: 'admin' });
      setModalOpen(true);
      form.setFieldsValue({
        ...rec,
        dateEmbauche: rec.dateEmbauche ? new Date(rec.dateEmbauche) : null
      });
    }
  }));

  const profsWithHandlers = staticPersonnel.professeurs.map(p => ({
    ...p,
    onDetails: (rec) => {
      setSelectedPersonnel({ ...rec, type: 'prof' });
      setDrawerOpen(true);
    },
    onEdit: (rec) => {
      setEditingPersonnel({ ...rec, type: 'prof' });
      setModalOpen(true);
      form.setFieldsValue({
        ...rec,
        dateEmbauche: rec.dateEmbauche ? new Date(rec.dateEmbauche) : null
      });
    }
  }));

  // Filtrage des données
  const filteredAdmins = adminsWithHandlers.filter(a =>
    a.nom.toLowerCase().includes(search.toLowerCase()) ||
    a.prenom.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    a.poste.toLowerCase().includes(search.toLowerCase())
  );

  const filteredProfs = profsWithHandlers.filter(p =>
    p.nom.toLowerCase().includes(search.toLowerCase()) ||
    p.prenom.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    p.matieres.some(m => m.toLowerCase().includes(search.toLowerCase())) ||
    p.classes.some(c => c.toLowerCase().includes(search.toLowerCase()))
  );



  return (
    <div>
      {/* Statistiques */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Total Personnel" 
              value={personnelStats.general.totalPersonnel} 
              prefix={<TeamOutlined style={{ color: '#1890ff' }} />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Administrateurs" 
              value={personnelStats.administrateurs.total} 
              prefix={<CrownOutlined style={{ color: '#faad14' }} />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Professeurs" 
              value={personnelStats.professeurs.total} 
              prefix={<ReadOutlined style={{ color: '#52c41a' }} />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Personnel Actif" 
              value={personnelStats.general.personnelActif} 
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} 
            />
          </Card>
        </Col>
      </Row>

      {/* Onglets */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: 16 }}>
        <TabPane tab="Administrateurs" key="1">
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={12}>
              <Input.Search
                placeholder="Rechercher un administrateur (nom, email, poste)"
                value={search}
                onChange={e => setSearch(e.target.value)}
                allowClear
              />
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => { setModalOpen(true); setEditingPersonnel(null); form.resetFields(); }}>
                Nouvel Administrateur
              </Button>
            </Col>
          </Row>
          <div style={{ overflowX: 'auto' }}>
            <Table
              columns={adminColumns}
              dataSource={filteredAdmins}
              rowKey="id"
              pagination={{ pageSize: 8 }}
              scroll={{ x: 800 }}
              size="small"
            />
          </div>
        </TabPane>

        <TabPane tab="Professeurs" key="2">
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={12}>
              <Input.Search
                placeholder="Rechercher un professeur (nom, matières, classes)"
                value={search}
                onChange={e => setSearch(e.target.value)}
                allowClear
              />
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => { setModalOpen(true); setEditingPersonnel(null); form.resetFields(); }}>
                Nouveau Professeur
              </Button>
            </Col>
          </Row>
          <div style={{ overflowX: 'auto' }}>
            <Table
              columns={profColumns}
              dataSource={filteredProfs}
              rowKey="id"
              pagination={{ pageSize: 8 }}
              scroll={{ x: 1000 }}
              size="small"
            />
          </div>
        </TabPane>


      </Tabs>

      {/* Drawer pour les détails */}
      <Drawer
        title={selectedPersonnel ? 
          `${selectedPersonnel.type === 'admin' ? 'Administrateur' : 'Professeur'} - ${selectedPersonnel.prenom} ${selectedPersonnel.nom}` : 
          'Détail Personnel'
        }
        placement="right"
        width={420}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        {selectedPersonnel && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Nom">{selectedPersonnel.prenom} {selectedPersonnel.nom}</Descriptions.Item>
            <Descriptions.Item label="Email">{selectedPersonnel.email}</Descriptions.Item>
            <Descriptions.Item label="Téléphone">{selectedPersonnel.telephone}</Descriptions.Item>
            <Descriptions.Item label="École">{selectedPersonnel.ecole.nom}</Descriptions.Item>
            <Descriptions.Item label="Date d'embauche">{new Date(selectedPersonnel.dateEmbauche).toLocaleDateString()}</Descriptions.Item>
            <Descriptions.Item label="Statut">
              <Tag color={selectedPersonnel.statut === 'Actif' ? 'green' : 'red'}>{selectedPersonnel.statut}</Tag>
            </Descriptions.Item>
            
            {selectedPersonnel.type === 'admin' ? (
              <>
                <Descriptions.Item label="Poste">
                  <Tag color="orange">{selectedPersonnel.poste}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Permissions">
                  {selectedPersonnel.permissions.map((perm, index) => (
                    <Tag key={index} color="blue" style={{ marginBottom: 2 }}>{perm}</Tag>
                  ))}
                </Descriptions.Item>
              </>
            ) : (
              <>
                <Descriptions.Item label="Matières">
                  {selectedPersonnel.matieres.map((matiere, index) => (
                    <Tag key={index} color="blue" style={{ marginBottom: 2 }}>{matiere}</Tag>
                  ))}
                </Descriptions.Item>
                <Descriptions.Item label="Classes">
                  {selectedPersonnel.classes.map((classe, index) => (
                    <Tag key={index} color="green" style={{ marginBottom: 2 }}>{classe}</Tag>
                  ))}
                </Descriptions.Item>
                <Descriptions.Item label="Niveau">{selectedPersonnel.niveau}</Descriptions.Item>
                <Descriptions.Item label="Expérience">{selectedPersonnel.experience}</Descriptions.Item>
              </>
            )}
            
            <Descriptions.Item label="Créé le">{new Date(selectedPersonnel.createdAt).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="Modifié le">{new Date(selectedPersonnel.updatedAt).toLocaleString()}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>

      {/* Modal pour ajouter/modifier */}
      <Modal
        title={editingPersonnel ? 
          `Modifier ${editingPersonnel.type === 'admin' ? 'l\'administrateur' : 'le professeur'}` : 
          'Nouveau personnel'
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={values => { setModalOpen(false); }}
        >
          <Form.Item name="prenom" label="Prénom" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="nom" label="Nom" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="telephone" label="Téléphone" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          
          {editingPersonnel?.type === 'admin' ? (
            <Form.Item name="poste" label="Poste" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="Directrice Générale">Directrice Générale</Select.Option>
                <Select.Option value="Directeur Administratif">Directeur Administratif</Select.Option>
                <Select.Option value="Responsable Pédagogique">Responsable Pédagogique</Select.Option>
                <Select.Option value="Responsable Financier">Responsable Financier</Select.Option>
              </Select>
            </Form.Item>
          ) : (
            <>
              <Form.Item name="niveau" label="Niveau d'études" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="experience" label="Expérience" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </>
          )}
          
          <Form.Item name="statut" label="Statut" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="Actif">Actif</Select.Option>
              <Select.Option value="Inactif">Inactif</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingPersonnel ? 'Modifier' : 'Ajouter'}
              </Button>
              <Button onClick={() => setModalOpen(false)}>
                Annuler
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 