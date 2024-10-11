import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hook/AuthContext';
import { ROUTES } from '../constants/routes';
import LoadingPage from './LoadingPage';

const GithubCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { handleGithubLogin } = useAuthContext();

    useEffect(() => {
        const handleCallback = async () => {
            const searchParams = new URLSearchParams(location.search);
            const code = searchParams.get('code');
            const error = searchParams.get('error');

            if (error) {
                console.log('GitHub authorization error:', error);
                navigate(ROUTES.LOGIN);
                return;
            }

            if (code) {
                try {
                    const result = await handleGithubLogin(code);
                    if (result.status === 200) {
                        navigate(ROUTES.DASHBOARD);
                    } else {
                        navigate(ROUTES.LOGIN);
                    }
                } catch (error) {
                    console.error('GitHub login error:', error);
                    navigate(ROUTES.LOGIN);
                }
            } else {
                console.log('No code received from GitHub');
                navigate(ROUTES.LOGIN);
            }
        };

        handleCallback();
    }, [location, navigate, handleGithubLogin]);

    return <LoadingPage />;
};

export default GithubCallback;