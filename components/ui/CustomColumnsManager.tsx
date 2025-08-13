// components/ui/CustomColumnsManager.tsx
'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Palette, Save, X, GripVertical } from 'lucide-react';
import { CustomColumn } from '../../types/todo';
import { Input } from './Input';
import { Button } from './Button';
import { Modal } from './Modal';

interface CustomColumnsManagerProps {
  columns: CustomColumn[];
  onAdd: (column: Omit<CustomColumn, 'id' | 'createdAt' | 'userId'>) => void;
  onUpdate: (id: string, updates: Partial<CustomColumn>) => void;
  onDelete: (id: string) => void;
  onReorder: (columns: CustomColumn[]) => void;
  disabled?: boolean;
}

interface ColumnFormData {
  name: string;
  description: string;
  color: string;
}

const PRESET_COLORS = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
  '#ec4899', '#f97316', '#84cc16', '#06b6d4', '#6366f1'
];

export function CustomColumnsManager({
  columns,
  onAdd,
  onUpdate,
  onDelete,
  onReorder,
  disabled = false
}: CustomColumnsManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<CustomColumn | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [formData, setFormData] = useState<ColumnFormData>({
    name: '',
    description: '',
    color: PRESET_COLORS[0]
  });

  const openAddModal = () => {
    setFormData({
      name: '',
      description: '',
      color: PRESET_COLORS[0]
    });
    setEditingColumn(null);
    setIsModalOpen(true);
  };

  const openEditModal = (column: CustomColumn) => {
    setFormData({
      name: column.name,
      description: column.description || '',
      color: column.color
    });
    setEditingColumn(column);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingColumn(null);
    setFormData({ name: '', description: '', color: PRESET_COLORS[0] });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    const columnData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      color: formData.color,
      order: editingColumn ? editingColumn.order : columns.length,
      isDefault: false
    };

    if (editingColumn) {
      onUpdate(editingColumn.id, columnData);
    } else {
      onAdd(columnData);
    }

    closeModal();
  };

  const handleDelete = (column: CustomColumn) => {
    if (column.isDefault) return;
    
    if (confirm(`Are you sure you want to delete the "${column.name}" column? This action cannot be undone.`)) {
      onDelete(column.id);
    }
  };

  const handleDragStart = (e: React.DragEvent, columnId: string) => {
    setDraggedColumn(columnId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    
    if (!draggedColumn || draggedColumn === targetColumnId) {
      setDraggedColumn(null);
      return;
    }

    const draggedIndex = columns.findIndex(col => col.id === draggedColumn);
    const targetIndex = columns.findIndex(col => col.id === targetColumnId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const reorderedColumns = [...columns];
    const draggedItem = reorderedColumns.splice(draggedIndex, 1)[0];
    reorderedColumns.splice(targetIndex, 0, draggedItem);

    // Update order property
    const updatedColumns = reorderedColumns.map((col, index) => ({
      ...col,
      order: index
    }));

    onReorder(updatedColumns);
    setDraggedColumn(null);
  };

  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);

  return (
    <div className="custom-columns-manager">
      <div className="columns-header">
        <h3 className="columns-title">Custom Workflow Columns</h3>
        <Button
          onClick={openAddModal}
          disabled={disabled}
          className="add-column-btn"
          size="sm"
        >
          <Plus className="w-4 h-4" />
          Add Column
        </Button>
      </div>

      <div className="columns-list">
        {sortedColumns.map((column) => (
          <div
            key={column.id}
            className={`column-item ${draggedColumn === column.id ? 'dragging' : ''}`}
            draggable={!column.isDefault && !disabled}
            onDragStart={(e) => handleDragStart(e, column.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="column-drag-handle">
              {!column.isDefault && !disabled && (
                <GripVertical className="w-4 h-4 text-gray-400" />
              )}
            </div>

            <div
              className="column-color-indicator"
              style={{ backgroundColor: column.color }}
            />

            <div className="column-info">
              <div className="column-name">
                {column.name}
                {column.isDefault && (
                  <span className="default-badge">Default</span>
                )}
              </div>
              {column.description && (
                <div className="column-description">
                  {column.description}
                </div>
              )}
            </div>

            <div className="column-actions">
              <Button
                onClick={() => openEditModal(column)}
                disabled={disabled}
                variant="ghost"
                size="sm"
                className="edit-btn"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              
              {!column.isDefault && (
                <Button
                  onClick={() => handleDelete(column)}
                  disabled={disabled}
                  variant="ghost"
                  size="sm"
                  className="delete-btn text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingColumn ? 'Edit Column' : 'Add New Column'}
      >
        <form onSubmit={handleSubmit} className="column-form">
          <div className="form-group">
            <label htmlFor="column-name" className="form-label">
              Column Name
            </label>
            <Input
              id="column-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., In Review, Testing, Deployed"
              required
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <label htmlFor="column-description" className="form-label">
              Description (Optional)
            </label>
            <textarea
              id="column-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what tasks belong in this column..."
              rows={3}
              maxLength={200}
              className="form-textarea"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Column Color
            </label>
            <div className="color-picker">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`color-option ${formData.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                />
              ))}
            </div>
            <Input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              className="custom-color-input"
            />
          </div>

          <div className="form-actions">
            <Button
              type="button"
              onClick={closeModal}
              variant="secondary"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.name.trim()}
            >
              <Save className="w-4 h-4" />
              {editingColumn ? 'Update' : 'Create'} Column
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
