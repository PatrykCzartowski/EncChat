import './ProfileSearchBar.css';
import { FaSearch } from 'react-icons/fa';

export default function ProfileSearchBar() {
    return (
        <div className="searchBar">
            <div className="searchInputWrapper">
                <input
                    className="searchInput"
                    type="text"
                    placeholder="Search for a user"
                />
                <FaSearch className="searchIcon" onClick={() => console.log('Search triggered')} />
            </div>
        </div>
    );
}
