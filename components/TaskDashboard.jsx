'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/utils/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { useAuth } from '@/utils/AuthContext';
import Navbar from './Navbar';

const TaskDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(tasksData);
    });

    return unsubscribe;
  }, [user]);

  const handleAddTask = async () => {
    if (!newTask.title.trim() || !newTask.description.trim()) return;
    setLoading(true);

    try {
      if (editingTaskId) {
        const taskRef = doc(db, 'tasks', editingTaskId);
        await updateDoc(taskRef, newTask);
        setEditingTaskId(null);
      } else {
        await addDoc(collection(db, 'tasks'), {
          ...newTask,
          userId: user.uid,
          createdAt: new Date(),
        });
      }

      setNewTask({ title: '', description: '' });
    } catch (error) {
      console.error('Error adding/updating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = (task) => {
    setNewTask({ title: task.title, description: task.description });
    setEditingTaskId(task.id);
  };

  const handleDeleteTask = async (id) => {
    setLoading(true);
    try {
      const taskRef = doc(db, 'tasks', id);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setNewTask({ title: '', description: '' });
  };

  // Filter tasks based on the search query
  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {/* Task Input Form at the Top */}
      <div className="p-6 bg-white shadow-md rounded-lg mx-auto max-w-4xl mt-6">
        <h1 className="text-2xl font-semibold mb-4 text-center text-gray-600">
          {editingTaskId ? 'Edit Task' : 'Add Task'}
        </h1>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Task Title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="text-gray-600 w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <textarea
            placeholder="Task Description"
            value={newTask.description}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
            className="text-gray-600 w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          ></textarea>
          <div className="flex justify-between items-center">
            <button
              onClick={handleAddTask}
              className="bg-purple-600 text-white py-2 px-6 rounded-lg hover:bg-purple-700 transition"
              disabled={loading}
            >
              {loading ? 'Processing...' : editingTaskId ? 'Update Task' : 'Add Task'}
            </button>
            {editingTaskId && (
              <button
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-4xl mx-auto p-6 mt-4">
        <input
          type="text"
          placeholder="Search tasks by title or description"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
        />
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto mt-4 p-4">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="p-4 bg-white border rounded-lg shadow-md hover:shadow-lg transition"
          >
            <h3 className="font-bold text-lg text-black">{task.title}</h3>
            <p className="text-gray-500 break-words mt-2 text-sm">{task.description}</p>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => handleEditTask(task)}
                className="bg-green-900 text-white py-1 px-4 rounded hover:bg-green-600 transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="bg-red-900 text-white py-1 px-4 rounded hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskDashboard;
