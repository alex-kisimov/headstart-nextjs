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
            {/* <ul className={styles.buttonList}>
                <li>
                    <button disabled={allOrders.current === 0 || activeTab === 'all'} className={activeTab === 'all' ? styles.active : ''} type="button" onClick={showAll}>Showing All ({allOrders.current})</button>
                </li>
                <li>
                    <button disabled={requireDetails.current === 0 || activeTab === 'require'} className={activeTab === 'require' ? styles.active : ''} type="button" onClick={showRequireDetails}>Requires Details ({requireDetails.current})</button>
                </li>
                <li>
                    <button disabled={readyToSend.current === 0 || activeTab === 'ready'} className={activeTab === 'ready' ? styles.active : ''} type="button" onClick={showReadyToSend}>Ready to Send ({readyToSend.current})</button>
                </li>
                <li>
                    <button disabled={sentRequests.current === 0 || activeTab === 'sent'} className={activeTab === 'sent' ? styles.active : ''} type="button" onClick={showSent}>Sent Requests ({sentRequests.current})</button>
                </li>
            </ul> */}
            {/* <div className={styles.results}>
                {!showLoader && orders.length <= 0 && (
                    <div className={styles.error}>
                        <div className={styles.icon}>
                            <svg width="222" height="81" viewBox="0 0 222 81" xmlns="http://www.w3.org/2000/svg">
                                <g fill="#FF6441" fillRule="evenodd">
                                    <path d="M165 50h57.001v-2.001H165V50zM0 50h57v-2.001H0V50z" />
                                    <path d="M56 0v60h73v-2H58V2h106v36.5h2V0z" />
                                    <path d="m152.808 56.169 1.415-1.414 5.727 5.727-1.414 1.414-5.728-5.727zM150 24.5h2v-12h-2v12zm-10 0h2v-12h-2v12zm-10 0h2v-12h-2v12zM120 46h2V12h-2v34zm-10 0h2V12h-2v34zm-10 0h2V12h-2v34zm-10 0h2V12h-2v34zm-10 0h2V12h-2v34zm-10 0h2V12h-2v34z" />
                                    <path d="M71.5 79.5h41v-1h-41v1zm-33.6-9h25.3v1H37.9v-1zm105.9-20.2 16.9 16.9-.1.6c-1.2 4.8 1.7 9.7 6.5 11 .9.2 1.7.3 2.6.3l-5.4-5.4 8.3-8.3 5.4 5.4c.1-2.5-.8-4.9-2.6-6.7-2.2-2.2-5.5-3.1-8.6-2.4l-.6.1-16.9-16.9.1-.6c1.2-4.8-1.7-9.7-6.5-11-.9-.2-1.7-.3-2.6-.3l5.4 5.4-8.3 8.3-5.4-5.4c-.2 4.2 2.6 8 6.8 9.1 1.5.4 3 .4 4.5 0l.5-.1zM169.3 81c-.9 0-1.8-.1-2.7-.3-5.7-1.5-9.2-7.1-8.1-12.8l-15.4-15.4c-1.6.3-3.3.3-4.9-.1-2.8-.7-5.2-2.5-6.7-5.1-1.5-2.5-1.9-5.5-1.2-8.3l.4-1.7 6.6 6.6 5.5-5.5-6.6-6.6 1.7-.4c1.8-.5 3.7-.5 5.5 0 5.7 1.5 9.2 7.1 8.1 12.8l15.4 15.4c3.6-.7 7.3.4 9.9 3 2.7 2.7 3.8 6.7 2.9 10.5l-.4 1.7-6.6-6.6-5.5 5.5 6.6 6.6-1.7.4c-1 .2-1.9.3-2.8.3z" />
                                </g>
                            </svg>
                        </div>
                        <div className={styles.errorText}>You don't currently have any service enquiries. Please use the module below to start the process of requesting services.</div>
                    </div>
                )}
                {showLoader && (
                    <div className={styles.loader}><Loader /></div>
                )}
                {!showLoader && (
                    <>
                        {orders.map((product, i) => {
                            return (
                                <ProductCard product={product} worksheet={worksheets.current[i]} key={`${product.ID}-${i}`} />
                            )
                        })}
                    </>
                )}
            </div> */}
        </div>
    )
}

export default AppointmentListingPage
