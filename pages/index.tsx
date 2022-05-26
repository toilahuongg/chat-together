import type { NextPage } from 'next'
import GuestHome from '@src/Components/Guest/Home';
import useAuth from '@src/hooks/useAuth';
import Slider from '@src/Components/Guest/Slider';
import Head from 'next/head';

import styles from './style.module.scss';
const Home: NextPage = () => {
  const { isAuth } = useAuth();
  return isAuth ? (
    <div className={styles.home}>
      <Head>
        <title> Chat together </title>
      </Head>
      <div className="flex-center">
        <div className="slider">
          <Slider />
        </div>
      </div>
    </div>
  ) : <GuestHome />;
}

export default Home
