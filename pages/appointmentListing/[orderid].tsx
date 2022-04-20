/* eslint-disable radix */
/* eslint-disable jsx-a11y/label-has-associated-control */
import Head from 'next/head'
import { useRouter } from 'next/router'
import { FunctionComponent, useState } from 'react'
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
import styles from './Details.module.css'

const OrderPage: FunctionComponent = () => {
  const { query, push } = useRouter()
  const [activeTab, setActiveTab] = useState('item')

  const onFormSubmit = (e) => {
    e.preventDefault()

    IntegrationEvents.GetWorksheet('Outgoing', query.orderid.toString()).then((worksheet) => {
      const lineItemId = worksheet.LineItems[0].ID

      LineItems.Patch('Outgoing', query.orderid.toString(), lineItemId, {
        xp: {
          CargoWidth: parseInt(e.target.width.value),
          CargoHeight: parseInt(e.target.height.value),
          CargoLenght: parseInt(e.target.length.value),
          CargoWeight: parseInt(e.target.weight.value),
        },
      }).then((response) => {
        if (response.PromotionDiscount) {
          Orders.RemovePromotion('Outgoing', query.orderid.toString(), 'container-calc').then(
            () => {
              Orders.AddPromotion('Outgoing', query.orderid.toString(), 'container-calc').then(
                () => {
                  push('/appointmentListing')
                }
              )
            }
          )
        } else {
          Orders.AddPromotion('Outgoing', query.orderid.toString(), 'container-calc').then(() => {
            push('/appointmentListing')
          })
        }
      })
    })
  }

  const showGeneralDetails = () => {}
  const showRequireDetails = () => {}

  return (
    <div className="wrapper page-container">
      <div className="title-striped">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 497.6 116.7" width="447.6" height="116.7"><path d="M89 42.8v-8.3l62.4-28.6v11zM23.1 53.2V59l96.8-48.6V0zM0 79.6l53.4-22.1v-6.7L0 75.2z" fill="#FF6441"></path></svg>
        </div>
        <h1>Add details</h1>
      </div>
      <ul className={styles.buttonList}>
        <li>
          <button
            className={activeTab === 'general' ? styles.active : ''}
            type="button"
            onClick={showGeneralDetails}
          >
            General details
          </button>
        </li>
        <li>
          <button
            className={activeTab === 'item' ? styles.active : ''}
            type="button"
            onClick={showRequireDetails}
          >
            Item details
          </button>
        </li>
      </ul>
      <form className={styles.results} onSubmit={onFormSubmit}>
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
          <div className={styles.colHalf}>
            <label htmlFor="description">Goods description</label>
            <input id="description" type="text" placeholder="Enter Details" />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.col}>
            <label htmlFor="length">Add length</label>
            <input required id="length" type="text" placeholder="Length" />
          </div>
          <div className={styles.col}>
            <label htmlFor="height">Add height</label>
            <input required id="height" type="text" placeholder="Height" />
          </div>
          <div className={styles.col}>
            <label htmlFor="width">Add width</label>
            <input required id="width" type="text" placeholder="Width" />
          </div>
          <div className={styles.col}>
            <label htmlFor="weight">Add weight</label>
            <input required id="weight" type="text" placeholder="Weight" />
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

        <div className={styles.colHalf}>
          <label htmlFor="operation">Type of operation</label>
          <input id="operation" type="text" placeholder="Enter Details" />
        </div>
        <div className={styles.radioContainer}>
          <p>Does it have a cradle?</p>
          <fieldset className={styles.radio}>
            <label>
              <input type="radio" name="cradleHave" value="Yes" />
              Yes
            </label>
            <label>
              <input type="radio" name="cradleHave" value="No" />
              No
            </label>
          </fieldset>
        </div>

        <div className={styles.radioContainer}>
          <p>Does it need a cradle?</p>
          <fieldset className={styles.radio}>
            <label>
              <input type="radio" name="cradleNeed" value="Yes" />
              Yes
            </label>
            <label>
              <input type="radio" name="cradleNeed" value="No" />
              No
            </label>
          </fieldset>
        </div>

        <div className={styles.radioContainer}>
          <p>Storage needed?</p>
          <fieldset className={styles.radio}>
            <label>
              <input type="radio" name="storage" value="Yes" />
              Yes
            </label>
            <label>
              <input type="radio" name="storage" value="No" />
              No
            </label>
          </fieldset>
        </div>

        <button type="submit" className="btn btn--secondary">
          Add details
        </button>
      </form>
    </div>
  )
}

export default OrderPage
