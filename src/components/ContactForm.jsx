import React from 'react';
import { Form, Input, Select, Button } from 'antd';
import { MailOutlined, UserOutlined, PhoneOutlined, SendOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';

const { Option } = Select;

const ages = [
  "2-3 ans (Petite Section)",
  "3-4 ans (Moyenne Section)",
  "4-5 ans (Grande Section)",
  "5-6 ans (CP)",
  "6-7 ans (CE1)",
  "7-8 ans (CE2)",
  "8-9 ans (CM1)",
  "9-10 ans (CM2)",
  "Autre"
];

const ecoles = [
  "La Tulipe",
  "La Marguerite",
  "La Rose",
  "Les Orchidées",
  "Je souhaite être conseillé(e)"
];

const types = [
  "Inscription année 2025-2026",
  "Visite de l'école",
  "Rendez-vous avec la direction",
  "Demande d'informations générales",
  "Informations sur les tarifs",
  "Questions sur nos services (cantine, transport, etc.)",
  "Autre demande"
];

const ContactForm = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Formulaire */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-8 border-t-4 border-green-400">
          <h2 className="text-2xl font-bold text-green-700 mb-1">Parlons de votre projet éducatif</h2>
          <p className="text-gray-600 mb-4">Prenons rendez-vous pour découvrir comment l'Institut Froebel peut accompagner votre enfant vers l'excellence.</p>
          <Form layout="vertical" name="contact" autoComplete="off" onFinish={() => {}}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item name="parent" label="Nom du parent *" rules={[{ required: true, message: 'Veuillez entrer votre nom' }]}> 
                <Input prefix={<UserOutlined />} placeholder="Votre nom complet" size="large" className="rounded-lg" />
              </Form.Item>
              <Form.Item name="email" label="Email *" rules={[{ required: true, type: 'email', message: 'Veuillez entrer un email valide' }]}> 
                <Input prefix={<MailOutlined />} placeholder="votre.email@exemple.com" size="large" className="rounded-lg" />
              </Form.Item>
              <Form.Item name="tel" label="Téléphone *" rules={[{ required: true, message: 'Veuillez entrer un numéro' }]}> 
                <Input prefix={<PhoneOutlined />} placeholder="07 XX XX XX XX" size="large" className="rounded-lg" />
              </Form.Item>
              <Form.Item name="age" label="Âge de l'enfant">
                <Select placeholder="Sélectionnez l'âge" size="large" className="rounded-lg">
                  {ages.map((age) => <Option key={age} value={age}>{age}</Option>)}
                </Select>
              </Form.Item>
              <Form.Item name="ecole" label="École d'intérêt">
                <Select placeholder="Choisissez votre école" size="large" className="rounded-lg">
                  {ecoles.map((ecole) => <Option key={ecole} value={ecole}>{ecole}</Option>)}
                </Select>
              </Form.Item>
              <Form.Item name="type" label="Type de demande">
                <Select placeholder="Sélectionnez votre demande" size="large" className="rounded-lg">
                  {types.map((type) => <Option key={type} value={type}>{type}</Option>)}
                </Select>
              </Form.Item>
            </div>
            <Form.Item name="message" label="Votre message">
              <Input.TextArea rows={4} placeholder="Parlez-nous de votre projet éducatif, vos attentes, ou toute question spécifique que vous avez... (optionnel)" className="rounded-lg" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" size="large" icon={<SendOutlined />} className="w-full rounded-lg bg-green-600 border-green-600 hover:bg-green-700 hover:border-green-700">
                Envoyer ma demande
              </Button>
            </Form.Item>
          </Form>
        </div>
        {/* Infos pratiques */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow p-5 border-l-4 border-green-400">
            <h3 className="text-lg font-bold text-green-700 mb-2">Contact Principal</h3>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>📞 21 26 02 70</li>
              <li>🗓️ Inscriptions 2025-2028 ouvertes</li>
              <li>🕒 Accueil tous les jours</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl shadow p-5 border-l-4 border-green-400">
            <h3 className="text-lg font-bold text-green-700 mb-2">Notre Excellence</h3>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>Fondé en 1975 – 50+ ans d'expérience</li>
              <li>Plus de 5000 anciens élèves diplômés</li>
              <li>98% de taux de réussite</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl shadow p-5 border-l-4 border-green-400">
            <h3 className="text-lg font-bold text-green-700 mb-2">Pourquoi nous choisir ?</h3>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>Pédagogie bienveillante et personnalisée</li>
              <li>Anglais dès la petite section</li>
              <li>Services complets : cantine, transport, ateliers</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm; 