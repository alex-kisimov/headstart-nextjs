/* eslint-disable */
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
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
        const orderIndex = e.target.closest("tr").dataset.index;
        const button = e.target.closest("button");
        button.classList.add("action--loading");
        button.setAttribute("disabled", true);

        Orders.Complete('Incoming', e.currentTarget.dataset.orderid).then((response) => {
            button.classList.remove("action--loading");
            button.removeAttribute("disabled");

            const newOrders = orders;
            newOrders[orderIndex] = { ...newOrders[orderIndex], ...response};
            setOrders([...newOrders]);
        });
    }

    const cancelOrder = (e) => {
        const orderIndex = e.target.closest("tr").dataset.index;
        const button = e.target.closest("button");
        button.classList.add("action--loading");
        button.setAttribute("disabled", true);
        
        Orders.Cancel('Incoming', e.currentTarget.dataset.orderid).then((response) => {
            button.classList.remove("action--loading");
            button.removeAttribute("disabled");

            const newOrders = orders;
            newOrders[orderIndex] = { ...newOrders[orderIndex], ...response};
            setOrders([...newOrders]);
        });
    }

    useEffect(() => {
        getAllOrders()
    }, [storeToken])

    return (
        <div>
            <div className="wrapper">
                <div className="title-striped title-striped--margin-top">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 497.6 116.7" width="447.6" height="116.7">
                            <path d="M89 42.8v-8.3l62.4-28.6v11zM23.1 53.2V59l96.8-48.6V0zM0 79.6l53.4-22.1v-6.7L0 75.2z" fill="#FF6441"></path>
                        </svg>
                    </div>
                    <h1>Service Enquiries</h1>
                </div>
                <div className={styles.results}>
                    {showLoader && (
                        <div className={styles.loader}><Loader /></div>
                    )}
                    {!showLoader && (
                        <>
                            <table className="fixed-table__data-table generic-table__table">
                                <thead className="generic-table__thead">
                                    <tr className="generic-table__row">
                                        {["Created by User", "Company", "Date submitted", "Service", "Width", "Height", "Length", "Weight", "Total", "Status", "Actions"].map((title, i) => {
                                            return (
                                                <th key={i} className="generic-table__header">
                                                    <button className="generic-sort">
                                                        <span>{title}</span>
                                                        <span className="generic-sort__icon"></span>
                                                    </button>
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody className="generic-table__tbody">
                            
                                {orders.map((order, i) => {
                                    const hasMultipleLineItems = order.LineItems?.length > 1;
                                    let liOrders;
                                    if (hasMultipleLineItems) {
                                        liOrders = order.LineItems.map((li, liIndex) => {
                                            return {
                                                username: liIndex === 0 ? order.FromUser.Username : "",
                                                fromCompanyID: liIndex === 0 ? order.FromCompanyID : "",
                                                dateSubmitted: liIndex === 0 ? order.DateSubmitted.split("T")[0] : "",
                                                productName: li.Product.Name,
                                                cargoWidth: li.xp?.CargoWidth,
                                                cargoHeight: li.xp?.CargoHeight,
                                                cargoLength: li.xp?.CargoLenght,
                                                cargoWeight: li.xp?.CargoWeight,
                                                total: liIndex === 0 ? order.Total : "",
                                                status: liIndex === 0 ? order.Status : ""
                                            }
                                        });
                                    }

                                    return (
                                        hasMultipleLineItems ? (
                                            liOrders.map((li, ii) => {
                                                return (
                                                    <tr key={ii} className={`generic-table__row generic-table__row--${(i + 1) % 2 ? 'odd' : 'even'}`} data-index={i}>
                                                        <td className="generic-table__cell">{li.username}</td>
                                                        <td className="generic-table__cell">{li.fromCompanyID}</td>
                                                        <td className="generic-table__cell">{li.dateSubmitted}</td>
                                                        <td className="generic-table__cell">{li.productName}</td>
                                                        <td className="generic-table__cell">{li.cargoWidth}</td>
                                                        <td className="generic-table__cell">{li.cargoHeight}</td>
                                                        <td className="generic-table__cell">{li.cargoLength}</td>
                                                        <td className="generic-table__cell">{li.cargoWeight}</td>
                                                        <td className="generic-table__cell">{li.total}</td>
                                                        <td className="generic-table__cell"><StatusCell text={li.status}/></td>
                                                        <td className="generic-table__cell">
                                                        {(order.Status !== 'Completed' && order.Status !== 'Canceled') && (
                                                            <td className="generic-table__cell generic-table__cell--flex">
                                                                <button className="action generic-table__action generic-table__action--desktop generic-table__action--filter action--secondary" data-orderid={order.ID} onClick={completeOrder}>
                                                                    <span className="action__loader">
                                                                        <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                                                                            <circle cx="70" cy="28" r="14" transform="translate(-55 -13)" stroke="#FFE0D9" stroke-width="2" fill="none" fill-rule="evenodd" pathLength="100"></circle>
                                                                        </svg>
                                                                    </span>
                                                                    <span className="action__icon action__icon--complete"></span>
                                                                    <span className="action__label">Complete</span>
                                                                </button>

                                                                {order?.xp?.RequestToCancel && 
                                                                <button className="action generic-table__action generic-table__action--desktop generic-table__action--filter action--secondary" data-orderid={order.ID} onClick={cancelOrder}>
                                                                    <span className="action__loader">
                                                                        <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                                                                            <circle cx="70" cy="28" r="14" transform="translate(-55 -13)" stroke="#FFE0D9" stroke-width="2" fill="none" fill-rule="evenodd" pathLength="100"></circle>
                                                                        </svg>
                                                                    </span>
                                                                    <span className="action__icon"><svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" style={{marginRight: "1px", marginBottom: "1px"}}><path d="M13.824 5 15 6.176 11.176 10 15 13.824 13.824 15 10 11.176 6.176 15 5 13.824 8.824 10 5 6.176 6.176 5 10 8.823 13.824 5z" fill="#3C3C46" fillRule="evenodd"></path></svg></span>
                                                                    <span className="action__label">Cancel</span>
                                                                </button>}
                                                            </td>
                                                        )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr key={i} className={`generic-table__row generic-table__row--${(i + 1) % 2 ? 'odd' : 'even'}`} data-index={i}>
                                                <td className="generic-table__cell">{order.FromUser.Username}</td>
                                                <td className="generic-table__cell">{order.FromCompanyID}</td>
                                                <td className="generic-table__cell">{order.DateSubmitted}</td>
                                                {order.LineItems.map((lineItem, lineItemIndex) => {
                                                    return (
                                                        <React.Fragment key={lineItemIndex}>
                                                        <td className="generic-table__cell">{lineItem.Product.Name}</td>
                                                        <td className="generic-table__cell">{lineItem?.xp?.CargoWidth}</td>
                                                        <td className="generic-table__cell">{lineItem?.xp?.CargoHeight}</td>
                                                        <td className="generic-table__cell">{lineItem?.xp?.CargoLenght}</td>
                                                        <td className="generic-table__cell">{lineItem?.xp?.CargoWeight}</td>
                                                        </React.Fragment>
                                                    )
                                                })}
                                                <td className="generic-table__cell">{order.Total}</td>
                                                <td className="generic-table__cell"><StatusCell text={order.Status}/></td>

                                                {(order.Status !== 'Completed' && order.Status !== 'Canceled') && (
                                                    <td className="generic-table__cell generic-table__cell--flex">
                                                        <button className="action generic-table__action generic-table__action--desktop generic-table__action--filter action--secondary" data-orderid={order.ID} onClick={completeOrder}>
                                                            <span className="action__loader">
                                                                <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                                                                    <circle cx="70" cy="28" r="14" transform="translate(-55 -13)" stroke="#FFE0D9" strokeWidth="2" fill="none" fillRule="evenodd" pathLength="100"></circle>
                                                                </svg>
                                                            </span>
                                                            <span className="action__icon action__icon--complete"></span>
                                                            <span className="action__label">Complete</span>
                                                        </button>

                                                        {order?.xp?.RequestToCancel && 
                                                        <button className="action generic-table__action generic-table__action--desktop generic-table__action--filter action--secondary" data-orderid={order.ID} onClick={cancelOrder}>
                                                            <span className="action__loader">
                                                                <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                                                                    <circle cx="70" cy="28" r="14" transform="translate(-55 -13)" stroke="#FFE0D9" strokeWidth="2" fill="none" fillRule="evenodd" pathLength="100"></circle>
                                                                </svg>
                                                            </span>
                                                            <span className="action__icon"><svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" style={{marginRight: "1px", marginBottom: "1px"}}><path d="M13.824 5 15 6.176 11.176 10 15 13.824 13.824 15 10 11.176 6.176 15 5 13.824 8.824 10 5 6.176 6.176 5 10 8.823 13.824 5z" fill="#3C3C46" fillRule="evenodd"></path></svg></span>
                                                            <span className="action__label">Cancel</span>
                                                        </button>}
                                                    </td>
                                                )}
                                            </tr>
                                        )
                                    )
                                })}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

const StatusCell = ({ text }) => {

    const getColour = () => {
        let colour = "";
        switch (text) {
            case "Completed":
                colour = "green";
                break;
            case "Canceled":
                colour = "red";
                break;
            default: break;
        }
        return colour;
    }

    const getPath = () => {
        let path;
        switch (getColour()) {
            case "green":
                path = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18">
                    <path d="M9 16A7 7 0 109 2a7 7 0 000 14zm0 2A9 9 0 119.001-.001 9 9 0 019 18zm3.334-12.246l1.332 1.492-6.32 5.642-3.067-3.195L5.72 8.307l1.732 1.805 4.881-4.358z" fill="#008040" fillRule="evenodd"></path>
                </svg>
                break;
            case "red":
                path = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18">
                    <path d="M9 2a7 7 0 100 14A7 7 0 009 2zm0-2a9 9 0 11-.001 18.001A9 9 0 019 0zm1 11H8V4h2zm0 3H8v-2h2z" fill="#e21f2d" fillRule="evenodd"></path>
                </svg>
                break;
            default: break;
        }
        return path;
    }

    return (text &&
        <span className={"status status--" + getColour()}>
            {getPath()}
            {text}
        </span>
    ) || null;
};

export default AppointmentListingPage
