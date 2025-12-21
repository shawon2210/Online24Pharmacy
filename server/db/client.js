import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    errorFormat: 'minimal',
  });
};

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Middleware to exclude password from queries
prisma.$use(async (params, next) => {
  const result = await next(params);
  
  if (params.model === 'User') {
    if (Array.isArray(result)) {
      return result.map(user => {
        const { passwordHash: _passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
    } else if (result && typeof result === 'object') {
      const { passwordHash: _passwordHash, ...userWithoutPassword } = result;
      return userWithoutPassword;
    }
  }
  
  return result;
});

export default prisma;
