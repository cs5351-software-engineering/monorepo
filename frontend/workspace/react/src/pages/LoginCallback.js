import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../hook/AuthContext';
import { ROUTES } from '../constants/routes';

const LoginCallback = () => {
    const { handleGitHubLogin } = useAuthContext();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.get('error') === 'access_denied') {
            console.log('Access denied by user');
            navigate(ROUTES.LOGIN, { replace: true });
        } else if (searchParams.get('code')) {
            const code = searchParams.get('code');
            console.log('Received GitHub code:', code);
            handleGitHubLogin(code)
                .then(() => {
                    console.log('GitHub login successful, navigating to home');
                    navigate(ROUTES.HOME, { replace: true });
                })
                .catch((error) => {
                    console.error('GitHub login error:', error);
                    navigate(ROUTES.LOGIN, { replace: true });
                });
        } else {
            console.log('No code found in URL, redirecting to login');
            navigate(ROUTES.LOGIN, { replace: true });
        }
    }, [location, navigate, handleGitHubLogin]);

    return <div>Processing login...</div>;
};

export default LoginCallback;