import { db } from '../db/connection';
import pkceChallenge from 'pkce-challenge';

export const create_pkce = async (session: string) => {
  try {
    const pkce: { code_challenge: string, code_verifier: string } = pkceChallenge(64);
    const codeChallenge: string = pkce.code_challenge;
    const codeVerifier: string = pkce.code_verifier;

      await db.query(`UPDATE client_1_session SET code_verifier = $1, code_challenge = $2 WHERE session_id = $3`,
                      [codeVerifier, codeChallenge, session]);
      return { codeChallenge, codeVerifier };
  } catch (e: any) {
    console.log(e.message);
  }
};