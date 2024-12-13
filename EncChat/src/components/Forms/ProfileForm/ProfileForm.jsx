import Styles from './ProfileForm.module.css';

export default function ProfileForm() {

    const handleFormSubmit = (event) => {
        event.preventDefault();
        console.log("Form Submitted");
        const ProfileData = {
            avatar: event.target[0].value,
            firstName: event.target[1].value,
            lastName: event.target[2].value,
            bio: event.target[3].value,
        }
        console.log(ProfileData);
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