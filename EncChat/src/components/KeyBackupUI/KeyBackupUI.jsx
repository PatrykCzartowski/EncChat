import { useState, useEffect, useRef } from 'react';
import createKeyBackupManager from '../Utils/keyBackup';
import chatEncryption from '../Utils/clientEncryption';
import Styles from './KeyBackupUI.module.css';
import Buttons from '../UserPage/UserPageComponents/ProfileInfo/ProfileInfo.module.css';
import { FaKey, FaPlus, FaSyncAlt } from 'react-icons/fa';

export default function KeyBackupUI() {
    const [isBackupReady, setIsBackupReady] = useState(false);
    const [restoreStatus, setRestoreStatus] = useState({ state: 'idle', message: ''});
    const [showModal, setShowModal] = useState(false);
    const [userBackups, setUserBackups] = useState();
    const [selectedBackupId, setSelectedBackupId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const passwordRef = useRef(null);
    const backupManager = useRef(null);

    useEffect(() => {
        const initBackupManager = async () => {
            backupManager.current = createKeyBackupManager(chatEncryption);
            await backupManager.current.init();
            setIsBackupReady(true);

            backupManager.current.setupAutomationBackups(5); // backup every 5 days
        }

        initBackupManager();
    }, []);

    const loadUserBackups = async () => {
        setIsLoading(true);
        try {
            const backups = await backupManager.current.getUserBackups();
            setUserBackups(backups);
        } catch (error) {
            console.error('Error loading backups:', error);
            alert('Failed to load backups: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenRestoreModal = async () => {
        if(!isBackupReady) return;
        
        setShowModal(true);
        await loadUserBackups();
    };

    const handleCreateBackup = async () => {
        if(!isBackupReady) return;

        try {
            const success = await backupManager.current.createBackup();
            if(success) {
                alert('Backup successfully created and saved to database!');
                if (showModal) {
                    await loadUserBackups();
                }
            }
        } catch (error) {
            console.error('Error creating backup:', error);
            alert(`Failed to create backup: ${error.message}`);
        }
    };

    const handleRemoveBackup = async (backupId, event) => {
        event.stopPropagation(); // Prevent selecting the backup when clicking delete
        
        if (!confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
            return;
        }
        
        try {
            await backupManager.current.removeBackup(backupId);
            await loadUserBackups(); // Refresh the list
            
            if (selectedBackupId === backupId) {
                setSelectedBackupId(null); // Reset selection if the selected backup was deleted
            }
            
            alert('Backup successfully removed');
        } catch (error) {
            console.error('Error removing backup:', error);
            alert(`Failed to remove backup: ${error.message}`);
        }
    };

    const handleRestoreBackup = async () => {
        if(!isBackupReady || !selectedBackupId || !passwordRef.current.value) {
            setRestoreStatus({
                state: 'error',
                message: 'Please select a backup file and enter your password',
            });
            return;
        }

        try {
            setRestoreStatus({ state: 'loading', message: 'Restoring backup...'});

            const result = await backupManager.current.restoreFromBackup(
                selectedBackupId,
                passwordRef.current.value
            );

            setRestoreStatus({
                state: 'success',
                message: `Backup restored successfully! User ID: ${result.userId}, Chats: ${result.chatCount}`,
            });

            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch(error) {
            console.error('Error restoring backup:', error);
            setRestoreStatus({
                state: 'error',
                message: `Failed to restore: ${error.message}`
            });
        }
    };

    return (
        <div className={Styles.keyBackupContainer}>
            <div className={Buttons.keyBackupButtons + ' ' + Buttons.rightAlign}>
                <button
                    className={Buttons.circleIconButton}
                    onClick={handleCreateBackup}
                    disabled={!isBackupReady}
                    title="Create Encryption Keys Backup"
                >
                    <FaKey />
                    <span className={Buttons.iconBadge}><FaPlus style={{fontSize: '0.7em'}} /></span>
                </button>
                <button
                    className={Buttons.secondaryCircleIconButton}
                    onClick={handleOpenRestoreModal}
                    disabled={!isBackupReady}
                    title="Restore from Backup"
                >
                    <FaKey />
                    <span className={Buttons.iconBadge}><FaSyncAlt style={{fontSize: '0.7em'}} /></span>
                </button>
            </div>

            {showModal && (
                <div className={Styles.backupModalOverlay}>
                    <div className={Styles.backupModal}>
                        <h3>Restore Encryption Keys</h3>
                        <p>Select a backup and enter your backup password:</p>
                    
                        <div className={Styles.backupForm}>
                            <div className={Styles.formGroup}>
                                <label>Available Backups:</label>
                                {isLoading ? (
                                    <p className={Styles.loadingMessage}>Loading backups...</p>
                                ) : userBackups.backups.length > 0 ? (
                                    <div className={Styles.backupList}>
                                        {userBackups.backups.map(backup => (
                                            <div
                                                key={backup.id}
                                                className={
                                                    Styles.backupItem +
                                                    (selectedBackupId === backup.id ? ' ' + Styles.backupItemSelected : '')
                                                }
                                                onClick={() => setSelectedBackupId(backup.id)}
                                            >
                                                <div className={Styles.backupInfo}>
                                                    <span className={Styles.backupName}>{backup.backupName}</span>
                                                    <span className={Styles.backupDate}>{new Date(backup.timestamp).toLocaleString()}</span>
                                                </div>
                                                <button
                                                    className={Styles.removeBackupBtn}
                                                    onClick={(event) => handleRemoveBackup(backup.id, event)}
                                                    title='Remove Backup'
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className={Styles.noBackupsMessage}>No backups found. Create a backup first.</p>
                                )}
                            </div>
                            <div className={Styles.formGroup}>
                                <label>Password:</label>
                                <input
                                    type="password"
                                    id="backupPassword"
                                    ref={passwordRef}
                                    disabled={!selectedBackupId}
                                    placeholder='Enter backup password'
                                />
                            </div>
                            {restoreStatus.state !== 'idle' && (
                                <div className={
                                    Styles.restoreStatus + ' ' +
                                    (restoreStatus.state === 'loading' ? Styles.restoreStatusLoading : '') +
                                    (restoreStatus.state === 'success' ? Styles.restoreStatusSuccess : '') +
                                    (restoreStatus.state === 'error' ? Styles.restoreStatusError : '')
                                }>
                                    {restoreStatus.message}
                                </div>
                            )}

                            <div className={Styles.backupActions}>
                                <button 
                                    className={Styles.restoreConfirmButton}
                                    onClick={handleRestoreBackup}
                                    disabled={restoreStatus.state === 'loading' || !selectedBackupId}
                                >
                                    {restoreStatus.state === 'loading' ? 'Restoring...' : 'Restore Selected Backup'}
                                </button>
                                <button 
                                    className={Styles.cancelButton}
                                    onClick={() => setShowModal(false)}
                                    disabled={restoreStatus.state === 'loading'}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className={Styles.refreshButton}
                                    onClick={loadUserBackups}
                                    disabled={restoreStatus.state === 'loading'}
                                >
                                    {isLoading ? 'Refreshing...' : 'Refresh List'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}