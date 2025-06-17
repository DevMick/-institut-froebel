/**
 * Quick Stats Card Component - Rotary Club Mobile
 * Widget statistiques avec mini graphiques et animations counter
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Svg, { Circle, Path } from 'react-native-svg';
import { THEME } from '../../config/theme';

interface QuickStatsCardProps {
  onPress?: () => void;
  style?: object;
}

interface StatData {
  label: string;
  value: number;
  maxValue?: number;
  icon: string;
  color: string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
}

export const QuickStatsCard: React.FC<QuickStatsCardProps> = ({
  onPress,
  style,
}) => {
  // Données de statistiques (simulées)
  const stats: StatData[] = [
    {
      label: 'Présences',
      value: 12,
      maxValue: 15,
      icon: 'event',
      color: THEME.colors.PRIMARY,
      unit: '/15',
      trend: 'up',
      trendValue: 8,
    },
    {
      label: 'Nouveaux',
      value: 3,
      icon: 'person-add',
      color: THEME.colors.SUCCESS,
      unit: ' membres',
      trend: 'up',
      trendValue: 15,
    },
    {
      label: 'Projets',
      value: 8,
      maxValue: 10,
      icon: 'work',
      color: THEME.colors.SECONDARY,
      unit: ' actifs',
      trend: 'stable',
    },
    {
      label: 'Budget',
      value: 85,
      maxValue: 100,
      icon: 'account-balance',
      color: THEME.colors.WARNING,
      unit: '%',
      trend: 'down',
      trendValue: 5,
    },
  ];

  // Animations pour les compteurs
  const animatedValues = useRef(
    stats.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Animer tous les compteurs en parallèle
    const animations = animatedValues.map((animatedValue, index) =>
      Animated.timing(animatedValue, {
        toValue: stats[index].value,
        duration: 1500,
        delay: index * 200, // Décalage pour effet séquentiel
        useNativeDriver: false,
      })
    );

    Animated.parallel(animations).start();
  }, [animatedValues, stats]);

  // Render mini graphique circulaire
  const renderCircularProgress = (stat: StatData, index: number) => {
    if (!stat.maxValue) return null;

    const size = 32;
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = stat.value / stat.maxValue;
    const strokeDashoffset = circumference - progress * circumference;

    return (
      <View style={styles.progressContainer}>
        <Svg width={size} height={size}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={THEME.colors.GRAY_200}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={stat.color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.progressCenter}>
          <Text style={[styles.progressText, { color: stat.color }]}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
      </View>
    );
  };

  // Render trend indicator
  const renderTrendIndicator = (stat: StatData) => {
    if (!stat.trend || !stat.trendValue) return null;

    const trendIcon = stat.trend === 'up' ? 'trending-up' : 
                     stat.trend === 'down' ? 'trending-down' : 
                     'trending-flat';
    
    const trendColor = stat.trend === 'up' ? THEME.colors.SUCCESS :
                      stat.trend === 'down' ? THEME.colors.ERROR :
                      THEME.colors.GRAY_500;

    return (
      <View style={styles.trendContainer}>
        <Icon name={trendIcon} size={12} color={trendColor} />
        <Text style={[styles.trendText, { color: trendColor }]}>
          {stat.trendValue}%
        </Text>
      </View>
    );
  };

  // Render stat item
  const renderStatItem = (stat: StatData, index: number) => {
    return (
      <View key={stat.label} style={styles.statItem}>
        <View style={styles.statHeader}>
          <View style={[styles.iconContainer, { backgroundColor: `${stat.color}20` }]}>
            <Icon name={stat.icon} size={16} color={stat.color} />
          </View>
          {renderCircularProgress(stat, index)}
        </View>

        <View style={styles.statContent}>
          <View style={styles.valueContainer}>
            <Animated.Text style={[styles.statValue, { color: stat.color }]}>
              {animatedValues[index]._value.toFixed(0)}
            </Animated.Text>
            {stat.unit && (
              <Text style={styles.statUnit}>{stat.unit}</Text>
            )}
          </View>
          
          <Text style={styles.statLabel} numberOfLines={1}>
            {stat.label}
          </Text>
          
          {renderTrendIndicator(stat)}
        </View>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel="Statistiques rapides du club"
      accessibilityRole="button"
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Icon name="analytics" size={20} color={THEME.colors.PRIMARY} />
          <Text style={styles.title}>Statistiques</Text>
        </View>
        
        <View style={styles.periodContainer}>
          <Text style={styles.periodText}>Ce mois</Text>
          <Icon name="chevron-right" size={16} color={THEME.colors.GRAY_400} />
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => renderStatItem(stat, index))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Voir le rapport complet
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.SURFACE,
    borderRadius: THEME.radius.LG,
    padding: THEME.spacing.MD,
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

  periodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  periodText: {
    fontSize: THEME.typography.FONT_SIZE.XS,
    color: THEME.colors.GRAY_500,
    marginRight: THEME.spacing.XS,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.SM,
  },

  statItem: {
    width: '48%',
    marginBottom: THEME.spacing.SM,
  },

  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.XS,
  },

  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  progressContainer: {
    position: 'relative',
  },

  progressCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },

  progressText: {
    fontSize: THEME.typography.FONT_SIZE.XS,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
  },

  statContent: {
    alignItems: 'flex-start',
  },

  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 2,
  },

  statValue: {
    fontSize: THEME.typography.FONT_SIZE.LG,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
  },

  statUnit: {
    fontSize: THEME.typography.FONT_SIZE.XS,
    color: THEME.colors.GRAY_500,
    marginLeft: 2,
  },

  statLabel: {
    fontSize: THEME.typography.FONT_SIZE.XS,
    color: THEME.colors.GRAY_600,
    marginBottom: THEME.spacing.XS,
  },

  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  trendText: {
    fontSize: THEME.typography.FONT_SIZE.XS,
    fontWeight: THEME.typography.FONT_WEIGHT.MEDIUM,
    marginLeft: 2,
  },

  footer: {
    borderTopWidth: 1,
    borderTopColor: THEME.colors.OUTLINE_VARIANT,
    paddingTop: THEME.spacing.SM,
    alignItems: 'center',
  },

  footerText: {
    fontSize: THEME.typography.FONT_SIZE.XS,
    color: THEME.colors.PRIMARY,
    fontWeight: THEME.typography.FONT_WEIGHT.MEDIUM,
  },
});

export default QuickStatsCard;
