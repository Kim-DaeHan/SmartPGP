import { api } from '../config';

const Pr_keyring = {
  get: (user_hash) => api.get(`pr_keyring/info/${user_hash}`),
  getAll: () => api.get('pr_keyring/list'),
  append: (data) => api.post('pr_keyring/append', data),

}

export default Pr_keyring;