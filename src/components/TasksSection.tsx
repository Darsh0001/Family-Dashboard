import React, { useState } from 'react';
import { TaskItem, FamilyMember } from '../types/dashboard';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  AlertCircle,
  Clock,
  Sparkles,
  Check,
  X,
} from 'lucide-react';

interface TasksSectionProps {
  tasks: TaskItem[];
  familyMembers: FamilyMember[];
  onToggleTask: (id: string) => void;
  onAddTask: (task: Omit<TaskItem, 'id' | 'createdAt'>) => void;
  onDeleteTask: (id: string) => void;
}

export const TasksSection: React.FC<TasksSectionProps> = ({
  tasks,
  familyMembers,
  onToggleTask,
  onAddTask,
  onDeleteTask,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'overdue'>('pending');
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newAssignee, setNewAssignee] = useState<string>('all');
  const [newCategory, setNewCategory] = useState<TaskItem['category']>('kitchen');

  const todayStr = new Date().toISOString().split('T')[0];

  // Quick preset chores for effortless kitchen taps
  const quickPresets = [
    { title: 'Empty dishwasher', cat: 'kitchen' as const, member: 'zain' },
    { title: 'Take out trash & recycling', cat: 'chores' as const, member: 'tariq' },
    { title: 'Buy milk & eggs', cat: 'groceries' as const, member: 'dad' },
    { title: 'Water herb garden', cat: 'chores' as const, member: 'maya' },
    { title: 'Wipe dining table', cat: 'kitchen' as const, member: 'all' },
    { title: 'Prep school backpacks', cat: 'school' as const, member: 'all' },
  ];

  const handleAddPreset = (preset: typeof quickPresets[0]) => {
    onAddTask({
      title: preset.title,
      isCompleted: false,
      dueDate: todayStr,
      assignedTo: preset.member,
      category: preset.cat,
      priority: 'normal',
    });
  };

  const handleFormSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      title: newTitle.trim(),
      isCompleted: false,
      dueDate: todayStr,
      assignedTo: newAssignee,
      category: newCategory,
      priority: 'normal',
    });

    setNewTitle('');
    setShowAddForm(false);
  };

  const getMember = (id?: string) => {
    return familyMembers.find((m) => m.id === id) || familyMembers[0];
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const isOverdue = !t.isCompleted && t.dueDate < todayStr;

    if (filter === 'pending' && t.isCompleted) return false;
    if (filter === 'overdue' && !isOverdue) return false;

    if (selectedMemberFilter !== 'all' && t.assignedTo !== selectedMemberFilter) {
      return false;
    }

    return true;
  });

  const pendingCount = tasks.filter((t) => !t.isCompleted).length;
  const overdueCount = tasks.filter((t) => !t.isCompleted && t.dueDate < todayStr).length;

  return (
    <div className="kitchen-panel rounded-2xl p-3 sm:p-4 flex flex-col h-full">
      {/* Header with filter tabs and counts */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-amber-400" />
          <h2 className="text-base sm:text-lg font-bold text-stone-100">
            Family Tasks
          </h2>
          {overdueCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-rose-300 bg-rose-950/70 border border-rose-800/80 px-2 py-0.5 rounded-full">
              <AlertCircle className="w-3 h-3 text-rose-400" />
              {overdueCount} Overdue
            </span>
          )}
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-1 bg-stone-900/80 p-0.5 rounded-xl border border-stone-800">
          <button
            onClick={() => setFilter('pending')}
            className={`touch-btn px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'pending'
                ? 'bg-stone-800 text-amber-300 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            To-Do ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`touch-btn px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'overdue'
                ? 'bg-rose-900/60 text-rose-200 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Overdue
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`touch-btn px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-stone-800 text-stone-100 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Family Member filter row */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 mb-2">
        <button
          onClick={() => setSelectedMemberFilter('all')}
          className={`touch-btn min-h-[32px] px-2.5 py-1 text-xs font-semibold rounded-lg shrink-0 border ${
            selectedMemberFilter === 'all'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-stone-900/50 text-stone-400 border-stone-800 hover:text-stone-200'
          }`}
        >
          Everyone
        </button>
        {familyMembers.map((member) => (
          <button
            key={member.id}
            onClick={() => setSelectedMemberFilter(member.id)}
            className={`touch-btn min-h-[32px] px-2.5 py-1 text-xs font-semibold rounded-lg shrink-0 border flex items-center gap-1.5 ${
              selectedMemberFilter === member.id
                ? 'bg-stone-800 text-stone-100 border-stone-600'
                : 'bg-stone-900/50 text-stone-400 border-stone-800 hover:text-stone-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${member.color}`} />
            <span>{member.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Task list container */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
        {filteredTasks.length === 0 ? (
          <div className="py-8 text-center text-stone-400">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-stone-600" />
            <p className="text-sm font-semibold">All caught up!</p>
            <p className="text-xs text-stone-500 mt-0.5">No tasks match this filter</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isOverdue = !task.isCompleted && task.dueDate < todayStr;
            const member = getMember(task.assignedTo);

            return (
              <div
                key={task.id}
                className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  isOverdue
                    ? 'bg-rose-950/25 border-rose-800/60 shadow-sm'
                    : task.isCompleted
                    ? 'bg-stone-900/40 border-stone-800/40 opacity-60'
                    : 'bg-stone-800/70 border-stone-700/60'
                }`}
              >
                {/* Touch checkbox and task content */}
                <button
                  onClick={() => onToggleTask(task.id)}
                  className="touch-btn flex items-center gap-3 flex-1 text-left min-h-[44px]"
                  title={task.isCompleted ? 'Mark incomplete' : 'Mark done'}
                >
                  <div className="min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0">
                    {task.isCompleted ? (
                      <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    ) : isOverdue ? (
                      <div className="w-6 h-6 rounded-lg border-2 border-rose-500 bg-rose-950/40 flex items-center justify-center">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-lg border-2 border-stone-600 hover:border-amber-400" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div
                      className={`text-sm font-semibold leading-tight ${
                        task.isCompleted
                          ? 'line-through text-stone-500'
                          : isOverdue
                          ? 'text-rose-100 font-bold'
                          : 'text-stone-100'
                      }`}
                    >
                      {task.title}
                    </div>

                    {/* Metadata tags */}
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      {isOverdue && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400">
                          Overdue
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-stone-400">
                        <span className={`w-2 h-2 rounded-full ${member.color}`} />
                        <span>{member.name.split(' ')[0]}</span>
                      </span>
                      {task.dueTime && (
                        <span className="flex items-center gap-0.5 text-stone-400 font-mono text-[11px]">
                          <Clock className="w-3 h-3 text-stone-500" />
                          <span>{task.dueTime}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                {/* Delete button */}
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="touch-btn min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-500 hover:text-red-400 rounded-lg"
                  title="Remove task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Kitchen Presets Strip */}
      <div className="mt-2 pt-2 border-t border-stone-800/80">
        <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-tight mb-1.5">
          Quick One-Touch Tasks:
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {quickPresets.map((preset) => (
            <button
              key={preset.title}
              onClick={() => handleAddPreset(preset)}
              className="touch-btn min-h-[36px] px-2.5 py-1 text-xs font-medium rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:bg-stone-800 hover:text-amber-300 shrink-0 flex items-center gap-1"
            >
              <Plus className="w-3 h-3 text-amber-400" />
              <span>{preset.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Add Custom Task Button / Input */}
      {showAddForm ? (
        <form onSubmit={handleFormSubmit} className="mt-2 p-3 rounded-xl bg-stone-800/90 border border-stone-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400">New Family Task</span>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-stone-400 hover:text-stone-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="What needs doing?"
            className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-sm focus:border-amber-500 focus:outline-none"
            autoFocus
          />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-stone-400 block mb-0.5">Assign To</label>
              <select
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-200 text-xs"
              >
                {familyMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-stone-400 block mb-0.5">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as TaskItem['category'])}
                className="w-full px-2 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-200 text-xs"
              >
                <option value="kitchen">Kitchen</option>
                <option value="groceries">Groceries</option>
                <option value="chores">Chores</option>
                <option value="school">School</option>
                <option value="errands">Errands</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              className="touch-btn flex-1 min-h-[44px] py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs"
            >
              Add Task
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="touch-btn px-3 min-h-[44px] py-2 rounded-xl bg-stone-700 text-stone-300 font-semibold text-xs"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="touch-btn mt-2 w-full min-h-[44px] py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 hover:text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Add Custom Task</span>
        </button>
      )}
    </div>
  );
};
