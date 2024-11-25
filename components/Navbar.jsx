'use client';

import { auth } from '@/utils/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserEmail(user.email); // Set the user's email address
    }
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/auth'); // Redirect to auth page after logout
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="w-full bg-violet-900 text-white py-4 px-6 flex justify-between items-center shadow-md">
      <div>
        <h1 className="text-2xl font-bold">Task Manager</h1>
        {userEmail && <p className="text-sm text-gray-200">Logged in as: {userEmail}</p>}
      </div>
      <button
        onClick={handleLogout}
        className="bg-gray-500 hover:bg-gray-600 transition-colors px-4 py-2 rounded"
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
