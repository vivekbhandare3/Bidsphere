import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from "../api/axios";
import { AuthContext } from '../context/AuthContext';

export default function Payment() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);
    const [auction, setAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Verify if user can pay for this auction
        api.get(`/payment/check/${id}`, {
            withCredentials:true
        }).then(res => {
            if (res.data.status === 'already_paid') {
                navigate(`/receipt/${id}`);
            } else {
                setAuction(res.data);
            }
            setLoading(false);
        }).catch(err => {
            setError(err.response?.data?.error || 'Failed to load payment details.');
            setLoading(false);
        });
    }, [id, token, navigate]);

    const handlePayment = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/payment/process/${id}?method=Credit Card`, {}, {
                withCredentials:true
            });
            navigate(`/receipt/${id}`);
        } catch (err) {
            setError(err.response?.data?.error || 'Payment failed.');
        }
    };

    if (loading) return <div className="text-center py-20">Loading secure checkout...</div>;
    if (error) return <div className="text-center py-20 text-red-600 font-bold">{error}</div>;

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">Checkout</h2>
                    <p className="text-gray-500 mt-2">Complete your purchase for <strong className="text-gray-800">{auction?.productName}</strong></p>
                </div>

                <div className="border-b border-gray-200 pb-6 mb-6 flex justify-between items-center">
                    <span className="text-lg text-gray-600 font-medium">Total Amount:</span>
                    <h3 className="text-3xl text-blue-600 font-black">₹{auction?.currentPrice}</h3>
                </div>

                <form onSubmit={handlePayment} className="space-y-5">
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Card Number</label>
                        <input type="text" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0000 0000 0000 0000" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-bold mb-2">Expiry Date</label>
                            <input type="text" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="MM/YY" required />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-bold mb-2">CVV</label>
                            <input type="password" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="123" required />
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg shadow-md transition mt-4 text-lg">
                        Pay Now
                    </button>
                </form>
                
                <div className="text-center mt-6">
                    <Link to="/profile" className="text-gray-500 hover:text-gray-800 underline">Cancel and return to Profile</Link>
                </div>
            </div>
        </div>
    );
}