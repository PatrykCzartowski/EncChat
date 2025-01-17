import Styles from './ProfileForm.module.css';
import { useNavigate } from 'react-router-dom';

export default function ProfileForm({ account }) {
    const navigate = useNavigate();

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        console.log("Form Submitted");
        const ProfileData = {
            avatar: event.target[0].files[0],
            firstName: event.target[1].value,
            lastName: event.target[2].value,
            bio: event.target[3].value,
        };
        const response = await fetch('/api/account/create_profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ accountId: account.id, ProfileData }),
        });
        const result = await response.json();
        if (result) {
            navigate('/user-page', { state: { account } });
            return;
        }
    };

    return (
        <div className={Styles.ProfileForm}>
            <h2>Profile Creation</h2>
            <hr className={Styles.line} />
            <form onSubmit={handleFormSubmit}>
                <label className={Styles.label} htmlFor="avatar">Profile Picture</label>
                <input className={Styles.inputField} type="file" id="avatar" name="avatar" />

                <label className={Styles.label} htmlFor="firstName">First Name</label>
                <input className={Styles.inputField} type="text" id="firstName" name="firstName" placeholder="Enter your first name" />

                <label className={Styles.label} htmlFor="lastName">Last Name</label>
                <input className={Styles.inputField} type="text" id="lastName" name="lastName" placeholder="Enter your last name" />

                <label className={Styles.label} htmlFor="bio">Bio</label>
                <textarea className={Styles.inputField} id="bio" name="bio" placeholder="Write a short bio"></textarea>

                <button className={Styles.buttonSubmit} type="submit">Submit</button>
            </form>
        </div>
    );
}
