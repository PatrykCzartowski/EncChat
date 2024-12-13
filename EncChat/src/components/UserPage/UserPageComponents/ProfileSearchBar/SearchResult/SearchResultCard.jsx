import Styles from './SearchResult.module.css';

export default function SearchResultCard({ user }) {
    return (
        <div>
            {user.profile.firstName} {user.profile.lastName}
        </div>
    )
}