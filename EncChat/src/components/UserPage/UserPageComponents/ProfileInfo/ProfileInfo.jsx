import './ProfileInfo.css';
import { useAuth } from '../../../../Auth/AuthProvider';
import Loading from '../../../Utils/Loading/Loading';
import { useNavigate } from 'react-router-dom';

export default function ProfileInfo({ userId, profile }) {
    const auth = useAuth();
    const navigate = useNavigate();

    const handleProfileEdit = () => {
        navigate('/profile-edit', { state: { userId, profile } });
    }

    return (
        <div className="profileInfo">
            <div className="personalInfoBox">
                <div className="profileAvatarBox" onClick={handleProfileEdit}>
                    <img
                        className="profileAvatar"
                        src={profile.avatar}
                        alt="Profile"
                        width="100px"
                        height="100px"
                    />
                </div>
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
