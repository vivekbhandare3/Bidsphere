import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { FaArrowLeft, FaCloudUploadAlt } from 'react-icons/fa';

export default function AddProduct() {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [fileError, setFileError] = useState('');
    
    const [categories] = useState([
        { id: 1, name: 'Electronics' }, { id: 2, name: 'Antiques' }, { id: 3, name: 'Vehicles' }
    ]);

    const handleFileChange = (e) => {
        const files = e.target.files;
        if (files.length !== 3) {
            setFileError('You must select exactly 3 images.');
        } else {
            setFileError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const form = e.target;
        const files = form.imageFiles.files;

        if (files.length !== 3) {
            setFileError('You must select exactly 3 images before submitting.');
            return;
        }

        const formData = new FormData();
        formData.append('productName', form.productName.value);
        formData.append('description', form.description.value);
        formData.append('startingPrice', form.startingPrice.value);
        formData.append('startTimeStr', form.startTimeStr.value);
        formData.append('endTimeStr', form.endTimeStr.value);
        formData.append('categoryId', form.categoryId.value);
        
        // Append all 3 files (Backend needs to be updated to accept multiple files)
        for (let i = 0; i < files.length; i++) {
            formData.append('imageFiles', files[i]);
        }

        try {
            await api.post('/seller/add-product', formData, {
                withCredentials:true,
                headers: { 
                    'Content-Type': 'multipart/form-data' 
                }
            });
            navigate('/seller-dashboard');
        } catch (err) {
            console.error("FULL ERROR RESPONSE:", err.response);
            
            // Extract the exact error message or status code
            const errorMsg = err.response?.data?.error 
                          || err.response?.data?.message 
                          || `Failed with Status Code: ${err.response?.status} (${err.response?.statusText})`;
            
            setError(errorMsg);
        }
    };

    return (
        <div className="min-h-screen bg-[#f0f8fd] py-12 px-4">
            <div className="container mx-auto max-w-3xl">
                <Link to="/seller-dashboard" className="inline-flex items-center gap-2 text-[#0066b2] hover:text-[#004b87] mb-6 font-bold transition-colors">
                    <FaArrowLeft /> Back to Dashboard
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-blue-50 p-8 sm:p-10 relative overflow-hidden">
                    <h2 className="text-3xl font-black text-[#0066b2] mb-8 tracking-tight">Post New Auction</h2>

                    {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Product Title</label>
                            <input type="text" name="productName" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors" required />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                <select name="categoryId" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors text-gray-600" required>
                                    <option value="">-- Choose Category --</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Starting Price (₹)</label>
                                <input type="number" name="startingPrice" step="0.01" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Start Time</label>
                                <input type="datetime-local" name="startTimeStr" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors text-gray-600" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">End Time</label>
                                <input type="datetime-local" name="endTimeStr" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors text-gray-600" required />
                            </div>
                        </div>

                        <div className="bg-[#f7fbff] border-2 border-dashed border-blue-200 rounded-xl p-6 text-center transition hover:bg-blue-50">
                            <FaCloudUploadAlt className="text-4xl text-[#4da6e7] mx-auto mb-3" />
                            <label className="block text-sm font-bold text-gray-700 mb-2 cursor-pointer">
                                Upload Exactly 3 Product Images
                            </label>
                            <input 
                                type="file" 
                                name="imageFiles" 
                                accept="image/*" 
                                multiple
                                onChange={handleFileChange}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-[#0066b2] hover:file:bg-blue-100 cursor-pointer" 
                                required 
                            />
                            {fileError && <p className="text-red-500 text-xs font-bold mt-2">{fileError}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                            <textarea name="description" rows="4" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors custom-scrollbar" required></textarea>
                        </div>

                        <button 
                            type="submit" 
                            disabled={!!fileError}
                            className={`w-full text-white font-bold py-4 rounded-xl shadow-sm transition text-lg ${fileError ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#4ba0e0] hover:bg-[#3b8ac5]'}`}
                        >
                            Publish Auction
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}