import styles from './text-field.module.scss';
type TProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    onChange?: (value: string) => void,
    icon: React.ReactNode,
    errorMessage?: string 
}
const TextField: React.FC<TProps> = ({ onChange, icon, errorMessage, ...props }) => {
    return (
        <div className={styles.textField}>
            <div className={styles.relative}>
                <span className={styles.icon}>{icon}</span>
                <input {...props} onChange={(e) => onChange && onChange(e.target.value)} />
            </div>
            { errorMessage && <div className={styles.error}> { errorMessage } </div> }
        </div>
    )
}

export default TextField;