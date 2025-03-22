import React from "react";
import Styles from "./ChatSettings.module.css";

export default function ChatSettings() {
    return (
        <div className={Styles.chatSettingsContainer}>

            <div className={Styles.settingItem}>
                <label>Change Chat Name</label>
                <input type="text" className={Styles.SettingsInput} placeholder="Enter new chat name..." />
            </div>

            <div className={Styles.settingItem}>
                <label>Enable Notifications</label>
                <input type="checkbox" className={Styles.checkbox} />
            </div>

            <div className={Styles.settingItem}>
                <label>Enable Disappearing Messages</label>
                <input type="checkbox" className={Styles.checkbox} />
            </div>

            <div className={Styles.settingItem}>
                <label>Search Messages</label>
                <input type="text" className={Styles.SettingsInput} placeholder="Search for a message..." />
            </div>

            <div className={Styles.settingItem}>
                <label>Multimedia Preview</label>
                <div className={Styles.mediaPreview}>
                    <div className={Styles.mediaItem}></div>
                    <div className={Styles.mediaItem}></div>
                    <div className={Styles.mediaItem}></div>
                    <div className={Styles.mediaItem}></div>
                </div>
            </div>
        </div>
    );
}
