import styles from './checkbox.module.scss';
type TProps = {
  label?: string,
  type?: "checkbox" | "radio"
  checked?: boolean,
  onChange?: () => void
}

const Checkbox: React.FC<TProps> = ({
  label,
  type = "checkbox",
  checked = false,
  onChange = () => {}
}) => {
  return (
    <label className={styles.container}> { label }
      <input type={type} checked={checked} onChange={onChange}/>
      <span className={styles.checkmark}></span>
    </label>
  )
}

export default Checkbox;