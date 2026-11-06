import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from "../api/axios";
import { AuthContext } from '../context/AuthContext';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';
import { FaClock, FaHistory, FaUserCircle } from 'react-icons/fa';

export default function PlaceBid() {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [auction, setAuction] = useState(null);
    const [bidHistory, setBidHistory] = useState([]);
    const [livePrice, setLivePrice] = useState(0);
    const [bidAmount, setBidAmount] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        // Fetch static details and history
        api.get(`/auctions/${id}`)
            .then(res => {
                setAuction(res.data.auction);
                setBidHistory(res.data.bidHistory);
                setLivePrice(res.data.auction.currentPrice);
            });

        // Firebase Realtime Listener
        const auctionRef = ref(db, 'auctions/' + id);
        const unsubscribe = onValue(auctionRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.currentPrice) {
                setLivePrice(data.currentPrice);
            }
        });

        return () => unsubscribe();
    }, [id]);

    const handleBid = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post(`/place-bid/${id}?amount=${bidAmount}`, {}, {
                withCredentials:true,
            });
            setMessage({ type: 'success', text: res.data.message });
            setBidAmount('');
            // Refetch history to show new bid
            const historyRes = await api.get(`/auctions/${id}`);
            setBidHistory(historyRes.data.bidHistory);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Error placing bid' });
        }
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    };

    if (!auction) return <div className="text-center py-20">Loading...</div>;

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Image Section */}
                <div>
                    <img src={`${import.meta.env.VITE_IMAGE_URL_LOACL}/${auction.imageUrls[0]}`} alt="Product" className="w-full rounded-3xl shadow-lg object-cover" />
                </div>

                {/* Details Section */}
                <div>
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-md text-sm font-bold uppercase tracking-wide">
                        {auction.category?.name || 'General'}
                    </span>
                    <h1 className="text-4xl font-extrabold mt-3 mb-4 text-gray-900">{auction.productName}</h1>
                    <p className="text-gray-600 mb-8 leading-relaxed">{auction.description}</p>

                    <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 flex justify-between text-center mb-6 shadow-inner">
                        <div className="w-1/2 border-r border-blue-200">
                            <span className="text-xs font-bold text-gray-500 uppercase">Current Bid</span>
                            <h2 className="text-3xl font-black text-blue-600 mt-1">₹{livePrice}</h2>
                        </div>
                        <div className="w-1/2">
                            <span className="text-xs font-bold text-gray-500 uppercase">Ends At</span>
                            <h5 className="text-xl font-bold text-red-500 mt-2 flex justify-center items-center gap-2">
                                <FaClock /> {auction.endTime ? new Date(auction.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'TBD'}
                            </h5>
                        </div>
                    </div>

                    {/* Bidding Controls */}
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                        {!user ? (
                            <p className="text-center text-gray-600">Please <Link to="/login" className="text-blue-600 font-bold underline">login</Link> to place a bid.</p>
                        ) : (
                            <>
                                {auction.status === 'ACTIVE' && (
                                    <form onSubmit={handleBid}>
                                        <label className="block font-bold text-gray-700 mb-2">Enter Your Bid (Higher than current)</label>
                                        <div className="flex shadow-sm rounded-lg overflow-hidden">
                                            <span className="bg-gray-100 px-4 py-3 border-y border-l border-gray-300 text-gray-600 font-bold">₹</span>
                                            <input 
                                                type="number" 
                                                className="flex-grow px-4 py-3 border-y border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                                min={livePrice + 1}
                                                value={bidAmount}
                                                onChange={(e) => setBidAmount(e.target.value)}
                                                required 
                                            />
                                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 font-bold transition">
                                                Place Bid
                                            </button>
                                        </div>
                                    </form>
                                )}
                                {auction.status === 'UPCOMING' && <div className="text-blue-600 bg-blue-50 p-4 rounded text-center font-bold">Bidding starts soon.</div>}
                                {auction.status === 'ENDED' && <div className="text-red-600 bg-red-50 p-4 rounded text-center font-bold">This auction has closed.</div>}

                                {message.text && (
                                    <div className={`mt-4 p-3 rounded text-center font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {message.text}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Bid History */}
                    <div className="mt-8 bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                        <h4 className="font-bold text-lg mb-4 flex items-center gap-2"><FaHistory className="text-blue-500"/> Bid History</h4>
                        <div className="max-h-60 overflow-y-auto pr-2">
                            {bidHistory.length === 0 ? (
                                <p className="text-center text-gray-400 py-4">No bids placed yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {bidHistory.map((bid, i) => (
                                        <div key={i} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition border border-transparent hover:border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <FaUserCircle className="text-gray-400 text-2xl" />
                                                <span className="font-bold text-gray-700">{bid.bidder.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-green-600 font-black">₹{bid.amount}</div>
                                                <div className="text-xs text-gray-400">{new Date(bid.bidTime).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}