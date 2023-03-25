import 'source-map-support/register'

import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import { decode, verify } from 'jsonwebtoken'

import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
import { certToPEM } from '../../auth/utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info(event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  const signingKey = await getSigningKey(jwt)
  const jwtToken = verify(token, signingKey, {
    algorithms: ['RS256']
  }) as JwtPayload
  return jwtToken

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

async function getSigningKeys() {
  const jwksUrl =
    'https://dev-uk4yzfdvjxawdhw6.us.auth0.com/.well-known/jwks.json'
  const { data: jwks } = await Axios.get<IJwks>(jwksUrl)
  if (!jwks.keys || !jwks.keys.length) {
    throw new Error('The JWKS endpoint did not contain any keys')
  }

  const signingKeys = jwks.keys
    .filter(
      (key) =>
        key.use === 'sig' && // Determines the JWK is for signature verification
        key.kty === 'RSA' && // We are only supporting RSA (RS256)
        key.kid && // The `kid` must be present
        key.x5c &&
        key.x5c.length /*|| (key.n && key.e)*/ // Has useful public keys
    )
    .map((key) => {
      return { kid: key.kid, publicKey: certToPEM(key.x5c[0]) }
    })
  if (!signingKeys.length) {
    throw new Error(
      'The JWKS endpoint did not contain any signature verification keys'
    )
  }

  return signingKeys
}

async function getSigningKey(jwt: Jwt) {
  const signingKeys = await getSigningKeys()
  const signingKey = signingKeys.find((key) => key.kid === jwt.header.kid)
  if (!signingKey) {
    throw new Error(`Signing key with kid: ${jwt.header.kid} was not found`)
  }
  return signingKey.publicKey
}

interface IJwks {
  keys: {
    alg: string
    kty: string
    use: string
    n: string
    e: string
    kid: string
    x5t: string
    x5c: string[]
  }[]
}
