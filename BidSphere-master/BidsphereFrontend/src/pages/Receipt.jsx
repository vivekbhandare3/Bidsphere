import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from "../api/axios";
import { AuthContext } from '../context/AuthContext';

export default function Receipt() {
    const { id } = useParams();
    const { token } = useContext(AuthContext);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/payment/check/${id}`, {
            withCredentials:true
        }).then(res => {
            // DEBUG: Open your browser console (F12) to see exactly what the backend sent
            console.log("RECEIPT DATA RECEIVED:", res.data);
            
            // This logic captures the payment object whether it is at the root or nested
            const payment = res.data.payment || res.data;
            const auction = res.data.auction || res.data;
            
            setData({ payment, auction });
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [id, token]);

    if (loading) return <div className="text-center py-20">Loading receipt...</div>;
    if (!data?.payment) return <div className="text-center py-20 text-red-600">Receipt not found.</div>;

    const { payment, auction } = data;

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <div className="text-center border-b border-gray-200 pb-6 mb-6">
                    <h2 className="text-3xl text-green-500 font-black tracking-widest">PAID</h2>
                </div>

<div className="space-y-4 text-sm text-gray-600">
    <div className="flex justify-between items-center">
        <span className="font-bold">Transaction ID:</span>
        <span className="font-mono text-xs break-all text-right w-1/2">
            {payment.transactionId ? payment.transactionId : 'N/A'}
        </span>
    </div>
    <div className="flex justify-between">
        <span className="font-bold">Date:</span>
        <span>
            {payment.paymentDate ? new Date(payment.paymentDate).toLocaleString() : 'N/A'}
        </span>
    </div>
    <div className="flex justify-between">
    <span className="font-bold">Buyer:</span>
    <span className="font-bold text-gray-800">
        {/* Read the new 'buyerName' field we just created in the Java model */}
        {payment.buyerName || 'Unknown Buyer'}
    </span>
</div>
    <div className="flex justify-between">
        <span className="font-bold">Payment Method:</span>
        <span>{payment.paymentMethod || 'N/A'}</span>
    </div>
    <hr className="my-4" />
    <div className="flex justify-between">
        <span className="font-bold">Item:</span>
        <span>{auction?.productName || 'N/A'}</span>
    </div>
    <div className="flex justify-between pt-2">
        <span className="font-black text-gray-800">Total Paid:</span>
        <span className="font-black text-blue-600">₹{payment.amount || '0'}</span>
    </div>
</div>

                <div className="mt-10 flex flex-col gap-3">
                    <button onClick={() => window.print()} className="bg-gray-800 text-white py-3 rounded-lg font-bold">Print Receipt</button>
                    <Link to="/profile" className="text-center text-blue-600 border border-blue-600 py-3 rounded-lg font-bold">Back to Profile</Link>
                </div>
            </div>
        </div>
    );
}