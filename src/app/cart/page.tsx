'use client';

import {useEffect, useState} from 'react';
import {cartStore, CartItem} from "@/store/cartStore";
import Link from 'next/link';
import {useRouter} from 'next/navigation';

export default function CartPage(){
    const [items, setItems] = useState<CartItem[]>(() => cartStore.getItems());
    const [total, setTotal] = useState<number>(() => cartStore.getTotal());
    const router = useRouter();

    // 每次items更新时同步更新total
    const refreshCart = () => {
        setItems(cartStore.getItems());
        setTotal(cartStore.getTotal());
    };


    const handleUpdateQuantity = (menuItemId: number, quantity:number) => {
        cartStore.updateQuantity(menuItemId, quantity);
        refreshCart();
    }

    const handleRemove = (menuItemId: number) => {
        cartStore.removeItem(menuItemId);
        refreshCart();
    };

    if (items.length === 0) return (
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
            <p className="text-gray-500 mb-4">Your cart is empty</p>
            <Link href="/">
                <button className="bg-orange-500 text-white px-6 py-2 rounded-full">
                    Back to Menu
                </button>
            </Link>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto px-4 pb-24">
            {/* Header */}
            <div className="flex items-center gap-3 py-4 border-b">
                <Link href="/">
                    <button className="text-gray-500">← Back</button>
                </Link>
                <h1 className="text-xl font-semibold">Your Cart</h1>
            </div>

            {/* Items */}
            <div className="divide-y">
                {items.map(item => (
                    <div key={item.menuItem.id} className="flex items-center gap-3 py-4">
                        <div className="flex-1">
                            <p className="font-medium text-sm">{item.menuItem.name}</p>
                            <p className="text-xs text-gray-500">{item.menuItem.nameZh}</p>
                            <p className="text-sm text-gray-700 mt-1">
                                ${(item.menuItem.price * item.quantity).toFixed(2)}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleUpdateQuantity(item.menuItem.id, item.quantity - 1)}
                                className="w-7 h-7 rounded-full border border-orange-500 text-orange-500 flex items-center justify-center"
                            >
                                −
                            </button>
                            <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                            <button
                                onClick={() => handleUpdateQuantity(item.menuItem.id, item.quantity + 1)}
                                className="w-7 h-7 rounded-full border border-orange-500 text-orange-500 flex items-center justify-center"
                            >
                                +
                            </button>
                            <button
                                onClick={() => handleRemove(item.menuItem.id)}
                                className="ml-2 text-gray-400 text-xs"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary */}
            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Tax (6.25%)</span>
                    <span>${(total * 0.0625).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                    <span>Total</span>
                    <span>${(total * 1.0625).toFixed(2)}</span>
                </div>
            </div>

            {/* Checkout button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
                <button
                    onClick={() => router.push('/checkout')}
                    className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium"
                >
                    Proceed to Checkout · ${(total * 1.0625).toFixed(2)}
                </button>
            </div>
        </div>
    );
}
