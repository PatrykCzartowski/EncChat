import styles from './AboutAuthors.module.css';
import AuthorCard from './AuthorCard/AuthorCard';

export default function AboutAuthors() {

    const AuthorsData = {
        author1: {
            authorPicture: '',
            authorName: 'Author Name',
            authorRole: 'Author Role',
            authorSocials: ['Social Name', 'Social Name', 'Social Name']
        },
        author2: {
            authorPicture: '',
            authorName: 'Author Name',
            authorRole: 'Author Role',
            authorSocials: ['Social Name', 'Social Name', 'Social Name']
        },
        author3: {
            authorPicture: '',
            authorName: 'Author Name',
            authorRole: 'Author Role',
            authorSocials: ['Social Name', 'Social Name', 'Social Name']
        }
    }

    return (
        <div className={styles.aboutAuthors}>
            <div className={styles.logo}>super duper logo</div>
            <AuthorCard author={AuthorsData.author1}/>
            <AuthorCard author={AuthorsData.author2}/>
            <AuthorCard author={AuthorsData.author3}/>
        </div>
    )
}