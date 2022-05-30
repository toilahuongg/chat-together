import styles from './slider-range.module.scss';

type TProps = {
  min?: number,
  max?: number,
  step?: number,
  value: number,
  onChange: (value: number) => void,
}
const SliderRange: React.FC<TProps> = ({ min = 1, step = 1, max = 100, value, onChange}) => {
  return (
    <div className={styles.slideContainer}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className={styles.slider}
      />
    </div>
  )
}

export default SliderRange