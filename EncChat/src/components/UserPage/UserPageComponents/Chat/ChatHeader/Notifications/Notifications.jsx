import React, { useState } from 'react';
import styles from './Notifications.module.css';

export default function Notifications({ show }) {
    if (!show) return null;

    return (
        <div className={styles.notificationsContainer}>
            <div className={styles.notificationItem}>no notifications available</div>
        </div>
    );
}
