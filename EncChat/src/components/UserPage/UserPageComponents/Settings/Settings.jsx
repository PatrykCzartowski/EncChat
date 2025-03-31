import { useEffect } from "react";
import "./Settings.css";

export default function Settings({ closeSettings }) {

    useEffect(() => {
        const handleChatClick = (event) => {
            if (event.target.closest(".friendListItem")) { 
                closeSettings();
            }
        };

        document.addEventListener("click", handleChatClick);
        return () => {
            document.removeEventListener("click", handleChatClick);
        };
    }, [closeSettings]);

    return (
        <div className="settingsContainer">
            <button className="closeButton" onClick={closeSettings}>✖</button>
            <h2>General Settings</h2>
            <p>Here you can adjust your preferences.</p>
        </div>
    );
}
