import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../services/ApiService';

export const CalendrierScreen = ({ user, club, onBack }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [messagePersonnalise, setMessagePersonnalise] = useState('');
  const [envoyerATousLesMembres, setEnvoyerATousLesMembres] = useState(true);
  const [emailsDestinataires, setEmailsDestinataires] = useState('');
  const [sending, setSending] = useState(false);

  const apiService = new ApiService();

  const months = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' },
  ];

  const handleSendCalendrier = async () => {
    try {
      setSending(true);

      // Préparer les données pour l'envoi
      const emailData = {
        clubId: club.id,
        mois: selectedMonth,
        messagePersonnalise: messagePersonnalise.trim(),
        envoyerATousLesMembres: envoyerATousLesMembres,
        emailsDestinataires: emailsDestinataires.trim() 
          ? emailsDestinataires.split(',').map(email => email.trim()).filter(email => email)
          : []
      };

      // Appel à l'API pour envoyer le calendrier
      const result = await apiService.sendCalendrier(emailData);
      
      if (result.success) {
        const successMessage = `🎉 **Calendrier envoyé avec succès !**

📅 **Mois :** ${result.nomMois}
📧 **Destinataires :** ${result.nombreDestinataires} membre(s)
📋 **Événements :** ${result.nombreEvenements} événement(s)
🏢 **Club :** ${result.clubNom}

🕐 **Envoyé le :** ${new Date().toLocaleString('fr-FR')}

✅ Le calendrier du mois de ${result.nomMois} a été transmis avec succès aux destinataires.`;

        Alert.alert(
          '✅ Succès !',
          successMessage,
          [
            {
              text: 'Retour au menu',
              onPress: () => {
                setMessagePersonnalise('');
                setEmailsDestinataires('');
                onBack();
              }
            }
          ]
        );
      } else {
        Alert.alert('Erreur', result.message || 'Erreur lors de l\'envoi du calendrier');
      }
    } catch (error) {
      console.error('❌ Erreur envoi calendrier:', error);
      Alert.alert('Erreur', error.message || 'Erreur lors de l\'envoi du calendrier');
    } finally {
      setSending(false);
    }
  };

  const renderMonthSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Mois du calendrier</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.monthSelector}
      >
        {months.map((month) => (
          <TouchableOpacity
            key={month.value}
            style={[
              styles.monthButton,
              selectedMonth === month.value && styles.monthButtonSelected
            ]}
            onPress={() => setSelectedMonth(month.value)}
          >
            <Text style={[
              styles.monthButtonText,
              selectedMonth === month.value && styles.monthButtonTextSelected
            ]}>
              {month.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calendrier Mensuel</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Carte d'information */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="calendar" size={24} color="#005AA9" />
            <Text style={styles.infoTitle}>Envoi Calendrier Mensuel</Text>
          </View>
          <Text style={styles.infoDescription}>
            Envoyez le calendrier des événements du mois par email aux membres du club.
            Le calendrier inclut les réunions, événements et anniversaires.
          </Text>
        </View>

        {/* Sélecteur de mois */}
        {renderMonthSelector()}

        {/* Message personnalisé */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Message personnalisé (optionnel)</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Ajouter un message personnalisé au calendrier..."
            value={messagePersonnalise}
            onChangeText={setMessagePersonnalise}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Destinataires */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destinataires</Text>
          
          {/* Option tous les membres */}
          <View style={styles.optionRow}>
            <View style={styles.optionContent}>
              <Ionicons name="people" size={20} color="#005AA9" />
              <Text style={styles.optionText}>Envoyer à tous les membres du club</Text>
            </View>
            <Switch
              value={envoyerATousLesMembres}
              onValueChange={setEnvoyerATousLesMembres}
              trackColor={{ false: '#767577', true: '#005AA9' }}
              thumbColor={envoyerATousLesMembres ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          {/* Emails spécifiques */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emails spécifiques (optionnel)</Text>
            <TextInput
              style={styles.emailInput}
              placeholder="email1@example.com, email2@example.com"
              value={emailsDestinataires}
              onChangeText={setEmailsDestinataires}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <Text style={styles.helpText}>
              Séparez plusieurs emails par des virgules
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer avec bouton d'envoi */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.sendButton, sending && styles.sendButtonDisabled]}
          onPress={handleSendCalendrier}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="mail" size={20} color="white" />
              <Text style={styles.sendButtonText}>
                Envoyer Calendrier {months[selectedMonth - 1]?.label}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#005AA9',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  infoDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  monthSelector: {
    marginBottom: 10,
  },
  monthButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  monthButtonSelected: {
    backgroundColor: '#005AA9',
    borderColor: '#005AA9',
  },
  monthButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  monthButtonTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  messageInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 100,
  },
  optionRow: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 15,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  emailInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 80,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  footer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  sendButton: {
    backgroundColor: '#005AA9',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
