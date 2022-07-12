import { db } from '../db/connection';
import { v4 as uuidv4 } from 'uuid';

const oneDay = 24 * 60 * 60 * 1000;
// If user authenticated (check local session) (1) -> If user session on SSO exists (check global session) (2) -> allow
// If (1) false -> redirect to homepage 
// If (2) false -> redirect to logout_callback (Not implemented)
export const authenticate = async (req, res, next) => {
    const _app_session = req.cookies._app_session;
    
    if (_app_session === undefined) {
        return res.redirect(`${process.env.APP_URL}`);
    }
    else {
        const session: any = await db.collection('app_session').doc(_app_session).get();
        if (session.exists) {
            const role: string = session.data().role;
            
            if (role === 'guest') {
                return res.redirect(`${process.env.APP_URL}`);
            }           
            
        } else {
            res.cookie("_app_session", "", {
                httpOnly: true,
                maxAge: 0
            })
            return res.redirect(`${process.env.APP_URL}`);
        }
    }
    next();
}