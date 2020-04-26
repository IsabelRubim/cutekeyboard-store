import axios from 'axios';

const api = axios.create({
  baseURL: 'https://my-json-server.typicode.com/isabelrubim/cutekeyboard-store',
});

export default api;
