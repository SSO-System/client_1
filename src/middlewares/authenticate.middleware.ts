import { db } from '../db/connection';
import { v4 as uuidv4 } from 'uuid';

// If user authenticated -> Allow
// Otherwise -> Redirect to SSO 
export const authenticate = async (req, res, next) => {
    try {
        const role = req.session.role;
        
        if (role === 'guest') {
            const _app_session = req.sessionID;

            await db.query('UPDATE client_1_session SET redirect_to = $1 WHERE session_id = $2', [`${process.env.APP_URL}` + req.path, _app_session]);
            
            const client_id = process.env.CLIENT_ID;
            const code_challenge = req.session.code_challenge;
            return res.redirect(`${process.env.AUTH_ISSUER}/auth?client_id=${client_id}&response_type=code&redirect_uri=${process.env.APP_URL}/login_callback&scope=openid profile email&prompt=consent&code_challenge=${code_challenge}&code_challenge_method=S256`);
        }

        next();
    } catch (e: any) {
        console.log(e.message);
    }
}