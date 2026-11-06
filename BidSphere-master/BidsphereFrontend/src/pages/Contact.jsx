import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaHeadset } from 'react-icons/fa';

export default function Contact() {
    return (
        <div className="min-h-[85vh] bg-[#f0f8fd] relative overflow-hidden flex items-center justify-center py-12 px-4">
            {/* Background Decorative Circles */}
            <div className="absolute top-0 left-10 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 right-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>

            <div className="container mx-auto max-w-4xl relative z-10">
                <div className="text-center mb-12">
                    <span className="bg-[#dcf0fb] text-[#2c88c7] px-5 py-2 rounded-full font-semibold text-sm inline-flex items-center gap-2 shadow-sm border border-blue-100 mb-4">
                        <FaHeadset /> We're here to help
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-[#0066b2] mb-4 tracking-tight">
                        Contact Us
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Have questions about bidding, selling, or your account? Reach out to our dedicated support team.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Email Card */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-50 text-center hover:shadow-md transition">
                        <div className="w-16 h-16 bg-[#e1f0fa] rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaEnvelope className="text-2xl text-[#0066b2]" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Email</h3>
                        <p className="text-[#4da6e7] font-medium">support@bidsphere.com</p>
                    </div>

                    {/* Phone Card */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-50 text-center hover:shadow-md transition">
                        <div className="w-16 h-16 bg-[#e1f0fa] rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaPhoneAlt className="text-2xl text-[#0066b2]" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Phone</h3>
                        <p className="text-[#4da6e7] font-medium">+91-9011223344</p>
                    </div>

                    {/* Address Card */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-50 text-center hover:shadow-md transition">
                        <div className="w-16 h-16 bg-[#e1f0fa] rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaMapMarkerAlt className="text-2xl text-[#0066b2]" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Address</h3>
                        <p className="text-gray-600 font-medium">Pune, Maharashtra, India</p>
                    </div>
                </div>
            </div>
        </div>
    );
}