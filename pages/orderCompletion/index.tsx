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
                            <div className="generic-table__actions">
                                <div className="generic-table__actions-feature">
                                    <div className="today-only generic-table__action" data-key="TruckAppointmentDate">
                                        <label className="today-only__label">
                                            <input type="radio" name="today-only__radio" className="today-only__radio today-only__radio--all" onChange={() => console.log("I don't change")} checked={true}/>
                                            All appointments
                                        </label>
                                        <label className="today-only__label">
                                            <input type="radio" name="today-only__radio" className="today-only__radio today-only__radio--today"/>
                                            Today only
                                        </label>
                                    </div>
                                </div>
                                <div className="generic-table__actions-secondary">
                                    <button className="action generic-table__action generic-table__action--desktop generic-table__action--filter">
                                        <span className="action__icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 22" width="26" height="22"><path d="M19 14a4.002 4.002 0 013.874 3H26v2h-3.126a4.002 4.002 0 01-7.748 0H0v-2h15.126c.444-1.725 2.01-3 3.874-3zm0 2a2 2 0 10-.001 3.999A2 2 0 0019 16zM9 7a4.002 4.002 0 013.874 3H26v2H12.874a4.002 4.002 0 01-7.748 0H0v-2h5.126C5.57 8.275 7.136 7 9 7zm0 2a2 2 0 10-.001 3.999A2 2 0 009 9zm6-9a4.002 4.002 0 013.874 3H26v2h-7.126a4.002 4.002 0 01-7.748 0H0V3h11.126c.444-1.725 2.01-3 3.874-3zm0 2a2 2 0 10-.001 3.999A2 2 0 0015 2z"></path></svg>
                                        </span>
                                        <span className="action__label">
                                            Search and filter
                                        </span>
                                    </button>
                                    <a href="/apm/api/tas/appointmentListingCsv?terminalId=ea5a1241-9736-4b82-b815-eae337ef1ac6&amp;fileName=appointment-listing-20210812Z%24.csv" className="action action--secondary action--reverse generic-table__action generic-table__action--desktop">
                                        <span className="action__icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 18" width="14" height="18"><path d="M10.664 0H0v18h14V3.454zm-.849 2L12 4.263V16H2V2zM3 10h3v2H3zm0-3h8v2H3zm4 3h4v2H7zm-4 3h3v2H3zm4 0h4v2H7z" fill="#ff6441"></path></svg>
                                        </span>
                                        <span className="action__label">
                                            Export to CSV
                                        </span>
                                    </a>
                                </div>
                            </div>

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
                                    const hasMultipleLineItems = order.LineItems.length > 1;
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
                                                    <tr key={ii} className={`generic-table__row generic-table__row--${(i + 1) % 2 ? 'odd' : 'even'}`}>
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
                                                                    <span className="action__icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 18" width="14" height="18"><path d="M10.664 0H0v18h14V3.454zm-.849 2L12 4.263V16H2V2zM3 10h3v2H3zm0-3h8v2H3zm4 3h4v2H7zm-4 3h3v2H3zm4 0h4v2H7z" fill="#ff6441"></path></svg></span>
                                                                    <span className="action__label">Complete</span>
                                                                </button>

                                                                {order?.xp?.RequestToCancel && 
                                                                <button className="action generic-table__action generic-table__action--desktop generic-table__action--filter action--secondary" data-orderid={order.ID} onClick={cancelOrder}>
                                                                    <span className="action__icon"><svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M13.824 5 15 6.176 11.176 10 15 13.824 13.824 15 10 11.176 6.176 15 5 13.824 8.824 10 5 6.176 6.176 5 10 8.823 13.824 5z" fill="#3C3C46" fillRule="evenodd"></path></svg></span>
                                                                    <span className="action__label">Cancel</span>
                                                                </button>}
                                                            </td>
                                                        )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr key={i} className={`generic-table__row generic-table__row--${(i + 1) % 2 ? 'odd' : 'even'}`}>
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
                                                            <span className="action__icon">
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 18" width="14" height="18"><path d="M10.664 0H0v18h14V3.454zm-.849 2L12 4.263V16H2V2zM3 10h3v2H3zm0-3h8v2H3zm4 3h4v2H7zm-4 3h3v2H3zm4 0h4v2H7z" fill="#ff6441"></path></svg>
                                                            </span>
                                                            <span className="action__label">Complete</span>
                                                        </button>

                                                        {order?.xp?.RequestToCancel && 
                                                        <button className="action generic-table__action generic-table__action--desktop generic-table__action--filter action--secondary" data-orderid={order.ID} onClick={cancelOrder}>
                                                            <span className="action__icon"><svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M13.824 5 15 6.176 11.176 10 15 13.824 13.824 15 10 11.176 6.176 15 5 13.824 8.824 10 5 6.176 6.176 5 10 8.823 13.824 5z" fill="#3C3C46" fillRule="evenodd"></path></svg></span>
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
