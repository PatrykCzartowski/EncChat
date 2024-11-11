import "./Logo.module.css";
import logoImg from "../../assets/Logotyp.svg";

export default function Logo() {
  return (
    <div className="logo">
      <img src={logoImg} alt="logo" />
    </div>
  );
}
