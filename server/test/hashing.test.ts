import { sha512Hash } from '../src/helpers/hash'

describe('Consistent hashing', () => {
  test('Simple id', () => {
    const secret = 'yaas';
    const hashOne = sha512Hash('message', secret);
    const hashTwo = sha512Hash('message', secret);

    expect(hashOne).toEqual(hashTwo);
  });

  test('With custom secret', () => {
    const secret = 'secret_1234';
    const hashOne = sha512Hash('id', secret);
    const hashTwo = sha512Hash('id', secret);

    expect(hashOne).toEqual(hashTwo);
  });

  test('With complex secret', () => {
    const secret = 'secret_C8Sw2F2CadwS';
    const hashOne = sha512Hash('mintlify', secret);
    const hashTwo = sha512Hash('mintlify', secret);

    expect(hashOne).toEqual(hashTwo);
  });
})