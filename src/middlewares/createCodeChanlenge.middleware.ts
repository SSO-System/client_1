import { create_pkce } from '../actions/create_pkce';
import { db } from '../db/connection';

export const createCodeChallenge = async (req, res, next) => {
    const _app_session = res.locals._app_session;

    const session: any = await db.collection("app_session").doc(_app_session).get();

    if (session.data().codeChallenge === undefined) { 
        const codeChallenge = await create_pkce(_app_session);
        res.locals.codeChallenge = codeChallenge;
    } else {
        res.locals.codeChallenge = session.data().codeChallenge;
    }
    next();
}