import './ProfileSearchBar.css';
import { FaSearch } from 'react-icons/fa';
import { useState } from 'react';
import SearchResult from './SearchResult/SearchResult';

export default function ProfileSearchBar({friendData}) {
    const [input, setInput] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const findUsers = async (input) => {
        try {
            const response = await fetch('/api/account/find_profile_like', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ providedString: input }),
            });
            const users = await response.json();
            return users;
        } catch(error) {
            console.error('Error finding users:', error);
        }
    }

    const handleInputChange = async (event) => {
        const value = event.target.value;
        setInput(value);
    
        if (value === '') {
            setSearchResults([]);
        } else {
            const res = await findUsers(value);
            if (res) setSearchResults(res);
        }
    };
    

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
            <SearchResult searchResults={searchResults} friendData={friendData}/>
        </div>
    );
}