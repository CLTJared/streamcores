const store = {
  access: null,
  refresh: null,
  expiresAt: 0,
};

function saveToken(access, refresh, expiresInSec) {
  store.access = access;
  store.refresh = refresh;
  store.expiresAt = Date.now() + expiresInSec * 1000;
}

function getToken() {
  return store;
}

module.exports = { saveToken, getToken };