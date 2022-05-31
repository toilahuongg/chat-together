import ArrowUp from '@src/styles/svg/arrow-up.svg';
import ArrowDown from '@src/styles/svg/arrow-down.svg';
import styles from './accordion.module.scss';
import { useState } from 'react';

type TProps = {
  title: string,
}
const Accordion: React.FC<TProps> = ({ title, children }) => {
  const [isShow, setShow] = useState(false);
  const toggle = () => setShow(!isShow);
  return (
    <div className={styles.accordion}>
      <div className={styles.header} onClick={toggle}>
        <div className={styles.title}> {title} </div>
        <div className={styles.icon}>
          {isShow ? <ArrowUp /> : <ArrowDown /> }
        </div>
      </div>
      { isShow && <div className={styles.body}>{children} </div> }
    </div>
  )
}

export default Accordion;