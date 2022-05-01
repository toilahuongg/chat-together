import { useState } from '@hookstate/core';

import { showListGroupState } from '@src/hooks/useListGroup';
import IconLeftArrow from '@src/styles/svg/left-arrow.svg';
import IconRightArrow from '@src/styles/svg/right-arrow.svg';
import styles from './nav.module.scss';

const Nav = () => {
    const showListGroup = useState(showListGroupState);
    return (
        <div className={styles.nav}>
            <div className={styles.navBar}>
                <button onClick={() => showListGroup.set(!showListGroup.get())}>
                    {
                        showListGroup.get() ? (
                            <IconLeftArrow />
                        ) : (
                            <IconRightArrow />
                        )
                    }
                </button>
            </div>
        </div>
    )
}

export default Nav;