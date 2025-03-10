/* eslint-disable no-use-before-define */
/* eslint-disable radix */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { FunctionComponent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Orders, IntegrationEvents, Tokens } from 'ordercloud-javascript-sdk'
import formatPrice from '../../ordercloud/utils/formatPrice'
import { useOcSelector } from '../../ordercloud/redux/ocStore'
import Loader from '../../components/Helpers/Loader'
import styles from './SendRequest.module.css'

const SendrequestPage: FunctionComponent = () => {
  const { query, push } = useRouter()
  const storeToken = useOcSelector((store) => store.ocAuth.decodedToken)
  const [orderworksheet, setOrderWorksheet] = useState(null)
  const [orderDetails, setOrderDetails] = useState(null)
  const [loader, setLoader] = useState(false)

  const sendRequest = () => {
    setLoader(true)

    Orders.Submit('Outgoing', query.orderid.toString()).then((response) => {
      setTimeout(() => {
        push('/appointmentListing')
      }, 5000)
    })
  }

  useEffect(() => {
    const token = Tokens.GetAccessToken()

    if (token && query?.orderid) {
      IntegrationEvents.GetWorksheet('Outgoing', query.orderid.toString()).then((worksheet) => {
        setOrderWorksheet(worksheet)
        setOrderDetails(worksheet.LineItems)
      })
    }
  }, [storeToken, query])

  console.log(orderworksheet)
  return (
    <div className="wrapper page-container">
      <div className={styles.heading}>
        <div>
          <div className="title-striped">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 497.6 116.7"
                width="447.6"
                height="116.7"
              >
                <path
                  d="M89 42.8v-8.3l62.4-28.6v11zM23.1 53.2V59l96.8-48.6V0zM0 79.6l53.4-22.1v-6.7L0 75.2z"
                  fill="#FF6441"
                />
              </svg>
            </div>
            {orderworksheet && (
              <h1 className={`${styles.title} h2`}>
                {orderworksheet?.LineItems[0]?.Product?.Name}
              </h1>
            )}
          </div>
          <p className={styles.addPreference}>Add a personal preference</p>
        </div>
        <div>
          <div className={styles.quantityWrapper}>
            <span className={styles.quantityLabel}>Quantity:</span>
            <span className={styles.quantity}>{orderDetails?.length}</span>{' '}
            <button type="button" className={`${styles.edit} ${styles.headingEdit}`}>
              <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <g fill="#FF6441" fillRule="evenodd">
                  <path d="M13.523 1.546 2.917 12.153l-.529 3.71 3.71-.528L16.706 4.728l-3.182-3.182zm0 2.122 1.06 1.06-9.191 9.192-1.238.177.176-1.237 9.193-9.192zM9 15h9v1H9z" />
                </g>
              </svg>
            </button>
          </div>
          <div className={styles.costContainer}>
            <span className={styles.costLabel}>Estimated cost:</span>
            <span className={styles.cost}>{formatPrice(orderworksheet?.Order?.Total)}</span>
          </div>
        </div>
      </div>
      <p className={styles.disclaimer}>
        The estimated cost incurs charges relating to moves within the terminal that may not be
        reflected within the breakdown
      </p>
      {orderDetails && (
        <div className={styles.results}>
          {loader && (
            <div className={styles.loader}>
              <Loader />
            </div>
          )}
          <div className={styles.tableHead}>
            <span>Order details</span>
            <Link href={`/appointmentListing/${query.orderid.toString()}`}>
              <a className={styles.edit}>
                <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <g fill="#FF6441" fillRule="evenodd">
                    <path d="M13.523 1.546 2.917 12.153l-.529 3.71 3.71-.528L16.706 4.728l-3.182-3.182zm0 2.122 1.06 1.06-9.191 9.192-1.238.177.176-1.237 9.193-9.192zM9 15h9v1H9z" />
                  </g>
                </svg>
              </a>
            </Link>
          </div>
          <div className={styles.orderDetails}>
            {orderDetails.map((lineItem, i) => {
              return (
                <div key={lineItem.ID}>
                  <p className={styles.lineitem}>
                    {lineItem?.Product?.Name} {i + 1}
                  </p>
                  <ul className={styles.list}>
                    <li className={styles.item}>
                      <p className={styles.label}>Cargo width</p>
                      <p className={styles.value}>{lineItem.xp.CargoWidth}m</p>
                    </li>
                    <li className={styles.item}>
                      <p className={styles.label}>Cargo height</p>
                      <p className={styles.value}>{lineItem.xp.CargoHeight}m</p>
                    </li>
                    <li className={styles.item}>
                      <p className={styles.label}>Cargo length</p>
                      <p className={styles.value}>{lineItem.xp.CargoLenght}m</p>
                    </li>
                    <li className={styles.item}>
                      <p className={styles.label}>Cargo weight</p>
                      <p className={styles.value}>{lineItem.xp.CargoWeight}m</p>
                    </li>
                  </ul>
                </div>
              )
            })}
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.submit} button button--small button--primary`}
              onClick={sendRequest}
            >
              Submit enquiry
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SendrequestPage
