'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { cartStore } from '@/store/cartStore';

export default function OrderConfirmationPage(){
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    useEffect(() => {
        cartStore.clearCart();
    }, []);

    return (
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-2xl font-semibold mb-2">Order Placed!</h1>
            <p className="text-gray-500 mb-2">Order #{orderId}</p>
            <p className="text-gray-500 mb-8">
                {"Your order has been received. We'll have it ready in about 20 minutes!"}
            </p>
            <Link href="/">
                <button className="bg-orange-500 text-white px-8 py-3 rounded-xl font-medium">
                    Back to Menu
                </button>
            </Link>
        </div>
    );

}