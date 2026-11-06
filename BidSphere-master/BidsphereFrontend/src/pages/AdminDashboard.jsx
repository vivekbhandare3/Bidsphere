import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from "../api/axios";
import { FaTrash, FaUser, FaGavel } from 'react-icons/fa';

export default function AdminDashboard() {
    const { token } = useContext(AuthContext);
    const [data, setData] = useState({ users: [], auctions: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const res = await api.get("/admin/dashboard", {
                withCredentials:true
            });
            setData(res.data);
        } catch (err) {
            console.error("Dashboard Error:", err);
            setError(err.response?.data?.message || "Failed to load dashboard data. Are you sure you restarted Spring Boot?");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.post(`/admin/delete-user/${id}`, {}, {
                withCredentials:true
            });
            fetchDashboardData(); // Refresh the list
        } catch (err) {
            alert(err.response?.data || "Error deleting user");
        }
    };

    const handleDeleteAuction = async (id) => {
        if (!window.confirm("Are you sure you want to delete this auction?")) return;
        try {
            await api.post(`/admin/delete-auction/${id}`, {}, {
                withCredentials:true
            });
            fetchDashboardData(); // Refresh the list
        } catch (err) {
            alert(err.response?.data?.error || "Error deleting auction");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="bg-red-100 text-red-700 p-6 rounded-lg max-w-lg text-center shadow-md border border-red-200">
                    <h3 className="font-bold text-xl mb-2">Access Denied</h3>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="text-3xl font-black text-gray-800 mb-8 border-b pb-4">System Administrator Panel</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Users Management Section */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="bg-purple-600 text-white px-6 py-4 flex items-center gap-2">
                        <FaUser className="text-xl" />
                        <h2 className="text-xl font-bold">Registered Users ({data.users?.length || 0})</h2>
                    </div>
                    <div className="p-0 max-h-[500px] overflow-y-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b">
                                    <th className="p-4 font-bold text-gray-600">ID</th>
                                    <th className="p-4 font-bold text-gray-600">Username</th>
                                    <th className="p-4 font-bold text-gray-600">Role</th>
                                    <th className="p-4 text-center font-bold text-gray-600">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.users?.map(user => (
                                    <tr key={user.id} className="border-b hover:bg-gray-50">
                                        <td className="p-4 text-gray-500">{user.id}</td>
                                        <td className="p-4 font-medium text-gray-800">{user.username}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : user.role === 'SELLER' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            {user.role !== 'ADMIN' && (
                                                <button onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:text-red-700 transition">
                                                    <FaTrash />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Auctions Management Section */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="bg-gray-800 text-white px-6 py-4 flex items-center gap-2">
                        <FaGavel className="text-xl" />
                        <h2 className="text-xl font-bold">System Auctions ({data.auctions?.length || 0})</h2>
                    </div>
                    <div className="p-0 max-h-[500px] overflow-y-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b">
                                    <th className="p-4 font-bold text-gray-600">Item</th>
                                    <th className="p-4 font-bold text-gray-600">Status</th>
                                    <th className="p-4 font-bold text-gray-600">Price</th>
                                    <th className="p-4 text-center font-bold text-gray-600">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.auctions?.map(auction => (
                                    <tr key={auction.id} className="border-b hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-800">{auction.productName}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${auction.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : auction.status === 'ENDED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {auction.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-600">₹{auction.currentPrice}</td>
                                        <td className="p-4 text-center">
                                            {auction.status !== 'ACTIVE' && (
                                                <button onClick={() => handleDeleteAuction(auction.id)} className="text-red-500 hover:text-red-700 transition">
                                                    <FaTrash />
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
        </div>
    );
}