import React, { createContext, useState, useEffect, useContext } from 'react';
import config from '../config';
import axios from 'axios';
import { generateCodeVerifier, generateCodeChallenge } from '../utils/pkce';
import { API } from '../constants/api';
import { ROUTES } from '../constants/routes';

export const AuthContext = createContext();

// Remove this line
// const GITHUB_CLIENT_ID = 'Ov23liVVZLlEsxcoDUcx';

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    const storedUser = localStorage.getItem('user');
    if (storedAuth === 'true') {
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
      redirect_uri: 'http://localhost:3000/loginCallback',
      response_type: 'code',
      scope: 'openid email profile',
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  const handleGoogleCallback = async (code) => {

    console.log(code);
    const codeVerifier = localStorage.getItem('code_verifier');
    try {
      const response = await axios.post(API.GET_TOKEN, {
        code: code,
        codeVerifier: codeVerifier,
        redirectUri: 'http://localhost:3000/LoginCallback',
      }, { withCredentials: true });

      if (response.status === 200) {
        //assign token to local storage
        return response
      } else {
        //nothing
        console.error('Authentication failed:', response);
        return response
      }
    } catch (error) {
      //most likely server down
      console.error('Error exchanging code:', error);
      return { "status": "500" }
    }

  }

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