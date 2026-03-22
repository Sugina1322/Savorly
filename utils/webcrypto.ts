import { digest, getRandomValues, randomUUID } from 'expo-crypto';

type MutableCrypto = {
  getRandomValues?: typeof getRandomValues;
  randomUUID?: typeof randomUUID;
  subtle?: {
    digest?: typeof digest;
  };
};

const cryptoObject: MutableCrypto =
  typeof globalThis.crypto === 'object' && globalThis.crypto !== null
    ? (globalThis.crypto as MutableCrypto)
    : {};

if (!cryptoObject.getRandomValues) {
  cryptoObject.getRandomValues = getRandomValues;
}

if (!cryptoObject.randomUUID) {
  cryptoObject.randomUUID = randomUUID;
}

if (!cryptoObject.subtle) {
  cryptoObject.subtle = {
    digest,
  };
} else if (!cryptoObject.subtle.digest) {
  cryptoObject.subtle.digest = digest;
}

if (globalThis.crypto !== cryptoObject) {
  Object.defineProperty(globalThis, 'crypto', {
    value: cryptoObject,
    configurable: true,
  });
}
