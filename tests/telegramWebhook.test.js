import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/telegram.js';

test('Telegram Webhook Serverless Handler', async (t) => {
  await t.test('should return status message on GET request', async () => {
    let statusCode = 0;
    let responseBody = '';

    const req = { method: 'GET' };
    const res = {
      status(code) {
        statusCode = code;
        return {
          send(body) { responseBody = body; }
        };
      }
    };

    await handler(req, res);
    assert.equal(statusCode, 200);
    assert.match(responseBody, /Active/i);
  });

  await t.test('should handle valid message parsing without crashing', async () => {
    let statusCode = 0;
    let jsonResult = null;

    const req = {
      method: 'POST',
      body: {
        message: {
          chat: { id: 123456 },
          text: 'kopi 25rb gopay',
          from: { first_name: 'Daniel' }
        }
      }
    };

    const res = {
      status(code) {
        statusCode = code;
        return {
          json(data) { jsonResult = data; }
        };
      }
    };

    await handler(req, res);
    assert.equal(statusCode, 200);
    assert.deepEqual(jsonResult, { ok: true });
  });
});
