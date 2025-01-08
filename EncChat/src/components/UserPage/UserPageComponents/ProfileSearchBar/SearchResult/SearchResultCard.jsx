import Styles from "./SearchResult.module.css";
import { FaUserPlus, FaBan, FaUserTimes } from 'react-icons/fa';

export default function SearchResultCard({user, friendData, onSelectUser, currentUserId, onHandleSendFriendRequest, onHandleBlockAccount, onHandleRemoveFriend}) {
  
  const searchResultIsFriend = (searchResult) => {
    for (let i = 0; i < friendData.length; i++) {
      if (friendData[i].accountId === searchResult.id) {
        return true;
      }
    }
    return false;
  };
  const userIsFriend = searchResultIsFriend(user);

  const handleSendFriendRequest = () => {
    onHandleSendFriendRequest(user.id);
  };

  const handleBlockAccount = () => {
    onHandleBlockAccount(user.id);
  };

  const handleRemoveFriend = () => {
    onHandleRemoveFriend(user.id);
  };

  console.log("user: ", user);

  const foundUserIsCurrentUser = user.id === currentUserId;
  if (foundUserIsCurrentUser) {
    return (
      <div className={Styles.searchResultCard} onClick={onSelectUser}>
        <div className={Styles.rowContainer}>
          {user.profile.firstName} {user.profile.lastName}
          <div>
            <p>That's you!</p>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className={Styles.searchResultCard} onClick={onSelectUser}>
        <div className={Styles.rowContainer}>
          {user.profile.firstName} {user.profile.lastName}
          {userIsFriend ? (
            <FaUserTimes
              className={Styles.icon}
              title="Remove Friend"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFriend();
              }}
            />
            ) : (
            <>
             <FaUserPlus
                className={Styles.icon}
                title="Add Friend"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSendFriendRequest();
                }}
             />
             <FaBan
                className={Styles.icon}
                title="Block User"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBlockAccount();
                }}
             />
            </>
          )}
        </div>
      </div>
    );
  }
}