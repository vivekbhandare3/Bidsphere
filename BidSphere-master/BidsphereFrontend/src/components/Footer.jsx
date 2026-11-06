import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="bg-[#f7fbff] text-gray-600 mt-auto flex flex-col font-medium border-t border-blue-50">
            {/* Back to Top Bar */}
            <div 
                onClick={scrollToTop}
                className="bg-[#78bce4] hover:bg-[#5da7d4] text-white text-center py-4 cursor-pointer transition font-bold text-sm tracking-wide"
            >
                Back to Top ↑
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left max-w-5xl mx-auto">
                    
                    {/* About Column */}
                    <div className="flex flex-col items-center">
                        <h4 className="text-blue-600 font-bold text-lg mb-4">About Our Auction</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-blue-500 transition">How It Works</a></li>
                            <li><a href="#" className="hover:text-blue-500 transition">About Us</a></li>
                            <li><a href="#" className="hover:text-blue-500 transition">Success Stories</a></li>
                            <li><a href="#" className="hover:text-blue-500 transition">Press & Media</a></li>
                        </ul>
                    </div>

                    {/* Guide Column */}
                    <div className="flex flex-col items-center">
                        <h4 className="text-blue-600 font-bold text-lg mb-4">Buyer & Seller Guide</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-blue-500 transition">How to Bid</a></li>
                            <li><a href="#" className="hover:text-blue-500 transition">List an Item</a></li>
                            <li><a href="#" className="hover:text-blue-500 transition">Auction Rules</a></li>
                            <li><a href="#" className="hover:text-blue-500 transition">Payment & Shipping</a></li>
                        </ul>
                    </div>

                    {/* Connect Column */}
                    <div className="flex flex-col items-center">
                        <h4 className="text-blue-600 font-bold text-lg mb-4">Connect with Us</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><a href="#" className="flex items-center gap-2 hover:text-blue-500 transition"><FaFacebook /> Facebook</a></li>
                            <li><a href="#" className="flex items-center gap-2 hover:text-blue-500 transition"><FaTwitter /> Twitter</a></li>
                            <li><a href="#" className="flex items-center gap-2 hover:text-blue-500 transition"><FaInstagram /> Instagram</a></li>
                            <li><a href="#" className="flex items-center gap-2 hover:text-blue-500 transition"><FaLinkedin /> LinkedIn</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Copyright Banner */}
            <div className="bg-gray-100 border-t border-gray-200 py-4 text-center text-xs text-gray-400">
                &copy; {new Date().getFullYear()} BidSphere | Your Trusted Bidding Platform
            </div>
        </footer>
    );
}