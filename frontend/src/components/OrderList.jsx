/* eslint-disable react/prop-types */
import { useState } from "react";
import { CircularProgress, Modal } from "@mui/material";
import { mockOrders } from "../data/mockData";

function OrderDetailsModal({ order, open, handleClose }) {
    const [orderDetail, setOrderDetail] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchOrderDetails = async (id) => {
        try {
            // Mock order details - use the order items directly
            const order = mockOrders.find(o => o.ORDER_ID === id);
            if (order) {
                setOrderDetail(order.items);
            }
        } catch (err) {
            console.error("Error fetching order details:", err);
        } finally {
            setIsLoading(false);
        }
    };

    if (open && isLoading) {
        fetchOrderDetails(order.ORDER_ID);
    }

    return (
        <Modal open={open} onClose={handleClose}>
            <div className="glass-card mx-auto mt-24 h-[75%] w-[50%] overflow-auto p-8 shadow-2xl">
                <h1 className="text-2xl">Order details for order #{order.ORDER_ID}</h1>
                {isLoading ? (
                    <div className="mt-8 flex items-center justify-center">
                        <CircularProgress color="warning" size={50} />
                    </div>
                ) : (
                    <>
                        {orderDetail.map((data, dataIndex) => (
                            <div key={dataIndex} className="my-4 h-fit glass-card p-4 shadow-md bg-amber-400/20">
                                <p className="text-gray-900">
                                    <b>Dish name:</b> {data.NAME}
                                </p>
                                <p className="text-gray-800">
                                    <b>Price:</b> ₹{data.PRICE}
                                </p>
                                <p className="text-gray-600">
                                    <b>Date:</b> {order.ORDER_TIMESTAMP}
                                </p>
                            </div>
                        ))}
                        <p className="mt-16 text-xl font-semibold">Total Price: ₹{order.TOTAL_AMOUNT}</p>
                        <p className="mt-6 font-semibold">
                            Press <b>ESC</b> to close
                        </p>
                    </>
                )}
            </div>
        </Modal>
    );
}

export default function OrderList({ orderData }) {
    const [openModalIndex, setOpenModalIndex] = useState(null);

    const handleOpen = (index) => {
        setOpenModalIndex(index);
    };

    const handleClose = () => {
        setOpenModalIndex(null);
    };

    return (
        <>
            {orderData.map((order, index) => (
                <div
                    key={index}
                    className={`my-4 h-fit cursor-pointer glass-card p-4 transition-all hover:-translate-y-1 hover:shadow-xl ${order.STATUS === "Failed" ? "bg-red-500/10 border-red-500/20" : "bg-green-500/10 border-green-500/20"
                        }`}
                    onClick={() => handleOpen(index)}
                >
                    <OrderDetailsModal order={order} open={openModalIndex === index} handleClose={handleClose} />
                    <p>
                        <b>Order </b>#{order.ORDER_ID}
                    </p>
                    <p>
                        <b>Date:</b> {order.ORDER_TIMESTAMP}
                    </p>
                    <p>
                        <b>Status:</b> {order.STATUS}
                    </p>
                    <p>
                        <b>Price:</b> ₹{order.TOTAL_AMOUNT}
                    </p>
                </div>
            ))}
        </>
    );
}
