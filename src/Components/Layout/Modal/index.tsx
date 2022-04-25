import React from 'react';

import IconClose from '@src/styles/svg/close.svg';
import styles from './modal.module.scss';

type TProps = {
  isShow: boolean;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode | React.ReactNode[] | string | string[];
  onClose: () => void;
};
const Header: React.FC<TProps['children']> = ({ children }) => {
  return <div className={styles.header}> {children} </div>;
};
const Body: React.FC<TProps['children']> = ({ children }) => {
  return <div className={styles.body}> {children} </div>;
};
const Footer: React.FC<TProps['children'] & { align: 'left' | 'center' | 'right' | 'between' }> = ({ align, children }) => {
  return <div className={`${styles.footer} ${styles[align]}`}> {children} </div>;
};

const Modal: React.FC<TProps> = ({ isShow, size, children, onClose }) => {
  return (
    <div className={`${styles.modal} ${isShow ? `${styles.show}` : ''}`} onMouseDown={() => onClose()}>
      <div className={`${styles.content}  ${styles[size || 'sm']}`} onMouseDown={(e) => e.stopPropagation()}>
        <button type="button" className={styles.btnClose} onClick={() => onClose()}>
          <IconClose width="14" height="14" viewBox="0 0 30 30" />
        </button>
        {children}
      </div>
    </div>
  );
};
Modal.defaultProps = { size: 'sm' };
export default Object.assign(Modal, { Header, Body, Footer });