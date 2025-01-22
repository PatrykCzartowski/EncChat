import Styles from './ProfileForm.module.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import UploadAvatar from './UploadAvatar';

export default function ProfileForm({ account }) {
    const navigate = useNavigate();
    const [avatar, setAvatar] = useState(null);

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        const formData = {
            accountId: account.id,
            firstName: event.target.firstName.value,
            lastName: event.target.lastName.value,
            bio: event.target.bio.value,
            avatar: avatar,
        };
        console.log(formData);

        const response = await fetch('/api/account/create_profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const result = await response.json();
        if (result) {
            navigate('/user-page', { state: { account } });
            return;
        }
    };

    return (
        <div className={Styles.ProfileForm}>
            <h2 className={Styles.ProfileHeading}>Profile Creation</h2>

            <div className={Styles.ProfileFormBody}>
                <div className={Styles.LeftSection}>
                    <label className={Styles.label} htmlFor="avatar">Avatar</label>
                    <UploadAvatar setAvatar={setAvatar} />
                </div>

                <div className={Styles.RightSection}>
                    <form onSubmit={handleFormSubmit}>
                        <label className={Styles.label} htmlFor="firstName">First Name</label>
                        <input
                            className={Styles.inputField}
                            type="text"
                            id="firstName"
                            name="firstName"
                            placeholder="Enter your first name"
                        />

                        <label className={Styles.label} htmlFor="lastName">Last Name</label>
                        <input
                            className={Styles.inputField}
                            type="text"
                            id="lastName"
                            name="lastName"
                            placeholder="Enter your last name"
                        />

                        <label className={Styles.label} htmlFor="bio">Bio</label>
                        <textarea
                            className={Styles.inputField}
                            id="bio"
                            name="bio"
                            placeholder="Write a short bio"
                        ></textarea>

                        <button className={Styles.buttonSubmit} type="submit">
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}



