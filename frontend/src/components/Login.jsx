import React, { useState } from 'react';
import { useAuth } from '../App';
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useAuth();
  // const [username, setUsername] = useState('');
  // const [password, setPassword] = useState('');
  // const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // setError('');
    setErrors({});
    setLoading(true);
    

    try {
      await login(email, password);
      toast.success("Logged in successfully!");
    } catch (err) {
      setErrors(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center mt-5">
      <div className="col-md-5 col-lg-4">
        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <div className="text-center mb-4">
              <i className="bi bi-person-circle display-4 text-primary"></i>
              <h3 className="mt-2 fw-semibold">Welcome Back</h3>
              <p className="text-muted small">Sign in to your account</p>
            </div>


            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-medium">Username</label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-person"></i>
                  </span>
                  <input
                    type="text"
                    // className="form-control"
                    className={`form-control ${errors.email ? "is-invalid" : ""
                      }`}
                    placeholder="Enter your email"
                    // value={username}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors(prev => ({
                        ...prev,
                        email: null
                      }));
                    }}
                  />
                  <div className="invalid-feedback">
                    {errors.email?.[0]}
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label fw-medium">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type="password"
                    // className="form-control"
                    className={`form-control ${errors.password ? "is-invalid" : ""
                      }`}
                    placeholder="Enter your password"
                    value={password}
                    // onChange={(e) => setPassword(e.target.value)}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors(prev => ({
                        ...prev,
                        password: null
                      }));
                    }}
                  />
                  <div className="invalid-feedback">
                    {errors.password?.[0]}
                  </div>
                </div>
              </div>
              <button
                className="btn btn-primary w-100 py-2"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right me-2"></i>Login
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
