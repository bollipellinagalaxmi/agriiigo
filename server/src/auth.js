import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { query } from './db.js';
const secret = process.env.JWT_SECRET;
if (!secret || secret === 'change-this-secret') console.warn('Set a private JWT_SECRET in server/.env before production use.');
export function signToken(user) { return jwt.sign({ id: user.id, role: user.role }, secret || 'local-development-only-change-me', { expiresIn: '7d' }); }
export function authenticate(req, res, next) { const token=(req.headers.authorization||'').replace(/^Bearer\s+/i,'');if(!token)return res.status(401).json({error:'Sign in to continue.'});let claims;try{claims=jwt.verify(token,secret||'local-development-only-change-me')}catch{return res.status(401).json({error:'Your session has expired. Please sign in again.'})}query('SELECT id,role,is_active FROM users WHERE id=?',[claims.id]).then(rows=>{if(!rows[0]||!rows[0].is_active)return res.status(401).json({error:'This account is inactive. Contact Agriiigo support.'});req.user={id:rows[0].id,role:rows[0].role};next()}).catch(next); }
export const allow = (...roles) => (req, res, next) => roles.includes(req.user?.role) ? next() : res.status(403).json({ error: 'You do not have access to this action.' });
