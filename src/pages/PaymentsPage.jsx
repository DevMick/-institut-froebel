import React, { useState } from 'react';
import { Row, Col, Card, Statistic, Table, Button, Input, Tag, Space, Drawer, Descriptions, Modal, Form, Select, DatePicker } from 'antd';
import { DollarOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { staticPayments, paymentStats } from '../data/staticPayments';

const paymentColumns = [
  { 
    title: 'Élève', 
    dataIndex: 'eleve', 
    key: 'eleve',
    width: 140,
    render: (eleve) => eleve ? `${eleve.prenom} ${eleve.nom}` : '-' 
  },
  { 
    title: 'Classe', 
    dataIndex: ['eleve', 'classe'], 
    key: 'classe',
    width: 80,
    render: (_, record) => record.eleve?.classe || '-' 
  },
  { 
    title: 'École', 
    dataIndex: ['ecole', 'nom'], 
    key: 'ecole',
    width: 120,
    render: (_, record) => record.ecole?.nom || '-' 
  },
  { 
    title: 'Montant', 
    dataIndex: 'montant', 
    key: 'montant',
    width: 100,
    render: (m) => m ? `${m.toLocaleString()} Ar` : '-' 
  },
  { 
    title: 'Mode', 
    dataIndex: 'modePaiement', 
    key: 'modePaiement',
    width: 110
  },
  { 
    title: 'Date', 
    dataIndex: 'datePaiement', 
    key: 'datePaiement',
    width: 110,
    render: (d) => d ? new Date(d).toLocaleDateString() : '-' 
  },
  { 
    title: 'Statut', 
    dataIndex: 'statut', 
    key: 'statut',
    width: 90,
    render: (s) => <Tag color={s === 'Payé' ? 'green' : s === 'En attente' ? 'orange' : s === 'Remboursé' ? 'red' : 'default'}>{s}</Tag> 
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

export default function PaymentsPage() {
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [form] = Form.useForm();

  // Ajout des handlers sur chaque ligne pour les actions
  const paymentsWithHandlers = staticPayments.map(p => ({
    ...p,
    onDetails: (rec) => {
      setSelectedPayment(rec);
      setDrawerOpen(true);
    },
    onEdit: (rec) => {
      setEditingPayment(rec);
      setModalOpen(true);
      form.setFieldsValue({
        ...rec,
        datePaiement: rec.datePaiement ? rec.datePaiement : null
      });
    }
  }));

  const filteredPayments = paymentsWithHandlers.filter(p =>
    p.eleve.nom.toLowerCase().includes(search.toLowerCase()) ||
    p.eleve.prenom.toLowerCase().includes(search.toLowerCase()) ||
    p.eleve.classe.toLowerCase().includes(search.toLowerCase()) ||
    p.ecole.nom.toLowerCase().includes(search.toLowerCase()) ||
    p.modePaiement.toLowerCase().includes(search.toLowerCase()) ||
    p.statut.toLowerCase().includes(search.toLowerCase()) ||
    p.reference.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}><Card><Statistic title="Total Paiements" value={paymentStats.totalPaiements} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Montant Total" value={paymentStats.montantTotal.toLocaleString()} suffix="Ar" prefix={<DollarOutlined style={{ color: '#faad14' }} />} /></Card></Col>
        <Col span={6}><Card><Statistic title="En Attente" value={paymentStats.enAttente} prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Remboursés" value={paymentStats.rembourses} prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />} /></Card></Col>
      </Row>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Input.Search
            placeholder="Rechercher un paiement (élève, classe, école, mode, statut, référence)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            allowClear
          />
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setModalOpen(true); setEditingPayment(null); form.resetFields(); }}>
            Nouveau Paiement
          </Button>
        </Col>
      </Row>
      <div style={{ overflowX: 'auto' }}>
        <Table
          columns={paymentColumns}
          dataSource={filteredPayments}
          rowKey="id"
          pagination={{ pageSize: 8 }}
          scroll={{ x: 900 }}
          size="small"
        />
      </div>
      <Drawer
        title={selectedPayment ? `Paiement - ${selectedPayment.eleve.prenom} ${selectedPayment.eleve.nom}` : 'Détail Paiement'}
        placement="right"
        width={420}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        {selectedPayment && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Élève">{selectedPayment.eleve.prenom} {selectedPayment.eleve.nom}</Descriptions.Item>
            <Descriptions.Item label="Classe">{selectedPayment.eleve.classe}</Descriptions.Item>
            <Descriptions.Item label="École">{selectedPayment.ecole.nom}</Descriptions.Item>
            <Descriptions.Item label="Montant">{selectedPayment.montant.toLocaleString()} Ar</Descriptions.Item>
            <Descriptions.Item label="Mode de paiement">{selectedPayment.modePaiement}</Descriptions.Item>
            <Descriptions.Item label="Date de paiement">{new Date(selectedPayment.datePaiement).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="Statut">
              <Tag color={selectedPayment.statut === 'Payé' ? 'green' : selectedPayment.statut === 'En attente' ? 'orange' : selectedPayment.statut === 'Remboursé' ? 'red' : 'default'}>{selectedPayment.statut}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Référence">{selectedPayment.reference}</Descriptions.Item>
            <Descriptions.Item label="Commentaire">{selectedPayment.commentaire}</Descriptions.Item>
            <Descriptions.Item label="Créé le">{new Date(selectedPayment.createdAt).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="Modifié le">{new Date(selectedPayment.updatedAt).toLocaleString()}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
      <Modal
        title={editingPayment ? 'Modifier le paiement' : 'Nouveau paiement'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ statut: 'Payé', modePaiement: 'Espèces' }}
          onFinish={values => { setModalOpen(false); }}
        >
          <Form.Item name={['eleve', 'prenom']} label="Prénom de l'élève" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name={['eleve', 'nom']} label="Nom de l'élève" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name={['eleve', 'classe']} label="Classe" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name={['ecole', 'nom']} label="École" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="montant" label="Montant" rules={[{ required: true }]}> <Input type="number" min={0} /> </Form.Item>
          <Form.Item name="modePaiement" label="Mode de paiement" rules={[{ required: true }]}> <Select>
            <Select.Option value="Espèces">Espèces</Select.Option>
            <Select.Option value="Virement bancaire">Virement bancaire</Select.Option>
            <Select.Option value="Chèque">Chèque</Select.Option>
            <Select.Option value="Mobile Money">Mobile Money</Select.Option>
          </Select></Form.Item>
          <Form.Item name="datePaiement" label="Date de paiement" rules={[{ required: true }]}> <DatePicker style={{ width: '100%' }} /> </Form.Item>
          <Form.Item name="statut" label="Statut" rules={[{ required: true }]}> <Select>
            <Select.Option value="Payé">Payé</Select.Option>
            <Select.Option value="En attente">En attente</Select.Option>
            <Select.Option value="Remboursé">Remboursé</Select.Option>
          </Select></Form.Item>
          <Form.Item name="reference" label="Référence"> <Input /> </Form.Item>
          <Form.Item name="commentaire" label="Commentaire"> <Input.TextArea rows={2} /> </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button type="default" onClick={() => setModalOpen(false)} style={{ marginRight: 8 }}>Annuler</Button>
            <Button type="primary" htmlType="submit">{editingPayment ? 'Modifier' : 'Créer'}</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 