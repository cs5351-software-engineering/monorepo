import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';
import { SidebarData } from './Data';
import { UilSignOutAlt } from '@iconscout/react-unicons';
import ConfirmDialog from './ConfirmDialog';
import { useAuthContext } from '../hook/AuthContext';
import { ROUTES } from '../constants/routes';
import '../styles/ConfirmDialog.css';

const Sidebar = ({ selected, setSelected }) => {
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuthContext();

  const handleLogout = () => {
    setIsLogoutConfirmOpen(true);
  };

  const confirmLogout = () => {
    logout();
    setIsLogoutConfirmOpen(false);
    navigate(ROUTES.LOGIN);
  };

  const closeLogoutDialog = () => {
    setIsLogoutConfirmOpen(false);
  };

  return (
    <div className='Sidebar'>
      {/* logo */}
      <div className='logo'>
        <img src={process.env.PUBLIC_URL + '/images/app-logo.png'} alt='logo' />
        <span>
          <span>A</span>pp
        </span>
      </div>

      {/* menu */}
      <div className='menu'>
        {SidebarData.map((item, index) => {
          return (
            <div
              className={selected === item.heading ? 'menuItem active' : 'menuItem'}
              key={item}
              onClick={() => setSelected(item.heading)}
            >
              <item.icon />
              <span>
                {item.heading}
              </span>
            </div>
          )
        })}

        <div className='menuItem' onClick={handleLogout}>
          <UilSignOutAlt />
          <span>Logout</span>
        </div>
      </div>

      {/* confirm logout dialog */}
      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        onClose={closeLogoutDialog}
        onConfirm={confirmLogout}
        message="Are you sure you want to logout?"
      />
    </div>
  )
};

export default Sidebar;