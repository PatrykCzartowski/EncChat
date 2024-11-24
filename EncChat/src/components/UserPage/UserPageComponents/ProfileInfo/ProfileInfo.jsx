import './ProfileInfo.css';
import user_img from '../../../../assets/placeholder_user.png';
import { useAuth } from '../../../../Auth/AuthProvider';

import Loading from '../../../Utils/Loading/Loading';

export default function ProfileInfo({ account, profile }) {

    const auth = useAuth();

    return (
        <div className="ProfileInfoContainer">
            <img src={user_img} width="100px" height="100px"/>
            {profile? <h1>{profile.name}</h1> : <Loading />}
            <p>{account? account.email : <Loading />}</p>
            <button onClick={() => auth.logOut()}>logout</button>
        </div>
    );
}