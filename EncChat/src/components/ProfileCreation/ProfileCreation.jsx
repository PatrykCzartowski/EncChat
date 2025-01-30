import Styles from './ProfileCreation.module.css';
import {useLocation} from 'react-router-dom';
import ProfileForm from '../Forms/ProfileForm/ProfileForm';

export default function ProfileCreation() {
    const location = useLocation();

    const accountId = location.state?.accountId;

    return (
        <div className={Styles.container}>
            <ProfileForm accountId={accountId}/>
        </div>
    );
}