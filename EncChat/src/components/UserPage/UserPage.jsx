import { useAuth } from '../../Auth/AuthProvider/AuthProvider';

export default function UserPage() {

    const user = useAuth();

  return (
    <div>
      <h1>User Page</h1>
      <button onClick={() => user.logOut()}>logout</button>
    </div>
  );
}