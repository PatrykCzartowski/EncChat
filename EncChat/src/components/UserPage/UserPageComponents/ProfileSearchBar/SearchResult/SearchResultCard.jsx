import Styles from './SearchResult.module.css';

export default function SearchResultCard({ user, onSelectUser }) {
    return (
        <button
            className={Styles.searchResultCard}
            onClick={onSelectUser}
        >
            {user.profile.firstName} {user.profile.lastName}
        </button>
    );
}
