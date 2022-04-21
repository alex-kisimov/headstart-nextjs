/* eslint-disable no-return-assign */
/* eslint-disable radix */
/* eslint-disable jsx-a11y/label-has-associated-control */
import styles from '../Details.module.css'

const AddDetailsForm = ({ addDetailForms, lineItem, itemIndex }) => {
  return (
    <form ref={(el) => (addDetailForms.current[itemIndex] = el)} className={styles.results}>
      <input type="hidden" name="lineItemId" value={lineItem.ID} />
      <p>Item {itemIndex + 1}</p>
      <div className={styles.row}>
        <div className={styles.col}>
          <label htmlFor="port">Port of Loading/Departure</label>
          <input id="port" type="text" placeholder="Enter Details" />
        </div>
        <div className={styles.col}>
          <label htmlFor="vessel">Vessel/Service</label>
          <input id="vessel" type="text" placeholder="Enter Details" />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.col}>
          <label htmlFor="length">Add length</label>
          <input name="length" required id="length" type="text" placeholder="Length" />
        </div>
        <div className={styles.col}>
          <label htmlFor="height">Add height</label>
          <input name="height" required id="height" type="text" placeholder="Height" />
        </div>
        <div className={styles.col}>
          <label htmlFor="width">Add width</label>
          <input name="width" required id="width" type="text" placeholder="Width" />
        </div>
        <div className={styles.col}>
          <label htmlFor="weight">Add weight</label>
          <input name="weight" required id="weight" type="text" placeholder="Weight" />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.col}>
          <label htmlFor="lifting">Lifting points</label>
          <input id="lifting" type="text" placeholder="Enter Details" />
        </div>
        <div className={styles.col}>
          <label htmlFor="location">Cargo location</label>
          <input id="location" type="text" placeholder="Enter Details" />
        </div>
      </div>
    </form>
  )
}

export default AddDetailsForm
