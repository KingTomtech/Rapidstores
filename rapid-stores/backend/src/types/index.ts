export interface Env {
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
  AI: any; // Workers AI binding
  ENVIRONMENT: string;
  WHATSAPP_NUMBER: string;
  CURRENCY: string;
}

export interface User {
  id: string;
  email?: string;
  phone: string;
  full_name: string;
  role: 'customer' | 'admin';
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock_quantity: number;
  image_url?: string;
  is_manufactured: boolean;
  custom_options?: any;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'paid' | 'processing' | 'ready' | 'delivered' | 'cancelled';
  total_amount: number;
  payment_method?: 'mobile_money' | 'voucher' | 'cash';
  payment_status: 'pending' | 'paid' | 'failed';
  delivery_address?: string;
  phone_number: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product_id: string;
  quantity: number;
  product: Product;
}

export interface Voucher {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount?: number;
  max_uses?: number;
  current_uses: number;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
}

export interface ManufacturingOrder {
  id: string;
  product_id: string;
  customer_id: string;
  specifications: any;
  status: 'pending' | 'in_production' | 'completed' | 'delivered';
  progress: number;
  estimated_completion?: string;
  created_at: string;
  updated_at: string;
}
