/* eslint-disable no-return-assign */
/* eslint-disable radix */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { useEffect, useState } from 'react'
import styles from '../Details.module.css'

const AddDetailsForm = ({ addDetailForms, lineItem, itemIndex }) => {
  const [isDebug, setIsDebug] = useState(false)
  const [length, setLength] = useState(lineItem?.xp?.CargoLenght || '')
  const [width, setWidth] = useState(lineItem?.xp?.CargoWidth || '')
  const [weight, setWeight] = useState(lineItem?.xp?.CargoWeight || '')
  const [height, setHeight] = useState(lineItem?.xp?.CargoHeight || '')

  const onLengthChange = (e) => {
    setLength(e.currentTarget.value)
  }
  const onWidthChange = (e) => {
    setWidth(e.currentTarget.value)
  }
  const onWeightChange = (e) => {
    setWeight(e.currentTarget.value)
  }
  const onHeightChange = (e) => {
    setHeight(e.currentTarget.value)
  }

  useEffect(() => {
    const windowSearch = Object.fromEntries(new URLSearchParams(window.location.search))

    if (windowSearch.debug) {
      setIsDebug(true)
    }
  }, [])

  return (
    <>
      <div className={styles.itemTitle}>
        <p>
          Item {itemIndex + 1}{' '}
          {isDebug && (
            <>
              {` - `}
              {lineItem.ID}
            </>
          )}
        </p>
      </div>
      <form ref={(el) => (addDetailForms.current[itemIndex] = el)} className={styles.results}>
        <input type="hidden" name="lineItemId" value={lineItem.ID} />
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
            <label htmlFor="length">
              Add length<span className={styles.required}>*</span>
            </label>
            <input
              name="length"
              required
              id="length"
              type="text"
              placeholder="Length"
              value={length}
              onChange={onLengthChange}
            />
          </div>
          <div className={styles.col}>
            <label htmlFor="height">
              Add height<span className={styles.required}>*</span>
            </label>
            <input
              name="height"
              required
              id="height"
              type="text"
              placeholder="Height"
              value={height}
              onChange={onHeightChange}
            />
          </div>
          <div className={styles.col}>
            <label htmlFor="width">
              Add width<span className={styles.required}>*</span>
            </label>
            <input
              name="width"
              required
              id="width"
              type="text"
              placeholder="Width"
              value={width}
              onChange={onWidthChange}
            />
          </div>
          <div className={styles.col}>
            <label htmlFor="weight">
              Add weight<span className={styles.required}>*</span>
            </label>
            <input
              name="weight"
              required
              id="weight"
              type="text"
              placeholder="Weight"
              value={weight}
              onChange={onWeightChange}
            />
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
    </>
  )
}

export default AddDetailsForm
