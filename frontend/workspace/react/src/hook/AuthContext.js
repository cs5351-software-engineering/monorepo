import React, { createContext, useState, useEffect, useContext } from 'react';
import config from '../config';
import axios from 'axios';
import { generateCodeVerifier, generateCodeChallenge } from '../utils/pkce';
import { API } from '../constants/api';
import { ROUTES } from '../constants/routes';

export const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    if (accessToken &&refreshToken ) {  //later do more auth
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleGoogleLogin = async () => {
    const codeVerifier = generateCodeVerifier();
    localStorage.setItem('code_verifier', codeVerifier);

    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = 42; // You can implement generateRandomString similarly to codeVerifier

    const params = new URLSearchParams({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      redirect_uri: `${window.location.origin}${ROUTES.LOGIN_CALLBACK}`,
      response_type: 'code',
      scope: 'openid email profile',
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  const handleGoogleCallback = async (code) => {
    console.log("Authorization code received:", code);

    // Retrieve the code verifier from storage
    const codeVerifier = localStorage.getItem('code_verifier'); // Consider using sessionStorage
    if (!codeVerifier) {
      console.error('Code verifier not found in storage.');
      return { status: 400, message: "Invalid request: Code verifier missing." };
    }

    try {
      const payload = {
        code,
        code_verifier: codeVerifier, 
        redirect_uri: `${window.location.origin}${ROUTES.LOGIN_CALLBACK}`
      };

      // Make the POST request to exchange the authorization code for tokens
      const response = await axios.post(API.GET_TOKEN, payload, { withCredentials: true });

      if (response.status === 200) {
        const { access_token, refresh_token } = response.data;

        if (access_token && refresh_token) {
          // Store tokens securely
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
          console.log('Tokens successfully stored.');
          return { status: 200, data: response.data };
        } else {
          console.error('Tokens not found in the response:', response.data);
          return { status: 500, message: "Tokens missing in the response." };
        }
      } else {
        // Handle unexpected status codes
        console.error('Authentication failed with status:', response.status, response.data);
        return { status: response.status, message: 'Authentication failed.' };
      }
    } catch (error) {
      // Handle network or server errors
      if (error.response) {
        // Server responded with a status other than 2xx
        console.error('Server error during token exchange:', error.response.data);
        return { status: error.response.status, message: error.response.data };
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received from server:', error.request);
        return { status: 503, message: 'Service unavailable. Please try again later.' };
      } else {
        // Other errors
        console.error('Error setting up the request:', error.message);
        return { status: 500, message: 'Internal server error.' };
      }
    } finally {
      localStorage.removeItem('code_verifier'); // Ensure it's removed after use for security
    }
  };


  const initiateGitHubLogin = async () => {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    localStorage.setItem('github_code_verifier', codeVerifier);

    const redirectUri = encodeURIComponent(`http://localhost:3000${ROUTES.LOGIN_CALLBACK}`);
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${config.githubClientId}&redirect_uri=${redirectUri}&scope=user&code_challenge=${codeChallenge}&code_challenge_method=S256`;

    window.location.href = githubAuthUrl;
  };

  const handleGitHubLogin = async (code) => {
    try {
      console.log('Exchanging code for access token');
      const codeVerifier = localStorage.getItem('github_code_verifier');

      const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: config.githubClientId,
        code_verifier: codeVerifier,
        code: code,
      }, {
        headers: {
          Accept: 'application/json',
        },
      });

      const { access_token } = tokenResponse.data;

      if (access_token) {
        console.log('Access token received');
        localStorage.setItem('github_token', access_token);

        console.log('Fetching user profile');
        const userResponse = await axios.get('https://api.github.com/user', {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });

        const userProfile = userResponse.data;
        console.log('User profile received:', userProfile);

        setUser(userProfile);
        setIsAuthenticated(true);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(userProfile));

        console.log('Authentication complete');
        return Promise.resolve();
      } else {
        throw new Error('Failed to get access token');
      }
    } catch (error) {
      console.error('GitHub login error:', error);
      return Promise.reject(error);
    } finally {
      localStorage.removeItem('github_code_verifier');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
  };

  const handleForgetPassword = async (email) => {
    try {
      // Implement your forget password logic here
      // This might involve calling an API endpoint
      console.log('Forget password requested for:', email);
      // You might want to show a success message to the user
    } catch (error) {
      console.error('Error in forget password:', error);
      // Handle the error (e.g., show an error message to the user)
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      logout,
      user,
      loading,
      authError,
      handleGoogleLogin,
      handleGoogleCallback,
      handleGitHubLogin,
      initiateGitHubLogin,
      handleForgetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  return useContext(AuthContext);
};