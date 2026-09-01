import https from 'https'
import http from 'http'
import { URL } from 'url'
import {
  OrcusPayConfig,
  PaginationParams,
  PaginationMeta,
  Payment,
  PaymentLink,
  CreatePaymentLinkParams,
  CreateCheckoutSessionParams,
  CheckoutSession,
  CheckoutSessionDetail,
  StatusResponse,
} from './types'
import { OrcusPayError, OrcusPayConnectionError } from './errors'

const DEFAULT_BASE_URL = 'https://brain.orcuspay.com/api/v1'

export class OrcusPay {
  private accessKey: string
  private secretKey: string
  private baseUrl: string

  constructor(config: OrcusPayConfig) {
    if (!config.accessKey) throw new Error('accessKey is required')
    if (!config.secretKey) throw new Error('secretKey is required')
    this.accessKey = config.accessKey
    this.secretKey = config.secretKey
    this.baseUrl = (config.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '')
  }

  private request<T>(method: string, path: string, body?: any): Promise<T> {
    return new Promise((resolve, reject) => {
      const url = new URL(this.baseUrl + path)
      const isHttps = url.protocol === 'https:'
      const payload = body ? JSON.stringify(body) : undefined

      const options: http.RequestOptions = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method,
        headers: {
          'x-api-key': this.accessKey,
          'x-api-secret': this.secretKey,
          'Content-Type': 'application/json',
          'User-Agent': 'orcuspay-node/1.0.0',
          ...(payload && { 'Content-Length': Buffer.byteLength(payload).toString() }),
        },
      }

      const transport = isHttps ? https : http
      const req = transport.request(options, (res) => {
        let data = ''
        res.on('data', (chunk) => { data += chunk })
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data)
            if (res.statusCode && res.statusCode >= 400) {
              const err = parsed.error || { code: 'unknown', message: data, status: res.statusCode }
              reject(new OrcusPayError(err))
            } else {
              resolve(parsed)
            }
          } catch {
            if (res.statusCode && res.statusCode >= 400) {
              reject(new OrcusPayError({ code: 'unknown', message: data, status: res.statusCode! }))
            } else {
              resolve(data as any)
            }
          }
        })
      })

      req.on('error', (err) => {
        reject(new OrcusPayConnectionError(err.message))
      })

      if (payload) req.write(payload)
      req.end()
    })
  }

  async status(): Promise<StatusResponse> {
    const res = await this.request<{ data: StatusResponse }>('GET', '/status')
    return res.data
  }

  // --- Payments ---

  async listPayments(params?: PaginationParams & { status?: string }): Promise<{
    data: Payment[]
    meta: PaginationMeta
  }> {
    const query = new URLSearchParams()
    if (params?.limit) query.set('limit', String(params.limit))
    if (params?.cursor) query.set('cursor', params.cursor)
    if (params?.status) query.set('status', params.status)
    const qs = query.toString()
    return this.request('GET', `/payments${qs ? '?' + qs : ''}`)
  }

  async getPayment(id: string): Promise<Payment> {
    const res = await this.request<{ data: Payment }>('GET', `/payments/${encodeURIComponent(id)}`)
    return res.data
  }

  // --- Payment Links ---

  async listPaymentLinks(params?: PaginationParams): Promise<{
    data: PaymentLink[]
    meta: PaginationMeta
  }> {
    const query = new URLSearchParams()
    if (params?.limit) query.set('limit', String(params.limit))
    if (params?.cursor) query.set('cursor', params.cursor)
    const qs = query.toString()
    return this.request('GET', `/payment-links${qs ? '?' + qs : ''}`)
  }

  async getPaymentLink(id: string): Promise<PaymentLink> {
    const res = await this.request<{ data: PaymentLink }>('GET', `/payment-links/${encodeURIComponent(id)}`)
    return res.data
  }

  async createPaymentLink(params: CreatePaymentLinkParams): Promise<PaymentLink> {
    const res = await this.request<{ data: PaymentLink }>('POST', '/payment-links', params)
    return res.data
  }

  // --- Checkout Sessions ---

  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<CheckoutSession> {
    const res = await this.request<{ data: CheckoutSession }>('POST', '/checkout/sessions', params)
    return res.data
  }

  async getCheckoutSession(id: string): Promise<CheckoutSessionDetail> {
    const res = await this.request<{ data: CheckoutSessionDetail }>('GET', `/checkout/sessions/${encodeURIComponent(id)}`)
    return res.data
  }
}
