import styles from "./NotFound.module.css";

function NotFound() {
  return (
    <div className={styles.wrap}>
      <h1>You lost, buddy?</h1>
    </div>
  );
}

NotFound.propTypes = {};

export default NotFound;
