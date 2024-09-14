<p align="center">
  <a href="https://www.wordsmith.com">
    <img src="https://raw.githubusercontent.com/wordsmith/wordsmith-javascript/master/media/wordsmith.png" height="60">
  </a>
</p>
<p align="center">
  <i>Wordsmith Native is a full end-to-end, cloud-based localization stack for moderns apps.</i>
</p>
<p align="center">
  <img src="https://github.com/wordsmith/wordsmith-javascript/actions/workflows/npm-publish.yml/badge.svg">
  <a href="https://www.npmjs.com/package/@wordsmith/express">
    <img src="https://img.shields.io/npm/v/@wordsmith/express.svg">
  </a>
  <a href="https://developers.wordsmith.com/docs/native">
    <img src="https://img.shields.io/badge/docs-wordsmith.com-blue">
  </a>
</p>

# Wordsmith Native SDK: Express i18n middleware

Express middleware for server side localization using [Wordsmith Native](https://www.wordsmith.com/native/).

Related packages:
- [@wordsmith/native](https://www.npmjs.com/package/@wordsmith/native)
- [@wordsmith/cli](https://www.npmjs.com/package/@wordsmith/cli)

Learn more about Wordsmith Native in the [Wordsmith Developer Hub](https://developers.wordsmith.com/docs/native).

## Quick start

Install the necessary express packages:

```shell
npm install --save express cookie-parser body-parser ...
```

And the Wordsmith Native integration:

```shell
npm install --save @wordsmith/native @wordsmith/express
```

Create an express app and attach the necessary middleware:

```javascript
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
```

Import the Wordsmith Native libraries and set up:

```javascript
const { TxExpress } = require('@wordsmith/express');

const wsExpress = new TxExpress({ token: '...' });
app.use(wsExpress.middleware());
app.post('/i18n', wsExpress.setLocale());
```

> All options passed to the `TxExpress`'s constructor that are not handled by it
> will be passed on to `ws.init` internally. If you have already initialized the
> `ws` object, you do not have to supply these options.
>
> ```javascript
> const wsExpress = new TxExpress({
>   // TxExpress options
>   daemon: true,
>   ttl: 2 * 60,
>
>   // ws options
>   token: '...',
>   filterTags: 'mytags',
> });
>
> // is equivalent to
>
> const { ws } from '@wordsmith/native';
> ws.init({ token: '...', filterTags: 'mytags' })
> const wsExpress = new TxExpress({ daemon: true, ttl: 2 * 60 });
> ```

Finally, fetch available languages and translations and start the server:

```javascript
wsExpress.fetch().then(() => {
  app.listen(3000, () => {
    console.log('App listening on port 3000');
  });
});
```

### `wsExpress.middleware()` middleware

```javascript
app.use(wsExpress.middleware());
```

The middleware will make sure that you have a `req.t` function to translate the
argument to the user's selected language.

```javascript
app.get('/', (req, res) => {
  res.send(req.t('Hello world!'));
});
```

The `t`-function has the same interface as `@wordsmith/native`'s `t`-function.
So, you can pass all extra arguments, like this:

```javascript
app.get('/', (req, res) => {
  res.send(req.t('Hello world!', { _context: 'foo', _tags: 'bar' }));
});
```

The middleware will also make sure that any templates that are rendered by
Express will have a `t`-function and a `ws` object in their context. The
`t`-function will take care of translation (in the same way as `req.t` does)
and the `ws` object holds a list of available languages and the currently
selected language code (`ws.languages` and `ws.currentLocale` respectively).
Using this, you can do:

```javascript
// index.js
app.set('views', './views');
app.set('view engine', 'pug');

app.get('/', (req, res) => {
  res.render('index.pug');
});
```


```pug
// views/index.pug
html
  body
    form(method='POST' action='/i18n')
      select(name='locale')
        each locale in ws.languages
          option(
            value=locale.code
            selected=locale.code === ws.currentLocale
          )= locale.name
      input(type='submit' value="Change language")
    p= t('Hello World!')
```

This will render a language-select dropdown (with the list of languages
dynamically fetched by Wordsmith Native) and a translated string.

This (having `t` and `ws` available in the template's context) works regardless
of which template engine is being used.

### Escaping strings

Normally, interpolating strings in HTML that is to be rendered by a browser can
make your application vulnerable to XSS attacks. For this purpose, the
`t`-function in the express integration (both `req.t` and the `t`-function that
is available to the template's context) return the escaped version of the
rendered string. If you are confident that your string is safe to use inside
HTML or that your template engine takes care of escaping for you, then you must
use `ut` (available both as `req.ut` and as the `ut` function in your
templates). Also, be careful of double escaping:

```javascript
// index.js

app.get('/', (req, res) => {
  // This will send 'hello &lt;world&gt;' and it will appear as 'hello <world>'
  // in the browser
  res.send(req.t('hello <world>'));

  // This will send 'hello <world>' and it is dangerous to show in the browser
  res.send(req.ut('hello <world>'));
})
```

```pug
// views/index.pug

// These will send 'hello &amp;lt;world&amp;gt;' and they will appear as
// 'hello &lt;world&gt;' in the browser
p #{t('hello <world>')}
p= t('hello <world>')

// These will send 'hello &lt;world&gt;' and they will appear as
// 'hello <world>' in the browser
p #{ut('hello <world>')}
p= ut('hello <world>')

// These will send 'hello &lt;world&gt;' and they will appear as
// 'hello <world>' in the browser
p !{t('hello <world>')}
p!= t('hello <world>')

// These will send 'hello <world>' and they are dangerous to show in the
// browser
p !{ut('hello <world>')}
p!= ut('hello <world>')
```

### `wsExpress.setLocale()` handler

```javascript
app.post('/i18n', wsExpress.setLocale());
```

The `wsExpress.setLocale()` endpoint handler (mapped to `/i18n` in the example)
is used by the user to change their selected language. The form to make this
happen could look like this:

```html
<form method="POST" action="/i18n">
  <input type="hidden" name="next" value="/current_url" />
  <select name="locale">
    <option value="en">English</option>
    <option value="el">Greek</option>
    <option value="fr">French</option>
  </select>
  <input type="submit" value="change language" />
</form>
```

The value of `next` will determine where the user will be redirected to after
the form is submitted. If `next` is missing, then the user will be redirected
to the value of `req.headers.referer` which is the page where the form
originated from.

If you make an AJAX POST request with a JSON Content-Type to this endpoint with
a `locale` field, the server will respond with a `{"status": "success"}` reply,
after having changed the user's selected language (it will be up to you to
reload the page if you want to).

## Modes

The user's selected language can be saved and retrieved with a number of
available modes:

### Cookie (default)

This saves the selected language on a cookie named after the value of 'options.name'.

```javascript
const { TxExpress, CookieMode } = require('@wordsmith/express');
const wsExpress = new TxExpress({
  mode: CookieMode({ name: 'my-ws-cookie' }),
});
```

It must be used alongside `cookie-parser`:

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const { TxExpress, CookieMode } = require('@wordsmith/express');
const wsExpress = new TxExpress({
  token: '...',
  mode: CookieMode({ name: 'my-ws-cookie' }),
});

app.use(wsExpress.middleware());
app.post('/i18n', wsExpress.setLocale());
app.get('/', (req, res) => { res.send(req.t('Hello world!')); });
```

Also accepts the `cookieOptions` option which will be forwarded to `req.cookie()`.

### Signed cookie

This saves the selected language on a signed cookie named after the value of
'options.name'.

```javascript
const { TxExpress, SignedCookieMode } = require('@wordsmith/express');
const wsExpress = new TxExpress({
  mode: SignedCookieMode({ name: 'my-ws-cookie' }),
});
```

It must be used alongside `cookie-parser` which needs to be supplied with a secret:

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const cookieParser = require('cookie-parser');
app.use(cookieParser('mysecret'));

const { TxExpress, SignedCookieMode } = require('@wordsmith/express');
const wsExpress = new TxExpress({
  token: '...',
  mode: SignedCookieMode({ name: 'my-ws-cookie' }),
});

app.use(wsExpress.middleware());
app.post('/i18n', wsExpress.setLocale());
app.get('/', (req, res) => { res.send(req.t('Hello world!')); });
```

Also accepts the `cookieOptions` option which will be forwarded to `req.cookie()`.

### Session

This saves the selected language on a session variable named after the value of
'options.name'.

```javascript
const { TxExpress, SessionMode } = require('@wordsmith/express');
const wsExpress = new TxExpress({
  mode: SessionMode({ name: 'my-ws-cookie' }),
});
```

It must be used alongside `express-session` or `cookie-session`:

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const session = require('express-session');
// or
const cookieSession = require('cookie-session');

app.use(session({ secret: 'mysecret', ... }));
// or
app.use(cookieSession({ keys: ['mysecret'], ... }));

const { TxExpress, SessionMode } = require('@wordsmith/express');

const wsExpress = new TxExpress({
  token: '...',
  mode: SessionMode({ name: 'my-ws-cookie' }),
});

app.use(wsExpress.middleware());
app.post('/i18n', wsExpress.setLocale());
app.get('/', (req, res) => { res.send(req.t('Hello world!')); });
```

### Custom modes

The values for the `mode` options are objects that implement the
`setLocale(req, res, locale)` and `getLocale(req, res)` functions. You can
easily implement your own. A sample implementation could look like this:

```javascript
const myMode = {
  userLocales: {}, // User ID to selected locale map
  setLocale(req, res, locale) {
    this.userLocales[req.cookies.userId] = locale;
  },
  getLocale(req, res) {
    return this.userLocales[req.cookies.userId];
  },
};

const wsExpress = new TxExpress({ mode: myMode });
```

## Extracting strings with `wsjs-cli`

The `wsjs-cli` program from the `@wordsmith/cli` package will manage to extract
invocations of the `req.t` function in your source code, as well as invocations
of the `t` function in '.pug' and '.ejs' templates.

```shell
➜  npm install @wordsmith/cli

➜  npx wsjs-cli push views -v

    Parsing all files to detect translatable content...
    ✓ Processed 2 file(s) and found 2 translatable phrases.
    ✓ Content detected in 2 file(s).
    /views/index.ejs
      └─ This string originated from a EJS file
        └─ occurrences: ["/views/index.ejs"]
    /views/index.pug
      └─ This string originated from a PUG file
        └─ occurrences: ["/views/index.pug"]

    Uploading content to Wordsmith... Success
    ✓ Successfully pushed strings to Wordsmith:
      Created strings: 2
```

It is easy to enhance support for express template engines in `wsjs-cli`,
especially if the template engine in question works by converting a template to
javascript code that can be then fed to the normal extraction process. In fact,
this in the only piece of code that was needed in order to extend support to
.pug and .ejs templates:

```javascript
// wordsmith-javascript/packages/cli/src/api/extract.js

function extractPhrases(file, relativeFile, options = {}) {

  // ...

  let source = fs.readFileSync(file, 'utf8');

  if (path.extname(file) === '.pug') {
    source = pug.compileClient(source);
  } else if (path.extname(file) === '.ejs') {
    const template = new ejs.Template(source);
    template.generateSource();
    source = template.source;
  }

  // ...
}
```

So, if your template engine of choice is not supported by `wsjs-cli` yet,
please consider contributing a pull request 😉.

## API

### TxExpress

```javascript
new TxExpress({

  // How to save the selected language. Must implement the `setLocale(req, res,
  // locale)` and `getLocale(req, res)` methods. Builtin modes: `CookieMode`,
  // `SignedCookieMode`, `SessionMode`.
  mode: Object,

  // Whether to fall back to the request's 'Accept-Language' header (set by the
  // browser) if the selected language isn't set, default: true
  fallBackToAcceptLanguage: Boolean

  // The locale to fall back to if both the mode and the 'Accept-Language'
  // header fail to produce a result, default: 'en'
  sourceLocale: String,

  // If the server should periodically refetch translations from Wordsmith,
  // default: true
  daemon: Boolean,

  // If daemon is true, how often to refetch translations in seconds, default:
  // 10 minutes
  ttl: Integer,

  // How to display log messages; a straightforward option would be
  // `console.log`, default: noop
  logging: Function
})
```

### CookieMode

```javascript
CookieMode({
  // The name of the cookie to be used
  name: String,

  // Extra options passed to the `req.cookie()` function
  cookieOptions: Object,
});
```

### SignedCookieMode

```javascript
SignedCookieMode({
  // The name of the cookie to be used
  name: String,

  // Extra options passed to the `req.cookie()` function; the `signed: true`
  // option will always be set
  cookieOptions: Object,
});
```

### SessionMode

```javascript
SessionMode({
  // The name of the session field to be used
  name: String,
});
```
