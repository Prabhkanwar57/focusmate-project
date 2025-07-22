'use client';
import React from 'react';
import { CheckSquare, Clock, Heart } from 'lucide-react';

export default function DashboardContent() {
  const tasks = [
    { id: 1, title: 'Complete project documentation', completed: false },
    { id: 2, title: 'Review team progress', completed: true },
    { id: 3, title: 'Prepare presentation slides', completed: false }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">8/12</p>
            </div>
            <CheckSquare className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Focus Sessions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">4</p>
            </div>
            <Clock className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Mood</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">😊 Happy</p>
            </div>
            <Heart className="text-red-500" size={24} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today's Tasks</h3>
          <div className="space-y-2">
            {tasks.slice(0, 3).map(task => (
              <div key={task.id} className="flex items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                <input 
                  type="checkbox" 
                  checked={task.completed}
                  readOnly
                  className="mr-3 rounded"
                />
                <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                  {task.title}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Productivity Chart</h3>
          <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
            <div className="ml-2 text-gray-500">Chart placeholder</div>
          </div>
        </div>
      </div>
    </div>
  );
}