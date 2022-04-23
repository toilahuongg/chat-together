import Nav from "./Nav";

import styles from './messenger.module.scss';
import ListGroup from "./ListGroup";
import BoxMessage from "./BoxMessage";

const Messenger = () => {

    return (
        <>
            <Nav />
            <div className={styles.container}>
                <ListGroup />
                <BoxMessage />
            </div>
        </>
    )
}

export default Messenger;