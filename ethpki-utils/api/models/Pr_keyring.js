import { api } from '../config';

const Pr_keyring = {
  get: (_id) => api.get(`pr_keyring/info/${_id}`),
  getAll: () => api.get('pr_keyring/list'),
  append: (data) => api.post('pr_keyring/append', data),
}

export default Pr_keyring;