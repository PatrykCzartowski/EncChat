import Styles from './SearchResult.module.css';
import SearchResultCard from './SearchResultCard';

export default function SearchResult({ searchResults, onSelectUser, friendData }) {
    return (
        <div className={Styles.searchResultContainer}>
            {searchResults.map((user) => (
                <SearchResultCard
                    key={user.id}
                    user={user}
                    friendData={friendData}
                    onSelectUser={() => onSelectUser(user)}
                />
            ))}
        </div> 
    );
}
