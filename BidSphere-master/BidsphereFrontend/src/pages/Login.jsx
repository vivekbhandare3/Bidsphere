import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api, { authApi } from '../api/axios';
import { FaUserCircle, FaEnvelope, FaLock, FaEyeSlash, FaSignInAlt } from 'react-icons/fa';

export default function Login() {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.get("/csrf");
            await authApi.post(
                "/authenticate",credentials,
                {
                    withCredentials:true
                }
            );
            login();
        } catch (err) {
            setError("Invalid credentials. Please try again.");
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center bg-[#f0f8fd] p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-blue-50 w-full max-w-[420px] p-10 relative overflow-hidden">
                
                {/* Header Profile Icon */}
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center gap-3 mb-2 text-[#4da6e7]">
                        <FaUserCircle className="text-4xl" />
                        <h2 className="text-3xl font-medium tracking-tight">Welcome Back</h2>
                    </div>
                    <p className="text-gray-500 text-sm">Sign in to your BidSphere account</p>
                </div>
                
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-center text-sm font-medium border border-red-100">{error}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Username/Email Input */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaEnvelope className="text-gray-400" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Email address or Username"
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors placeholder-gray-400"
                            onChange={(e) => setCredentials({...credentials, username: e.target.value})} 
                            required 
                        />
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaLock className="text-gray-400" />
                        </div>
                        <input 
                            type="password" 
                            placeholder="Password"
                            className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors placeholder-gray-400"
                            onChange={(e) => setCredentials({...credentials, password: e.target.value})} 
                            required 
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
                            <FaEyeSlash className="text-gray-400 hover:text-gray-600 transition-colors" />
                        </div>
                    </div>

                    {/* Options Row */}
                    <div className="flex items-center justify-between text-sm mt-2 mb-4">
                        <label className="flex items-center text-gray-500 cursor-pointer">
                            <input type="checkbox" className="mr-2 rounded border-gray-300 text-blue-500 focus:ring-blue-400" />
                            Remember me
                        </label>
                        <a href="#" className="text-[#4da6e7] font-medium hover:underline">Forgot password?</a>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className="w-full bg-[#4ba0e0] hover:bg-[#3b8ac5] text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm">
                        <FaSignInAlt /> Sign In
                    </button>
                </form>

                {/* Keep Google OAuth2 Button Active */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                    <a 
                        href={`${import.meta.env.VITE_API_URL}/oauth2/authorization/google`}
                        className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-lg py-2.5 px-4 bg-white text-gray-600 font-medium text-sm hover:bg-gray-50 shadow-sm transition"
                    >
                        <img className="h-5 w-5" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
                        Sign in with Google
                    </a>
                </div>

                <div className="mt-8 text-center text-sm text-gray-500">
                    Don't have an account? <Link to="/register" className="text-[#4da6e7] font-medium hover:underline">Register now</Link>
                </div>
            </div>
        </div>
    );
}