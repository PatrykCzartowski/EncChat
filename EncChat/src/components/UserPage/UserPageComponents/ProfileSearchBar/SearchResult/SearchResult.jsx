import Styles from './SearchResult.module.css';
import SearchResultCard from './SearchResultCard';

export default function SearchResult({searchResults, friendData}) {

    return(
        <div>
            {searchResults.map((user) => {
                return <SearchResultCard key={user.id} user={user} friendData={friendData}/>
            })}
        </div>
    )
}