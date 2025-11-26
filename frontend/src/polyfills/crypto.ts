declare global {
  interface Crypto {
    getRandomValues: Crypto['getRandomValues'];
    subtle?: Crypto['subtle'];
  }

  var crypto: Crypto;
}

function randomBytes(array: Uint8Array) {
  for (let i = 0; i < array.length; i += 1) {
    array[i] = Math.floor(Math.random() * 256);
  }
  return array;
}

if (typeof globalThis.crypto?.getRandomValues !== 'function') {
  globalThis.crypto = {
    getRandomValues: (arr: Uint8Array) => randomBytes(arr),
  } as Crypto;
}

