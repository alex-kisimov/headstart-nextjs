/* eslint-disable */
import { FunctionComponent, useEffect, useRef, useState } from 'react';
import { BuyerProduct } from 'ordercloud-javascript-sdk';
import styles from './appointmentListing.module.css';
import ProductCard from './ProductCard';
import { useOcSelector } from '../../ordercloud/redux/ocStore';
import Loader from '../../components/Helpers/Loader';

import { OcProductListOptions } from '../../ordercloud/redux/ocProductList';
import { Me, Orders, IntegrationEvents, Tokens } from 'ordercloud-javascript-sdk';

export interface OcProductListProps {
    options?: OcProductListOptions
    renderItem?: (product: BuyerProduct) => JSX.Element
}


const AppointmentListingPage: FunctionComponent<OcProductListProps> = () => {
    const [products, setProducts] = useState([])
    const worksheets = useRef([])
    const storeToken = useOcSelector(store => store.ocAuth.decodedToken)
    const [showLoader, setShowLoader] = useState(true)
    const [activeTab, setActiveTab] = useState('all')
    const allOrders = useRef(0)
    const requireDetails = useRef(0)
    const readyToSend = useRef(0)
    const sentRequests = useRef(0);
    const requestedToCancel = useRef(0);
    const cancelledRequests = useRef(0);

    const resolvePromises = (requests) => {
        Promise.all(requests).then((worksheetsResponse) => {
            const productRequests = [];

            worksheets.current = worksheetsResponse

            worksheetsResponse.forEach((worksheet: any) => {
                const productId = worksheet.LineItems[0].ProductID;

                productRequests.push(Me.GetProduct(productId));
            });

            Promise.all(productRequests).then((productsResponse) => {
                setShowLoader(false);
                setProducts(productsResponse);
            });
        });
    }

    const getAllProducts = () => {
        const token = Tokens.GetAccessToken()
        const requests = []

        if (token) {
            setShowLoader(true)

            // Me.ListOrders({sortBy: ['!LastUpdated']}).then((responseOpen) => {
            //     console.log(responseOpen)
            // });

            Me.ListOrders({ sortBy: ['!LastUpdated'] }).then((response) => {
                const allSentRequests = response.Items.filter((order) => !order.xp?.RequestToCancel);
                sentRequests.current = allSentRequests.length;

                Me.ListOrders({ sortBy: ['!LastUpdated'], filters: { Status: 'Unsubmitted' } }).then((responseUnsubmitted) => {
                    let requireDetailsCount = 0;
                    let readyToSendCount = 0;
                    let requestToCancel = 0;
                    let cancelledRequest = 0;

                    response.Items.forEach(order => {
                        if (order.xp?.RequestToCancel && order.Status === "Open") {
                            requestToCancel += 1;
                        }

                        if (order.Status === "Canceled") {
                            cancelledRequest += 1;
                        }

                        requests.push(IntegrationEvents.GetWorksheet('Outgoing', order.ID))
                    });

                    responseUnsubmitted.Items.forEach(order => {
                        if (order.PromotionDiscount === 0) {
                            requireDetailsCount += 1;
                        } else {
                            readyToSendCount += 1;
                        }

                        requests.push(IntegrationEvents.GetWorksheet('Outgoing', order.ID))
                    });

                    readyToSend.current = readyToSendCount;
                    requireDetails.current = requireDetailsCount;
                    requestedToCancel.current = requestToCancel;
                    allOrders.current = requests.length;
                    cancelledRequests.current = cancelledRequest;

                    resolvePromises(requests);
                })
            })
        }
    }

    const getRequireDetails = () => {
        const token = Tokens.GetAccessToken()
        const requests = []

        if (token) {
            setShowLoader(true)

            Me.ListOrders({ sortBy: ['!LastUpdated'], filters: { Status: 'Unsubmitted' } }).then((responseUnsubmitted) => {
                const requireDetails = responseUnsubmitted.Items.filter((item) => item.PromotionDiscount === 0)

                requireDetails.forEach(order => {
                    requests.push(IntegrationEvents.GetWorksheet('Outgoing', order.ID))
                });

                resolvePromises(requests)
            })
        }
    }

    const getReadyToSend = () => {
        const token = Tokens.GetAccessToken()
        const requests = []

        if (token) {
            setShowLoader(true)

            Me.ListOrders({ sortBy: ['!LastUpdated'], filters: { Status: 'Unsubmitted' } }).then((responseUnsubmitted) => {
                const requireDetails = responseUnsubmitted.Items.filter((item) => item.PromotionDiscount !== 0)

                requireDetails.forEach(order => {
                    requests.push(IntegrationEvents.GetWorksheet('Outgoing', order.ID))
                });

                resolvePromises(requests);
            })
        }
    }

    const getSent = () => {
        const token = Tokens.GetAccessToken()
        const requests = []

        if (token) {
            setShowLoader(true)

            Me.ListOrders({ sortBy: ['!LastUpdated'], filters: { Status: 'Open' } }).then((responseOpen) => {
                const sentOrders = responseOpen.Items.filter((order) => !order.xp?.RequestToCancel);

                sentOrders.forEach(order => {
                    requests.push(IntegrationEvents.GetWorksheet('Outgoing', order.ID))
                });

                resolvePromises(requests);
            })
        }
    }

    const getCancellationPending = () => {
        const token = Tokens.GetAccessToken();
        const requests = [];

        if (token) {
            setShowLoader(true)

            Me.ListOrders({ sortBy: ['!LastUpdated'], filters: { Status: 'Open' } }).then((responseOpen) => {
                const ordersRequestedToCancel = responseOpen.Items.filter((order) => order.xp?.RequestToCancel || false);

                ordersRequestedToCancel.forEach(order => {
                    requests.push(IntegrationEvents.GetWorksheet('Outgoing', order.ID))
                });

                resolvePromises(requests);
            })
        }
    }

    const getCancelled = () => {
        const token = Tokens.GetAccessToken()
        const requests = []

        if (token) {
            setShowLoader(true)

            Me.ListOrders({ sortBy: ['!LastUpdated'], filters: { Status: 'Canceled' } }).then((responseCanceled) => {
                console.log()
                responseCanceled.Items.forEach(order => {
                    requests.push(IntegrationEvents.GetWorksheet('Outgoing', order.ID))
                });

                resolvePromises(requests);
            })
        }
    }

    const showAll = () => {
        setActiveTab('all')
        getAllProducts()
    }

    const showRequireDetails = () => {
        setActiveTab('require')
        getRequireDetails()
    }

    const showReadyToSend = () => {
        setActiveTab('ready')
        getReadyToSend()
    }

    const showSent = () => {
        setActiveTab('sent')
        getSent()
    }

    const showCancellationPending = () => {
        setActiveTab('requestCancel')
        getCancellationPending()
    }

    const showCancelled = () => {
        setActiveTab('cancelled')
        getCancelled()
    }

    useEffect(() => {
        getAllProducts()
    }, [storeToken])

    return (
        <div className='wrapper page-container'>
            <div className={styles.title}>
                <div className="title-striped">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 497.6 116.7" width="447.6" height="116.7"><path d="M89 42.8v-8.3l62.4-28.6v11zM23.1 53.2V59l96.8-48.6V0zM0 79.6l53.4-22.1v-6.7L0 75.2z" fill="#FF6441"></path></svg>
                    </div>
                    <h1>Service Enquiries</h1>
                </div>
                <p>This is where you'll find service enquiries that you've made, please be aware that any expired quotes will be archived after 90 days.</p>
                <a className='button button--primary' href='/singleService'>Request another services</a>
            </div>
            <ul className={styles.buttonList}>
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
                <li>
                    <button disabled={requestedToCancel.current === 0 || activeTab === 'requestCancel'} className={activeTab === 'requestCancel' ? styles.active : ''} type="button" onClick={showCancellationPending}>Cancellation Pending ({requestedToCancel.current})</button>
                </li>
                <li>
                    <button disabled={cancelledRequests.current === 0 || activeTab === 'cancelled'} className={activeTab === 'cancelled' ? styles.active : ''} type="button" onClick={showCancelled}>Cancelled ({cancelledRequests.current})</button>
                </li>
            </ul>
            <div className={styles.results}>
                {!showLoader && products.length <= 0 && (
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
                        {products.map((product, i) => {
                            return (
                                <ProductCard product={product} worksheet={worksheets.current[i]} key={`${product.ID}-${i}`} />
                            )
                        })}
                    </>
                )}
            </div>
        </div>
    )
}

export default AppointmentListingPage
