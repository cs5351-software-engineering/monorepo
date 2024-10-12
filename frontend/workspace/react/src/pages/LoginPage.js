import React from 'react';
import { Button, Form, Grid, Header, Segment } from 'semantic-ui-react';
import { useAuthContext } from '../hook/AuthContext';
import { useTranslation } from 'react-i18next';
import { GoogleLogin } from '@react-oauth/google';
import '../styles/GitHubButton.css';
import '../styles/LoginPage.css';
import { FaUser, FaLock, FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc"; // Import Google icon
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const LoginPage = () => {
    const { handleGoogleLogin, initiateGitHubLogin } = useAuthContext();
    const { t } = useTranslation();
    const [user, setUser] = React.useState([]);

    return (
        <div className="login-page">
            <div className='wrapper'>
                <form action="">
                    <h1>Login</h1>

                    {/* <div className='input-box'>
                        <input type="text" placeholder='Username' required />
                        <FaUser className='icon' />
                    </div>
                    <div className='input-box'>
                        <input type="password" placeholder='Password' required />
                        <FaLock className='icon' />
                    </div>

                    <div className='remember-forgot'>
                        <label><input type="checkbox" />Remember me</label>
                        <Link to={ROUTES.FORGET_PASSWORD}>Forgot Password</Link>
                    </div>

                    <button type='submit'>Login</button>

                    <div className='register-link'>
                        <p>Don't have an account? <a href="/registration">Register</a></p>
                    </div> */}

                    <div className='alternative-login'>
                        <div className='divider'>
                            <span>Or</span>
                        </div>
                    </div>

                    <div className='social-login'>
                        <GoogleLogin
                            onSuccess={credentialResponse => {
                                console.log(credentialResponse);
                                setUser(credentialResponse);
                                // handleGoogleLogin(credentialResponse);
                            }}
                            onError={() => {
                                console.log('Google Login Failed');
                            }}
                        />
                        {/* <button className="google-button" onClick={handleGoogleLogin}>
                            <FcGoogle className="button-icon" />
                            <span>Login with Google</span>
                        </button>
                        
                        <button className="github-button" onClick={initiateGitHubLogin}>
                            <FaGithub className="button-icon" />
                            <span>Login with GitHub</span>
                        </button> */}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;