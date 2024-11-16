import './ProfileInfo.css';
import user_img from '../../../../assets/placeholder_user.png';
import { useAuth } from '../../../../Auth/AuthProvider';

export default function ProfileInfo({ user, profile }) {

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