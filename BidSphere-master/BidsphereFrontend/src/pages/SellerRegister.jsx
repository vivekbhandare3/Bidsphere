import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from "../api/axios";
import { FaUserTie } from 'react-icons/fa';

export default function SellerRegister() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        businessName: '', name: '', username: '', email: '', address: '', password: '', role: 'SELLER'
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/register/seller', formData);
            navigate('/login', { state: { message: 'Seller account created! Please login.' } });
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 p-4 py-12">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 overflow-hidden">
                <div className="bg-gray-900 p-6 text-center text-white">
                    <div className="inline-flex items-center justify-center bg-gray-800 rounded-full px-4 py-1 mb-3 text-green-400 font-bold text-sm">
                        <FaUserTie className="mr-2" /> Become a Seller
                    </div>
                    <h2 className="text-2xl font-bold">Seller Registration</h2>
                </div>

                <div className="p-8">
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-600 mb-1 text-sm font-bold">Business Name</label>
                            <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" required 
                                   onChange={(e) => setFormData({...formData, businessName: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-gray-600 mb-1 text-sm font-bold">Owner Name</label>
                            <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" required 
                                   onChange={(e) => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-gray-600 mb-1 text-sm font-bold">Username</label>
                            <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" required 
                                   onChange={(e) => setFormData({...formData, username: e.target.value})}/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-600 mb-1 text-sm font-bold">Email</label>
                                <input type="email" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" required 
                                       onChange={(e) => setFormData({...formData, email: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-gray-600 mb-1 text-sm font-bold">City</label>
                                <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" required 
                                       onChange={(e) => setFormData({...formData, address: e.target.value})} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-600 mb-1 text-sm font-bold">Password</label>
                            <input type="password" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" required 
                                   onChange={(e) => setFormData({...formData, password: e.target.value})} />
                        </div>
                        
                        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition mt-6">
                            Register as Seller
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}