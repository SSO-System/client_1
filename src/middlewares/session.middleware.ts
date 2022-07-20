import { db } from '../db/connection';
import { v4 as uuidv4 } from 'uuid';

const oneDay = 24 * 60 * 60 * 1000;
// If no session -> Init. Otherwise -> Next
// If have session (not expired) -> Renew Expired -> Next
// If session expired -> Regenerate -> Next
// req.session contains all data about the session (ex: role, username, access_token, id_token, code_challenge, code_verifier,...)
export const session = async (req, res, next) => {
    try {
        const _app_session = req.cookies?._app_session;

        // No session
        if (_app_session === undefined) {
            const new_session = uuidv4();
            const expiredAt = new Date(+ new Date() + oneDay);
            await res.cookie("_app_session", new_session, {
                httpOnly: true,
                maxAge: oneDay,
            })

            await db.query('INSERT INTO client_1_session(session_id, expired_at, role) VALUES ($1, $2, $3)', [new_session, expiredAt, 'guest'])
            req.sessionID = new_session;
            req.session = {
                role: 'guest'
            }
        } else {
            const session = await db.query('SELECT * FROM client_1_session WHERE session_id = $1', [_app_session]);

            // Have session local but doesn't exist on DB
            if (session.rows.length === 0) {
                const new_session = uuidv4();
                const expiredAt = new Date(+ new Date() + oneDay);
                await res.cookie("_app_session", new_session, {
                    httpOnly: true,
                    maxAge: oneDay,
                })
                await db.query('INSERT INTO client_1_session (session_id, expired_at, role) VALUES ($1, $2, $3)', [new_session, expiredAt, 'guest']);
                req.sessionID = new_session;
                req.session = {
                    role: 'guest'
                }
            } else {
                const session_data: any = session.rows[0];
                const expiredAt = new Date(+ new Date() + oneDay);

                // Session expired
                if (+new Date(session_data.expired_at) < +new Date()) {
                    const new_session = uuidv4();

                    await res.cookie("_app_session", new_session, {
                        httpOnly: true,
                        maxAge: oneDay,
                    })
                    await db.query('DELETE FROM client_1_session WHERE session_id = $1', [_app_session]);
                    await db.query('INSERT INTO client_1_session (session_id, expired_at, role) VALUES ($1, $2, $3)', [new_session, expiredAt, 'guest']);
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
                    await db.query('UPDATE client_1_session SET expired_at = $1 WHERE session_id = $2', [expiredAt, _app_session]);
                    req.sessionID = _app_session;
                    req.session = session_data;
                }
            }
        }
        next();
    } catch (e: any) {
        console.log(e.message);
    }
}
