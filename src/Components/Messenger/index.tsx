import Nav from "./Nav";

import styles from './messenger.module.scss';
import ListGroup from "./ListGroup";

type TProps = {
    children: React.ReactNode
}
const Messenger: React.FC<TProps> = ({ children }) => {

    return (
        <>
            <Nav />
            <div className={styles.container}>
                <ListGroup />
                <div className={styles.group}>
                    { children }
                </div>
            </div>
        </>
    )
}

export default Messenger;