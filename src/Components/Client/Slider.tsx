import ReactSlider from "react-slick";

import Slider1 from '@src/styles/svg/slider1.svg';
import Slider2 from '@src/styles/svg/slider2.svg';
import Slider3 from '@src/styles/svg/slider3.svg';

import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import styles from './client.module.scss';

const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    arrows: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
};

const Slider = () => {

    return (
        <ReactSlider {...settings}>
            <div className={styles.slideItem}><Slider1 width="500" height="500" viewBox="0 0 1000 1000"/></div>
            <div className={styles.slideItem}><Slider2 width="500" height="500" viewBox="0 0 1000 1000"/></div>
            <div className={styles.slideItem}><Slider3 width="500" height="500" viewBox="0 0 1000 1000"/></div>
        </ReactSlider>
    )
}

export default Slider;