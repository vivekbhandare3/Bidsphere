import { useState, useEffect } from 'react';
import api from "../api/axios";
import { Link } from 'react-router-dom';
import { FaGavel, FaSpinner } from 'react-icons/fa';

export default function Auctions() {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [keyword, setKeyword] = useState('');
    const [status, setStatus] = useState('All Status');
    const [sort, setSort] = useState('Newest First');

    const [pageNo, setPageNo] = useState(1);
    const [pageSize] = useState(10);

    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
    setLoading(true);

    api.get("/auctions", {
        params: {
            keyword,
            status,
            sortString: sort,
            pageNo,
            pageSize
        }
    })
    .then(res => {

        setAuctions(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);

        setLoading(false);
    })
    .catch(err => {
        console.error("Error fetching auctions:", err);
        setLoading(false);
    });

}, [keyword, status, sort, pageNo, pageSize]);

useEffect(() => {
    setPageNo(1);
}, [keyword, status, sort]);

    return (
        <div className="min-h-screen bg-[#f0f8fd] py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-medium text-[#0066b2] mb-8 text-center tracking-wide">
                    Available Auctions
                </h1>

                {/* Filter and Search Bar */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-2 mb-8 flex flex-col sm:flex-row gap-4 items-center max-w-5xl mx-auto">
                    <input 
                        type="text" 
                        placeholder="Search auctions..." 
                        className="flex-grow px-4 py-2 border-none focus:ring-0 outline-none w-full text-gray-600"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                    <select 
                        className="border border-gray-200 text-gray-500 rounded-md px-4 py-2 bg-white focus:outline-none w-full sm:w-auto"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="All Status">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="ENDED">Ended</option>
                    </select>
                    <select 
                        className="border border-gray-200 text-gray-500 rounded-md px-4 py-2 bg-white focus:outline-none w-full sm:w-auto"
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                    >
                        <option value="Newest First">Newest First</option>
                        <option value="Price: Low to High">Price: Low to High</option>
                        <option value="Price: High to Low">Price: High to Low</option>
                    </select>
                </div>

                {/* Loading State Overlay */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <FaSpinner className="animate-spin text-[#0066b2] text-4xl mb-4" />
                        <p className="text-gray-500 font-medium">Updating results...</p>
                    </div>
                ) : Array.isArray(auctions) && auctions.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {auctions.map(auction => (
                            <div key={auction.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col">
                                
                                <div className="bg-gray-50 h-48 w-full flex items-center justify-center overflow-hidden p-4">
                                    {auction.imageUrls && auction.imageUrls.length > 0 ? (
                                        <img 
                                            // We append the backend URL directly to the filename
                                            src={`${import.meta.env.VITE_IMAGE_URL_LOCAL}/${auction.imageUrls[0]}`} 
                                            alt={auction.productName} 
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        // Fallback if there are no images
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                            <span>No Image</span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-5 flex-grow flex flex-col">
                                    <h2 className="text-[15px] font-bold text-[#0066b2] truncate mb-2">
                                        {auction.productName}
                                    </h2>
                                    
                                    <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                                        {auction.description || "Experience the timeless beauty and spiritual significance of this item..."}
                                    </p>
                                    
                                    <div className="mt-auto font-bold text-gray-800 text-sm mb-4">
                                        Current Bid: <span className="text-[#0066b2]">₹{auction.currentPrice?.toLocaleString('en-IN')}</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${auction.status === 'ENDED' ? 'bg-[#d9534f]' : auction.status === 'ACTIVE' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                                            {auction.status || 'ENDED'}
                                        </span>
                                        
                                        <Link 
                                            to={`/auctions/${auction.id}`} 
                                            className="bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-semibold px-4 py-1.5 rounded transition-colors"
                                        >
                                            View
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
                        <FaGavel className="text-gray-300 text-6xl mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No Matches Found</h3>
                        <p className="text-gray-500">Try adjusting your search keywords or filters.</p>
                        
                    </div>
                )}
                {!loading && totalPages > 0 && (
    <>
        <div className="flex justify-center items-center gap-2 mt-10 flex-wrap">

            <button
                disabled={pageNo === 1}
                onClick={() => setPageNo(pageNo - 1)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
                Previous
            </button>

            {[...Array(totalPages)].map((_, index) => (
                <button
                    key={index}
                    onClick={() => setPageNo(index + 1)}
                    className={`px-4 py-2 rounded ${
                        pageNo === index + 1
                            ? "bg-[#0066b2] text-white"
                            : "bg-white border border-gray-300 hover:bg-gray-100"
                    }`}
                >
                    {index + 1}
                </button>
            ))}

            <button
                disabled={pageNo === totalPages}
                onClick={() => setPageNo(pageNo + 1)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
                Next
            </button>

        </div>

        <div className="text-center mt-4 text-gray-600">
            Page <strong>{pageNo}</strong> of <strong>{totalPages}</strong>
            <br />
            Total Auctions: <strong>{totalElements}</strong>
        </div>
    </>
)}
            </div>
        </div>
    );
}