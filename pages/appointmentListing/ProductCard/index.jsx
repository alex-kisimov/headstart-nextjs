import Link from 'next/link'
import formatPrice from '../../../ordercloud/utils/formatPrice'
import styles from './ProductCard.module.css'
import TickIcon from './icons/tick-icon'
import ArrowIcon from './icons/arrow-icon'
import ContactIcon from './icons/contact-icon'
import ViewIcon from './icons/view-icon'
import RemoveIcon from './icons/remove-icon'

const OcProductCard = ({ worksheet, product }) => {
  const promotionDiscount = worksheet?.LineItems[0]?.LineTotal;
  const orderTotal = worksheet?.Order?.Total;
  const hasPromotion = worksheet?.LineItems[0]?.PromotionDiscount !== 0;
  const worksheetId = worksheet?.Order?.ID;
  const isSubmitted = worksheet?.Order.IsSubmitted;

  console.log(worksheet)

  if (!product) {
    return null
  }

  return (
    <div className={`${styles.container} ${isSubmitted ? styles.submitted : ''}`}>
      <div className={styles.title}>
        <p className={styles.name}>{product.Name}</p>
        <div className={styles.quantity}>
          <p>
            Quantity: <span className={styles.amount}>{worksheet.LineItems.length}</span>
          </p>
          <Link href={`/appointmentListing/${worksheet.Order.ID}`}>
            <a className={styles.edit}>
              <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <g fill="#FF6441" fillRule="evenodd">
                  <path d="M13.523 1.546 2.917 12.153l-.529 3.71 3.71-.528L16.706 4.728l-3.182-3.182zm0 2.122 1.06 1.06-9.191 9.192-1.238.177.176-1.237 9.193-9.192zM9 15h9v1H9z" />
                </g>
              </svg>
            </a>
          </Link>
        </div>
      </div>
      <div className={styles.middle}>
        <p className={styles.description}>{product.Description}</p>
        {hasPromotion && (
          <div className={styles.pricecontainer}>
            <span>Estimated cost</span>{' '}
            <span className={styles.price}>{formatPrice(orderTotal)}</span>
          </div>
        )}
        {product.PriceSchedule?.PriceBreaks[0].Price && !hasPromotion && (
          <div className={styles.pricecontainer}>
            <p>
              Base cost{' '}
              <span className={styles.price}>
                {formatPrice(product.PriceSchedule?.PriceBreaks[0].Price)}
              </span>
            </p>
          </div>
        )}
      </div>

      <div className={styles.bottom}>
        <ul className={styles.icons}>
          <li className={styles.iconItem}>
            <ContactIcon customClass={undefined} />
          </li>
          <li className={styles.iconItem}>
            <ViewIcon customClass={undefined} />
          </li>
          <li className={styles.iconItem}>
            <RemoveIcon customClass={undefined} />
          </li>
        </ul>
        {isSubmitted ? (
          <ul className={styles.list}>
            <li className={`${styles.item} ${isSubmitted ? styles.submittedIcon : ''}`}>
              <TickIcon customClass={styles.svg} />
              Sent to terminal
            </li>
          </ul>
        ) : (
          <ul className={styles.list}>
            <li className={styles.item}>
              <TickIcon customClass={styles.svg} />
              Select service
            </li>
            <li className={styles.item}>
              {hasPromotion ? (
                <TickIcon customClass={styles.svg} />
              ) : (
                <ArrowIcon customClass={styles.svg} />
              )}
              Provide details
            </li>
            <li className={styles.item}>
              <ArrowIcon customClass={styles.svg} />
              Send request
            </li>
          </ul>
        )}

        {!isSubmitted && (
          <>
            {hasPromotion ? (
              <Link href={`/sendRequest/${worksheetId}`}>
                <a className="btn">Send request</a>
              </Link>
            ) : (
              <Link href={`/appointmentListing/${worksheetId}`}>
                <a className="btn btn--secondary">Add details</a>
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default OcProductCard
