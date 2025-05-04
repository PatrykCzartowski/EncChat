import { useEffect, useState } from "react";
import Styles from "./Settings.module.css";
import InputStyles from '../../../Forms/Input.module.css';
import { useTheme } from '../../../../context/ThemeContext';

export default function Settings({ closeSettings }) {
  const [modal, setModal] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleChatClick = (event) => {
      if (event.target.closest(".friendListItem")) {
        closeSettings();
      }
    };
    document.addEventListener("click", handleChatClick);
    return () => document.removeEventListener("click", handleChatClick);
  }, [closeSettings]);

  const openModal = (type) => {
    setModal(type);
    setInputValue("");
  };

  const closeModal = () => {
    setModal(null);
    setInputValue("");
  };

  const handleConfirm = () => {
    closeModal();
  };

  return (
    <div className={Styles.settingsContainer}>
      <button className={Styles.closeButton} onClick={closeSettings}>✖</button>
      <h2>General Settings</h2>

      <div className={Styles.settingsList}>
        <button className={Styles.settingsButton} onClick={() => openModal("Name")}>
            Change Name
        </button>
        <button className={Styles.settingsButton} onClick={() => openModal("Surname")}>
            Change Surname
        </button>
        <button className={Styles.settingsButton} onClick={() => openModal("Password")}>
            Change Password
        </button>
        <button className={Styles.settingsButton} onClick={() => openModal("E-mail")}>
            Change E-mail
        </button>
        <div className={Styles.formGroup}>
        <label htmlFor="language">Language</label>
        <select id="language" className={Styles.settingsSelect} defaultValue="English">
            <option>English</option>
            <option>Polski</option>
            <option>Español</option>
            <option>Deutsch</option>
        </select>
        </div>

        <div className={Styles.formGroup}>
        <label htmlFor="theme">Theme</label>
        <select 
          id="theme" 
          className={Styles.settingsSelect} 
          value={theme}
          onChange={toggleTheme}
        >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
        </select>
        </div>

        <div className={Styles.formGroup}>
        <label htmlFor="notifications">Notifications</label>
        <select id="notifications" className={Styles.settingsSelect} defaultValue="Enabled">
            <option>Enabled</option>
            <option>Disabled</option>
        </select>
        </div>

        <button className={`${Styles.settingsButton} ${Styles.deleteButton}`}>
            Delete Account
        </button>
      </div>

      {modal && (
        <div className={Styles.modalOverlay}>
          <div className={Styles.modalContent}>
            <h3>{`Update ${modal}`}</h3>
            <input
                className={InputStyles.inputField}
                type={modal.toLowerCase().includes("password") ? "password" : "text"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Enter new ${modal.toLowerCase()}`}
            />
            <div className={Styles.modalActions}>
                <button onClick={handleConfirm}>OK</button>
                <button onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
