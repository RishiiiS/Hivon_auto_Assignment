'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);

  const loadUsers = async () => {
    try {
      const data = await api.get('/admin/users');
      if (data.error) {
        setError(data.error);
      } else {
        setUsers(data.users || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    
    setUpdating(userId);
    const res = await api.put('/admin/users', { userId, role: newRole });
    setUpdating(null);

    if (res.error) {
      alert(res.error);
      return;
    }
    
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Users</h1>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6 border border-red-100">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-gray-500 text-sm">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-6 text-gray-500 text-sm">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {u.name || 'Unnamed User'}
                    </td>
                    <td className="px-6 py-4">
                      {u.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${u.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <select 
                        disabled={updating === u.id}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
