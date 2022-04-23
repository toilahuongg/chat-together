import IconImageGallery from '@src/styles/svg/image-gallery.svg';
import IconSmile from '@src/styles/svg/smile.svg';
import IconSend from '@src/styles/svg/send-message.svg';
import styles from './input-box.module.scss';

const InputBox = () => {

  return (
    <div className={styles.inputBox}>
      <div className={styles.advancedMessage}>
        <button> <IconImageGallery /> </button>
        <button> <IconSmile /> </button>
      </div>
      <div className={styles.inputMessage}>
        <input placeholder="Enter your message..."/>
      </div>
      <div className={styles.btnSend}>
        <button> <IconSend /> </button>
      </div>
    </div>
  )
}

export default InputBox;