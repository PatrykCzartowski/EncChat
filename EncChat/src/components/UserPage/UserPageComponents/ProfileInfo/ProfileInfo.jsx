import './ProfileInfo.css';
import user_img from '../../../../assets/placeholder_user.png';
import { useAuth } from '../../../../Auth/AuthProvider';
import { useEffect, useState } from 'react';
export default function ProfileInfo({ user }) {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const getProfile = async (user) => {
            try {
                const response = await fetch('/api/user/profile', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id_users: user.id }),
                });
                const res = await response.json();
                if (res.profile) {
                    setProfile(res.profile);
                } else {
                    throw new Error(res.message || 'Profile not found');
                }
            } catch (error) {
                console.error('Error during profile fetch: ', error);
            }
        };

        if (user) {
            getProfile(user);
        }
    });

    const auth = useAuth();

    return (
        <div className="ProfileInfoContainer">
            <img src={user_img} width="100px" height="100px"/>
            <h1>{profile && profile.name_surname}</h1>
            <p>{user.email}</p>
            <button onClick={() => auth.logOut()}>logout</button>
        </div>
    );
}