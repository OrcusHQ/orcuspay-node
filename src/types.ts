export interface OrcusPayConfig {
  accessKey: string
  secretKey: string
  baseUrl?: string
}

export interface PaginationParams {
  limit?: number
  cursor?: string
}

export interface PaginationMeta {
  has_more: boolean
  next_cursor: string | null
}

export interface ApiError {
  code: string
  message: string
  status: number
}

export interface Customer {
  name: string | null
  email: string | null
  phone: string | null
  address?: string | null
  city?: string | null
}

export interface Payment {
  id: string
  status: string
  amount: number
  currency: string
  customer: Customer
  transaction_id: string | null
  payment_method: string | null
  created_at: string
  updated_at: string
}

export interface PaymentLink {
  id: string
  url: string
  slug: string
  title: string
  description: string | null
  amount: number
  currency: string
  is_reusable: boolean
  is_active: boolean
  current_uses: number
  max_uses: number | null
  expires_at: string | null
  success_url: string | null
  created_at: string
  updated_at: string
}

export interface CreatePaymentLinkParams {
  title: string
  amount: number
  description?: string
  currency?: string
  is_reusable?: boolean
  max_uses?: number | null
  expires_at?: string
  success_url?: string
}

export interface LineItem {
  quantity: number
  price_data: {
    unit_amount: number
    product_data: {
      name: string
      description?: string
      imageUrl?: string
    }
  }
}

export interface CreateCheckoutSessionParams {
  success_url: string
  cancel_url: string
  line_items: LineItem[]
  customer?: {
    name: string
    email?: string
    phone?: string
    address?: string
    city?: string
  }
  meta_data?: Record<string, any>
}

export interface CheckoutSession {
  id: string
  payment_id: string
  reference: string | null
  status: string
  url: string
  checkout_url: string
}

export interface CheckoutSessionDetail {
  id: string
  payment_id: string
  reference: string | null
  status: string
  payment_status: string
  amount: number
  amount_paisa: number
  subtotal: number
  subtotal_paisa: number
  currency: string
  customer: Customer
  success_url: string | null
  cancel_url: string | null
  transaction_id: string | null
  payment_method: string | null
  meta_data: Record<string, any>
  created_at: string
  updated_at: string
}

export interface StatusResponse {
  name: string
  version: string
  base_url: string
  dashboard_url: string
  status: string
}
