import { randomBytes, createHmac } from 'crypto'

let _genRandomString = length => {
  return randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
}

let _hashUsingSha512 = (password, salt) => {
  let hash = createHmac('sha512', salt)
  hash.update(password)
  let hashPassword = hash.digest('hex')

  return hashPassword
}

let hashPasswordWithRandomSalt = plainTextPassword => {
  let salt = _genRandomString(16)
  let hashedPassword = _hashUsingSha512(plainTextPassword, salt)

  return { salt, hashedPassword }
}

let isPasswordMatchedHashWithSalt = (plainTextPassword, hashPassword, salt) => _hashUsingSha512(plainTextPassword, salt) === hashPassword

export default {
  hashPasswordWithRandomSalt,
  isPasswordMatchedHashWithSalt,
}
