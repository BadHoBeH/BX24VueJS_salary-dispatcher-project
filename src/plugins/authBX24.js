import Bitrix24 from 'bitrix24-vue';
import Bitrix from '@2bad/bitrix';
// eslint-disable-next-line import/no-cycle
import store from '@/store';
import { findIndex } from 'lodash';

/**
 *  constants
 */
const WEBHOOK_TOKEN_DEFAULT = '';
const AUTH_METHODS_DEFAULT = async () => ([
  {
    method: 'token',
    // eslint-disable-next-line no-use-before-define
    auth: await oAuthBitrix(),
  },
  {
    method: 'webhook',
    // eslint-disable-next-line no-use-before-define
    auth: await oAuthWebhook(),
  },
]);
const AUTH_METHOD_DEFAULT = 'webhook';
const AUTH_CHECK_DEFAULT = false;
const BX_24 = Bitrix24.init();

/**
 *  constants function
 */
const GENERATOR_URL = (i) => (i.domain === undefined ? false : `https://${i.domain}/rest`);

/**
 *  get
 */
export function get(priority = 'webhook') {
  console.log('method get: ', priority, WEBHOOK_TOKEN_DEFAULT);
}

export async function getMethodsAuth() {
  console.log('authMethods');
  return true;
}

export function oAuthWebhook(webhook = WEBHOOK_TOKEN_DEFAULT) {
  return webhook || false;
}

async function getActiveBitrixAuthInfo() {
  if (!await BX_24) return false;
  return Bitrix24.getAuthInfo();
}

export async function oAuthBitrix(authInfo) {
  const a = authInfo || await getActiveBitrixAuthInfo();
  if (!a) return false;
  console.log('oAuthBitrix', GENERATOR_URL(a), a.access_token);
  return {
    url: GENERATOR_URL(a),
    token: a.access_token,
  };
}

export async function oAuthCheck(authInfo) {
  console.log(authInfo);
}

export async function bitrixAuth() {
  const aut = store.getters['auth/getAuth'];
  switch (aut.method) {
    case ('token'): {
      return Bitrix(aut.auth.url, aut.auth.token);
    } case ('webhook'): {
      return Bitrix(aut.auth);
    }
    default: break;
  }
  return false;
}

export async function auth(methods = AUTH_METHODS_DEFAULT()) {
  const arrayMethods = (await methods).filter((i) => !!i.auth).map(async (i) => {
    const objectAuth = i;
    switch (i.method) {
      case 'token': {
        try {
          const { result } = await Bitrix(objectAuth.auth.url, objectAuth.auth.token)
            .list('profile', {});
          objectAuth.user = result;
          objectAuth.status = true;
        } catch (e) {
          objectAuth.error = e;
          objectAuth.status = false;
        }
        break;
      }
      case 'webhook': {
        try {
          const { result } = await Bitrix(objectAuth.auth)
            .list('profile', {});
          objectAuth.user = result;
          objectAuth.status = true;
        } catch (e) {
          objectAuth.error = e;
          objectAuth.status = false;
        }
        break;
      }
      default: break;
    }
    return objectAuth;
  });
  return Promise.all(arrayMethods);
}

/**
 * Проверяет на приоритетность методов авторизации. Авторизует либо по выбранному
 * если выбранного нет -> авторизует по возможному активному.
 * @param authData (arrayObject) - дата для авторизации
 * @param authMethod - (string) приоритетный метод/ключ авторизации
 * @param authCheck - (boolean) нужно ли проверять авторизацию?
 * @returns {Promise<*[]>}
 */
// eslint-disable-next-line max-len
export async function setAuth(authData = auth(), authMethod = AUTH_METHOD_DEFAULT, authCheck = AUTH_CHECK_DEFAULT) {
  const resp = (await authData).map((i) => {
    // eslint-disable-next-line no-param-reassign
    i.select = (i.method || i.key) === authMethod && !!i.status;
    // eslint-disable-next-line no-param-reassign
    if (authCheck) i.status = oAuthCheck(i);
    return i;
  });
  if (findIndex(resp, ['select', true]) === -1 && findIndex(resp, ['status', true]) !== -1) resp[findIndex(resp, ['status', true])].select = true;
  (await store.dispatch('auth/set', resp));
  return resp;
}

export default oAuthCheck();
