import { db } from '../db/connection';
import { v4 as uuidv4 } from 'uuid';

const oneDay = 24 * 60 * 60 * 1000;
// If no session -> Init. Otherwise -> Next
export const check_session = async (req, res, next) => {
    const _app_session = req.cookies?._app_session;
    if (_app_session === undefined) {
        const new_session = uuidv4();
        const expiredAt = new Date(+ new Date() + oneDay);
        await res.cookie("_app_session", new_session, {
            httpOnly: true,
            maxAge: oneDay,
        })
        await db.collection('app_session').doc(new_session).set({
            expiredAt,
            role: 'guest',
        })
        res.locals._app_session = new_session;
    } else {
        const session = await db.collection('app_session').doc(_app_session).get();
        if (!session.exists) {
            const new_session = uuidv4();
            const expiredAt = new Date(+ new Date() + oneDay);

            await res.cookie("_app_session", new_session, {
                httpOnly: true,
                maxAge: oneDay,
            })

            await db.collection('app_session').doc(new_session).set({
                expiredAt,
                role: 'guest',
            })
            
            res.locals._app_session = new_session
        } else {
            const expiredAt = new Date(+ new Date() + oneDay);

            await res.cookie("_app_session", _app_session, {
                httpOnly: true,
                maxAge: oneDay,
            })

            await db.collection('app_session').doc(_app_session).update({
                expiredAt
            })

            res.locals._app_session = _app_session;
        }
    }

    next();
}