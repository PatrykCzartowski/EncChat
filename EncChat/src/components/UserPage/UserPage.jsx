import './UserPage.css';

import ProfileInfo from './UserPageComponents/ProfileInfo/ProfileInfo';
import ProfileSearchBar from './UserPageComponents/ProfileSearchBar/ProfileSearchBar';
import ProfileFriendsList from './UserPageComponents/ProfileFriendsList/ProfileFriendsList';

import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function UserPage() {
  const location = useLocation();
  const user = location.state?.user;

  return (
    <div>
      <ProfileInfo user={user}/>
      <ProfileSearchBar />
      <ProfileFriendsList user={user}/>
    </div>
  );
}