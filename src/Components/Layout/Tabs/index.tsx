
import { classNames } from '@src/helpers/classNames';
import styles from './tabs.module.scss';
export type TTab = {
  id: string,
  label: string
}
type TProps = {
  tabs: TTab[],
  selected: string,
  onSelect: (selected: string) => void
}

const Tabs: React.FC<TProps> = ({ tabs, selected, onSelect }) => {

  return (
    <div className={styles.tabs}>
      { tabs.map((tab) => (
        <div
          key={tab.id}
          className={selected === tab.id ? classNames(styles, ['item', 'selected']) : styles.item}
          onClick={() => onSelect(tab.id)}
        >
          {tab.label}
        </div>
      ))}
    </div>
  )
};

export default Tabs;