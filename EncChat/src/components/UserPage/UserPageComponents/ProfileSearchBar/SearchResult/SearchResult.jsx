import Styles from './SearchResult.module.css';
import SearchResultCard from './SearchResultCard';

export default function SearchResult({searchResults}) {
    console.log(searchResults);
    return(
        <div>
            {searchResults.map((user) => {
                return <SearchResultCard key={user.id} user={user} />
            })}
        </div>
    )
}