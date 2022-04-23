import type { NextPage } from 'next'
import GuestHome from '@src/Components/Guest/Home';
import useAuth from '@src/hooks/useAuth';
import Slider from '@src/Components/Guest/Slider';

const Home: NextPage = () => {
  const { isAuth } = useAuth();
  return isAuth ? (
    <div className="flex-center">
      <div className="slider">
        <Slider />
      </div>
    </div>
  ) : <GuestHome />;
}

export default Home
