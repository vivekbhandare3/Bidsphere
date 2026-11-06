import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaGavel, FaShieldAlt, FaClock, FaTrophy, FaSignInAlt, FaUserPlus, FaSearch, FaUser } from 'react-icons/fa';

export default function Home() {
    const { user } = useContext(AuthContext);

    return (
        <div className="bg-[#f0f8fd] min-h-screen relative overflow-hidden text-gray-800">
            {/* Background Decorative Circles */}
            <div className="absolute top-10 left-20 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
            <div className="absolute top-40 right-20 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>

            {/* Hero Section */}
            <div className="relative container mx-auto px-4 py-24 text-center z-10">
                <div className="mb-8 flex justify-center">
                    <span className="bg-[#dcf0fb] text-[#2c88c7] px-5 py-2 rounded-full font-semibold text-sm flex items-center gap-2 shadow-sm border border-blue-100">
                        <FaGavel /> Online Auction Platform
                    </span>
                </div>
                
                <h1 className="text-5xl md:text-6xl font-black text-[#0066b2] mb-6 tracking-tight">
                    Welcome to BidSphere!
                </h1>
                
                <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Discover unique items & exciting auctions. Buy, sell, and bid with confidence on our trusted platform!
                </p>
                
                <div className="flex justify-center gap-4 flex-wrap">
                    {!user ? (
                        <>
                            <Link to="/login" className="bg-[#419be0] hover:bg-[#3482c2] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-md transition">
                                <FaSignInAlt /> Login
                            </Link>
                            <Link to="/register" className="bg-[#419be0] hover:bg-[#3482c2] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-md transition">
                                <FaUserPlus /> Register
                            </Link>
                            <Link to="/auctions" className="bg-[#419be0] hover:bg-[#3482c2] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-md transition">
                                <FaGavel /> Auctions
                            </Link>
                        </>
                    ) : (
                        <Link to="/auctions" className="bg-[#419be0] hover:bg-[#3482c2] text-white px-10 py-4 rounded-xl font-bold text-lg flex items-center gap-2 shadow-md transition">
                            <FaGavel /> Browse Auctions
                        </Link>
                    )}
                </div>
            </div>

            {/* Features Section */}
            <div className="relative container mx-auto px-4 py-16 z-10">
                <h2 className="text-4xl font-bold text-center mb-12 text-[#2c3e50]">Why Choose BidSphere</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <div className="bg-white p-10 rounded-2xl shadow-sm border border-blue-50 text-center hover:shadow-lg transition">
                        <div className="w-16 h-16 bg-[#e1f0fa] rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaShieldAlt className="text-2xl text-[#0066b2]" />
                        </div>
                        <h5 className="text-2xl font-bold mb-3 text-gray-800">Secure Bidding</h5>
                        <p className="text-gray-500">Safe transactions with advanced security protocols.</p>
                    </div>
                    <div className="bg-white p-10 rounded-2xl shadow-sm border border-blue-50 text-center hover:shadow-lg transition">
                        <div className="w-16 h-16 bg-[#e1f0fa] rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaClock className="text-2xl text-[#0066b2]" />
                        </div>
                        <h5 className="text-2xl font-bold mb-3 text-gray-800">Real-time Updates</h5>
                        <p className="text-gray-500">Instant bid notifications so you never miss out.</p>
                    </div>
                    <div className="bg-white p-10 rounded-2xl shadow-sm border border-blue-50 text-center hover:shadow-lg transition">
                        <div className="w-16 h-16 bg-[#e1f0fa] rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaTrophy className="text-2xl text-[#0066b2]" />
                        </div>
                        <h5 className="text-2xl font-bold mb-3 text-gray-800">Win Amazing Items</h5>
                        <p className="text-gray-500">Unique collectibles from sellers worldwide.</p>
                    </div>
                </div>
            </div>

            {/* How it works bottom section */}
            <div className="relative container mx-auto px-4 pb-24 pt-8 z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-10">
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-blue-50 text-center">
                        <div className="w-14 h-14 bg-[#0066b2] rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl">
                            <FaUser />
                        </div>
                        <h4 className="font-bold text-xl mb-2 text-gray-800">Register</h4>
                        <p className="text-sm text-gray-500">Create an account to start bidding or selling on our platform.</p>
                    </div>
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-blue-50 text-center">
                        <div className="w-14 h-14 bg-[#0066b2] rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl">
                            <FaSearch />
                        </div>
                        <h4 className="font-bold text-xl mb-2 text-gray-800">Find Items</h4>
                        <p className="text-sm text-gray-500">Browse or search for items you're interested in from our vast collection.</p>
                    </div>
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-blue-50 text-center">
                        <div className="w-14 h-14 bg-[#0066b2] rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl">
                            <FaGavel />
                        </div>
                        <h4 className="font-bold text-xl mb-2 text-gray-800">Bid or Sell</h4>
                        <p className="text-sm text-gray-500">Place bids on items or list your own for auction and start earning.</p>
                    </div>
                </div>
                
                <div className="text-center">
                    <Link to="/register" className="inline-flex items-center gap-2 bg-[#419be0] hover:bg-[#3482c2] text-white px-8 py-3 rounded-lg font-bold shadow-md transition">
                        <FaUserPlus /> Get Started Today
                    </Link>
                </div>
            </div>
        </div>
    );
}