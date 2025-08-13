// components/charts/CompletionChart.tsx
'use client';

import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { TodoStats } from '../../types/todo';

interface CompletionChartProps {
  stats: TodoStats;
  type?: 'pie' | 'bar';
}

export function CompletionChart({ stats, type = 'pie' }: CompletionChartProps) {
  // Ensure we have valid data
  const totalTasks = stats.total || 0;
  const completed = stats.completed || 0;
  const pending = stats.pending || 0;
  
  const completionData = [
    { name: 'Completed', value: completed, color: '#10B981' },
    { name: 'Pending', value: pending, color: '#F59E0B' },
  ].filter(item => item.value > 0); // Only show items with values

  const priorityData = [
    { name: 'High', value: stats.byPriority?.high || 0, color: '#EF4444' },
    { name: 'Medium', value: stats.byPriority?.medium || 0, color: '#F59E0B' },
    { name: 'Low', value: stats.byPriority?.low || 0, color: '#10B981' },
  ].filter(item => item.value > 0); // Only show items with values

  // If no data, show empty state
  if (totalTasks === 0) {
    return (
      <div className="card-modern p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-700/50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Data Available
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Add some tasks to see your completion statistics
          </p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-600">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {payload[0].name}: {payload[0].value}
          </p>
          {stats.total > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {((payload[0].value / stats.total) * 100).toFixed(1)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show label if slice is too small
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-sm font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (type === 'pie') {
    return (
      <div className="space-y-6">
        {/* Completion Rate Chart */}
        {completionData.length > 0 && (
          <div className="card-modern p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-700/50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📈 Task Completion Rate
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={completionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={CustomLabel}
                    outerRadius={100}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="none"
                  >
                    {completionData.map((entry, index) => (
                      <Cell key={`completion-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ 
                      fontSize: '14px',
                      color: 'var(--text-color)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {stats.completionRate.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Overall completion rate
              </p>
              <div className="mt-2 text-xs text-gray-400">
                {completed} completed out of {totalTasks} total tasks
              </div>
            </div>
          </div>
        )}

        {/* Priority Distribution Chart */}
        {priorityData.length > 0 && (
          <div className="card-modern p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-700/50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🎯 Tasks by Priority
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={CustomLabel}
                    outerRadius={100}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="none"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`priority-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ 
                      fontSize: '14px',
                      color: 'var(--text-color)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Total: {priorityData.reduce((sum, item) => sum + item.value, 0)} tasks
            </div>
          </div>
        )}
      </div>
    );
  }

  // Bar chart version
  return (
    <div className="space-y-6">
      {/* Completion Rate Bar Chart */}
      {completionData.length > 0 && (
        <div className="card-modern p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-700/50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📊 Task Status Overview
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={completionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="name" 
                  className="text-sm text-gray-600 dark:text-gray-400"
                  tick={{ fontSize: 12, fill: 'currentColor' }}
                />
                <YAxis 
                  className="text-sm text-gray-600 dark:text-gray-400"
                  tick={{ fontSize: 12, fill: 'currentColor' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={100}>
                  {completionData.map((entry, index) => (
                    <Cell key={`completion-bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {stats.completionRate.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Overall completion rate
            </p>
          </div>
        </div>
      )}

      {/* Priority Distribution Bar Chart */}
      {priorityData.length > 0 && (
        <div className="card-modern p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-700/50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🎯 Priority Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="name" 
                  className="text-sm text-gray-600 dark:text-gray-400"
                  tick={{ fontSize: 12, fill: 'currentColor' }}
                />
                <YAxis 
                  className="text-sm text-gray-600 dark:text-gray-400"
                  tick={{ fontSize: 12, fill: 'currentColor' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={100}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`priority-bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}