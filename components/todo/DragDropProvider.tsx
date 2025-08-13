// components/todo/DragDropProvider.tsx
'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { DragDropContext, DropResult, DragStart, DragUpdate } from '@hello-pangea/dnd';

interface DragDropProviderProps {
  children: React.ReactNode;
  onDragEnd: (result: DropResult) => void;
}

export function DragDropProvider({ children, onDragEnd }: DragDropProviderProps) {
  const [mounted, setMounted] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStylesAppliedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const applyDragOptimizations = useCallback(() => {
    if (dragStylesAppliedRef.current) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'drag-performance-styles';
    styleElement.textContent = `
      /* Disable all transitions during drag for better performance */
      [data-rbd-draggable-context-id] * {
        transition: none !important;
        animation: none !important;
      }
      
      /* Enable hardware acceleration for better performance */
      [data-rbd-draggable-context-id] {
        transform: translateZ(0);
        will-change: transform;
      }
      
      /* Optimize repaints */
      [data-rbd-droppable-context-id] {
        contain: layout style paint;
      }
      
      /* Smooth dragging animations */
      [data-rbd-drag-handle-context-id] {
        backface-visibility: hidden;
        perspective: 1000px;
      }
    `;
    
    document.head.appendChild(styleElement);
    dragStylesAppliedRef.current = true;
  }, []);

  const removeDragOptimizations = useCallback(() => {
    if (!dragStylesAppliedRef.current) return;
    
    const styleElement = document.getElementById('drag-performance-styles');
    if (styleElement) {
      document.head.removeChild(styleElement);
      dragStylesAppliedRef.current = false;
    }
  }, []);

  const handleDragStart = useCallback((initial: DragStart) => {
    isDraggingRef.current = true;
    
    // Apply performance optimizations
    applyDragOptimizations();
    
    // Disable pointer events on non-dragging elements to improve performance
    document.body.style.pointerEvents = 'none';
    document.body.style.userSelect = 'none';
    
    // Force GPU acceleration
    document.body.style.transform = 'translateZ(0)';
    
    // Reduce visual complexity during drag
    const cards = document.querySelectorAll('.kanban-card:not([data-rbd-draggable-id="' + initial.draggableId + '"])');
    cards.forEach(card => {
      (card as HTMLElement).style.opacity = '0.8';
      (card as HTMLElement).style.filter = 'blur(0.5px)';
    });
  }, [applyDragOptimizations]);

  const handleDragUpdate = useCallback((update: DragUpdate) => {
    // Throttle updates for better performance
    requestAnimationFrame(() => {
      // Update drop zone indicators
      const destination = update.destination;
      if (destination) {
        const dropZone = document.querySelector(`[data-rbd-droppable-id="${destination.droppableId}"]`);
        if (dropZone) {
          dropZone.classList.add('kanban-column-content--dragging');
        }
      }
    });
  }, []);

  const handleDragEnd = useCallback((result: DropResult) => {
    isDraggingRef.current = false;
    
    // Remove performance optimizations
    removeDragOptimizations();
    
    // Re-enable pointer events
    document.body.style.pointerEvents = '';
    document.body.style.userSelect = '';
    document.body.style.transform = '';
    
    // Restore visual complexity
    const cards = document.querySelectorAll('.kanban-card');
    cards.forEach(card => {
      (card as HTMLElement).style.opacity = '';
      (card as HTMLElement).style.filter = '';
    });
    
    // Remove all dragging indicators
    const dropZones = document.querySelectorAll('.kanban-column-content--dragging');
    dropZones.forEach(zone => {
      zone.classList.remove('kanban-column-content--dragging');
    });
    
    // Use requestAnimationFrame to ensure smooth transition back
    requestAnimationFrame(() => {
      onDragEnd(result);
    });
  }, [onDragEnd, removeDragOptimizations]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      removeDragOptimizations();
    };
  }, [removeDragOptimizations]);

  if (!mounted) {
    return <div>{children}</div>;
  }

  return (
    <DragDropContext 
      onDragStart={handleDragStart}
      onDragUpdate={handleDragUpdate}
      onDragEnd={handleDragEnd}
    >
      {children}
    </DragDropContext>
  );
}
