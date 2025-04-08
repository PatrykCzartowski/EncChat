import { useEffect, useState } from "react";
import "./Settings.css";

export default function Settings({ closeSettings }) {
  const [modal, setModal] = useState(null);
  const [inputValue, setInputValue] = useState("");

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
    <div className="settingsContainer">
      <button className="closeButton" onClick={closeSettings}>✖</button>
      <h2>General Settings</h2>

      <div className="settingsList">
        <button className="settingsButton" onClick={() => openModal("Name")}>
            Change Name
        </button>
        <button className="settingsButton" onClick={() => openModal("Surname")}>
            Change Surname
        </button>
        <button className="settingsButton" onClick={() => openModal("Password")}>
            Change Password
        </button>
        <button className="settingsButton" onClick={() => openModal("E-mail")}>
            Change E-mail
        </button>
        <div className="formGroup">
        <label htmlFor="language">Language</label>
        <select id="language" className="settingsSelect" defaultValue="English">
            <option>English</option>
            <option>Polski</option>
            <option>Español</option>
            <option>Deutsch</option>
        </select>
        </div>

        <div className="formGroup">
        <label htmlFor="theme">Theme</label>
        <select id="theme" className="settingsSelect" defaultValue="Light">
            <option>Light</option>
            <option>Dark</option>
        </select>
        </div>

        <div className="formGroup">
        <label htmlFor="notifications">Notifications</label>
        <select id="notifications" className="settingsSelect" defaultValue="Enabled">
            <option>Enabled</option>
            <option>Disabled</option>
        </select>
        </div>

        <button className="settingsButton deleteButton">
            Delete Account
        </button>
      </div>

      {modal && (
        <div className="modalOverlay">
          <div className="modalContent">
            <h3>{`Update ${modal}`}</h3>
            <input
                className={"settingsInput"}
                type={modal.toLowerCase().includes("password") ? "password" : "text"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Enter new ${modal.toLowerCase()}`}
            />
            <div className="modalActions">
                <button onClick={handleConfirm}>OK</button>
                <button onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
