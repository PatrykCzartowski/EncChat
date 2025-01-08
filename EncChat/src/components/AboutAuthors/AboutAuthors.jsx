import { Link } from "react-router-dom";
import styles from "./AboutAuthors.module.css";
import AuthorCard from "./AuthorCard/AuthorCard";
import Logo from "../Logo/Logo.jsx";

export default function AboutAuthors() {
  const AuthorsData = {
    author1: {
      authorPicture: "",
      name: "Author Name 1",
      role: "Author Role 1",
      socials: ["Facebook", "LinkedIn", "Email"],
    },
    author2: {
      authorPicture: "",
      name: "Author Name 2",
      role: "Author Role 2",
      socials: ["Facebook", "LinkedIn", "Email"],
    },
    author3: {
      authorPicture: "",
      name: "Author Name 3",
      role: "Author Role 3",
      socials: ["Facebook", "LinkedIn", "Email"],
    },
  };

  return (
    <div className={styles.aboutAuthors}>
      <Link to="/" className={styles.backButton}>
        ← Back
      </Link>
      <div className={styles.logo}><Logo /></div>
      <div className={styles.cardsContainer}>
        <AuthorCard author={AuthorsData.author1} />
        <AuthorCard author={AuthorsData.author2} />
        <AuthorCard author={AuthorsData.author3} />
      </div>
    </div>
  );
}
