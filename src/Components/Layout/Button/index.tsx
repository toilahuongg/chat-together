import Loading from '@src/styles/svg/loading.svg';
import styles from './button.module.scss';
type TProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
    variable?: 
        'default'
        | 'default-guest'
        | 'login-google'
        | 'login-facebook'
        | 'login-github'
        | 'submit-login'
        | 'submit-signup'
        | 'link'
        | 'primary'
        | 'outline-primary',
    icon?: React.ReactNode,
    loading?: boolean,
}
const Button: React.FC<TProps> = ({ variable = 'default', icon, loading, children, ...props }) => {
    return (
        <button {...props} className={loading ? styles.btnLoading : styles[variable]} disabled={!!loading}>
            {loading ? <span className={styles.loading}> <Loading  /> </span> : (<>
                { icon && <span className={styles.icon}> {icon} </span>}
                <span className={styles.content}> { children } </span>
            </>)}
           
        </button>
    )
}

export default Button;