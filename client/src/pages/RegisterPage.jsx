import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Sparkles } from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      navigate('/', { replace: true });
    } catch (err) {
      if (err.errors && err.errors.length) {
        setError(err.errors.map((e) => e.message).join('. '));
      } else {
        setError(err.message || 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ApplyTrack</h1>
          <p className="text-sm text-slate-500 mt-1">
            Build your personal recruitment control center
          </p>
        </div>

        {/* Card */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/40">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Create Your Account</h2>

          {error && (
            <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Aditya Sharma"
              required
            />

            <Input
              label="University / Work Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="aditya@scaler.com"
              required
            />

            <Input
              label="Password (min 8 chars, 1 uppercase, 1 symbol)"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              loading={loading}
            >
              Sign Up
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
