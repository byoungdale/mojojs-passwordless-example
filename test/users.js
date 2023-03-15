import { app } from '../lib/index.js';
import t from 'tap';

app.log.level = 'debug';

t.test('User', async (t) => {
    const ua = await app.newTestUserAgent({ tap: t });

    await t.test('Show', async () => {
        (await ua.getOk('/users/1'))
            .statusIs(200)
            .textLike('button', /Sign up with Email/);
    });

    await t.test('Edit', async () => {});

    await ua.stop();
});
