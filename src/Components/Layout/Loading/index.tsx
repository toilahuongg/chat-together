import IconLoading from '@src/styles/svg/loading.svg';
import { classNames } from '@src/helpers/classNames';

import styles from './loading.module.scss';
type TProps = {
    fullScreen?: boolean
}
const Loading: React.FC<TProps> = ({ fullScreen = false }) => {
    const arrClass = ['wrapper'];
    if (fullScreen) arrClass.push('fullScreen');
    return (
        <div className={classNames(styles, arrClass)}>
            {fullScreen ? (
                <div className={styles.loader} />
            ) : (
                <div className={styles.loading}>
                    <IconLoading />
                </div>

            )}
        </div>
    )
}

export default Loading;