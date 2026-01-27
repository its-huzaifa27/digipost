import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { apiFetch } from '../../utils/api';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Using apiFetch handles credentials: 'include' automatically
            const data = await apiFetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            // Store user details and token
            localStorage.setItem('user', JSON.stringify(data.user));
            if (data.token) {
                localStorage.setItem('token', data.token);
            }

            // Redirect based on role
            if (data.user.role === 'moderator') {
                navigate('/clients');
            } else {
                navigate('/clients');
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-purple-600">
                    Welcome Back
                </h1>
                <p className="text-gray-500 mt-2">Sign in to manage your digital presence</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <div>
                    <Input
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        rightElement={
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                            >
                                {showPassword ? (
                                    <HiOutlineEyeOff className="w-5 h-5" />
                                ) : (
                                    <HiOutlineEye className="w-5 h-5" />
                                )}
                            </button>
                        }
                    />
                    <div className="text-right mt-1">
                        <Link to="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                            Forgot password?
                        </Link>
                    </div>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center"
                    >
                        {error}
                    </motion.div>
                )}

                <Button
                    type="submit"
                    variant="gradient"
                    className="w-full py-3"
                    disabled={isLoading}
                >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-500">
                Don't have an account?{' '}
                <Link to="/signup" className="text-blue-600 font-semibold hover:text-blue-700">
                    Create Account
                </Link>
            </div>
        </AuthLayout>
    );
}
