# JeanFX Academy Pro

A private trading-mentorship site that another trader can reuse. The public page reads its trader name, plan prices, payment wallets, and results copy from desk settings. Those settings are edited at `/admin`.

The page is educational. It does not promise profits, and it does not pretend a crypto transfer has been verified. Students choose a plan, send the published wallet, and the desk confirms the payment by hand.

## Run locally

```sh
npm install
cp .env.example .env
npm run dev
```

The dev server listens on [http://127.0.0.1:43123](http://127.0.0.1:43123).

Set `ADMIN_PASSWORD` (8+ characters) and `ADMIN_SECRET` (32+ characters) in `.env` before you share the site. Anyone with the desk password can replace the payment wallet. If `ADMIN_PASSWORD` is missing, the first launch writes a password to `data/admin-password.txt`.

## Desk settings

Open `/admin` and sign in.

- **Identity** — trader name, headline, and an optional contact line. The name is used across the public site, so the same build can be run for another trader.
- **Method** — the teaching story, three principles, and the curriculum.
- **Plans** — names, USD prices, and a discount percentage for the one-month, three-month, six-month, and twelve-month plans. Default prices are $250, $750, $1,500, and $3,000. A discount above 0 strikes the full price through and shows the reduced amount. The six-month plan is recommended unless you mark another one.
- **Wallets** — paste a crypto address or upload a QR image. Up to four wallets. Stablecoins show a unit amount. Bitcoin and similar assets tell the student to confirm the coin amount before sending. Students can upload a transfer screenshot or PDF beside the wallet. Those files are stored in the `depositProofs` collection.
- **Proofs** — the receipts students uploaded, with the plan, amount, and payment reference.
- **Results** — four public figures and three desk notes. Put only records you can explain. Sample notes are labeled as teaching examples. The footer risk line cannot be edited away.

Without `MONGODB_URI`, settings are stored in `data/site-settings.json`. With `MONGODB_URI`, they are stored in the `academy.siteSettings` collection. Atlas has to allow the server under Network Access, or the desk refuses the save. Do not commit `.env` or the `data/` directory.

If a database password was ever pasted into a public README, rotate it in MongoDB Atlas and put the new URI only in `.env`.

## Scripts

```sh
npm run dev
npm test
npm run lint
npm run build
```
