import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function GoogleCallback() {
    const [searchParams] = useSearchParams();
    const { setUserFromApi } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            try {
                // Simple JWT decode without external library
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                const user = JSON.parse(jsonPayload);

                // Ensure we map the fields correctly to what setUserFromApi expects
                setUserFromApi({
                    id: user.id || user.sub, // 'sub' is standard jwt subject, but we signed with 'id'
                    name: user.name,
                    email: user.email,
                    role: user.role
                });

                // We can also store the token if needed for future API calls
                // localStorage.setItem('authToken', token);

                navigate('/');
            } catch (error) {
                console.error('Failed to process Google login', error);
                navigate('/login?error=auth_failed');
            }
        } else {
            navigate('/login?error=no_token');
        }
    }, [searchParams, setUserFromApi, navigate]);

    return (
        <div className="h-screen flex items-center justify-center bg-slate-50">
            <div className="text-xl font-medium text-slate-600">Processing Google Login...</div>
        </div>
    );
}

export default GoogleCallback;
