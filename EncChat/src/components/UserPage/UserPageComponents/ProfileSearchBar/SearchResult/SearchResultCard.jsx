import Styles from "./SearchResult.module.css";
import { FaUserPlus, FaBan, FaUserTimes } from 'react-icons/fa';

export default function SearchResultCard({ foundUser, friendData, userId, onHandleSendFriendRequest, onHandleBlockAccount, onHandleRemoveFriend }) {

  const searchResultIsFriend = (searchResult) => {
    return friendData.some((friend) => friend.friendId === searchResult.accountId);
  };
  const foundUserIsFriend = searchResultIsFriend(foundUser);

  const handleSendFriendRequest = () => {
    onHandleSendFriendRequest(foundUser.id);
  };

  const handleBlockAccount = () => {
    onHandleBlockAccount(foundUser.id);
  };

  const handleRemoveFriend = () => {
    onHandleRemoveFriend(foundUser.id);
  };

  const foundUserIsCurrentUser = foundUser.accountId === userId;
  if (foundUserIsCurrentUser) {
    return (
      <div className={Styles.searchResultCard}>
        <div className={Styles.rowContainer}>
          <img src={foundUser.avatar} alt="User" className={Styles.userImage} />
          <span className={Styles.userName}>
            {foundUser.firstName} {foundUser.lastName}
          </span>
          <div>
            <p>That's you!</p>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className={Styles.searchResultCard}>
        <div className={Styles.rowContainer}>
        <img src={foundUser.avatar} alt="User" className={Styles.userImage} />
          <span className={Styles.userName}>
            {foundUser.firstName} {foundUser.lastName}
          </span>
          <div className={Styles.actionIcons}>
            {foundUserIsFriend ? (
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
