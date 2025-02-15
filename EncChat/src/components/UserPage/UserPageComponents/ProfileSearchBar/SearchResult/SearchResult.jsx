import Styles from './SearchResult.module.css';
import SearchResultCard from './SearchResultCard';


export default function SearchResult({ searchResults, friendData, userId, onHandleSendFriendRequest, onHandleBlockAccount, onHandleRemoveFriend}) {

    return (
        <div className={Styles.searchResultContainer}>
            {searchResults.map((searchResult) => (
                <SearchResultCard
                    key={searchResult.id}
                    foundUser={searchResult}
                    friendData={friendData}
                    userId={userId}
                    onHandleSendFriendRequest={onHandleSendFriendRequest}
                    onHandleBlockAccount={onHandleBlockAccount}
                    onHandleRemoveFriend={onHandleRemoveFriend}
                />
            ))}
        </div>
    )
}
