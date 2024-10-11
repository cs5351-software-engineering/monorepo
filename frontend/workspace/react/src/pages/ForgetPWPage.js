import React from 'react';
import { useAuthContext } from '../hook/AuthContext';
import { useTranslation } from 'react-i18next';
import '../styles/ForgetPWPage.css';
import { FaEnvelope } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const ForgetPWPage = () => {
    const { handleForgetPassword } = useAuthContext();
    const { t } = useTranslation();

    const handleSubmit = (event) => {
        event.preventDefault();
        const email = event.target.email.value;
        handleForgetPassword(email);
    };

    return (
        <div className="forget-pw-page">
            <div className='wrapper'>
                <form onSubmit={handleSubmit}>
                    <h1>Forgot Password</h1>
                    <div className='input-box'>
                        <input type="email" name="email" placeholder='Email' required />
                        <FaEnvelope className='icon' />
                    </div>

                    <button type='submit'>Reset Password</button>

                    <div className='login-link'>
                        <p>Remember your password? <Link to={ROUTES.LOGIN}>Login</Link></p>
                    </div>
                </form>
            </div>  
        </div>
    );
}

export default ForgetPWPage;