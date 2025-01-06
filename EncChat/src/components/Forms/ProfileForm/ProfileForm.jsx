import Styles from './ProfileForm.module.css';
import { useNavigate } from 'react-router-dom';

export default function ProfileForm({ account }) {

    const navigate = useNavigate();

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        console.log("Form Submitted");
        const ProfileData = {
            avatar: event.target[0].value,
            firstName: event.target[1].value,
            lastName: event.target[2].value,
            bio: event.target[3].value,
        }
        const response = await fetch('/api/account/create_profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ accountId: account.id ,ProfileData }),
        })
        const result = await response.json();
        if(result) {
            navigate('/user-page', { state: { account } });
            return;
        }
    }

    return (
        <div className={Styles.ProfileForm}>
            <h1>Profile Form</h1>
            <form onSubmit={handleFormSubmit}>
                <label htmlFor="avatar">Profile Picture</label>
                <input type="file" id="avatar" name="avatar" />
                <label htmlFor="firstName">First Name</label>
                <input type="text" id="firstName" name="firstName" />
                <label htmlFor="lastName">Last Name</label>
                <input type="text" id="lastName" name="lastName" />
                <label htmlFor="bio">Bio</label>
                <textarea id="bio" name="bio" />

                <button type="submit">Submit</button>
            </form>
        </div>
    )
}