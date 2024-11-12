import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../AuthProvider/AuthProvider';

export default function PrivateRoute() {
    const user = useAuth();
    if(!user.token) return <Navigate to="/" />;
    return <Outlet />;
};