import { MenuItem } from '@/lib/api';

export interface CartItem {
    menuItem: MenuItem;
    quantity: number;
    specialInstructions?: string;
}

export const cartStore = {
    getItems() : CartItem[] {
        if(typeof window === 'undefined') return [];
        const stored = localStorage.getItem('cart');
        return stored ? JSON.parse(stored) : [];
    },

    addItem(menuItem: MenuItem){
        const items = this.getItems();
        const existing = items.find(i=>i.menuItem.id === menuItem.id);
        if(existing){
            existing.quantity+=1;
        }else{
            items.push({ menuItem, quantity: 1 });
        }
        localStorage.setItem('cart', JSON.stringify(items));
    },

    removeItem(menuItemId: number){
        const items = this.getItems().filter(i => i.menuItem.id !== menuItemId);
        localStorage.setItem('cart', JSON.stringify(items));
    },

    updateQuantity(menuItemId: number, quantity: number) {
        const items = this.getItems();
        const item = items.find(i => i.menuItem.id === menuItemId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(menuItemId);
                return;
            }
            item.quantity = quantity;
            localStorage.setItem('cart', JSON.stringify(items));
        }
    },

    clearCart() {
        localStorage.removeItem('cart');
    },

    getTotal(): number {
        return this.getItems().reduce(
            (sum, item) => sum + item.menuItem.price * item.quantity, 0
        );
    },

    getCount(): number {
        return this.getItems().reduce((sum, item) => sum + item.quantity, 0);
    }
};