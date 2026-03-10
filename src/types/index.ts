export interface Product {
  id: string
  user_id: string
  name: string
  reward_multiplier: number
  category: string
  quantity: number
  created_at: string
}

export interface Sale {
  id: string
  user_id: string
  customer: string
  product_id: string
  sell_price: number
  quantity: number
  sale_date: string
  created_at: string
  // joined
  products?: Pick<Product, 'name'>
}

export interface GoodsIn {
  id: string
  user_id: string
  product_id: string
  purchase_price: number
  quantity: number
  created_at: string
  // joined
  products?: Pick<Product, 'name'>
}
