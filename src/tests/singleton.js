// src/tests/singleton.js
import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset } from 'vitest-mock-extended'
import { beforeEach } from 'vitest'

// Mock the Prisma client
const prisma = mockDeep()

beforeEach(() => {
  mockReset(prisma)
})

export default prisma
