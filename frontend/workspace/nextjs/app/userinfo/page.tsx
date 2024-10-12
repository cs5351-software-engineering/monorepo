'use client';

import { useState, useEffect } from 'react';
import { jwtDecode, JwtPayload } from "jwt-decode";

interface CredentialPayload extends JwtPayload {
  email?: string;
  name?: string;
}

export default function CheckUserInfo() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [credential, setCredential] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<string | null>(null);
  const [accessTokenDecoded, setAccessTokenDecoded] = useState<string | null>(null);
  const [refreshTokenDecoded, setRefreshTokenDecoded] = useState<string | null>(null);

  useEffect(() => {
    // Retrieve access_token, credential, and refresh_token from localStorage
    const storedAccessToken = localStorage.getItem('access_token');
    const storedCredential = localStorage.getItem('credential');
    const storedRefreshToken = localStorage.getItem('refresh_token');
    const storedUserInfo = localStorage.getItem('userinfo');
    const storedAccessTokenDecoded = localStorage.getItem('access_token_decoded');
    const storedRefreshTokenDecoded = localStorage.getItem('refresh_token_decoded');

    setAccessToken(storedAccessToken);
    setCredential(storedCredential);
    setRefreshToken(storedRefreshToken);
    setUserInfo(storedUserInfo);
    setAccessTokenDecoded(storedAccessTokenDecoded);
    setRefreshTokenDecoded(storedRefreshTokenDecoded);

  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Info</h1>

      {/* Display credential */}
      {credential && (
        <div className="bg-gray-100 p-4 rounded mb-4">
          <h2 className="text-xl font-semibold mb-2">Credential:</h2>
          <pre className="whitespace-pre-wrap break-all">{credential}</pre>
        </div>
      )}

      {/* Display user info */}
      {userInfo && (
        <div className="bg-gray-100 p-4 rounded mb-4">
          <h2 className="text-xl font-semibold mb-2">User Info:</h2>
          <pre className="whitespace-pre-wrap break-all">{JSON.stringify(JSON.parse(userInfo), null, 2)}</pre>
        </div>
      )}

      {/* Display access_token */}
      {accessToken && (
        <div className="bg-gray-100 p-4 rounded mb-4">
          <h2 className="text-xl font-semibold mb-2">Access Token:</h2>
          <pre className="whitespace-pre-wrap break-all">{accessToken}</pre>
        </div>
      )}

      {/* Display access_token_decoded */}
      {accessTokenDecoded && (
        <div className="bg-gray-100 p-4 rounded mb-4">
          <h2 className="text-xl font-semibold mb-2">Access Token Decoded:</h2>
          <pre className="whitespace-pre-wrap break-all">{accessTokenDecoded}</pre>
        </div>
      )}

      {/* Display refresh_token */}
      {refreshToken && (
        <div className="bg-gray-100 p-4 rounded mb-4">
          <h2 className="text-xl font-semibold mb-2">Refresh Token:</h2>
          <pre className="whitespace-pre-wrap break-all">{refreshToken}</pre>
        </div>
      )}

      {/* Display refresh_token_decoded */}
      {refreshTokenDecoded && (
        <div className="bg-gray-100 p-4 rounded mb-4">
          <h2 className="text-xl font-semibold mb-2">Refresh Token Decoded:</h2>
          <pre className="whitespace-pre-wrap break-all">{refreshTokenDecoded}</pre>
        </div>
      )}

    </div>
  );
}
