import React, { useState } from 'react';
import styles from './Notifications.module.css';

export default function Notifications({ show }) {
    const [activeTab, setActiveTab] = useState('others');

    if (!show) return null;

    return (
        <div className={styles.notificationsContainer}>
            <div className={styles.tabs}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'others' ? styles.active : ''}`}
                    onClick={() => setActiveTab('others')}
                >
                    Others
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'requests' ? styles.active : ''}`}
                    onClick={() => setActiveTab('requests')}
                >
                    Friend Requests
                </button>
            </div>

            <div className={styles.tabContent}>
                {activeTab === 'others' && (
                    <div>
                        <p className={styles.notificationItem}>No other notifications</p>
                    </div>
                )}
                {activeTab === 'requests' && (
                    <div>
                        <p className={styles.notificationItem}>No friend requests</p>
                    </div>
                )}
            </div>
        </div>
    );
}
