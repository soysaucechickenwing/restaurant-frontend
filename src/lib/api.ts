import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  }
});

export interface MenuItem{
    id: number;
    name: string;
    nameZh: string;
    description: string;
    price: number;
    imageUrl: string | null;
    isAvailable: boolean;
    displayOrder: number;
}

export interface MenuCategory {
    id: number;
    name: string;
    nameZh: string;
    displayOrder: number;
    isActive: boolean;
    items: MenuItem[];
}

export interface OrderItem {
    menuItemId: number;
    quantity: number;
    specialInstructions?: string;
}

export interface CreateOrderRequest {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    orderType: 'PICKUP' | 'DELIVERY';
    specialInstructions?: string;
    items: OrderItem[];
}

export const getMenu
    = async (): Promise<MenuCategory[]> => {
    const response = await api.get('/api/menu');
    return response.data;
}

export const createOrder = async (order: CreateOrderRequest) => {
    const response = await api.post('/api/orders', order);
    return response.data;
};

export const createPaymentIntent = async (orderId: number) => {
    const response = await api.post(`/api/payments/create-intent/${orderId}`);
    return response.data;
};

export default api;