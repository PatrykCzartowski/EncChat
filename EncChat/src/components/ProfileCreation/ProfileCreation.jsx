import Styles from './ProfileCreation.module.css';
import {useLocation} from 'react-router-dom';
import ProfileForm from '../Forms/ProfileForm/ProfileForm';

export default function ProfileCreation() {
    const location = useLocation();

    const account = location.state?.account;

    return (
        <div className={Styles.container}>
            <ProfileForm account={account}/>
        </div>
    );
}