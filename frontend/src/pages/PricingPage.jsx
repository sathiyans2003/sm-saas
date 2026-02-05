import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SubscribeButton from '../components/SubscribeButton';
import { getProfile } from '../api/authApi';

const PricingPage = () => {
    const [plans, setPlans] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Plans
                // Ideally this should use paymentApi but I added route there
                const plansRes = await axios.get('http://localhost:5000/api/payment/plans');
                setPlans(plansRes.data);

                // Fetch User
                const userRes = await getProfile();
                setUser(userRes.data);
            } catch (err) {
                console.error("Error fetching data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Choose Your Plan</h2>
            <div className="row">
                {plans.map(plan => (
                    <div className="col-md-4" key={plan._id}>
                        <div className="card mb-4 shadow-sm">
                            <div className="card-header">
                                <h4 className="my-0 font-weight-normal">{plan.name}</h4>
                            </div>
                            <div className="card-body">
                                <h1 className="card-title pricing-card-title">
                                    ₹{plan.price} <small className="text-muted">/ mo</small>
                                </h1>
                                <ul className="list-unstyled mt-3 mb-4">
                                    {plan.features.map((feature, index) => (
                                        <li key={index}>{feature}</li>
                                    ))}
                                </ul>
                                <SubscribeButton plan={plan} user={user} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PricingPage;
