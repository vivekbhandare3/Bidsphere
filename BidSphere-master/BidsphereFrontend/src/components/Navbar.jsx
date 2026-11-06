import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaGavel, FaStore, FaUserCircle, FaShieldAlt, FaSignOutAlt, FaPlusCircle } from 'react-icons/fa';

export default function Navbar() {
    const { isAuthenticated, isSeller, isUser, isAdmin, logout } = useContext(AuthContext);
    const location = useLocation();

    const getLinkClass = (path) => {
        return location.pathname === path 
            ? "bg-[#83c9eb] text-white px-4 py-1.5 rounded-full font-bold transition" 
            : "text-gray-700 hover:text-blue-500 font-bold transition px-2 py-1.5";
    };

    return (
        <nav className="bg-[#e4f4fb] text-gray-800 sticky top-0 z-50 shadow-sm border-b border-blue-100">
            <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                
                {/* Logo */}
                <Link to="/" className="text-3xl font-black text-blue-600 tracking-tight">
                    BidSphere
                </Link>

                {/* Navigation Links */}
                <div className="flex items-center gap-4 text-sm">
                    <Link to="/" className={getLinkClass('/')}>Home</Link>
                    <Link to="/about-us" className={getLinkClass('/about-us')}>About</Link>
                    <Link to="/contact" className={getLinkClass('/contact')}>Contact</Link>
                    <Link to="/auctions" className={getLinkClass('/auctions')}>Auctions</Link>

                    {!isAuthenticated ? (
                        <>
                            <Link to="/login" className={getLinkClass('/login')}>User Login</Link>
                            <Link to="/seller-register" className={getLinkClass('/seller-register')}>Seller Login</Link>
                        </>
                    ) : (
                        <div className="flex gap-4 items-center border-l-2 border-blue-200 pl-6 ml-2">
                            
                            {isSeller && (
                                <>
                                    <Link to="/add-product" className="text-yellow-500 hover:text-yellow-600 flex items-center gap-1 font-bold">
                                        <FaPlusCircle /> Add Product
                                    </Link>
                                    <Link to="/seller-dashboard" className="text-green-600 hover:text-green-700 flex items-center gap-1 font-bold border-r border-gray-300 pr-4">
                                        <FaStore /> Dashboard
                                    </Link>
                                </>
                            )}

                            {isUser && (
                                <Link to="/profile" className="flex items-center gap-1 text-blue-600 font-bold hover:text-blue-800 border-r border-gray-300 pr-4">
                                    <FaUserCircle className="text-lg"/> Profile
                                </Link>
                            )}

                            {isAdmin && (
                                <Link to="/admin/dashboard" className="text-purple-600 hover:text-purple-700 flex items-center gap-1 font-bold border-r border-gray-300 pr-4">
                                    <FaShieldAlt /> Admin Panel
                                </Link>
                            )}
                            
                            <button 
                                onClick={logout} 
                                className="text-red-500 hover:text-red-700 font-bold flex items-center gap-1 transition"
                            >
                                <FaSignOutAlt /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}