import { db } from '../db/connection';
import { v4 as uuidv4 } from 'uuid';

const oneDay = 24 * 60 * 60 * 1000;
// If no session -> Init. Otherwise -> Next
// If have session (not expired) -> Renew Expired -> Next
// If session expired -> Regenerate -> Next
// req.session contains all data about the session (ex: role, username, access_token, id_token, code_challenge, code_verifier,...)
export const session = async (req, res, next) => {
    const _app_session = req.cookies?._app_session;

    // No session
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
        });
        req.sessionID = new_session;
        req.session = {
            role: 'guest'
        }
    } else {
        const session = await db.collection('app_session').doc(_app_session).get();

        // Have session local but doesn't exist on DB
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
            });
            req.sessionID = new_session;
            req.session = {
                role: 'guest'
            }
        } else {
            const session_data: any = session.data();
            const expiredAt = new Date(+ new Date() + oneDay);

            // Session expired
            if (+new Date(session_data.expiredAt) < +new Date()) {
                const new_session = uuidv4();

                await res.cookie("_app_session", new_session, {
                    httpOnly: true,
                    maxAge: oneDay,
                })

                await db.collection('app_session').doc(_app_session).delete();
                await db.collection('app_session').doc(new_session).set({
                    expiredAt,
                    role: 'guest',
                })
                req.sessionID = new_session;
                req.session = {
                    role: 'guest'
                }
            } else {
                // Renew expired
                await res.cookie("_app_session", _app_session, {
                    httpOnly: true,
                    maxAge: oneDay 
                });

                await db.collection('app_session').doc(_app_session).update({
                    expiredAt
                });
                req.sessionID = _app_session;
                req.session = session_data;
            }
        }
    }
    next();
}
