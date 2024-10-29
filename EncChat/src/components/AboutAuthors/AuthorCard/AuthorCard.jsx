import styles from './AuthorCard.module.css';

export default function AuthorCard({author}) {
        return (
            <div className={styles.authorCard}>
                <div className={styles.authorPicture}>
                    <img src={authorPicture} alt="author picture"/>
                </div>
                <div className={styles.authorName}>{author.name}</div>
                <div className={styles.authorRole}>{author.role}</div>
                <div className={styles.authorSocials}>
                    <div className={styles.socialBar}>
                        <img src='' alt="social icon"/>
                        <p className={styles.socialName}>{author.socials[0]}</p>
                    </div>
                    <div className={styles.socialBar}>
                        <img src="" alt="social icon"/>
                        <p className={styles.socialName}>{author.socials[1]}</p>
                    </div>
                    <div className={styles.socialBar}>
                        <img src="" alt="social icon"/>
                        <p className={styles.socialName}>{author.socials[2]}</p>
                    </div>
                </div>
            </div>
        )
}