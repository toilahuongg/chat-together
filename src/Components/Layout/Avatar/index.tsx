import styles from './avatar.module.scss';

type TProps = {
  src: string,
  width?: number,
  height?: number,
  alt?: string,
  hidden?:boolean
}
const Avatar: React.FC<TProps> = ({
  src,
  width = 56,
  height = 56,
  alt = "",
  hidden = false
}) => {
  const style = {
    width,
    minWidth: width,
    height,
    minHeight: height
  }
  if (hidden) style['display'] = "none";
  return (
    <div
      className={styles.avatar}
      style={style}
    >
      <img src={src} alt={alt} loading="lazy" />
    </div>
  )
}

export default Avatar;