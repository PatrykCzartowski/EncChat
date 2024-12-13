import Styles from './ProfileCreation.module.css';

import ProfileForm from '../Forms/ProfileForm/ProfileForm';

export default function ProfileCreation() {
    return (
        <div className={Styles.container}>
            <h1>Profile Creation</h1>
            <ProfileForm />
        </div>
    );
}