import bcrypt from 'bcryptjs'

const ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 12)

export const hashPassword = (plain: string) => bcrypt.hash(plain, ROUNDS)
export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash)