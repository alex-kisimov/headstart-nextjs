import { useState, useEffect } from 'react';
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
  const orderTotal = worksheet?.Order?.Total;
  const hasPromotion = worksheet?.LineItems[0]?.PromotionDiscount !== 0;
  const worksheetId = worksheet?.Order?.ID;
  const isSubmitted = worksheet?.Order.Status === 'Open';
  const isCancelled = worksheet?.Order.Status === 'Canceled';
  const isCompleted = worksheet?.Order.Status === 'Completed';
  const [isRemoved, toRemove] = useState(false);
  const [isRequestCancel, setIsRequestCancel] = useState(
    worksheet?.Order?.xp?.RequestToCancel || false
  )
  const [openModal, setOpenModal] = useState(false);
  const [isDebug, setIsDebug] = useState(false)

  const removeCard = () => {
    Orders.Delete('Outgoing', worksheetId)
      .then(() => {
        toRemove(true)
      })
      .catch(() => {
        console.error(`Error removing worksheet ${worksheetId}`)
      })
  };

  const requestCancellation = () => {
    Orders.Patch('Outgoing', worksheetId, {
      xp: {
        RequestToCancel: true
      },
    }).then(() => {
      setIsRequestCancel(true);
      setOpenModal(false);
    });
  };

  const openCancellationModal = () => {
    setOpenModal(true);
  }

  const closeCancellationModal = () => {
    setOpenModal(false);
  }

  useEffect(() => {
    const windowSearch = Object.fromEntries(new URLSearchParams(window.location.search))

    if (windowSearch.debug) {
      setIsDebug(true)
    }
  }, [])

  if (!product || isRemoved) {
    return null;
  }

  return (
    <div
      className={`${styles.container} ${isRequestCancel && !isCancelled ? styles.pending : ''} ${
        isCancelled ? styles.cancelledCard : ''
      } ${isSubmitted ? styles.submitted : ''} ${isCompleted ? styles.completed : ''}`}
    >
      <div className={styles.title}>
        <p className={styles.name}>
          {product.Name}
          {isDebug && (
            <>
              {` - `} {worksheetId}
            </>
          )}
        </p>
        <div className={styles.quantity}>
          {worksheet?.LineItems.length && (
            <p>
              Quantity: <span className={styles.amount}>{worksheet?.LineItems.length}</span>
            </p>
          )}
          {!isSubmitted && !isCancelled && !isCompleted && (
            <Link href={`/appointmentListing/${worksheet?.Order.ID}`}>
              <a className={styles.edit}>
                <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <g fill="#FF6441" fillRule="evenodd">
                    <path d="M13.523 1.546 2.917 12.153l-.529 3.71 3.71-.528L16.706 4.728l-3.182-3.182zm0 2.122 1.06 1.06-9.191 9.192-1.238.177.176-1.237 9.193-9.192zM9 15h9v1H9z" />
                  </g>
                </svg>
              </a>
            </Link>
          )}
        </div>
      </div>
      <div className={styles.middle}>
        <p className={styles.addPreference}>Add a personal reference</p>
        {hasPromotion && (
          <div className={styles.pricecontainer}>
            <span>Estimated cost</span>{' '}
            <span className={styles.price}>{formatPrice(orderTotal)}</span>
          </div>
        )}
        {product.PriceSchedule?.PriceBreaks[0].Price && !hasPromotion && (
          <div className={styles.pricecontainer}>
            <p>Base cost </p>
            <p>
              <span className={styles.price}>{formatPrice(orderTotal)}</span>
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
          {!isSubmitted && !isCancelled && !isCompleted && (
            <li className={styles.iconItem}>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={removeCard}
                title="Remove"
              >
                <RemoveIcon customClass={undefined} />
              </button>
            </li>
          )}
        </ul>
        {isSubmitted && !isRequestCancel && !isCancelled && (
          <ul className={styles.list}>
            <li className={styles.item}>
              <button
                onClick={openCancellationModal}
                type="button"
                className="button button--small"
              >
                Request cancellation
              </button>
            </li>
            <li className={`${styles.item} ${isSubmitted ? styles.submittedIcon : ''}`}>
              <TickIcon customClass={styles.svg} />
              Sent to terminal
            </li>
          </ul>
        )}

        {isCancelled && <li className={`${styles.item} ${styles.cancelled}`}>Cancelled</li>}

        {isCompleted && <li className={`${styles.item}`}>Completed</li>}

        {isRequestCancel && !isCancelled && (
          <li className={`${styles.item} ${styles.pendingCancel}`}>Cancellation pending</li>
        )}

        {!isSubmitted && !isCancelled && !isCompleted && (
          <ul className={styles.list}>
            <li className={styles.item}>
              <TickIcon customClass={styles.svg} />
              Select service
            </li>
            <li className={styles.separator} />
            <li className={styles.item}>
              {hasPromotion ? (
                <TickIcon customClass={styles.svg} />
              ) : (
                <ArrowIcon customClass={styles.svg} />
              )}
              Provide details
            </li>
            <li className={styles.separator} />
            <li className={styles.item}>
              <ArrowIcon customClass={styles.svg} />
              Send request
            </li>
          </ul>
        )}
        {!isSubmitted && !isCancelled && !isCompleted && (
          <>
            {hasPromotion ? (
              <Link href={`/sendRequest/${worksheetId}`}>
                <a className="button button--small button--primary">Send request</a>
              </Link>
            ) : (
              <Link href={`/appointmentListing/${worksheetId}`}>
                <a className="button button--small">Add details</a>
              </Link>
            )}
          </>
        )}
      </div>
      {openModal && (
        <div className={styles.modal}>
          <div className={styles.modalInner}>
            <p className={styles.modalTitle}>Cancel Request</p>
            <div className={styles.inner}>
              <p className={styles.error}>
                Are you sure you want to cancel this request? Lorem ipsum dolor sit amet,
                consectetur consectetur consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
            <div className={styles.actions}>
              <button
                type="button"
                className={`button button--small ${styles.cancel}`}
                onClick={closeCancellationModal}
              >
                Back to enquiry
              </button>
              <button
                type="button"
                className="button button--small button--primary"
                onClick={requestCancellation}
              >
                Confirm Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OcProductCard
