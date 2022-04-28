/* eslint-disable react/no-array-index-key */
/* eslint-disable radix */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { useRouter } from 'next/router'
import { FunctionComponent, useEffect, useRef, useState } from 'react'
import { LineItems, Orders, IntegrationEvents } from 'ordercloud-javascript-sdk'
import Loader from '../../components/Helpers/Loader'
import AddDetailsForm from './AddDetailsForm'
import styles from './Details.module.css'

const OrderPage: FunctionComponent = () => {
  const { query, push } = useRouter()
  const [activeTab, setActiveTab] = useState('item')
  const [worksheet, setWorksheet] = useState(null)
  const [loader, setLoader] = useState(true)
  const [error, setError] = useState(false)
  const addDetailForms = useRef([])

  const addDetails = (e) => {
    e.preventDefault()
    const requests = []

    setLoader(true)
    setError(false)

    for (let i = 0; i < addDetailForms.current.length; i += 1) {
      const form = addDetailForms.current[i]
      const data: any = Object.fromEntries(new FormData(form).entries())

      if (!data.length || !data.height || !data.width || !data.weight) {
        setError(true)
        setLoader(false)
        return
      }
    }

    for (let i = 0; i < addDetailForms.current.length; i += 1) {
      const form = addDetailForms.current[i]
      const data: any = Object.fromEntries(new FormData(form).entries())

      requests.push(
        LineItems.Patch('Outgoing', query.orderid.toString(), data.lineItemId, {
          xp: {
            CargoWidth: parseInt(data.width),
            CargoHeight: parseInt(data.height),
            CargoLenght: parseInt(data.length),
            CargoWeight: parseInt(data.weight),
          },
        })
      )
    }

    Promise.all(requests).then((response) => {
      if (response[0].PromotionDiscount) {
        Orders.RemovePromotion('Outgoing', query.orderid.toString(), 'container-calc').then(() => {
          Orders.AddPromotion('Outgoing', query.orderid.toString(), 'container-calc').then(() => {
            push('/appointmentListing')
          })
        })
      } else {
        Orders.AddPromotion('Outgoing', query.orderid.toString(), 'container-calc').then(() => {
          push('/appointmentListing')
        })
      }
    })
  }

  useEffect(() => {
    IntegrationEvents.GetWorksheet('Outgoing', query.orderid.toString()).then(
      (worksheetResponse) => {
        setWorksheet(worksheetResponse)
        setLoader(false)
      }
    )
  }, [query.orderid])

  return (
    <div className="wrapper page-container">
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
        <h1>Add details</h1>
      </div>
      <ul className={styles.buttonList}>
        <li>
          <button className={activeTab === 'general' ? styles.active : ''} type="button">
            General details
          </button>
        </li>
        <li>
          <button className={activeTab === 'item' ? styles.active : ''} type="button">
            Item details
          </button>
        </li>
      </ul>
      {loader && (
        <div className={styles.loader}>
          <Loader />
        </div>
      )}
      {!loader && (
        <>
          {worksheet.LineItems.map((lineItem, i) => {
            return (
              <AddDetailsForm
                addDetailForms={addDetailForms}
                lineItem={lineItem}
                key={i}
                itemIndex={i}
              />
            )
          })}
        </>
      )}
      <div className={styles.details}>
        {error && (
          <div className={styles.error}>
            <p>Please fill out all the required fields</p>
          </div>
        )}
        <button type="button" onClick={addDetails} className="button button--small button--primary">
          Add details
        </button>
      </div>
    </div>
  )
}

export default OrderPage
