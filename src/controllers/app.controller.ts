import axios from 'axios';
import { db } from '../db/connection';
import { v4 as uuidv4 } from 'uuid';

export default () => ({
  homePage: async (req, res) => {
    if (req.session.role !== 'guest') {
      return res.redirect(`${process.env.APP_URL}/me`);
    }
    
    return res.render("home", {
      title: "Welcome to Client 1",
      authServerUrl: process.env.AUTH_ISSUER,
      appUrl: process.env.APP_URL,
      clientId: process.env.CLIENT_ID,
      codeChallenge: req.session.code_challenge
    });
  },

  login_callback: async (req, res) => {
    if ("error" in req.query) {
      return res.render("callback_failed", {
        title: "Login Failed",
        appUrl: process.env.APP_URL,
        error: req.query.error,
        errorDescription: req.query.error_description
      });
    } else {
      if (req.query.code === undefined) {
        return res.render('callback_failed', {
          title: "Request Failed", 
          appUrl: process.env.APP_URL,
          error: "request_failed",
          errorDescription: "Missing authorization code"
        })
      }
      try {
        const result: any = await axios.post(`${process.env.AUTH_ISSUER}/token`, new URLSearchParams({
          client_id: `${process.env.CLIENT_ID}`,
          client_secret: `${process.env.CLIENT_SECRET}`,
          grant_type: "authorization_code",
          code: req.query.code,
          redirect_uri: process.env.APP_URL + "/login_callback",
          code_verifier: req.session.code_verifier,
          scope: 'openid profile',
          code_challenge_method: 'S256',
        }));

        
        const userInfo: any = await axios.post(`${process.env.AUTH_ISSUER}/me`, new URLSearchParams({
          access_token: result.data.access_token
        }))
        
        await db.query(`UPDATE client_1_session SET access_token = $1, id_token = $2, role = 'user', username = $3 WHERE session_id = $4`,
                      [result.data.access_token, result.data.id_token, userInfo.data.username, req.sessionID]);

        const user = await db.query('SELECT * FROM client_1_account WHERE username = $1', [userInfo.data.username]);
        
        if (user.rows.length === 0) {
          userInfo.data.created_at = (new Date()).toISOString();
          await db.query(`INSERT INTO client_1_account(username, email, email_verified, 
                                                      first_name, last_name, gender, picture, 
                                                      birthdate, created_at, sub)
                          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, 
                          [userInfo.data.username, userInfo.data.email, userInfo.data.email_verified, userInfo.data.first_name,
                          userInfo.data.last_name, userInfo.data.gender, userInfo.data.picture,
                          userInfo.data.birthdate, userInfo.data.created_at, userInfo.data.sub]);
        }
        
        return res.redirect(req.session.redirect_to ? req.session.redirect_to : `${process.env.APP_URL}/me`);

      } catch (e: any) {
        console.log(e.response.data);
      }
    }
  },
  
  user_info: async (req, res) => {
    const username: string = req.session.username;
    const idToken: string = req.session.id_token;
    const accessToken: string = req.session.access_token;
    const userInfo: any = await db.query('SELECT * FROM client_1_account WHERE username = $1', [username]);
    const user = userInfo.rows[0];

    return res.render("user_info", {
      idToken,
      appUrl: process.env.APP_URL,
      title: `Hello ${username}!`,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      authServerUrl: process.env.AUTH_ISSUER,
      username: username,
      firstname: user.firstname,
      lastname: user.lastname,
      birthdate: user.birthdate,
      gender: user.gender,
      picture: user.picture,
      createdAt: user.createdAt,
      email: user.email,
      emailVerified: user.email_verified
    });
  },

  logout_callback: async (req, res) => {
    try {
      const oneDay = 24 * 60 * 60 * 1000;
      const _app_session = req.sessionID;
      const new_session = uuidv4();
      res.cookie("_app_session", new_session, {
        httpOnly: true,
        maxAge: oneDay,
      });

      await db.query('DELETE FROM client_1_session WHERE session_id = $1', [_app_session]);
      await db.query('INSERT INTO client_1_session(session_id, expired_at, role) VALUES ($1, $2, $3)', 
                      [new_session, new Date(+ new Date() + oneDay), 'guest']);

      return res.redirect(`${process.env.APP_URL}`);
    } catch (e: any) {
      console.log(e.message);
    }
  },
  
  check_session: async (req, res) => {
    try {
      const access_token = req.session.access_token;
      if (!access_token) {
        res.status(200).send({
          active: false,
        });
      } else {
        const result = await axios({
              url:`${process.env.AUTH_ISSUER}/token/introspection`,
              method: 'POST',
              data: new URLSearchParams({
                client_id: `${process.env.CLIENT_ID}`,
                client_secret: `${process.env.CLIENT_SECRET}`,
                token: access_token
              })
            });
        const data: any = await result.data;
        res.status(200).send({
          active: data.active ? data.active : false,
        });
      };
    } catch (e: any) {
      console.log(e.message);
    }
  },
});
