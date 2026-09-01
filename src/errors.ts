import { ApiError } from './types'

export class OrcusPayError extends Error {
  code: string
  status: number

  constructor(error: ApiError) {
    super(error.message)
    this.name = 'OrcusPayError'
    this.code = error.code
    this.status = error.status
  }
}

export class OrcusPayConnectionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OrcusPayConnectionError'
  }
}
