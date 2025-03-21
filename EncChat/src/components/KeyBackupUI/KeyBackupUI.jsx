import { useState, useEffect, useRef } from 'react';
import './KeyBackupUI.css';
import createKeyBackupManager from '../Utils/keyBackup';
import chatEncryption from '../Utils/clientEncryption';

export default function KeyBackupUI() {
    const [isBackupReady, setIsBackupReady] = useState(false);
    const [restoreStatus, setRestoreStatus] = useState({ state: 'idle', message: ''});
    const [showModal, setShowModal] = useState(false);
    const [userBackups, setUserBackups] = useState([]);
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
        <div className="key-backup-containter">
            <div className="key-backup-buttons">
                <button
                    className="backup-button"
                    onClick={handleCreateBackup}
                    disabled={!isBackupReady}
                >
                    Create Encryption Keys Backup
                </button>
                <button
                    className="restore-button"
                    onClick={handleOpenRestoreModal}
                    disabled={!isBackupReady}
                >
                    Restore from Backup
                </button>
            </div>

            {showModal && (
                <div className="backup-modal-overlay">
                    <div className="backup-modal">
                        <h3>Restore Encryption Keys</h3>
                        <p>Select a backup and enter your backup password:</p>
                    
                        <div className="backup-form">
                            <div className="form-group">
                                <label>Available Backups:</label>
                                {isLoading ? (
                                    <p className="loading-message">Loading backups...</p>
                                ) : userBackups.length > 0 ? (
                                    <div className="backup-list">
                                        {userBackups.map(backup => (
                                            <div
                                                key={backup.id}
                                                className={`backup-item ${selectedBackupId === backup.id ? 'selected' : ''}`}
                                                onClick={() => setSelectedBackupId(backup.id)}
                                            >
                                                <div className='backup-info'>
                                                    <span className='backup-name'>{backup.backupName}</span>
                                                    <span className='backup-date'>{new Date(backup.timestamp).toLocaleString()}</span>
                                                </div>
                                                <button
                                                    className='remove-backup-btn'
                                                    onClick={(event) => handleRemoveBackup(backup.id, event)}
                                                    title='Remove Backup'
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-backups-message">No backups found. Create a backup first.</p>
                                )}
                            </div>
                            <div className="form-group">
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
                                <div className={`restore-status ${restoreStatus.state}`}>
                                    {restoreStatus.message}
                                </div>
                            )}

                            <div className="backup-actions">
                                <button 
                                    className='restore-confirm-button'
                                    onClick={handleRestoreBackup}
                                    disabled={restoreStatus.state === 'loading' || !selectedBackupId}
                                >
                                    {restoreStatus.state === 'loading' ? 'Restoring...' : 'Restore Selected Backup'}
                                </button>
                                <button 
                                    className='cancel-button'
                                    onClick={() => setShowModal(false)}
                                    disabled={restoreStatus.state === 'loading'}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className='refresh-button'
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