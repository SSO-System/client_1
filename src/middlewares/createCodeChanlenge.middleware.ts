import { create_pkce } from '../actions/create_pkce';

export const createCodeChallenge = async (req, res, next) => {
    const _app_session = req.sessionID;
    const session = req.session;

    if (session.codeChallenge === undefined) { 
        const { codeChallenge, codeVerifier } = await create_pkce(_app_session);
        req.session.codeChallenge = codeChallenge;
        req.session.codeVerifier = codeVerifier;
    } 

    next();
}