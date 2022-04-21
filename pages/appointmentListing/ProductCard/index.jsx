import { useState } from 'react';
import Link from 'next/link';
import { Orders } from 'ordercloud-javascript-sdk';
import formatPrice from '../../../ordercloud/utils/formatPrice';
import styles from './ProductCard.module.css';
import TickIcon from './icons/tick-icon';
import ArrowIcon from './icons/arrow-icon';
import ContactIcon from './icons/contact-icon';
import ViewIcon from './icons/view-icon';
import RemoveIcon from './icons/remove-icon';

const OcProductCard = ({ worksheet, product }) => {
  const promotionDiscount = worksheet?.LineItems[0]?.LineTotal;
  const hasPromotion = worksheet?.LineItems[0]?.PromotionDiscount !== 0;
  const worksheetId = worksheet?.Order?.ID;
  const isSubmitted = worksheet?.Order.IsSubmitted;
  const [isRemoved, toRemove] = useState(false);

  const removeCard = () => {
    Orders.Delete("Outgoing", worksheetId).then(() => {
      toRemove(true);
    }).catch(() => {
      console.error(`Error removing worksheet ${worksheetId}`);
    });
  };

  if (!product || isRemoved) {
    return null;
  }

  return (
    <div className={`${styles.container} ${isSubmitted ? styles.submitted : ''}`}>
      <p className={styles.name}>{product.Name}</p>
      <div className={styles.middle}>
        <p className={styles.description}>{product.Description}</p>
        {hasPromotion && (
          <div className={styles.pricecontainer}>
            <span>Estimated cost</span>{' '}
            <span className={styles.price}>{formatPrice(promotionDiscount)}</span>
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
          {!isSubmitted && (
            <li className={styles.iconItem}>
              <button type="button" onClick={removeCard} title="Remove">
                <RemoveIcon customClass={undefined} />
              </button>
            </li>
          )}
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

export default OcProductCard;