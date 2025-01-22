import Styles from "./SearchResult.module.css";
import { FaUserPlus, FaBan, FaUserTimes } from 'react-icons/fa';

export default function SearchResultCard({ user, friendData, onSelectUser, currentUserId, onHandleSendFriendRequest, onHandleBlockAccount, onHandleRemoveFriend }) {
  const searchResultIsFriend = (searchResult) => {
    return friendData.some((friend) => friend.accountId === searchResult.id);
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

  const foundUserIsCurrentUser = user.id === currentUserId;
  if (foundUserIsCurrentUser) {
    return (
      <div className={Styles.searchResultCard} onClick={onSelectUser}>
        <div className={Styles.rowContainer}>
          <img src={user.profile.avatar} alt="User" className={Styles.userImage} />
          <span className={Styles.userName}>
            {user.profile.firstName} {user.profile.lastName}
          </span>
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
        <img src={user.profile.avatar} alt="User" className={Styles.userImage} />
          <span className={Styles.userName}>
            {user.profile.firstName} {user.profile.lastName}
          </span>
          <div className={Styles.actionIcons}>
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
      </div>
    );
  }
}
