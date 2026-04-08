'use client';

import Image from "next/image";
import { useEffect, useState } from 'react';
import { getMenu, MenuCategory, MenuItem } from '@/lib/api';
import { cartStore } from '@/store/cartStore';
import Link from 'next/link';


export default function MenuPage(){
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMenu().then(data => {
      setCategories(data);
      if (data.length > 0) setActiveCategory(data[0].id);
      setLoading(false);
      setCartCount(cartStore.getCount());
    });
  }, []);

  const handleAddToCart = (item: MenuItem) => {
    cartStore.addItem(item);
    setCartCount(cartStore.getCount());
  };

  const activeItems = categories.find(c => c.id === activeCategory)?.items ?? [];

  if (loading) return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">Loading menu...</p>
      </div>
  );

  return (
      <div className="max-w-2xl mx-auto px-4 pb-24">
        {/* Header */}
        <div className="flex justify-between items-center py-4 border-b">
          <div>
            <h1 className="text-xl font-semibold">Uncles Kitchen</h1>
            <p className="text-sm text-gray-500">Order online · Ready in ~20 min</p>
          </div>
          <Link href="/cart">
            <button className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium">
              Cart ({cartCount})
            </button>
          </Link>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 py-3 overflow-x-auto scrollbar-hide">
          {categories.map(cat => (
              <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border transition-colors ${
                      activeCategory === cat.id
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'text-gray-600 border-gray-300'
                  }`}
              >
                {cat.name}
              </button>
          ))}
        </div>

        {/* Menu items */}
        <div className="divide-y">
          {activeItems.map(item => (
              <div key={item.id} className="flex items-center gap-3 py-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-2xl">
                  🍽️
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.nameZh}</p>
                  {item.description && (
                      <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                  )}
                  <p className="text-sm font-medium mt-1">${item.price.toFixed(2)}</p>
                </div>
                <button
                    onClick={() => handleAddToCart(item)}
                    className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-lg font-medium flex-shrink-0"
                >
                  +
                </button>
              </div>
          ))}
        </div>

        {/* Bottom cart bar */}
        {cartCount > 0 && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
              <Link href="/cart">
                <button className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium">
                  View Cart ({cartCount} items) · ${cartStore.getTotal().toFixed(2)}
                </button>
              </Link>
            </div>
        )}
      </div>
  );
}
