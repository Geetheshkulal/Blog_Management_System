import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../App';
import toast from "react-hot-toast";

export default function UserManager() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', first_name: '', last_name: '' });
  // const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data.results || data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');
    try {
      await api.createUser(form);
      setForm({ username: '', email: '', password: '', first_name: '', last_name: '' });
      setShowForm(false);
      // setSuccess(`User "${form.username}" created successfully`);
      toast.success(`User "${form.username}" created successfully`);
      loadUsers();
    } catch (err) {
      setErrors(err);
      // const msg = err.username || err.email || err.password || err.detail || 'Failed to create user';
      // setError(Array.isArray(msg) ? msg[0] : (typeof msg === 'string' ? msg : JSON.stringify(msg)));
    }
  };

  const handleDelete = async (userId, username) => {
    if (userId === currentUser.id) {
      alert("You cannot delete your own account");
      return;
    }
    if (!window.confirm(`Delete user "${username}"?`)) return;
    try {
      await request(`/api/users/${userId}/`, { method: 'DELETE' });
      loadUsers();
      toast.success("User deleted successfully");
    } catch (err) {
      alert(err.detail || 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted mt-2">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-semibold mb-0">
            <i className="bi bi-people me-2"></i>Manage Users
          </h4>
          <button
            className={`btn ${showForm ? 'btn-outline-secondary' : 'btn-primary'} btn-sm`}
            onClick={() => { setShowForm(!showForm); setError(''); setSuccess(''); }}
          >
            <i className={`bi ${showForm ? 'bi-x-lg' : 'bi-plus-circle'} me-1`}></i>
            {showForm ? 'Cancel' : 'Create User'}
          </button>
        </div>

        {success && (
          <div className="alert alert-success py-2" role="alert">
            <i className="bi bi-check-circle me-2"></i>{success}
          </div>
        )}

        {showForm && (
          <div className="card bg-light border-0 mb-4">
            <div className="card-body p-4">
              <h6 className="fw-medium mb-3">
                <i className="bi bi-person-plus me-2"></i>New User Details
              </h6>


              <form onSubmit={handleCreate}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-medium small">Username *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                      value={form.username}
                      onChange={(e) => {
                        setForm({ ...form, username: e.target.value });
                        setErrors(prev => ({ ...prev, username: null }));
                      }}
                    />
                    <div className="invalid-feedback">
                      {errors.username?.[0]}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium small">Email *</label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      value={form.email}
                      onChange={(e) => {
                        setForm({ ...form, email: e.target.value });
                        setErrors(prev => ({ ...prev, email: null }));
                      }}
                    />
                    <div className="invalid-feedback">
                      {errors.email?.[0]}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium small">Password * <span className="text-muted fw-normal">(min 8 chars)</span></label>
                    <input
                      type="password"
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      value={form.password}
                      // onChange={(e) => setForm({ ...form, password: e.target.value })}
                      onChange={(e) => {
                        setForm({ ...form, password: e.target.value });
                        setErrors(prev => ({ ...prev, password: null }));
                      }}
                    />
                    <div className="invalid-feedback">
                      {errors.password?.[0]}
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-medium small">First Name</label>
                    <input
                      type="text"
                      className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                      value={form.first_name}
                      onChange={(e) => {
                        setForm({ ...form, first_name: e.target.value });
                        setErrors(prev => ({ ...prev, first_name: null }));
                      }}
                    />
                    <div className="invalid-feedback">
                      {errors.first_name?.[0]}
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-medium small">Last Name</label>
                    <input
                      type="text"
                      className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                      value={form.last_name}
                      // onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                      onChange={(e) => {
                        setForm({ ...form, last_name: e.target.value });
                        setErrors(prev => ({ ...prev, last_name: null }));
                      }}
                    />
                      <div className="invalid-feedback">
                      {errors.last_name?.[0]}
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <button className="btn btn-primary btn-sm" type="submit">
                    <i className="bi bi-check-lg me-1"></i>Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Created At</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td className="text-muted">{u.id}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-person-circle me-2 text-muted"></i>
                      {u.username}
                      {u.id === currentUser.id && (
                        <span className="badge bg-primary ms-2 small">you</span>
                      )}
                    </div>
                  </td>
                  <td className="text-muted">{u.email}</td>
                  <td>{u.first_name} {u.last_name}</td>
                  <td>
                    {u.is_staff ? (
                      <span className="badge bg-warning text-dark">Admin</span>
                    ) : (
                      <span className="badge bg-secondary">User</span>
                    )}
                  </td>
                  <td>
                    {u.date_joined ? new Date(u.date_joined).toLocaleString() : '-'}
                  </td>
                  <td className="text-end">
                    {u.id !== currentUser.id && (
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(u.id, u.username)}
                      >
                        <i className="bi bi-trash me-1"></i>Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

async function request(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };
  if (token) headers['Authorization'] = `Token ${token}`;
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw { status: res.status, ...err };
  }
  if (res.status === 204) return null;
  return res.json();
}
