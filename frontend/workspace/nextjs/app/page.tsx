"use client"

import * as React from "react"
import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react";
import { handleGoogleLoginSuccess } from '../lib/auth/handleGoogleLoginSuccess';
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

const IndexPage = () => {
  const router = useRouter();

  const [titleFadeIn, setTitleFadeIn] = useState(false);
  const [descriptionFadeIn, setDescriptionFadeIn] = useState(false);
  
  // Fade in title and description
  useEffect(() => {
    setTitleFadeIn(true)
    setTimeout(() => {
      setDescriptionFadeIn(true);
    }, 500);
  }, []);

  return (
    <div className="flex h-screen">

      {/* Left black side */}
      <div className="w-1/2 bg-zinc-900 p-12">
        <div >
          <header className={`text-4xl font-bold mb-4 ${
            titleFadeIn ? 
            "transition-all duration-1000 translate-x-0 text-zinc-300 opacity-100" : 
            "-translate-x-8 text-zinc-900 opacity-0"}`}>CS5351 Software Engineering</header>
          <div className={`${
            descriptionFadeIn ? 
            "transition-all duration-1000 translate-x-0 text-zinc-300 opacity-100" : 
            "-translate-x-8 text-zinc-900 opacity-0"}`}>
            <p className="text-3xl font-bold mb-8">Codebase Analysis</p>
            <p className="text-md">
              Analyze the codebase of a project to find potential issues and improve the quality of the code.
            </p>
          </div>
        </div>

        {/* Github Link */}
        <Link 
          className={`${descriptionFadeIn ? "transition-all duration-1000 opacity-100" : "opacity-0"}`} 
          href="https://github.com/cs5351-software-engineering/monorepo" target="_blank">
          <FontAwesomeIcon className="absolute bottom-12" icon={faGithub} style={{color: "#ffffff", fontSize: "3rem"}} />
        </Link>
      </div>

      {/* Right white side */}
      <div className="w-1/2 bg-white flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-8">Login with Google</h2>

        {/* Google Login */}
        <GoogleLogin onSuccess={
          (credentialResponse) => {
            handleGoogleLoginSuccess(credentialResponse)
            router.push('/userinfo');
          }
        } onError={() => {}} />

        {/* Terms and Privacy */}
        <p className="px-8 text-center mt-8 text-sm text-muted-foreground">
          By clicking continue, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
        </p>

      </div>

    </div>
  );
};

export default IndexPage;
