import express from 'express';

import user from './user';
import pr_keyring from './pr_keyring';
import msg from './msg';

const routes = express.Router();

routes.get('/ping', (req, res) => res.send('pong'));
routes.use('/user', user);
routes.use('/pr_keyring', pr_keyring);
routes.use('/msg', msg);

export default routes;
