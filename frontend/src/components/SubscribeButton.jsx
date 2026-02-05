import React from 'react';
import { createOrder, verifyPayment, getKey } from '../api/paymentApi';

const SubscribeButton = ({ plan, user }) => {

    const handleSubscribe = async () => {
        if (!user) {
            alert("Please login to subscribe");
            return;
        }

        try {
            const { data: keyData } = await getKey();
            const { data: order } = await createOrder(plan.price, plan._id);

            const options = {
                key: keyData.key,
                amount: order.amount,
                currency: "INR",
                name: "ZACX",
                description: plan.name + " Plan",
                order_id: order.id,
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: user.mobile // Assuming user object has these
                },
                theme: {
                    color: "#3399cc"
                },
                handler: async function (response) {
                    try {
                        const verifyData = {
                            ...response,
                            planId: plan._id
                        };
                        const res = await verifyPayment(verifyData);

                        if (res.data.success) {
                            alert("Subscription Activated 🎉");
                            // Optionally refresh user profile or redirect
                            window.location.reload();
                        } else {
                            alert("Payment Verification Failed");
                        }
                    } catch (verifyError) {
                        console.error("Verification error", verifyError);
                        alert("Payment Verification Failed");
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                alert(response.error.description);
            });
            rzp.open();

        } catch (error) {
            console.error("Error creating order", error);
            alert("Could not initiate subscription. Please try again.");
        }
    };

    return (
        <button onClick={handleSubscribe} className="btn btn-primary">
            Subscribe to {plan.name}
        </button>
    );
};

export default SubscribeButton;
