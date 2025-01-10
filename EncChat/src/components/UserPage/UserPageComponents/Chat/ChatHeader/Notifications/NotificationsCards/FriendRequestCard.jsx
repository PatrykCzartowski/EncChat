import { useState, useEffect } from 'react';

export default function FriendRequestCard({ requestId, senderId, onHandleAcceptFriendRequest, onHandleDeclineFriendRequest }) {
    
    const [senderProfile, setSenderProfile] = useState(null);

    const getSenderProfile = async () => {
        const response = await fetch('/api/account/get_profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: senderId }),
        });
        if(response.ok) {
            const profile = await response.json();
            setSenderProfile(profile);
        }
    }
    
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
        <div >
            {senderProfile? ( 
                <div >
                    <p>{senderProfile.firstName} {senderProfile.lastName} sent you a friend request</p>
                    <div>
                        <button onClick={handleAcceptFriendRequest}>Accept</button>
                        <button onClick={handleDeclineFriendRequest}>Decline</button>
                    </div>
                </div>
            ) : (null)}
        </div>
    );
}