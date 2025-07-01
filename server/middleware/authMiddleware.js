// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

/**
 * Verify JWT and ensure payload has userId, email & role.
 * @param {string} token 
 * @returns {{ userId: string, email: string, role: string }}
 */
function verifyJwtPayload(token) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (
    typeof decoded !== 'object' ||
    !('userId' in decoded) ||
    !('email' in decoded) ||
    !('role' in decoded)
  ) {
    throw new Error('Invalid token payload');
  }
  return decoded;
}

/**
 * Authentication middleware – looks in Authorization header first,
 * then falls back to an HTTP-only cookie named "token". Attaches
 * decoded JWT payload to req.user.
 */
export async function authenticateToken(req, res, next) {
  try {
    // 1) Try Bearer token
    let token = req.header('Authorization')?.replace('Bearer ', '').trim();

    // 2) Fallback to cookie
    if (!token) token = req.cookies?.token;

    console.log('🔐 authenticateToken found token:', !!token);

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }

    // 3) Verify & attach
    const payload = verifyJwtPayload(token);
    req.user = { userId: payload.userId, email: payload.email, role: payload.role };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      console.log('Token expired');
      return res.status(401).json({ message: 'Token expired' });
    } else if (err.name === 'JsonWebTokenError') {
      console.log('Invalid token');
      return res.status(401).json({ message: 'Invalid token' });
    } else {
      console.log('Authentication error:', err.message);
      return res.status(401).json({ message: 'Authentication failed' });
    }
  }
}

/**
 * Admin-only middleware – first authenticates, then checks role.
 * Uses the above authenticateToken to populate req.user.
 */
export const authenticateAdmin = [
  authenticateToken,
  (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  }
];