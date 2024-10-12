import axios from "axios";
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../hook/AuthContext";
import { ROUTES } from "../constants/routes";
import LoadingPage from "./LoadingPage";

const GoogleCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { handleGoogleCallback } = useAuthContext();
    useEffect(() => {
        const handleCallback = async () => {
            const query = new URLSearchParams(location.search);
            const code = query.get('code');
            const state = query.get('state');
            if (code) {
                const result = await handleGoogleCallback(code);
                if (result.status === 200) {
                    navigate(ROUTES.DASHBOARD);
                }
                else {
                    //navigate(ROUTES.LOGIN)
                }
            } else {
                // Handle errors
                const error = query.get('error');
                console.error('OAuth error:', error);
            }
        };

        handleCallback();
    }, [location.search, navigate]);

    return <LoadingPage />;

}

export default GoogleCallback;