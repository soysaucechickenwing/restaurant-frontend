'use client'

import {useEffect, useState} from 'react'
import {useRouter} from "next/navigation";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {cartStore} from "@/store/cartStore";
import {createOrder, createPaymentIntent} from "@/lib/api";
import Link from 'next/link';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({orderId}: {orderId:number} ){
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit
        = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setLoading(true);
        setError(null);
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/order-confirmation?orderId=${orderId}`,
            },
        });
        if (error) {
            setError(error.message ?? 'Payment failed');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
            {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
            <button
                type="submit"
                disabled={!stripe || loading}
                className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium mt-4 disabled:opacity-50"
            >
                {loading ? 'Processing...' : `Pay $${(cartStore.getTotal() * 1.0625).toFixed(2)}`}
            </button>
        </form>
    );
}

export default function CheckoutPage(){
    const router = useRouter();
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
    });

    const items = cartStore.getItems();

    useEffect(() => {
        if(items.length === 0) router.push('/');
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCreateOrder = async () => {
        if (!form.customerName || !form.customerPhone) {
            setError('Please fill in your name and phone number');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 第一步：创建订单
            const order = await createOrder({
                customerName: form.customerName,
                customerPhone: form.customerPhone,
                customerEmail: form.customerEmail,
                orderType: 'PICKUP',
                items: items.map(i => ({
                    menuItemId: i.menuItem.id,
                    quantity: i.quantity,
                    specialInstructions: i.specialInstructions,
                })),
            });

            // 第二步：创建Stripe PaymentIntent
            const { clientSecret } = await createPaymentIntent(order.id);
            setOrderId(order.id);
            setClientSecret(clientSecret);
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 pb-24">
            {/* Header */}
            <div className="flex items-center gap-3 py-4 border-b">
                <Link href="/cart">
                    <button className="text-gray-500">← Back</button>
                </Link>
                <h1 className="text-xl font-semibold">Checkout</h1>
            </div>

            {/* Order summary */}
            <div className="mt-4 p-4 bg-gray-50 rounded-xl mb-4">
                <h2 className="font-medium mb-3">Order Summary</h2>
                {items.map(item => (
                    <div key={item.menuItem.id} className="flex justify-between text-sm mb-1">
                        <span>{item.quantity}x {item.menuItem.name}</span>
                        <span>${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
                <div className="border-t mt-2 pt-2">
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                        <span>Subtotal</span>
                        <span>${cartStore.getTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                        <span>Tax (6.25%)</span>
                        <span>${(cartStore.getTotal() * 0.0625).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold mt-1">
                        <span>Total</span>
                        <span>${(cartStore.getTotal() * 1.0625).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Contact form */}
            {!clientSecret && (
                <div className="space-y-3">
                    <h2 className="font-medium">Your Details</h2>
                    <input
                        name="customerName"
                        placeholder="Full name *"
                        value={form.customerName}
                        onChange={handleChange}
                        className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500"
                    />
                    <input
                        name="customerPhone"
                        placeholder="Phone number *"
                        value={form.customerPhone}
                        onChange={handleChange}
                        className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500"
                    />
                    <input
                        name="customerEmail"
                        placeholder="Email (optional)"
                        value={form.customerEmail}
                        onChange={handleChange}
                        className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500"
                    />

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button
                        onClick={handleCreateOrder}
                        disabled={loading}
                        className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium disabled:opacity-50"
                    >
                        {loading ? 'Please wait...' : 'Continue to Payment'}
                    </button>
                </div>
            )}

            {/* Stripe payment form */}
            {clientSecret && orderId && (
                <div className="mt-4">
                    <h2 className="font-medium mb-3">Payment</h2>
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <CheckoutForm orderId={orderId} />
                    </Elements>
                </div>
            )}
        </div>
    );
}