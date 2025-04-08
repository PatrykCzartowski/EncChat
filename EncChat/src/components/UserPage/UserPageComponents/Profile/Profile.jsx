import styles from './Profile.module.css';
import { useState, useEffect } from 'react';
import Avatar from 'react-avatar-edit';
import { MdBlock, MdChat, MdPersonAdd } from 'react-icons/md';

export default function Profile({ profile, closeProfile }) {
  if (!profile) return null;

  const [preview, setPreview] = useState(null);
  const [src, setSrc] = useState(null);
  const [tab, setTab] = useState("posts");

  const [avatarValue, setAvatarValue] = useState(profile.avatar);
  const [editAvatar, setEditAvatar] = useState(false);

  const onClose = () => setPreview(null);
  const onCrop = (view) => setPreview(view);

  const stats = {
    friends: profile.friendsCount || 0,
    createdAt: profile.createdAt || "N/A",
    totalMessages: profile.totalMessages || 0,
  };

  const posts = [
    {
      id: 1,
      content: "This is an important announcement from " + profile.firstName + ".",
      pinned: true,
      timestamp: "1 day ago",
    },
    {
      id: 2,
      content: "Just added a new friend today 👋",
      pinned: false,
      timestamp: "2 hours ago",
    },
    {
      id: 3,
      content: "Enjoying secure conversations 💬",
      pinned: false,
      timestamp: "3 days ago",
    },
  ];
  

  useEffect(() => {
    const handleClick = (e) => {
      if (e.target.closest('.friendListItem')) closeProfile();
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [closeProfile]);

  return (
    <div className="settingsContainer">
      <button className="closeButton" onClick={closeProfile}>✖</button>

      <div className={`${styles.profileFull} scrollStyled`}>
        <div className={styles.avatarBox}>
          <img
            src={avatarValue || 'https://via.placeholder.com/100'}
            alt="avatar"
            className={styles.avatar}
          />
        </div>


        <div className={styles.name}>
          {profile.firstName} {profile.lastName}
        </div>


        <div className={styles.buttonsRow}>
          <button className={styles.iconButton}><MdBlock size={20} /></button>
          <button className={styles.iconButton}><MdChat size={20} /></button>
          <button className={styles.iconButton}><MdPersonAdd size={20} /></button>
        </div>


        <p className={styles.bio}>
          {profile.bio}
        </p>


        <div className={styles.tabSwitcher}>
          <button
            className={tab === "posts" ? styles.activeTab : ""}
            onClick={() => setTab("posts")}
          >
            Posts
          </button>
          <button
            className={tab === "stats" ? styles.activeTab : ""}
            onClick={() => setTab("stats")}
          >
            Stats
          </button>
        </div>

        {tab === "posts" ? (
          <>
            <div className={styles.newPostBox}>
              <textarea placeholder="What's on your mind?" className={styles.newPostInput} />
              <button className={styles.newPostButton}>Post</button>
            </div>

            <div className={styles.wall}>
              {posts
                .filter(post => post.pinned)
                .map(post => (
                  <div key={post.id} className={`${styles.post} ${styles.pinnedPost}`}>
                    <p>📌 <strong>Pinned Post:</strong> {post.content}</p>
                    <span>{post.timestamp}</span>

                    <div className={styles.reactions}>
                      <button>👍</button>
                      <button>❤️</button>
                    </div>

                    <div className={styles.commentBox}>
                      <input placeholder="Write a comment..." />
                      <button>Send</button>
                    </div>
                  </div>
                ))}

              {posts
                .filter(post => !post.pinned)
                .map(post => (
                  <div key={post.id} className={styles.post}>
                    <p>{post.content}</p>
                    <span>{post.timestamp}</span>

                    <div className={styles.reactions}>
                      <button>👍</button>
                      <button>❤️</button>
                    </div>

                    <div className={styles.commentBox}>
                      <input placeholder="Write a comment..." />
                      <button>Send</button>
                    </div>
                  </div>
                ))}
            </div>

          </>
        ) : (
          <div className={styles.stats}>
            <div><strong>Friends:</strong> <span>{stats.friends}</span></div>
            <div><strong>Account created:</strong> <span>{stats.createdAt}</span></div>
            <div><strong>Total messages sent:</strong> <span>{stats.totalMessages}</span></div>
          </div>

        )}
      </div>
    </div>
  );
}
