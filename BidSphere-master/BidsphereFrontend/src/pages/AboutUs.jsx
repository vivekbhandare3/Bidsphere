export default function AboutUs() {
    return (
        <div className="container mx-auto px-4 py-20 max-w-4xl text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-6">About BidSphere</h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-16">
                We are a dedicated team working to provide a seamless, secure, and user-friendly platform for buying and selling items through online auctions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">JB</div>
                    <h5 className="text-xl font-bold text-gray-900">Janardan Borse</h5>
                    <p className="text-blue-600 font-medium">Co-Founder</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">VB</div>
                    <h5 className="text-xl font-bold text-gray-900">Vivek Bhandare</h5>
                    <p className="text-green-600 font-medium">Co-Founder</p>
                </div>
            </div>
        </div>
    );
}