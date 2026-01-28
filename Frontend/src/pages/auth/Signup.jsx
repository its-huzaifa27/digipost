import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { apiFetch } from '../../utils/api';

export function Signup() {
    const [role, setRole] = useState('user'); // 'user' or 'moderator'
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [secretToken, setSecretToken] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setIsModalOpen(true);
    };

    const handleFinalSignup = async () => {
        setIsLoading(true);
        setError('');

        try {
            const data = await apiFetch('/auth/signup', {
                method: 'POST',
                body: JSON.stringify({ ...formData, role, signupSecret: secretToken })
            });

            // Store user details (token is now HttpOnly cookie + localStorage backup)
            localStorage.setItem('user', JSON.stringify(data.user));
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            // Redirect based on role or default to dashboard
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Signup failed');
            setIsModalOpen(false); // Close modal on error to show error message
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-purple-600">
                    Create Account
                </h1>
                <p className="text-gray-500 mt-2">Join us to streamline your social media</p>
            </div>

            {/* Role Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                <button
                    type="button"
                    onClick={() => setRole('user')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${role === 'user'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    User
                </button>
                <button
                    type="button"
                    onClick={() => setRole('moderator')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${role === 'moderator'
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Moderator
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                    label="Full Name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />

                <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />

                <Input
                    label="Password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
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
                    {isLoading ? 'Processing...' : 'Create Account'}
                </Button>
            </form>

            {/* Secret Token Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Admin Verification"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Please enter the universal admin secret to complete your registration.
                    </p>
                    <Input
                        label="Secret Key"
                        type="password"
                        placeholder="Enter admin secret..."
                        value={secretToken}
                        onChange={(e) => setSecretToken(e.target.value)}
                    />
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleFinalSignup}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Verifying...' : 'Verify & Sign Up'}
                        </Button>
                    </div>
                </div>
            </Modal>

            <div className="mt-8 text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">
                    Sign In
                </Link>
            </div>
        </AuthLayout>
    );
}
