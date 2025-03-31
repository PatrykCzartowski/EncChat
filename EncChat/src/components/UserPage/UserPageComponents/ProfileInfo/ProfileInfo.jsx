import './ProfileInfo.css';
import { useAuth } from '../../../../Auth/AuthProvider';
import Loading from '../../../Utils/Loading/Loading';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

export default function ProfileInfo({ userId, profile, setSettingsOpen }) {
    const auth = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const menuRef = useRef(null);

    const handleProfileEdit = () => {
        navigate('/profile-edit', { state: { userId, profile } });
    }

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
        <div className="profileInfo">
            <div className="personalInfoBox">
            <div className="profileAvatarBox" onClick={toggleMenu}>
                    <img
                        className="profileAvatar"
                        src={profile.avatar}
                        alt="Profile"
                        width="100px"
                        height="100px"
                    />
                </div>
                {menuOpen && (
                    <div 
                        className="dropdownMenu" 
                        ref={menuRef} 
                        style={{ top: `${menuPosition.y}px`, left: `${menuPosition.x}px` }}
                    >
                        <ul>
                            <li onClick={() => setSettingsOpen(true)}>Edit general settings</li>
                            <li onClick={() => navigate('/profile-edit')}>Edit profile picture</li>
                            <li onClick={handleLogout}>Logout</li>
                        </ul>
                    </div>
                )}
                <div className="nameAndEmailBox">
                    {profile ? (
                        <h1 className="profileName">
                            {profile.firstName + ' ' + profile.lastName}
                        </h1>
                    ) : (
                        <Loading />
                    )}
                </div>
            </div>
            <div className="logoutBox">
                <button className="logoutButton" onClick={() => auth.logOut()}>
                    Logout <span className="arrow">↩</span>
                </button>
            </div>
        </div>
    );
}
