import { useState, useEffect, useContext } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import api from "../api/axios";
import { AuthContext } from '../context/AuthContext';
import {
    FaEnvelope, FaTrophy, FaFileInvoice, FaMapMarkerAlt, FaUserTag, FaStore
} from 'react-icons/fa';

export default function Profile() {
    const { user, logout, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        api.get("/profile", {
            withCredentials:true
        })
        .then((res) => {
            setProfileData(res.data);
            setLoading(false);
        })
        .catch((err) => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    const handlePayment = (auctionId) => {
        navigate(`/payment/${auctionId}`);
    };

    if (authLoading || loading) {
        return <div className="text-center py-20">Loading profile...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    const userInfo = profileData?.user || {};
    const wonAuctions = profileData?.wonAuctions || [];

    return (
        <div className="container mx-auto px-4 py-10 max-w-5xl">
            {/* PROFILE CARD */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">
                            Welcome, <span className="text-blue-600 ml-2">{userInfo.name || user.username}</span>
                        </h2>
                        <p className="text-gray-500 mt-2">Manage your account and auction activity.</p>
                    </div>
                    
                </div>

                <div className="space-y-3 text-gray-600">
                    <p className="flex items-center gap-2"><FaEnvelope /> {userInfo.email}</p>
                    {userInfo.address && <p className="flex items-center gap-2"><FaMapMarkerAlt /> {userInfo.address}</p>}
                    {userInfo.businessName && <p className="flex items-center gap-2"><FaStore /> {userInfo.businessName}</p>}
                    <p className="flex items-center gap-2"><FaUserTag /> <span className="uppercase font-bold bg-gray-100 px-3 py-1 rounded">{user.role}</span></p>
                </div>
            </div>

            {/* SELLER DASHBOARD LINK */}
            {user.role === "SELLER" && (
                <div className="bg-green-50 border border-green-100 p-6 rounded-xl mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div>
                            <h3 className="font-bold text-xl mb-2">Seller Dashboard</h3>
                            <p className="text-gray-600">Manage your listings, bids and sales.</p>
                        </div>
                        <Link to="/seller-dashboard" className="mt-4 md:mt-0 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full">
                            Go to Dashboard
                        </Link>
                    </div>
                </div>
            )}

            {/* USER WON AUCTIONS */}
            {user.role === "USER" && (
                <>
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <FaTrophy className="text-yellow-500" /> Auctions You Won
                    </h3>

                    {wonAuctions.length === 0 ? (
                        <div className="bg-blue-50 p-6 rounded-xl text-center text-blue-700 font-medium">
                            You haven't won any auctions yet.
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {wonAuctions.map((auction) => (
                                <div key={auction.id} className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col md:flex-row justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-xl text-gray-800">{auction.productName}</h4>
                                        <p className="text-green-600 font-bold mt-1">Winning Bid: ₹{auction.currentPrice?.toLocaleString('en-IN')}</p>
                                        <p className="mt-2 text-sm">
                                            Payment Status: 
                                            <span className={`ml-2 font-bold ${auction.payment ? 'text-green-600' : 'text-orange-500'}`}>
                                                {auction.payment ? 'PAID' : 'PENDING'}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="mt-4 md:mt-0">
                                        {!auction.payment ? (
                                            <button onClick={() => handlePayment(auction.id)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl">
                                                Pay Now
                                            </button>
                                        ) : (
                                            <Link to={`/receipt/${auction.id}`} className="flex items-center gap-2 border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl font-bold">
                                                <FaFileInvoice /> Receipt
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}