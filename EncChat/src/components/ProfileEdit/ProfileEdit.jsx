import styles from './ProfileEdit.module.css';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Avatar from 'react-avatar-edit';

import { BaselineModeEdit, Checkmark } from '../../assets/svgs/SvgsModels';

export default function ProfileEdit() {
    
    const location = useLocation();
    const navigate = useNavigate();

    const profile = location.state?.profile;
    const account = location.state?.account;

    const [preview, setPreview] = useState(null);
    const [src, setSrc] = useState(null);

    const [avatarValue, setAvatarValue] = useState(profile.avatar);
    const [firstNameValue, setFirstNameValue] = useState(profile.firstName);
    const [lastNameValue, setLastNameValue] = useState(profile.lastName);
    const [bioValue, setBioValue] = useState(profile.bio);

    const [editAvatar, setEditAvatar] = useState(false);
    const [editFirstName, setEditFirstName] = useState(false);
    const [editLastName, setEditLastName] = useState(false);
    const [editBio, setEditBio] = useState(false);

    const handleFirstNameChange = (event) => {
        setFirstNameValue(event.target.value)
    }
    const handleLastNameChange = (event) => {
        setLastNameValue(event.target.value)
    }
    const handleBioChange = (event) => {
        setBioValue(event.target.value);
    }

    const onClose = () => {
        setPreview(null);
        setAvatarValue(profile.avatar);
    }
    const onCrop = (view) => {
        setPreview(view);
        setAvatarValue(view);
    }

    const handleSaveChanges = () => {
        const updatedProfile = {
            accountId: account.id,
            avatar: avatarValue,
            firstName: firstNameValue,
            lastName: lastNameValue,
            bio: bioValue,
        }
        // add api call later
        console.log(updatedProfile);
    }
    const handleGoBack = () => {
        navigate('/user-page', { state: { account: account } });
    }

    return (
        <div className={styles.profileCard}>
            {editAvatar? 
                <div className={styles.testDiv}>
                    <Avatar 
                        width={400}
                        height={300}
                        onCrop={onCrop}
                        onClose={onClose}
                        src={src}
                    />
                    <div className={styles.editButton} onClick={() => setEditAvatar(false)}><Checkmark/></div>
                </div> 
                : 
                <div className={styles.testDiv}>
                    <img src={avatarValue} alt="Avatar" />
                    <div className={styles.editButton} onClick={() => setEditAvatar(true)}><BaselineModeEdit/></div>
                </div>
            }

            {editFirstName?
                <div className={styles.testDiv}>
                    <input onChange={handleFirstNameChange} type="text" id="firstName" defaultValue={profile.firstName} />
                    <div className={styles.editButton} onClick={() => setEditFirstName(false)}><Checkmark/></div>
                </div>
                :
                <div className={styles.testDiv}>
                    <h1>{firstNameValue}</h1>
                    <div className={styles.editButton} onClick={() => setEditFirstName(true)}><BaselineModeEdit/></div>
                </div>
            }

            {editLastName?
                <div className={styles.testDiv}>
                    <input onChange={handleLastNameChange} type="text" id="lastName" defaultValue={profile.lastName} />
                    <div className={styles.editButton} onClick={() => setEditLastName(false)}><Checkmark/></div>
                </div>
                :
                <div className={styles.testDiv}>
                    <h1>{lastNameValue}</h1>
                    <div className={styles.editButton} onClick={() => setEditLastName(true)}><BaselineModeEdit/></div>
                </div>
            }

            {editBio?
                <div className={styles.testDiv}>
                    <input onChange={handleBioChange} type="text" id="bio" defaultValue={profile.bio} />
                    <div className={styles.editButton} onClick={() => setEditBio(false)}><Checkmark/></div>
                </div>
                :
                <div className={styles.testDiv}>
                    <p>{bioValue}</p>
                    <div className={styles.editButton} onClick={() => setEditBio(true)}><BaselineModeEdit/></div>
                </div>
            }
            <button onClick={handleSaveChanges}>Save Changes</button>
            <button onClick={handleGoBack}>Go back</button>  
        </div>
    )
}