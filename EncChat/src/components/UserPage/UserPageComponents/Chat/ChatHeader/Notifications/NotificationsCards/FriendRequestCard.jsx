import { useState, useEffect } from "react";
import { FaUserCircle, FaCheck, FaTimes } from "react-icons/fa";
import placeholderImage from "../../../../../../../assets/placeholder_user.png";
import styles from "./FriendRequestCard.module.css";

export default function FriendRequestCard({ requestId, senderId, onHandleAcceptFriendRequest, onHandleDeclineFriendRequest }) {
  const [senderProfile, setSenderProfile] = useState(null);

  const getSenderProfile = async () => {
    const response = await fetch("/api/profile/get", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: senderId }),
    });
    if (response.ok) {
      const profile = await response.json();
      setSenderProfile(profile);
    }
  };

  useEffect(() => {
    getSenderProfile();
  }, []);

  const handleAcceptFriendRequest = () => {
    onHandleAcceptFriendRequest(requestId, senderId);
  };

  const handleDeclineFriendRequest = () => {
    onHandleDeclineFriendRequest(requestId);
  };

  return (
    <div className={styles.friendRequestCard}>
      {senderProfile ? (
        <div className={styles.cardContent}>
          <div className={styles.profileSection}>
            <img src={senderProfile.avatar || placeholderImage} alt="Profile" className={styles.profileIcon} />
            <div className={styles.profileDetails}>
              <p className={styles.name}>
                {senderProfile.firstName} {senderProfile.lastName}
              </p>
              <p className={styles.message}>sent you a friend request</p>
            </div>
          </div>
          <div className={styles.actions}>
            <button
              className={styles.acceptButton}
              onClick={handleAcceptFriendRequest}
            >
              <FaCheck className={styles.actionIcon} />
              Accept
            </button>
            <button
              className={styles.declineButton}
              onClick={handleDeclineFriendRequest}
            >
              <FaTimes className={styles.actionIcon} />
              Decline
            </button>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
