import { app } from '../lib/index.js';
import t from 'tap';

app.log.level = 'debug';

t.test('Signup', async (t) => {
    const ua = await app.newTestUserAgent({ tap: t });

    await t.test('Show and Submit', async () => {
        (await ua.getOk('/signup'))
            .statusIs(200)
            .textLike('button', /Sign up with Email/);
    });

    await t.test('Verify', async () => {});

    await ua.stop();
});
