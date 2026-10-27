import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import KanbanColumn from './KanbanColumn';
import ApplicationCard from './ApplicationCard';
import { STAGE_LIST, isValidTransition, VALID_TRANSITIONS } from '../../utils/constants';

const KanbanBoard = ({
  applications,
  onStageChange,
  onCardClick,
  onAddCard,
  onError
}) => {
  const [activeCard, setActiveCard] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5 // 5px threshold to distinguish clicks from drags
      }
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const card = applications.find((a) => a._id === active.id);
    setActiveCard(card || null);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const applicationId = active.id;
    const targetStage = over.id; // Target column stage name

    const app = applications.find((a) => a._id === applicationId);
    if (!app || app.stage === targetStage) return;

    // 1. Client-side transition validation check
    if (!isValidTransition(app.stage, targetStage)) {
      const allowed = VALID_TRANSITIONS[app.stage] || [];
      const errorMsg = `Invalid stage jump from '${app.stage}' to '${targetStage}'. Allowed next stages: ${
        allowed.length ? allowed.join(', ') : 'None (Terminal stage)'
      }`;
      if (onError) onError(errorMsg);
      return;
    }

    // 2. Delegate to parent for optimistic update & API execution
    await onStageChange(applicationId, targetStage, app.stage);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex space-x-4 overflow-x-auto pb-4 pt-1 items-start">
        {STAGE_LIST.map((stage) => {
          const stageApps = applications.filter((app) => app.stage === stage);
          return (
            <KanbanColumn
              key={stage}
              stage={stage}
              applications={stageApps}
              onCardClick={onCardClick}
              onAddCard={onAddCard}
            />
          );
        })}
      </div>

      {/* Floating Drag Preview */}
      <DragOverlay>
        {activeCard ? (
          <div className="w-80 rotate-2 scale-105 pointer-events-none opacity-90 shadow-2xl">
            <ApplicationCard application={activeCard} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;
