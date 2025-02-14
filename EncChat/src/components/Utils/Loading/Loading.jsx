import Styles from './Loading.module.css';
import Logo from '../../Logo/Logo'

export default function Loading() {
  return (
      <div className={Styles.LoadingSpinnerContainer}>
        <Logo />
        <div className={Styles.LoadingSpinner}></div>
      </div>
  );
}