import './Logo.module.css';
import logoImg from './logo.svg';

export default function Logo() {
  return (
    <div className="logo">
      <h1>EncChat</h1>
      <img src={logoImg} alt="logo" />
    </div>
  );
}