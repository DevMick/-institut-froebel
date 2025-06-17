/**
 * Recent Activity Card Component - Rotary Club Mobile
 * Widget feed activités récentes avec timestamps relatives
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { THEME } from '../../config/theme';

interface Activity {
  id: string;
  type: 'member' | 'reunion' | 'payment' | 'announcement' | 'project';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
  color: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

interface RecentActivityCardProps {
  onActivityPress?: (activity: Activity) => void;
  onViewAllPress?: () => void;
  style?: object;
}

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({
  onActivityPress,
  onViewAllPress,
  style,
}) => {
  // Données d'activités simulées
  const activities: Activity[] = useMemo(() => [
    {
      id: '1',
      type: 'member',
      title: 'Nouveau membre',
      description: 'Marie Dubois a rejoint le club',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // Il y a 2h
      icon: 'person-add',
      color: THEME.colors.SUCCESS,
      user: { name: 'Marie Dubois' },
    },
    {
      id: '2',
      type: 'reunion',
      title: 'Réunion terminée',
      description: 'Réunion hebdomadaire du 15 juin',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Hier
      icon: 'event',
      color: THEME.colors.PRIMARY,
    },
    {
      id: '3',
      type: 'payment',
      title: 'Cotisation payée',
      description: 'Jean Martin - Cotisation Q2 2024',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Il y a 2 jours
      icon: 'payment',
      color: THEME.colors.SECONDARY,
      user: { name: 'Jean Martin' },
    },
    {
      id: '4',
      type: 'announcement',
      title: 'Nouvelle annonce',
      description: 'Assemblée générale le 30 juin',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Il y a 3 jours
      icon: 'campaign',
      color: THEME.colors.WARNING,
    },
    {
      id: '5',
      type: 'project',
      title: 'Projet mis à jour',
      description: 'Eau potable pour tous - 85% complété',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Il y a 5 jours
      icon: 'work',
      color: THEME.colors.INFO,
    },
  ], []);

  // Formater le timestamp relatif
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days === 1) return 'Hier';
    if (days < 7) return `Il y a ${days} jours`;
    if (weeks === 1) return 'Il y a 1 semaine';
    if (weeks < 4) return `Il y a ${weeks} semaines`;
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  // Render activity item
  const renderActivityItem = ({ item }: { item: Activity }) => (
    <TouchableOpacity
      style={styles.activityItem}
      onPress={() => onActivityPress?.(item)}
      activeOpacity={0.7}
      accessibilityLabel={`${item.title}: ${item.description}`}
      accessibilityRole="button"
    >
      {/* Icon container */}
      <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
        <Icon name={item.icon} size={20} color={item.color} />
      </View>

      {/* Content */}
      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.activityTime}>
            {formatRelativeTime(item.timestamp)}
          </Text>
        </View>
        
        <Text style={styles.activityDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        {item.user && (
          <View style={styles.userInfo}>
            <Icon name="person" size={12} color={THEME.colors.GRAY_500} />
            <Text style={styles.userName}>{item.user.name}</Text>
          </View>
        )}
      </View>

      {/* Chevron */}
      <View style={styles.chevronContainer}>
        <Icon name="chevron-right" size={16} color={THEME.colors.GRAY_400} />
      </View>
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="history" size={48} color={THEME.colors.GRAY_400} />
      <Text style={styles.emptyTitle}>Aucune activité récente</Text>
      <Text style={styles.emptyText}>
        Les activités du club apparaîtront ici.
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Icon name="history" size={20} color={THEME.colors.PRIMARY} />
          <Text style={styles.title}>Activité récente</Text>
        </View>
        
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={onViewAllPress}
          accessibilityLabel="Voir toutes les activités"
        >
          <Text style={styles.viewAllText}>Voir tout</Text>
          <Icon name="chevron-right" size={16} color={THEME.colors.PRIMARY} />
        </TouchableOpacity>
      </View>

      {/* Activities List */}
      <View style={styles.activitiesContainer}>
        {activities.length > 0 ? (
          <FlatList
            data={activities}
            renderItem={renderActivityItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false} // Disable scroll in card
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        ) : (
          renderEmptyState()
        )}
      </View>

      {/* Footer */}
      {activities.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {activities.length} activités cette semaine
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.SURFACE,
    borderRadius: THEME.radius.LG,
    padding: THEME.spacing.LG,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: THEME.colors.OUTLINE_VARIANT,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.MD,
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  title: {
    fontSize: THEME.typography.FONT_SIZE.MD,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.ON_SURFACE,
    marginLeft: THEME.spacing.XS,
  },

  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  viewAllText: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.PRIMARY,
    fontWeight: THEME.typography.FONT_WEIGHT.MEDIUM,
    marginRight: THEME.spacing.XS,
  },

  activitiesContainer: {
    marginBottom: THEME.spacing.SM,
  },

  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: THEME.spacing.SM,
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: THEME.spacing.MD,
  },

  activityContent: {
    flex: 1,
  },

  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.XS,
  },

  activityTitle: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.ON_SURFACE,
    flex: 1,
    marginRight: THEME.spacing.SM,
  },

  activityTime: {
    fontSize: THEME.typography.FONT_SIZE.XS,
    color: THEME.colors.GRAY_500,
  },

  activityDescription: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.GRAY_600,
    lineHeight: THEME.typography.LINE_HEIGHT.SM,
    marginBottom: THEME.spacing.XS,
  },

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  userName: {
    fontSize: THEME.typography.FONT_SIZE.XS,
    color: THEME.colors.GRAY_500,
    marginLeft: THEME.spacing.XS,
  },

  chevronContainer: {
    marginLeft: THEME.spacing.SM,
    paddingTop: THEME.spacing.XS,
  },

  separator: {
    height: 1,
    backgroundColor: THEME.colors.OUTLINE_VARIANT,
    marginLeft: 52, // Icon width + margin
  },

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: THEME.spacing.XXL,
  },

  emptyTitle: {
    fontSize: THEME.typography.FONT_SIZE.MD,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.GRAY_600,
    marginTop: THEME.spacing.MD,
    marginBottom: THEME.spacing.SM,
  },

  emptyText: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.GRAY_500,
    textAlign: 'center',
  },

  footer: {
    borderTopWidth: 1,
    borderTopColor: THEME.colors.OUTLINE_VARIANT,
    paddingTop: THEME.spacing.SM,
    alignItems: 'center',
  },

  footerText: {
    fontSize: THEME.typography.FONT_SIZE.XS,
    color: THEME.colors.GRAY_500,
  },
});

export default RecentActivityCard;
