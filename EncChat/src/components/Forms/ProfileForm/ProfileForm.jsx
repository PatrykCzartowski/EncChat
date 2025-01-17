import Styles from './ProfileForm.module.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import UploadAvatar from './UploadAvatar';
import { CloudinaryImage } from '@cloudinary/url-gen';
import { scale } from '@cloudinary/url-gen/actions/resize';
import { quality } from '@cloudinary/url-gen/actions/delivery';
import { format } from '@cloudinary/url-gen/actions/delivery';
import { auto as autoQuality } from '@cloudinary/url-gen/qualifiers/quality';
import { auto as autoFormat } from '@cloudinary/url-gen/qualifiers/format';

export default function ProfileForm({ account }) {
    const navigate = useNavigate();

    const [avatar, setAvatar] = useState(null);
    console.log(account);
    const handleFormSubmit = async (event) => {
        event.preventDefault();
        console.log(event.target);
        const formData = new FormData();
        formData.append('accountId', account.id);
        formData.append('avatar', avatar);
        formData.append('firstName', event.target.firstName.value);
        formData.append('lastName', event.target.lastName.value);
        formData.append('bio', event.target.bio.value);
        console.log(formData);
        const response = await fetch('/api/account/create_profile', {
            method: 'POST',
            body: formData,
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
            <UploadAvatar setAvatar={setAvatar}/>
            <form onSubmit={handleFormSubmit}>

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
