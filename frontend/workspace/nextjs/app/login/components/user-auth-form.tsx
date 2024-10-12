"use client"

import * as React from "react"
import axios from 'axios'
import { useRouter } from 'next/navigation'

import { cn } from "@/lib/utils"
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

import { jwtDecode } from "jwt-decode";

type UserAuthFormProps = React.HTMLAttributes<HTMLDivElement>

interface TokenResponse {
  access_token: string;
  refreshToken: string;
}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const router = useRouter();

  const handleGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      const response = await axios.post<TokenResponse>('http://localhost:8080/auth/token', {
        clientId: process.env.GOOGLE_CLIENT_ID,
        credential: credentialResponse.credential
      });

      if (
        response.data && 
        response.data.access_token && 
        response.data.refreshToken && 
        credentialResponse.credential
      ) {
        // Store the access token securely (e.g., in localStorage or httpOnly cookie)
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refreshToken);
        localStorage.setItem('credential', credentialResponse.credential);

        const credential_decoded = jwtDecode(credentialResponse.credential);
        localStorage.setItem('userinfo', JSON.stringify(credential_decoded));

        const access_token_decoded = jwtDecode(response.data.access_token);
        localStorage.setItem('access_token_decoded', JSON.stringify(access_token_decoded));

        const refresh_token_decoded = jwtDecode(response.data.refreshToken);
        localStorage.setItem('refresh_token_decoded', JSON.stringify(refresh_token_decoded));
        
        router.push('/userinfo');
      } else {
        console.error('Tokens not found in response:', response.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error:', error.response?.data || error.message);
      } else {
        console.error('Error getting token:', error);
      }
    }
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <div className="flex justify-center items-center">
        <GoogleLogin
          onSuccess={handleGoogleLoginSuccess}
          onError={() => {
            console.log('Login Failed');
          }}
        />
      </div>
    </div>
  )
}
