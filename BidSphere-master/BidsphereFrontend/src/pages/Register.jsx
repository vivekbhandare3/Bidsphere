import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from "../api/axios";

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', username: '', email: '', address: '', password: '', role: 'USER'
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Include username in the payload
            await api.post('/register/user', formData);
            navigate('/login', { state: { message: 'Registration successful! Please login.' } });
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-100">
                <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">Create Account</h3>
                
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-600 mb-1 text-sm font-bold">Full Name</label>
                        <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required 
                               onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-gray-600 mb-1 text-sm font-bold">Username</label>
                        <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required 
                               onChange={(e) => setFormData({...formData, username: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-gray-600 mb-1 text-sm font-bold">Email</label>
                        <input type="email" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required 
                               onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-gray-600 mb-1 text-sm font-bold">City / Address</label>
                        <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required 
                               onChange={(e) => setFormData({...formData, address: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-gray-600 mb-1 text-sm font-bold">Password</label>
                        <input type="password" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required 
                               onChange={(e) => setFormData({...formData, password: e.target.value})} />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition mt-4">
                        Register
                    </button>
                </form>
                <p className="text-center mt-6 text-gray-600">
                    Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
}