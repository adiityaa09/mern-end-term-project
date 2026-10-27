import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import ApplicationCard from './ApplicationCard';
import { STAGE_META } from '../../utils/constants';
import { Plus } from 'lucide-react';

const KanbanColumn = ({ stage, applications, onCardClick, onAddCard }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage
  });

  const meta = STAGE_META[stage] || STAGE_META['Wishlist'];

  return (
    <div className="flex flex-col flex-shrink-0 w-80 bg-slate-100/70 rounded-2xl border border-slate-200/80 p-3 max-h-[calc(100vh-12rem)]">
      {/* Column Header */}
      <div className="flex items-center justify-between px-1.5 py-1 mb-2.5">
        <div className="flex items-center space-x-2">
          <span className={`w-2.5 h-2.5 rounded-full ${meta.dotClass}`} />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {stage}
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white text-slate-600 shadow-2xs border border-slate-200">
            {applications.length}
          </span>
        </div>

        {onAddCard && (
          <button
            onClick={() => onAddCard(stage)}
            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-white rounded-md transition-colors"
            title={`Add application to ${stage}`}
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Cards List / Droppable Area */}
      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto px-1 py-1 rounded-xl transition-colors min-h-[160px] ${
          isOver ? 'bg-blue-50/60 ring-2 ring-blue-400 ring-dashed' : ''
        }`}
      >
        {applications.length === 0 ? (
          <div className="h-full flex items-center justify-center p-4 border border-dashed border-slate-200 rounded-xl text-center">
            <span className="text-xs text-slate-400 font-medium">No applications</span>
          </div>
        ) : (
          applications.map((app) => (
            <ApplicationCard
              key={app._id}
              application={app}
              onClick={onCardClick}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
