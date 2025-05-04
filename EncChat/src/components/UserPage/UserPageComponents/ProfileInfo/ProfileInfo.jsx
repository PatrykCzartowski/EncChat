import Styles from './ProfileInfo.module.css';
import { useAuth } from '../../../../Auth/AuthProvider';
import Loading from '../../../Utils/Loading/Loading';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

export default function ProfileInfo({ userId, profile, setSettingsOpen, setProfileOpen, setBlockedUsersOpen }) {
    const auth = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const menuRef = useRef(null);


    const handleLogout = () => {
        auth.logOut();
    };

    const toggleMenu = (event) => {
        setMenuOpen(!menuOpen);
        if (!menuOpen) {
            setMenuPosition({ x: event.clientX + 10, y: event.clientY + 10 });
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        if (menuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen]);

    return (
        <div className={Styles.profileInfo}>
            <div className={Styles.personalInfoBox}>
            <div className={Styles.profileAvatarBox} onClick={toggleMenu}>
                    <img
                        className={Styles.profileAvatar}
                        src={profile.avatar}
                        alt="Profile"
                        width="100px"
                        height="100px"
                    />
                </div>
                {menuOpen && (
                    <div 
                        className={Styles.dropdownMenu} 
                        ref={menuRef} 
                        style={{ top: `${menuPosition.y}px`, left: `${menuPosition.x}px` }}
                    >
                        <ul>
                            <li onClick={() => {
                            setProfileOpen(false);
                            setSettingsOpen(true);
                            }}>Edit general settings</li>

                            <li onClick={() => {
                            setSettingsOpen(false);
                            setProfileOpen(true);
                            }}>Edit profile</li>
                            
                            <li onClick={() => {
                            setBlockedUsersOpen();
                            }}>Blocked Users</li>

                            <li onClick={handleLogout}>Logout</li>
                        </ul>
                    </div>
                )}
                <div className={Styles.nameAndEmailBox}>
                    {profile ? (
                        <h1 className={Styles.profileName}>
                            {profile.firstName + ' ' + profile.lastName}
                        </h1>
                    ) : (
                        <Loading />
                    )}
                </div>
            </div>
            <div className={Styles.logoutBox}>
                <button className={Styles.logoutButton} onClick={() => auth.logOut()}>
                    Logout <span className={Styles.arrow}>↩</span>
                </button>
            </div>
        </div>
    );
}
