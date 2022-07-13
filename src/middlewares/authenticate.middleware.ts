import { db } from '../db/connection';
import { v4 as uuidv4 } from 'uuid';

// If user authenticated -> Allow
// Otherwise -> Redirect to SSO 
export const authenticate = async (req, res, next) => {
    const role = req.session.role;
    
    if (role === 'guest') {
        const _app_session = req.sessionID;

        await db.collection('app_session').doc(_app_session).update({
            redirect_to: `${process.env.APP_URL}` + req.path
        });
        
        const client_id = process.env.CLIENT_ID;
        const code_challenge = req.session.codeChallenge;
        return res.redirect(`${process.env.AUTH_ISSUER}/auth?client_id=${client_id}&response_type=code&redirect_uri=${process.env.APP_URL}/login_callback&scope=openid profile email&prompt=consent&code_challenge=${code_challenge}&code_challenge_method=S256`);
    }

    next();
}