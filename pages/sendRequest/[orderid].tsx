/* eslint-disable no-use-before-define */
/* eslint-disable radix */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { FunctionComponent, useEffect, useState } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  BuyerAddress,
  Address,
  LineItem,
  LineItems,
  Me,
  Order,
  Orders,
  ShipEstimateResponse,
  IntegrationEvents,
  RequiredDeep,
  ShipMethodSelection,
  OrderWorksheet,
  Payment,
  Payments,
  Auth,
  ApiRole,
  Tokens,
  Product,
  Products,
  Promotion,
} from 'ordercloud-javascript-sdk'
import OcProductDetail from '../../ordercloud/components/OcProductDetail'
import { useOcSelector } from '../../ordercloud/redux/ocStore'
import styles from './SendRequest.module.css'

const SendrequestPage: FunctionComponent = () => {
  const { isReady, query, push } = useRouter()
  const storeToken = useOcSelector((store) => store.ocAuth.decodedToken)
  const [orderDetails, setOrderDetails] = useState(null)

  const sendRequest = () => {
    const token = Tokens.GetAccessToken()

    Orders.Submit('Outgoing', query.orderid.toString()).then((response) => {
      console.log(response)
      setTimeout(() => {
        push('/appointmentListing')
      }, 5000)
    })
  }

  useEffect(() => {
    const token = Tokens.GetAccessToken()

    if (token && query?.orderid) {
      console.log(query)
      IntegrationEvents.GetWorksheet('Outgoing', query.orderid.toString()).then((worksheet) => {
        console.log(worksheet)
        setOrderDetails(worksheet.LineItems)
      })
    }
  }, [storeToken, query])

  return (
    <div>
      <h1 className={styles.title}>Send request</h1>
      {orderDetails && (
        <>
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
          {orderDetails.map((lineItem, i) => {
            return (
              <div key={lineItem.ID}>
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
          <div className={styles.actions}>
            <button type="button" className={`${styles.submit} btn`} onClick={sendRequest}>
              Submit enquiry
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default SendrequestPage
