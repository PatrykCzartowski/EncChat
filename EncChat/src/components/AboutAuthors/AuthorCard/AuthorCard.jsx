import styles from "./AuthorCard.module.css";
import placeholderUser from "../../../assets/placeholder_user.png";
import { FaFacebook, FaLinkedin, FaEnvelope } from "react-icons/fa";

export default function AuthorCard({ author }) {
  return (
    <div className={styles.authorCard}>
      <div className={styles.authorPicture}>
        <img
          src={author.authorPicture || placeholderUser}
          alt="author picture"
        />
      </div>
      <div className={styles.authorName}>{author.name}</div>
      <div className={styles.authorRole}>{author.role}</div>
      <div className={styles.authorSocials}>
        <div className={styles.socialBar}>
          <FaFacebook className={styles.socialIcon} />
          <p className={styles.socialName}>{author.socials[0]}</p>
        </div>
        <div className={styles.socialBar}>
          <FaLinkedin className={styles.socialIcon} />
          <p className={styles.socialName}>{author.socials[1]}</p>
        </div>
        <div className={styles.socialBar}>
          <FaEnvelope className={styles.socialIcon} />
          <p className={styles.socialName}>{author.socials[2]}</p>
        </div>
      </div>
    </div>
  );
}
