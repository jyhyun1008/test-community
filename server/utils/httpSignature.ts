import { createSign, createVerify, createHash } from 'crypto'

// 요청 서명 (다른 인스턴스에 Activity 보낼 때)
export function signRequest(
  method: string,
  url: string,
  body: string,
  privateKey: string,
  keyId: string,
) {
  const urlObj = new URL(url)
  const date = new Date().toUTCString()
  const digest = `SHA-256=${createHash('sha256').update(body).digest('base64')}`

  const signingString = [
    `(request-target): ${method.toLowerCase()} ${urlObj.pathname}`,
    `host: ${urlObj.host}`,
    `date: ${date}`,
    `digest: ${digest}`,
  ].join('\n')

  const signature = createSign('sha256').update(signingString).sign(privateKey, 'base64')

  return {
    date,
    digest,
    signature: `keyId="${keyId}",algorithm="rsa-sha256",headers="(request-target) host date digest",signature="${signature}"`,
  }
}

// 서명 검증 (다른 인스턴스에서 받은 요청)
export function verifySignature(
  method: string,
  url: string,
  headers: Record<string, string>,
  publicKey: string,
): boolean {
  try {
    const signatureHeader = headers['signature']
    if (!signatureHeader) return false

    const parts = Object.fromEntries(
      signatureHeader.split(',').map(p => {
        const [k, ...v] = p.split('=')
        return [k.trim(), v.join('=').replace(/^"|"$/g, '')]
      })
    )

    const headerNames = parts.headers?.split(' ') ?? []
    const urlObj = new URL(url)

    const signingString = headerNames.map(h => {
      if (h === '(request-target)') return `(request-target): ${method.toLowerCase()} ${urlObj.pathname}`
      return `${h}: ${headers[h]}`
    }).join('\n')

    return createVerify('sha256')
      .update(signingString)
      .verify(publicKey, parts.signature, 'base64')
  } catch {
    return false
  }
}