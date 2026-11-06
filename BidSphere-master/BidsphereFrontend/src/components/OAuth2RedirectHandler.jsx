import { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function OAuth2RedirectHandler() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    useEffect(() => {
        const token = searchParams.get('token');
        
        if (token) {
            // Reuses your context setup which pushes context user fetch profile effects
            login(token); 
        } else {
            navigate('/login?error=oauth2_failed');
        }
    }, [searchParams, login, navigate]);

    return (
        <div className="flex flex-col justify-center items-center min-h-[70vh] bg-gray-50">
            <div className="text-center p-6 max-w-sm bg-white rounded-xl shadow-md border border-gray-100">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                <h2 className="text-lg font-bold text-gray-800">Verifying Credentials</h2>
                <p className="text-gray-500 text-sm mt-1">Establishing secure context session...</p>
            </div>
        </div>
    );
}