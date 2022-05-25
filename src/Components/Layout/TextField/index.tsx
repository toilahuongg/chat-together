import { useEffect, useState } from 'react';
import randomChars from 'server/helpers/randomChars';
import styles from './text-field.module.scss';
type TProps = React.DetailedHTMLProps<Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>, HTMLInputElement> & {
    onChange?: (value: string) => void,
    icon?: React.ReactNode,
    plain?: boolean,
    label?: string,
    errorMessage?: string 
}
const TextField: React.FC<TProps> = ({ onChange, icon, errorMessage, plain, label, ...props }) => {
    const [key, setKey] = useState('');
    useEffect(() => {
        setKey(randomChars(8));
    }, []);
    return (
        <div className={styles.textField}>
            { label  && <label htmlFor=''> {label} </label>}
            <div className={styles.relative}>
                {icon && <span className={styles.icon}>{icon}</span> }
                <input
                    onChange={(e) => onChange && onChange(e.target.value)}
                    style={{padding: icon ? '10px 40px' : '10px' }}
                    className={plain ? styles.plain : ''}
                    {...props}
                />
            </div>
            { errorMessage && <div className={styles.error}> { errorMessage } </div> }
        </div>
    )
}

export default TextField;