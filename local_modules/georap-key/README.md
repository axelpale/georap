# georap-key

Generate short and usable id-like keys. Keys are random, URL-safe, and human-readable.

    > const key = require('georap-key');
    > key.generate()
    'xdrCieRMfJ'

Validate keys:

    > key.validate('xdrCieRMfJ')
    true

The randomness is provided by [nanoid](https://www.npmjs.com/package/nanoid). The package promises hardware random generation.
