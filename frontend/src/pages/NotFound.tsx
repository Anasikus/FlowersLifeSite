import styles from './NotFound.module.css';

const NotFound = () => {
  return (
    <div className={styles.app}>
      <div className={styles.error}>404</div>
      <div className={styles.img}>
        <img src="/img/cat.png" alt="cat" />
        <h1 className={styles.okak}>ОКАК</h1>
      </div>
    </div>
  );
};

export default NotFound;
