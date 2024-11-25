'use client';

import TaskDashboard from '@/components/TaskDashboard';
import { useAuth } from '@/utils/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const TasksPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth'); // Redirect to auth page if not authenticated
    }
  }, [loading, user, router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null; // Prevent UI flash during redirect

  return <TaskDashboard />;
};

export default TasksPage;
