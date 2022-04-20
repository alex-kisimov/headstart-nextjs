/* eslint-disable */
import { FunctionComponent, useEffect, useRef, useState } from 'react';
import { BuyerProduct } from 'ordercloud-javascript-sdk';
import styles from './orderCompletion.module.css';
// import ProductCard from './ProductCard';
import { useOcSelector } from '../../ordercloud/redux/ocStore';
import Loader from '../../components/Helpers/Loader';

import { OcProductListOptions } from '../../ordercloud/redux/ocProductList';
import { Me, Orders, IntegrationEvents, Tokens } from 'ordercloud-javascript-sdk';

export interface OcProductListProps {
    options?: OcProductListOptions
    renderItem?: (product: BuyerProduct) => JSX.Element
}


const AppointmentListingPage: FunctionComponent<OcProductListProps> = () => {
    const [orders, setOrders] = useState([])
    const storeToken = useOcSelector(store => store.ocAuth.decodedToken)
    const [showLoader, setShowLoader] = useState(true)

    const getAllOrders = () => {
        const token = Tokens.GetAccessToken()

        if (token) {
            setShowLoader(true)

            Orders.List('Incoming', { sortBy: ['!LastUpdated'] }).then((response) => {
                setShowLoader(false)
                setOrders(response.Items)
            });
        }
    }

    const completeOrder = (e) => {
        console.log(e.currentTarget.dataset.orderid)
        Orders.Complete('Incoming', e.currentTarget.dataset.orderid).then((response) => {
            console.log(response)
        })
    }

    useEffect(() => {
        getAllOrders()
    }, [storeToken])

    return (
        <div>
            <h1 className={styles.title}>Service Enquiries</h1>
            <div className={styles.results}>
                {showLoader && (
                    <div className={styles.loader}><Loader /></div>
                )}
                {!showLoader && (
                    <>
                        {orders.map((order, i) => {
                            console.log(order)
                            return (
                                <div key={i}>
                                    <hr />
                                    Raised by:
                                    <br />
                                    Company: {order.FromCompanyID}
                                    <br />
                                    User: {order.FromUser.Username}
                                    <br/>
                                    {order.Status !== 'Completed' && (
                                        <button className="btn" data-orderid={order.ID} onClick={completeOrder}>Complete</button>
                                    )}
                                    
                                    {order.Status === 'Completed' && (
                                        <div>Order completed</div>
                                    )}
                                </div>
                            )
                        })}
                    </>
                )}
            </div>
        </div>
    )
}

export default AppointmentListingPage
