// components/charts/AnalyticsCard.tsx
'use client';

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  BarChart3
} from 'lucide-react';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

export function AnalyticsCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  icon, 
  color = 'blue' 
}: AnalyticsCardProps) {
  const colorStyles = {
    blue: {
      bg: 'analytics-card-blue',
      icon: 'text-blue-600 dark:text-blue-400',
      text: 'text-blue-900 dark:text-blue-100',
      accent: 'from-blue-500 to-blue-600'
    },
    green: {
      bg: 'analytics-card-green',
      icon: 'text-green-600 dark:text-green-400',
      text: 'text-green-900 dark:text-green-100',
      accent: 'from-green-500 to-green-600'
    },
    yellow: {
      bg: 'analytics-card-yellow',
      icon: 'text-yellow-600 dark:text-yellow-400',
      text: 'text-yellow-900 dark:text-yellow-100',
      accent: 'from-yellow-500 to-yellow-600'
    },
    red: {
      bg: 'analytics-card-red',
      icon: 'text-red-600 dark:text-red-400',
      text: 'text-red-900 dark:text-red-100',
      accent: 'from-red-500 to-red-600'
    },
    purple: {
      bg: 'analytics-card-purple',
      icon: 'text-purple-600 dark:text-purple-400',
      text: 'text-purple-900 dark:text-purple-100',
      accent: 'from-purple-500 to-purple-600'
    },
  };

  const styles = colorStyles[color];

  return (
    <div className={`analytics-card ${styles.bg}`}>
      <div className="analytics-card-header">
        <div className="analytics-card-main">
          <div className="analytics-card-title-row">
            {icon && (
              <div className={`analytics-card-icon ${styles.icon}`}>
                {icon}
              </div>
            )}
            <h3 className="analytics-card-title">
              {title}
            </h3>
          </div>
          
          <div className="analytics-card-content">
            <p className={`analytics-card-value ${styles.text}`}>
              {value}
            </p>
            
            {subtitle && (
              <p className="analytics-card-subtitle">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {trend && (
          <div className={`analytics-card-trend ${
            trend.isPositive 
              ? 'positive' 
              : 'negative'
          }`}>
            {trend.isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="analytics-card-trend-value">
              {Math.abs(trend.value)}%
            </span>
          </div>
        )}
      </div>
      
      {/* Gradient accent bar */}
      <div className={`analytics-card-accent bg-gradient-to-r ${styles.accent}`}></div>
    </div>
  );
}

// Predefined analytics cards for common metrics
export function TodoAnalyticsCards({
  stats,
  className = '',
}: {
  stats: {
    total: number;
    completed: number;
    pending: number;
    completionRate: number;
    byPriority: {
      low: number;
      medium: number;
      high: number;
    };
  };
  className?: string;
}) {
  const overdueTasks = 0; // This would come from props in a real implementation
  const todaysTasks = 0; // This would come from props in a real implementation

  return (
    <div className={`analytics-cards-grid ${className}`}>
      <AnalyticsCard
        title="📊 Total Tasks"
        value={stats.total}
        subtitle={`${stats.pending} pending, ${stats.completed} completed`}
        icon={<BarChart3 className="w-5 h-5" />}
        color="blue"
      />

      <AnalyticsCard
        title="🎯 Completion Rate"
        value={`${stats.completionRate.toFixed(1)}%`}
        subtitle="Overall progress"
        icon={<Target className="w-5 h-5" />}
        color={stats.completionRate >= 75 ? 'green' : stats.completionRate >= 50 ? 'yellow' : 'red'}
        trend={
          stats.total > 0
            ? {
                value: Math.round(stats.completionRate),
                isPositive: stats.completionRate >= 50,
              }
            : undefined
        }
      />

      <AnalyticsCard
        title="🔴 High Priority"
        value={stats.byPriority.high}
        subtitle="Urgent tasks"
        icon={<AlertCircle className="w-5 h-5" />}
        color="red"
      />

      <AnalyticsCard
        title="✅ Completed"
        value={stats.completed}
        subtitle="Tasks finished"
        icon={<CheckCircle2 className="w-5 h-5" />}
        color="green"
      />
    </div>
  );
}