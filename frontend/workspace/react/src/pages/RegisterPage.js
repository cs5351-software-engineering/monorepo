import React from 'react';
import { useAuthContext } from '../hook/AuthContext';
import { useTranslation } from 'react-i18next';
import '../styles/RegisterPage.css';
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";

const RegisterPage = () => {
    const { handleRegister } = useAuthContext();
    const { t } = useTranslation();

    const handleSubmit = (event) => {
        event.preventDefault();
        // Add registration logic here
    };

    return (
        <div className="register-page">
            <div className='wrapper'>
                <form onSubmit={handleSubmit}>
                    <h1>Registration</h1>
                    <div className='input-box'>
                        <input type="text" placeholder='Username' required />
                        <FaUser className='icon' />
                    </div>
                    <div className='input-box'>
                        <input type="email" placeholder='Email' required />
                        <FaEnvelope className='icon' />
                    </div>
                    <div className='input-box'>
                        <input type="password" placeholder='Password' required />
                        <FaLock className='icon' />
                    </div>
                    <div className='input-box'>
                        <input type="password" placeholder='Confirm Password' required />
                        <FaLock className='icon' />
                    </div>

                    <div className='terms'>
                        <label>
                            <input type="checkbox" required />
                            <span>I agree to the terms & conditions</span>
                        </label>
                    </div>

                    <button type='submit'>Register</button>

                    <div className='login-link'>
                        <p>Already have an account? <a href="/login">Login</a></p>
                    </div>
                </form>
            </div>  
        </div>
    );
}

export default RegisterPage;