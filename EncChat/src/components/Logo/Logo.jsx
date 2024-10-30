import './Logo.module.css';
import logoImg from './Logotyp.svg';

export default function Logo() {
  return (
    <div className="logo">
      <img src={logoImg} alt="logo" />
    </div>
  );
}