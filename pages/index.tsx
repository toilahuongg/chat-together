import GuestHome from '@src/Components/Guest/Home';
import Slider from '@src/Components/Guest/Slider';
import useAuth from '@src/hooks/useAuth';
import useWindowSize from '@src/hooks/useWindowSize';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from './style.module.scss';

const Home: NextPage = () => {
  const { isAuth } = useAuth();
  const size = useWindowSize();
  return isAuth ? (
    <>
      <Head>
        <title> Chat together </title>
      </Head>
      {size.width > 768 && (

        <div className={styles.home}>
          <div className="flex-center">
            <div className="slider">
              <Slider />
            </div>
          </div>
        </div>
      )}
    </>
  ) : <GuestHome />;
}

export default Home
