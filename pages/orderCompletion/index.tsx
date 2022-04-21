/* eslint-disable */
import { FunctionComponent, useEffect, useRef, useState } from 'react';
import { BuyerProduct } from 'ordercloud-javascript-sdk';
import styles from './orderCompletion.module.css';
// import ProductCard from './ProductCard';
import { useOcSelector } from '../../ordercloud/redux/ocStore';
import Loader from '../../components/Helpers/Loader';

import { OcProductListOptions } from '../../ordercloud/redux/ocProductList';
import { Me, Orders, IntegrationEvents, Tokens, LineItems } from 'ordercloud-javascript-sdk';

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
        const requests = []

        if (token) {
            setShowLoader(true)

            Orders.List('Incoming', { sortBy: ['!LastUpdated'] }).then((response) => {
                let orders = response.Items;

                response.Items.forEach(order => {
                    requests.push(LineItems.List('Incoming', order.ID));
                });

                Promise.all(requests).then((lineItems) => {
                    setShowLoader(false);

                    orders.forEach((order, i) => {
                        orders[i]['LineItems'] = lineItems[i].Items
                    })

                    setOrders(orders);
                })
            });
        }
    }

    const completeOrder = (e) => {
        Orders.Complete('Incoming', e.currentTarget.dataset.orderid).then((response) => {
            console.log(response)
        })
    }

    const cancelOrder = (e) => {
        Orders.Cancel('Incoming', e.currentTarget.dataset.orderid).then((response) => {
            console.log(response)
        })
    }

    useEffect(() => {
        getAllOrders()
    }, [storeToken])

    return (
        <div>
            <div className="wrapper">
                <h1 className={styles.title}>Service Enquiries</h1>
                <div className={styles.results}>
                    {showLoader && (
                        <div className={styles.loader}><Loader /></div>
                    )}
                    {!showLoader && (
                        <>
                            {orders.map((order, i) => {
                                return (
                                    <div key={i}>
                                        <hr />
                                        Created by User: {order.FromUser.Username}
                                        <br />
                                        Company: {order.FromCompanyID}
                                        <br />
                                        Date submitted: {order.DateSubmitted}
                                        {order.LineItems.map((lineItem, lineItemIndex) => {
                                            return (
                                                <div key={lineItemIndex}>
                                                    <br />
                                                    Service: {lineItem.Product.Name}
                                                    <br />
                                                    Service details:
                                                    <ul>
                                                        <li>Width: {lineItem?.xp?.CargoWidth}</li>
                                                        <li>Height: {lineItem?.xp?.CargoHeight}</li>
                                                        <li>Lnegth: {lineItem?.xp?.CargoLenght}</li>
                                                        <li>Weight: {lineItem?.xp?.CargoWeight}</li>
                                                    </ul>
                                                    <br />
                                                </div>
                                            )
                                        })}
                                        Total: {order.Total}
                                        <br />
                                        {order?.xp?.RequestToCancel && (order.Status !== 'Completed' && order.Status !== 'Canceled') && (
                                            <div>
                                                <p>User has requested cancellation of this service</p>
                                                <button type="button" className="btn btn--secondary" data-orderid={order.ID} onClick={cancelOrder}>Cancel</button>
                                            </div>
                                        )}
                                        {(order.Status !== 'Completed' && order.Status !== 'Canceled') && (
                                            <button className="btn" data-orderid={order.ID} onClick={completeOrder}>Complete</button>
                                        )}
                                        {order.Status === 'Completed' && (
                                            <div>Order completed</div>
                                        )}
                                        {order.Status === 'Canceled' && (
                                            <div className={styles.cancelled}>Order cancelled</div>
                                        )}
                                    </div>
                                )
                            })}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AppointmentListingPage
