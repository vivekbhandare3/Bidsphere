import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from "../api/axios";
import { AuthContext } from '../context/AuthContext';

export default function EditProduct() {
    const { id } = useParams();
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [auction, setAuction] = useState(null);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/seller/edit-product/${id}`, {
            withCredentials:true
        }).then(res => {
            setAuction(res.data.auction);
            setCategories(res.data.categories);
            setLoading(false);
        }).catch(err => {
            setError(err.response?.data?.error || 'Failed to load auction.');
            setLoading(false);
        });
    }, [id, token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const form = e.target;
        const formData = new FormData();
        
        formData.append('productName', form.productName.value);
        formData.append('description', form.description.value);
        formData.append('startingPrice', form.startingPrice.value);
        formData.append('startTimeStr', form.startTimeStr.value);
        formData.append('endTimeStr', form.endTimeStr.value);
        formData.append('categoryId', form.categoryId.value);
        
        if (form.imageFile.files[0]) {
            formData.append('imageFile', form.imageFile.files[0]);
        }

        try {
            await api.put(`/seller/edit-product/${id}`, formData, {
                withCredentials:true,
                headers: { 
                    'Content-Type': 'multipart/form-data' 
                }
            });
            navigate('/seller-dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update auction.');
        }
    };

    if (loading) return <div className="text-center py-20">Loading form...</div>;
    if (error && !auction) return <div className="text-center py-20 text-red-600 font-bold">{error}</div>;

    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">Edit Auction</h2>
                    <Link to="/seller-dashboard" className="text-gray-500 hover:text-gray-800 underline">Cancel</Link>
                </div>

                {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block font-bold text-gray-700 mb-2">Product Title</label>
                        <input type="text" name="productName" defaultValue={auction.productName} className="w-full border rounded-lg px-4 py-3" required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block font-bold text-gray-700 mb-2">Category</label>
                            <select name="categoryId" defaultValue={auction.category?.id} className="w-full border rounded-lg px-4 py-3" required>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block font-bold text-gray-700 mb-2">Starting Price (₹)</label>
                            <input type="number" name="startingPrice" defaultValue={auction.startingPrice} step="0.01" className="w-full border rounded-lg px-4 py-3" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block font-bold text-gray-700 mb-2">Start Time</label>
                            <input type="datetime-local" name="startTimeStr" defaultValue={auction.startTime?.substring(0, 16)} className="w-full border rounded-lg px-4 py-3" required />
                        </div>
                        <div>
                            <label className="block font-bold text-gray-700 mb-2">End Time</label>
                            <input type="datetime-local" name="endTimeStr" defaultValue={auction.endTime?.substring(0, 16)} className="w-full border rounded-lg px-4 py-3" required />
                        </div>
                    </div>

                    <div>
                        <label className="block font-bold text-gray-700 mb-2">Update Product Image (Optional)</label>
                        {auction.imageUrl && (
                            <img src={`${import.meta.env.VITE_IMAGE_URL_LOCAL}/${auction.imageUrls[0]}`} alt="Current" className="h-16 rounded mb-2 border" />
                        )}
                        <input type="file" name="imageFile" accept="image/*" className="w-full border rounded-lg px-4 py-3 bg-gray-50" />
                    </div>

                    <div>
                        <label className="block font-bold text-gray-700 mb-2">Description</label>
                        <textarea name="description" defaultValue={auction.description} rows="4" className="w-full border rounded-lg px-4 py-3"></textarea>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg shadow-md transition text-lg">
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
}