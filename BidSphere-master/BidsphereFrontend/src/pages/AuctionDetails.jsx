import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from "../api/axios";
import { AuthContext } from '../context/AuthContext';
import { FaArrowLeft, FaGavel, FaHistory, FaSpinner, FaUserCircle, FaStore, FaClock, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

import { database } from '../firebase';
import { ref, onValue } from 'firebase/database';

export default function AuctionDetails() {
    const { id } = useParams(); 
    const { user, token } = useContext(AuthContext);
    
    const [auctionData, setAuctionData] = useState(null);
    const [bidHistory, setBidHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [bidAmount, setBidAmount] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        api.get(`/auctions/${id}`)
            .then(res => {
                setAuctionData(res.data.auction||res.data);
                setBidHistory(res.data.bidHistory || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError("Could not load auction details. It may have been removed.");
                setLoading(false);
            });
    }, [id]);

    useEffect(() => {
        if (!id) return;

        const auctionRef = ref(database, `auctions/${id}`);
        
        const unsubscribe = onValue(auctionRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.currentPrice) {
                setAuctionData(prevData => {
                    if (!prevData) return prevData;
                    return { 
                        ...prevData, 
                        currentPrice: data.currentPrice,
                        firebaseLiveBidder: data.highestBidder 
                    };
                });
            }
        });

        return () => unsubscribe();
    }, [id]);

    const handleBidSubmit = async (e) => {
        e.preventDefault();
        setError(''); 

        if (parseFloat(bidAmount) <= auctionData.currentPrice) {
            setError("Your bid must be higher than the current price!");
            return;
        }

        try {
            await api.post(
                `/place-bid/${id}`, 
                null, 
                { 
                    params: { amount: parseFloat(bidAmount) },
                    withCredentials:true
                }
            );

            setBidAmount('');
            
            const historyRes = await api.get(`/auctions/${id}`);
            setBidHistory(historyRes.data.bidHistory || []);

        } catch (err) {
            console.error("Bidding error:", err);
            setError(err.response?.data?.message || "Failed to place bid. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0f8fd]">
                <FaSpinner className="animate-spin text-[#0066b2] text-5xl mb-4" />
                <p className="text-gray-500 text-lg font-medium">Loading details...</p>
            </div>
        );
    }
    
    if (error && !auctionData) return <div className="min-h-screen bg-[#f0f8fd] p-20 text-center text-red-500 font-bold">{error}</div>;
    if (!auctionData) return <div className="min-h-screen bg-[#f0f8fd] p-20 text-center text-gray-600">Auction not found.</div>;

    const currentLeaderName = auctionData.firebaseLiveBidder 
                              || auctionData.highestBidder?.username 
                              || auctionData.highestBidderName
                              || (typeof auctionData.highestBidder === 'string' ? auctionData.highestBidder : null)
                              || 'No bids yet';

    const formatDate = (dateString) => {
        if (!dateString) return 'Not Set';
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Prepare images array from either the new imageUrls array or fallback to the single imageUrl
    const images = auctionData.imageUrls || (auctionData.imageUrl ? [auctionData.imageUrl] : []);

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="min-h-screen bg-[#f0f8fd] py-8">
            <div className="container mx-auto px-4 md:px-8 max-w-6xl">
                <Link to="/auctions" className="inline-flex items-center gap-2 text-[#0066b2] hover:text-[#004b87] mb-6 font-bold transition-colors">
                    <FaArrowLeft /> Back to Auctions
                </Link>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 shadow-sm text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column: Image Slider, Details, & Seller Info */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-50">
                            
                            {/* Image Slider Container */}
                            <div className="bg-[#f7fbff] h-96 rounded-xl relative flex items-center justify-center mb-6 overflow-hidden border border-blue-50 group p-4">
                                {images.length > 0 ? (
                                    <>
                                        <img 
                                            src={`${import.meta.env.VITE_IMAGE_URL_LOCAL}/${images[currentImageIndex]}`} 
                                            alt={`${auctionData.productName} - View ${currentImageIndex + 1}`} 
                                            className="w-full h-full object-contain transition-opacity duration-300"
                                        />
                                        
                                        {images.length > 1 && (
                                            <>
                                                {/* Left/Right Buttons */}
                                                <button onClick={prevImage} className="absolute left-2 bg-white/80 hover:bg-white text-[#0066b2] p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <FaChevronLeft />
                                                </button>
                                                <button onClick={nextImage} className="absolute right-2 bg-white/80 hover:bg-white text-[#0066b2] p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <FaChevronRight />
                                                </button>
                                                
                                                {/* Dots Indicator */}
                                                <div className="absolute bottom-4 flex gap-2">
                                                    {images.map((_, idx) => (
                                                        <button 
                                                            key={idx}
                                                            onClick={() => setCurrentImageIndex(idx)}
                                                            className={`w-2.5 h-2.5 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-[#0066b2]' : 'bg-gray-300'}`}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <FaGavel className="text-[#a4d4f2] text-6xl opacity-50" />
                                )}
                            </div>

                            <div className="flex items-center gap-3 mb-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${auctionData.status === 'ENDED' ? 'bg-[#d9534f]' : auctionData.status === 'ACTIVE' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                                    {auctionData.status}
                                </span>
                                <span className="text-sm font-semibold text-gray-500">
                                    {auctionData.category?.name || auctionData.categoryName || 'General'}
                                </span>
                            </div>

                            <h1 className="text-3xl font-black text-[#0066b2] mb-4 tracking-tight">{auctionData.productName}</h1>
                            
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {auctionData.description || "No description provided for this item."}
                            </p>
                        </div>

                        {/* Seller & Time Details */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-50">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3">Auction Information</h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="flex flex-col gap-1 text-gray-700 bg-[#f7fbff] border border-blue-50 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 text-xs text-[#0066b2] font-bold uppercase tracking-wide">
                                        <FaStore /> Seller
                                    </div>
                                    <p className="font-medium truncate">
                                        {auctionData.seller?.username || auctionData.sellerName || (typeof auctionData.seller === 'string' ? auctionData.seller : null) || 'System'}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-1 text-gray-700 bg-[#f7fbff] border border-blue-50 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 text-xs text-[#0066b2] font-bold uppercase tracking-wide">
                                        <FaClock /> Start Time
                                    </div>
                                    <p className="font-medium text-sm">{formatDate(auctionData.startTime)}</p>
                                </div>
                                
                                <div className="flex flex-col gap-1 text-gray-700 bg-[#f7fbff] border border-blue-50 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 text-xs text-red-500 font-bold uppercase tracking-wide">
                                        <FaClock /> End Time
                                    </div>
                                    <p className="font-medium text-sm">{formatDate(auctionData.endTime)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Bidding Hub */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#a4d4f2] bg-gradient-to-b from-white to-[#f7fbff]">
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-gray-500 font-semibold text-sm">
                                    {auctionData.status === 'ENDED' ? 'Final Winning Bid' : 'Current Highest Bid'}
                                </p>
                                <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-blue-100 shadow-sm text-xs">
                                    <FaUserCircle className="text-[#0066b2]" />
                                    <span className="font-bold text-[#0066b2] truncate max-w-[100px]">
                                        {currentLeaderName}
                                    </span>
                                </div>
                            </div>
                            
                            <p className="text-4xl font-black text-[#0066b2] mb-8">
                                ₹{auctionData.currentPrice?.toLocaleString('en-IN')}
                            </p>

                            {!user ? (
                                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-[#0066b2] text-center text-sm font-medium">
                                    <p className="mb-1">You must be logged in to place a bid.</p>
                                    <Link to="/login" className="font-bold underline hover:text-[#004b87]">Login Here</Link>
                                </div>
                            ) : auctionData.status === 'ACTIVE' ? (
                                <form onSubmit={handleBidSubmit} className="flex flex-col gap-3">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Place your bid</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="number" 
                                            min={auctionData.currentPrice + 1}
                                            placeholder={`Min: ₹${auctionData.currentPrice + 1}`}
                                            className="flex-grow px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 font-bold text-gray-700"
                                            value={bidAmount}
                                            onChange={(e) => setBidAmount(e.target.value)}
                                            required
                                        />
                                        <button type="submit" className="bg-[#4ba0e0] hover:bg-[#3b8ac5] text-white font-bold px-6 py-3 rounded-lg transition-colors shadow-sm whitespace-nowrap">
                                            Bid Now
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="bg-gray-100 border border-gray-200 p-4 rounded-xl text-gray-600 text-center font-bold">
                                    This auction has ended.
                                </div>
                            )}
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-50">
                            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-gray-100 pb-3 mb-4 text-[#2c3e50]">
                                <FaHistory className="text-[#4ba0e0]"/> Bid History
                            </h3>
                            
                            {bidHistory.length === 0 ? (
                                <p className="text-gray-400 text-center py-6 text-sm">No bids placed yet. Be the first!</p>
                            ) : (
                                <ul className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                    {bidHistory.map((bid, index) => (
                                        <li key={bid.id} className="flex justify-between items-center p-3 bg-[#f7fbff] rounded-xl border border-blue-50 hover:border-blue-100 transition-colors">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-[#0066b2] text-lg">₹{bid.amount.toLocaleString('en-IN')}</span>
                                                    {index === 0 && (
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                                            auctionData.status === 'ENDED' 
                                                                ? 'bg-green-100 text-green-700' 
                                                                : 'bg-[#dcf0fb] text-[#0066b2]'
                                                        }`}>
                                                            {auctionData.status === 'ENDED' ? 'Sold To' : 'Leading'}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-gray-500 font-medium mt-0.5">
                                                    {auctionData.status === 'ENDED' && index === 0 ? '' : 'by '}
                                                    {bid.bidder?.username || bid.bidderName || (typeof bid.bidder === 'string' ? bid.bidder : null) || bid.username || 'Unknown User'}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-400 text-right">
                                                {formatDate(bid.bidTime)}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}