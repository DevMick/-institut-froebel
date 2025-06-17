/**
 * Performance Monitor - Rotary Club Mobile
 * Monitoring performance avec metrics collection et memory leak detection
 */

import { Platform, InteractionManager, AppState } from 'react-native';

// Types
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface MemoryInfo {
  used: number;
  total: number;
  percentage: number;
  timestamp: number;
}

interface NavigationMetric {
  from: string;
  to: string;
  duration: number;
  timestamp: number;
}

interface RenderMetric {
  component: string;
  renderTime: number;
  propsCount: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private memorySnapshots: MemoryInfo[] = [];
  private navigationMetrics: NavigationMetric[] = [];
  private renderMetrics: RenderMetric[] = [];
  private isMonitoring = false;
  private memoryInterval: NodeJS.Timeout | null = null;
  private startTimes: Map<string, number> = new Map();

  /**
   * Démarrer le monitoring
   */
  start(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    console.log('📊 Performance monitoring started');

    // Monitoring mémoire
    this.startMemoryMonitoring();

    // Monitoring app state
    this.setupAppStateMonitoring();

    // Monitoring interactions
    this.setupInteractionMonitoring();
  }

  /**
   * Arrêter le monitoring
   */
  stop(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    
    if (this.memoryInterval) {
      clearInterval(this.memoryInterval);
      this.memoryInterval = null;
    }

    console.log('📊 Performance monitoring stopped');
  }

  /**
   * Démarrer le monitoring mémoire
   */
  private startMemoryMonitoring(): void {
    this.memoryInterval = setInterval(() => {
      this.captureMemorySnapshot();
    }, 30000); // Toutes les 30 secondes
  }

  /**
   * Capturer un snapshot mémoire
   */
  private captureMemorySnapshot(): void {
    try {
      // Note: React Native ne fournit pas d'API native pour la mémoire
      // Ceci est une simulation - en production, utiliser des outils natifs
      const mockMemory = {
        used: Math.random() * 100 + 50, // MB
        total: 512, // MB
        percentage: 0,
        timestamp: Date.now(),
      };
      
      mockMemory.percentage = (mockMemory.used / mockMemory.total) * 100;
      
      this.memorySnapshots.push(mockMemory);
      
      // Garder seulement les 100 derniers snapshots
      if (this.memorySnapshots.length > 100) {
        this.memorySnapshots.shift();
      }

      // Alerte si utilisation mémoire élevée
      if (mockMemory.percentage > 80) {
        console.warn('⚠️ High memory usage detected:', mockMemory.percentage.toFixed(1) + '%');
        this.recordMetric('memory_warning', mockMemory.percentage);
      }
    } catch (error) {
      console.error('Error capturing memory snapshot:', error);
    }
  }

  /**
   * Configurer le monitoring d'état de l'app
   */
  private setupAppStateMonitoring(): void {
    AppState.addEventListener('change', (nextAppState) => {
      this.recordMetric('app_state_change', 1, { state: nextAppState });
    });
  }

  /**
   * Configurer le monitoring d'interactions
   */
  private setupInteractionMonitoring(): void {
    // Monitoring des interactions utilisateur
    InteractionManager.setDeadline(16); // 60 FPS target
  }

  /**
   * Enregistrer une métrique
   */
  recordMetric(name: string, value: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // Garder seulement les 1000 dernières métriques
    if (this.metrics.length > 1000) {
      this.metrics.shift();
    }

    // Log en développement
    if (__DEV__) {
      console.log(`📊 Metric: ${name} = ${value}`, metadata);
    }
  }

  /**
   * Démarrer le timing d'une opération
   */
  startTiming(operation: string): void {
    this.startTimes.set(operation, Date.now());
  }

  /**
   * Terminer le timing d'une opération
   */
  endTiming(operation: string, metadata?: Record<string, any>): number {
    const startTime = this.startTimes.get(operation);
    if (!startTime) {
      console.warn(`No start time found for operation: ${operation}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.startTimes.delete(operation);
    
    this.recordMetric(`timing_${operation}`, duration, metadata);
    
    return duration;
  }

  /**
   * Enregistrer une métrique de navigation
   */
  recordNavigation(from: string, to: string, duration: number): void {
    const metric: NavigationMetric = {
      from,
      to,
      duration,
      timestamp: Date.now(),
    };

    this.navigationMetrics.push(metric);

    // Garder seulement les 100 dernières navigations
    if (this.navigationMetrics.length > 100) {
      this.navigationMetrics.shift();
    }

    this.recordMetric('navigation_time', duration, { from, to });

    // Alerte si navigation lente
    if (duration > 1000) {
      console.warn(`⚠️ Slow navigation detected: ${from} → ${to} (${duration}ms)`);
    }
  }

  /**
   * Enregistrer une métrique de rendu
   */
  recordRender(component: string, renderTime: number, propsCount: number): void {
    const metric: RenderMetric = {
      component,
      renderTime,
      propsCount,
      timestamp: Date.now(),
    };

    this.renderMetrics.push(metric);

    // Garder seulement les 200 derniers rendus
    if (this.renderMetrics.length > 200) {
      this.renderMetrics.shift();
    }

    this.recordMetric('render_time', renderTime, { component, propsCount });

    // Alerte si rendu lent
    if (renderTime > 16) { // > 1 frame à 60 FPS
      console.warn(`⚠️ Slow render detected: ${component} (${renderTime}ms)`);
    }
  }

  /**
   * Obtenir les métriques de performance
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Obtenir les snapshots mémoire
   */
  getMemorySnapshots(): MemoryInfo[] {
    return [...this.memorySnapshots];
  }

  /**
   * Obtenir les métriques de navigation
   */
  getNavigationMetrics(): NavigationMetric[] {
    return [...this.navigationMetrics];
  }

  /**
   * Obtenir les métriques de rendu
   */
  getRenderMetrics(): RenderMetric[] {
    return [...this.renderMetrics];
  }

  /**
   * Obtenir un résumé des performances
   */
  getPerformanceSummary(): {
    averageMemoryUsage: number;
    averageNavigationTime: number;
    averageRenderTime: number;
    slowNavigations: number;
    slowRenders: number;
    memoryWarnings: number;
  } {
    const memoryUsage = this.memorySnapshots.map(s => s.percentage);
    const navigationTimes = this.navigationMetrics.map(n => n.duration);
    const renderTimes = this.renderMetrics.map(r => r.renderTime);

    return {
      averageMemoryUsage: memoryUsage.length > 0 
        ? memoryUsage.reduce((a, b) => a + b, 0) / memoryUsage.length 
        : 0,
      averageNavigationTime: navigationTimes.length > 0 
        ? navigationTimes.reduce((a, b) => a + b, 0) / navigationTimes.length 
        : 0,
      averageRenderTime: renderTimes.length > 0 
        ? renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length 
        : 0,
      slowNavigations: this.navigationMetrics.filter(n => n.duration > 1000).length,
      slowRenders: this.renderMetrics.filter(r => r.renderTime > 16).length,
      memoryWarnings: this.metrics.filter(m => m.name === 'memory_warning').length,
    };
  }

  /**
   * Exporter les métriques
   */
  exportMetrics(): string {
    const data = {
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      metrics: this.metrics,
      memorySnapshots: this.memorySnapshots,
      navigationMetrics: this.navigationMetrics,
      renderMetrics: this.renderMetrics,
      summary: this.getPerformanceSummary(),
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Nettoyer les anciennes métriques
   */
  cleanup(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    this.metrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
    this.memorySnapshots = this.memorySnapshots.filter(s => s.timestamp > oneHourAgo);
    this.navigationMetrics = this.navigationMetrics.filter(n => n.timestamp > oneHourAgo);
    this.renderMetrics = this.renderMetrics.filter(r => r.timestamp > oneHourAgo);

    console.log('📊 Performance metrics cleaned up');
  }

  /**
   * Détecter les fuites mémoire
   */
  detectMemoryLeaks(): boolean {
    if (this.memorySnapshots.length < 10) return false;

    const recent = this.memorySnapshots.slice(-10);
    const trend = this.calculateTrend(recent.map(s => s.percentage));

    // Fuite détectée si tendance croissante > 5% sur 10 mesures
    if (trend > 5) {
      console.warn('⚠️ Potential memory leak detected! Trend:', trend.toFixed(2) + '%');
      return true;
    }

    return false;
  }

  /**
   * Calculer la tendance
   */
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const first = values[0];
    const last = values[values.length - 1];
    
    return last - first;
  }

  /**
   * Obtenir les recommandations d'optimisation
   */
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    const summary = this.getPerformanceSummary();

    if (summary.averageMemoryUsage > 70) {
      recommendations.push('Réduire l\'utilisation mémoire - considérer le lazy loading');
    }

    if (summary.averageNavigationTime > 500) {
      recommendations.push('Optimiser les transitions de navigation');
    }

    if (summary.averageRenderTime > 10) {
      recommendations.push('Optimiser les composants avec React.memo et useMemo');
    }

    if (summary.slowRenders > 10) {
      recommendations.push('Identifier et optimiser les composants lents');
    }

    if (this.detectMemoryLeaks()) {
      recommendations.push('Investiguer les fuites mémoire potentielles');
    }

    return recommendations;
  }
}

// Instance singleton
export const performanceMonitor = new PerformanceMonitor();

// HOC pour monitoring des composants
export const withPerformanceMonitoring = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) => {
  const MonitoredComponent = React.memo((props: P) => {
    const name = componentName || WrappedComponent.displayName || WrappedComponent.name;
    
    React.useEffect(() => {
      const startTime = Date.now();
      
      return () => {
        const renderTime = Date.now() - startTime;
        performanceMonitor.recordRender(name, renderTime, Object.keys(props).length);
      };
    });

    return <WrappedComponent {...props} />;
  });

  MonitoredComponent.displayName = `withPerformanceMonitoring(${componentName || WrappedComponent.displayName || WrappedComponent.name})`;
  
  return MonitoredComponent;
};

export default performanceMonitor;
