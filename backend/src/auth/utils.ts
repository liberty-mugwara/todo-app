import { JwtPayload } from './JwtPayload'
import { decode } from 'jsonwebtoken'

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtPayload
  return decodedJwt.sub
}

export function certToPEM(cert: string) {
  const formattedCert = cert.match(/.{1,64}/g).join('\n')
  return `-----BEGIN CERTIFICATE-----\n${formattedCert}\n-----END CERTIFICATE-----\n`
}
