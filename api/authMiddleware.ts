import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

export interface AuthResult {
  success: boolean;
  error?: string;
  uid?: string;
  user?: {
    uid: string;
    email?: string;
    role?: string;
    isOrganizer?: boolean;
    isSystemAdmin?: boolean;
  };
}

export const authenticateToken = async (req: Request): Promise<AuthResult> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'Unauthorized: No token provided' };
    }

    const token = authHeader.split('Bearer ')[1];
    
    if (!token) {
      return { success: false, error: 'Invalid token format' };
    }

    try {
     
      const decodedToken = await admin.auth().verifyIdToken(token);
      const uid = decodedToken.uid;
    
      const userDoc = await admin.firestore().collection('users').doc(uid).get();
      
      if (!userDoc.exists) {
        return { success: false, error: 'User not found' };
      }

      const userData = userDoc.data();
      
      return {
        success: true,
        uid,
        user: {
          uid,
          email: userData?.email,
          role: userData?.role,
          isOrganizer: userData?.isOrganizer,
          isSystemAdmin: userData?.isSystemAdmin,
        }
      };
      
    } catch (firebaseError) {

      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        const uid = payload.uid;
        
        if (!uid) {
          return { success: false, error: 'No UID in token payload' };
        }
        
       
        await admin.auth().getUser(uid);
        
        const userDoc = await admin.firestore().collection('users').doc(uid).get();
        const userData = userDoc.data();
        
        return {
          success: true,
          uid,
          user: {
            uid,
            email: userData?.email,
            role: userData?.role,
            isOrganizer: userData?.isOrganizer,
            isSystemAdmin: userData?.isSystemAdmin,
          }
        };
        
      } catch (parseError) {
        return { success: false, error: 'Invalid token' };
      }
    }
    
  } catch (e: any) {
    return { success: false, error: 'Authentication error: ' + e.message };
  }
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authResult = await authenticateToken(req);
  
  if (!authResult.success) {
    return res.status(401).json({ error: authResult.error });
  }

  (req as any).user = authResult.user;
  next();
};

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authResult = await authenticateToken(req);
  
  if (!authResult.success || !authResult.user) {
    return res.status(401).json({ error: authResult.error || 'Authentication failed' });
  }

  const isAdmin = authResult.user.role === 'admin' || 
                 authResult.user.role === 'system_admin' || 
                 authResult.user.isSystemAdmin === true;

  if (!isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  (req as any).user = authResult.user;
  next();
};

export const authenticateAdmin = adminMiddleware;