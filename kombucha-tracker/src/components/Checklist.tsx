import React from 'react';
import { useBatchStore } from '../stores/batchStore';
import { Checklist as ChecklistType, Task } from '../types/batch';

interface ChecklistProps {
  batchId: string;
  checklist: ChecklistType;
}

export const Checklist: React.FC<ChecklistProps> = ({ batchId, checklist }) => {
  const { updateTask } = useBatchStore();

  const handleTaskToggle = async (task: Task) => {
    try {
      await updateTask(batchId, checklist.id, task.id, {
        completed: !task.completed,
        completedAt: !task.completed ? Date.now() : undefined,
      });
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const getCompletionPercentage = () => {
    if (checklist.tasks.length === 0) return 0;
    const completedTasks = checklist.tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / checklist.tasks.length) * 100);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{checklist.title}</h3>
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
            {getCompletionPercentage()}%
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {checklist.tasks.map(task => (
          <div
            key={task.id}
            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50"
          >
            <button
              onClick={() => handleTaskToggle(task)}
              className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 ${
                task.completed
                  ? 'bg-green-500 border-green-500'
                  : 'border-gray-300'
              }`}
            >
              {task.completed && (
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className={`text-sm font-medium ${
                  task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                }`}>
                  {task.title}
                </h4>
                {task.dueDate && (
                  <span className="text-xs text-gray-500">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              {task.description && (
                <p className={`mt-1 text-sm ${
                  task.completed ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {task.description}
                </p>
              )}
              {task.completedAt && (
                <p className="mt-1 text-xs text-gray-400">
                  Completed: {new Date(task.completedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 