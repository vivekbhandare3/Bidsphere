import { useState, useEffect, useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from "../api/axios";
import { AuthContext } from '../context/AuthContext';
import { FaBoxOpen, FaEdit, FaTrash, FaPlus, FaStore, FaCheckCircle } from 'react-icons/fa';

export default function SellerDashboard() {
    const { user, loading: authLoading } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/seller/dashboard', {
            
                withCredentials:true
        })
        .then(res => {
            if (Array.isArray(res.data)) {
                setProducts(res.data);
            } else {
                setProducts([]); 
            }
            setLoading(false);
        })
        .catch(err => {
            console.error("Dashboard Fetch Error:", err);
            setLoading(false);
        });
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/seller/dashboard', {
                withCredentials:true
            });
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm('Are you sure you want to delete this upcoming auction?')) {
            try {
                await api.delete(`/seller/delete/${id}`, {
                    withCredentials:true
                });
                fetchProducts(); // Refresh list automatically
            } catch (err) {
                alert(err.response?.data?.error || 'Failed to delete listing.');
            }
        }
    };

    if (authLoading || loading) return <div className="text-center py-20">Loading dashboard...</div>;
    if (!user) return <Navigate to="/login" />;
    if (user.role === 'USER') return <Navigate to="/profile" />;

    return (
        <div className="container mx-auto px-4 py-10 max-w-6xl">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Seller Dashboard</h2>
                    <p className="text-gray-500 flex items-center gap-2 mt-1"><FaStore /> {user.username}</p>
                </div>
                <Link to="/add-product" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-bold flex items-center gap-2 shadow-sm transition">
                    <FaPlus /> Create Listing
                </Link>
            </div>

            {/* UNIFIED "ALL LISTINGS" TABLE */}
            <h4 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
                <FaBoxOpen className="text-blue-500" /> All Listings
            </h4>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-10">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 border-b">
    <tr>
        <th className="p-4 font-bold">Product</th>
        <th className="p-4 font-bold">Price</th>
        <th className="p-4 font-bold">Start Time</th>
        <th className="p-4 font-bold">End Time</th>
        <th className="p-4 font-bold">Status</th>
        <th className="p-4 font-bold">Winner</th>
        <th className="p-4 font-bold">Payments</th>
        <th className="p-4 font-bold text-center">Actions</th>
    </tr>
</thead>
                    <tbody>
    {products.map(p => (
        <tr key={p.id} className="border-b hover:bg-gray-50">
            <td className="p-4 font-bold">{p.productName}</td>
            <td className="p-4 text-blue-600">₹{p.currentPrice}</td>
            <td className="p-4 text-sm">{new Date(p.startTime).toLocaleString()}</td>
            <td className="p-4 text-sm">{new Date(p.endTime).toLocaleString()}</td>
            
            <td className="p-4">
                <span className={`px-2 py-1 rounded text-xs font-bold ${p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {p.status}
                </span>
            </td>
            
            {/* --- WINNER DISPLAY COLUMN --- */}
            <td className="p-4 font-bold text-gray-800">
                {p.status === 'ENDED' ? (
                    <span className="text-green-600">{p.winnerName || 'No Winner'}</span>
                ) : (
                    <span className="text-gray-400 italic">N/A</span>
                )}
            </td>
            <td className="p-4">
                <div className={`font-bold ${p.payment?.status === 'COMPLETED' ? 'text-green-600' : 'text-orange-600'}`}>
                        {p.payment?.status || "Pending Payment"}
                </div>
                <div className="text-xs text-gray-500">{p.payment?.transactionId || ""}</div>
            </td>
            <td className="p-4 text-center">
                {/* FIX: Ensure these routes exist in your App.js router */}
                <div className="flex justify-center gap-2">
                    <Link to={`/edit-product/${p.id}`} className="p-2 bg-blue-100 text-blue-600 rounded">
                        <FaEdit />
                    </Link>
                    <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-100 text-red-600 rounded">
                        <FaTrash />
                    </button>
                </div>
            </td>
        </tr>
    ))}
</tbody>
                </table>
            </div>
        </div>
    );
}