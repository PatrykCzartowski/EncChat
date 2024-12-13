import './ProfileSearchBar.css';
import { FaSearch } from 'react-icons/fa';
import { useState } from 'react';
import SearchResult from './SearchResult/SearchResult';

export default function ProfileSearchBar() {
    const [input, setInput] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const findUsers = async (input) => {
        console.log("input", input);
        try {
            const response = await fetch('/api/account/find_profile_like', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ providedString: input }),
            });
            const users = await response.json();
            console.log(users);
            return users;
        } catch(error) {
            console.error('Error finding users:', error);
        }
    }

    const handleInputChange = async (event) => {
        if(event.target.value != '') {
            const res = await findUsers(event.target.value);
            if(res) setSearchResults(res);
        }
    }

    return (
        <div className="searchBar">
            <div className="searchInputWrapper">
                <form>
                    <input
                        onChange={handleInputChange}
                        className="searchInput"
                        type="text"
                        placeholder="Search for a user"
                    />
                <FaSearch className="searchIcon" />
                </form>
            </div>
            <SearchResult searchResults={searchResults} />
        </div>
    );
}
