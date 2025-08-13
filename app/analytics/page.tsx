// app/analytics/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { BarChart3, PieChart, TrendingUp, RotateCcw } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { CompletionChart } from '../../components/charts/CompletionChart';
import { TodoAnalyticsCards } from '../../components/charts/AnalyticsCard';
import { Button } from '../../components/ui/Button';
import { TodoStats } from '../../types/todo';

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState<TodoStats>({
    total: 0,
    completed: 0,
    pending: 0,
    completionRate: 0,
    byPriority: {
      low: 0,
      medium: 0,
      high: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/todos');
      if (response.ok) {
        const todos = await response.json();
        
        const total = todos.length;
        const completed = todos.filter((todo: any) => todo.completed).length;
        const pending = total - completed;
        const completionRate = total > 0 ? (completed / total) * 100 : 0;

        const byPriority = {
          low: todos.filter((todo: any) => todo.priority === 'low').length,
          medium: todos.filter((todo: any) => todo.priority === 'medium').length,
          high: todos.filter((todo: any) => todo.priority === 'high').length,
        };

        setStats({
          total,
          completed,
          pending,
          completionRate: Math.round(completionRate * 100) / 100,
          byPriority,
        });
        
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    redirect('/login');
  }

  const refreshStats = () => {
    fetchStats();
  };

  return (
    <div className="min-h-screen">
      <Navbar 
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="fade-in space-y-8">
          {/* Header */}
          <div className="analytics-header">
            <div className="analytics-title-section">
              <h1 className="analytics-main-title">
                📊 Analytics Dashboard
              </h1>
              <p className="analytics-subtitle">
                Insights into your productivity and task completion patterns
              </p>
              <p className="analytics-timestamp">
                Last updated: {lastUpdated.toLocaleString()}
              </p>
            </div>
            
            <div className="analytics-controls">
              <button
                onClick={refreshStats}
                disabled={loading}
                className="analytics-refresh-btn"
              >
                <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              <div className="analytics-chart-toggle">
                <button
                  onClick={() => setChartType('pie')}
                  className={`analytics-toggle-btn ${chartType === 'pie' ? 'active' : ''}`}
                >
                  <PieChart className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`analytics-toggle-btn ${chartType === 'bar' ? 'active' : ''}`}
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="analytics-loading">
              <div className="analytics-loading-spinner"></div>
              <p className="analytics-loading-text">Loading analytics...</p>
            </div>
          ) : stats.total === 0 ? (
            <div className="analytics-empty-state">
              <BarChart3 className="analytics-empty-icon" />
              <h3 className="analytics-empty-title">
                No Data Available
              </h3>
              <p className="analytics-empty-description">
                Create some todos to see your analytics and productivity insights.
              </p>
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="analytics-empty-btn"
              >
                🚀 Go to Dashboard
              </button>
            </div>
          ) : (
            <>
              {/* Analytics Cards */}
              <TodoAnalyticsCards stats={stats} />

              {/* Charts Section */}
              <div className="analytics-charts-section">
                <div className="analytics-section-header">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="analytics-section-title">
                    Detailed Analytics
                  </h2>
                </div>
                
                <CompletionChart stats={stats} type={chartType} />
              </div>

              {/* Additional Insights */}
              <div className="analytics-insights-grid">
                <div className="analytics-insight-card">
                  <h3 className="analytics-card-title">
                    🎯 Productivity Insights
                  </h3>
                  <div className="analytics-card-content">
                    <div className="analytics-insight-row">
                      <span className="analytics-insight-label">Completion Rate</span>
                      <span className={`analytics-insight-value ${
                        stats.completionRate >= 75 ? 'excellent' :
                        stats.completionRate >= 50 ? 'good' : 'needs-improvement'
                      }`}>
                        {stats.completionRate >= 75 ? '🏆 Excellent' :
                         stats.completionRate >= 50 ? '👍 Good' : '📈 Needs Improvement'}
                      </span>
                    </div>
                    <div className="analytics-insight-row">
                      <span className="analytics-insight-label">Most Used Priority</span>
                      <span className="analytics-insight-value">
                        {stats.byPriority.high >= stats.byPriority.medium && stats.byPriority.high >= stats.byPriority.low ? '🔴 High' :
                         stats.byPriority.medium >= stats.byPriority.low ? '🟡 Medium' : '🟢 Low'}
                      </span>
                    </div>
                    <div className="analytics-insight-row">
                      <span className="analytics-insight-label">Task Distribution</span>
                      <span className="analytics-insight-value">
                        {stats.byPriority.high > 0 && stats.byPriority.high / stats.total > 0.5 ? '🎯 High Priority Focus' :
                         stats.byPriority.low > 0 && stats.byPriority.low / stats.total > 0.5 ? '🌱 Low Priority Focus' :
                         '⚖️ Balanced'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="analytics-insight-card">
                  <h3 className="analytics-card-title">
                    📈 Quick Stats
                  </h3>
                  <div className="analytics-card-content">
                    <div className="analytics-insight-row">
                      <span className="analytics-insight-label">Tasks per Priority</span>
                      <div className="analytics-priority-stats">
                        <div className="analytics-priority-item high">🔴 High: {stats.byPriority.high}</div>
                        <div className="analytics-priority-item medium">🟡 Medium: {stats.byPriority.medium}</div>
                        <div className="analytics-priority-item low">🟢 Low: {stats.byPriority.low}</div>
                      </div>
                    </div>
                    <div className="analytics-insight-row">
                      <span className="analytics-insight-label">Completion Ratio</span>
                      <span className="analytics-insight-value">
                        ✅ {stats.completed} : ⏳ {stats.pending}
                      </span>
                    </div>
                    <div className="analytics-insight-row">
                      <span className="analytics-insight-label">Progress</span>
                      <div className="analytics-progress-container">
                        <div className="analytics-progress-bar">
                          <div 
                            className="analytics-progress-fill" 
                            style={{ width: `${stats.completionRate}%` }}
                          ></div>
                        </div>
                        <span className="analytics-progress-text">
                          {stats.completionRate.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}