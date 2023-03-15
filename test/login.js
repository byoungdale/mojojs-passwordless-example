import { app } from '../lib/index.js';
import t from 'tap';

app.log.level = 'debug';

t.test('Login', async (t) => {
    const ua = await app.newTestUserAgent({ tap: t });

    await t.test('Show and Submit', async () => {
        (await ua.getOk('/login'))
            .statusIs(200)
            .textLike('button', /Login with Email/);
    });

    await t.test('Verify', async () => {});

    await t.test('Logout', async () => {});

    await ua.stop();
});
