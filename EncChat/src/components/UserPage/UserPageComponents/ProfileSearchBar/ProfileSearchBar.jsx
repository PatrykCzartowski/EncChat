import './ProfileSearchBar.css';

export default function ProfileSearchBar() {
    return (
        <div className="ProfileSearchBarContainer">
            <input type="text" placeholder="Search for a user"/>
            <button>Search</button>
        </div>
    );
}