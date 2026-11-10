# Hostinger VPS-এ alphadentalmedia.com ডিপ্লয় গাইড

ধরে নেওয়া হয়েছে VPS-এ **Ubuntu 22.04 / 24.04** (প্লেইন OS টেমপ্লেট) আছে।
সময় লাগবে আনুমানিক ২০–৩০ মিনিট (DNS ছড়াতে কিছু সময় বেশি লাগতে পারে)।

কাঠামো:
* **Nginx** → `dist/client` থেকে প্রি-রেন্ডার করা পেজ সার্ভ করে, HTTPS ও security headers দেয়
* **Node.js সার্ভিস (`alpha-lead`)** → শুধু ফর্মের `/api/lead` হ্যান্ডেল করে (127.0.0.1:3001)
* **Certbot** → ফ্রি SSL সার্টিফিকেট (Let's Encrypt), নিজে থেকে রিনিউ হয়

---

## ধাপ ১ — DNS ঠিক করুন (Hostinger hPanel)
1. hPanel → **VPS** → আপনার VPS → উপরে **IP address** কপি করুন (যেমন `203.0.113.10`)।
2. hPanel → **Domains** → `alphadentalmedia.com` → **DNS / Nameservers** → **DNS records**।
3. পুরনো `A` রেকর্ড (`@` ও `www`) মুছে দিন / এডিট করুন, তারপর রাখুন:

| Type | Name | Points to | TTL |
|---|---|---|---|
| A | `@` | আপনার VPS IP | 3600 |
| A | `www` | আপনার VPS IP | 3600 |

> VPS-এ IPv6 থাকলে একইভাবে `AAAA` রেকর্ডও দিতে পারেন (ঐচ্ছিক)।
> DNS ছড়াতে ৫ মিনিট থেকে কয়েক ঘণ্টা লাগতে পারে। যাচাই: `ping alphadentalmedia.com` যেন VPS IP দেখায়।

## ধাপ ২ — VPS-এ লগইন
hPanel → VPS → **SSH access** থেকে root পাসওয়ার্ড/কী নিন। তারপর নিজের কম্পিউটারের টার্মিনালে:

```bash
ssh root@YOUR_VPS_IP
```

## ধাপ ৩ — প্রয়োজনীয় সফটওয়্যার ইনস্টল
```bash
apt update && apt upgrade -y
apt install -y nginx git curl ufw certbot python3-certbot-nginx
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
node -v   # v22.x দেখাবে
```

ফায়ারওয়াল (SSH বন্ধ হবে না, শুধু ওয়েব পোর্ট খুলবে):
```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

## ধাপ ৪ — সাইটের কনফিগ ফাইল বসান
```bash
git clone --depth 1 https://github.com/zalalbd2008/React-Site-03.git /tmp/adm
mkdir -p /var/www/alphadentalmedia/releases

cp /tmp/adm/deploy/nginx-security-headers.conf /etc/nginx/snippets/alphadentalmedia-headers.conf
cp /tmp/adm/deploy/nginx-alphadentalmedia.conf /etc/nginx/sites-available/alphadentalmedia.conf
ln -sf /etc/nginx/sites-available/alphadentalmedia.conf /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

cp /tmp/adm/deploy/alpha-lead.service /etc/systemd/system/alpha-lead.service
cp /tmp/adm/deploy/alphadentalmedia.env.example /etc/alphadentalmedia.env
chmod 600 /etc/alphadentalmedia.env
systemctl daemon-reload
```

## ধাপ ৫ — ফর্মের লিড কোথায় যাবে সেট করুন
```bash
nano /etc/alphadentalmedia.env
```
`LEAD_WEBHOOK_URL=` এর পরে আপনার Zapier / Make / CRM / Slack webhook URL দিন। সেভ: `Ctrl+O`, `Enter`, `Ctrl+X`।

> Webhook না দিলেও সাইট চলবে, কিন্তু ফর্ম জমা দিলে ভিজিটর "temporarily unavailable" বার্তা দেখবে — কোনো লিড চুপচাপ হারাবে না।

## ধাপ ৬ — সাইট বিল্ড ও চালু করুন
```bash
bash /tmp/adm/deploy/deploy.sh
systemctl enable --now alpha-lead
nginx -t && systemctl reload nginx
```
যাচাই:
```bash
curl -s http://127.0.0.1:3001/api/lead/health     # {"ok":true}
curl -sI http://alphadentalmedia.com | head -1     # HTTP/1.1 200 OK
```

## ধাপ ৭ — HTTPS (ফ্রি SSL)
DNS VPS-এ পয়েন্ট করা শেষ হলে:
```bash
certbot --nginx -d alphadentalmedia.com -d www.alphadentalmedia.com --redirect -m YOUR_EMAIL --agree-tos -n
```
এখন https://alphadentalmedia.com খুলুন। সার্টিফিকেট নিজে থেকে রিনিউ হবে (`certbot renew --dry-run` দিয়ে পরীক্ষা করতে পারেন)।

---

## পরে আপডেট দিতে (GitHub-এ নতুন কোড পুশ করার পর)
```bash
ssh root@YOUR_VPS_IP
bash /var/www/alphadentalmedia/current/deploy/deploy.sh
```
প্রতিবার নতুন রিলিজ ফোল্ডারে বিল্ড হয়, তারপর এক মুহূর্তে সুইচ হয় — সাইট ডাউন হয় না। শেষ ৩টি রিলিজ রাখা হয়।

**রোলব্যাক** (আগের ভার্সনে ফেরা):
```bash
ls -1dt /var/www/alphadentalmedia/releases/*          # দ্বিতীয়টি আগের রিলিজ
ln -sfn /var/www/alphadentalmedia/releases/<আগের-ফোল্ডার> /var/www/alphadentalmedia/current
systemctl restart alpha-lead && systemctl reload nginx
```

## সমস্যা হলে
| লক্ষণ | দেখুন |
|---|---|
| সাইট খুলছে না | `systemctl status nginx`, `nginx -t`, DNS ঠিক আছে কিনা (`ping alphadentalmedia.com`) |
| ফর্ম কাজ করছে না | `systemctl status alpha-lead`, `journalctl -u alpha-lead -n 50` |
| ফর্মে "Forbidden" | `/etc/alphadentalmedia.env`-এ `ALLOWED_ORIGINS` আপনার ডোমেইন সহ আছে কিনা |
| certbot ব্যর্থ | DNS এখনো ছড়ায়নি — কিছুক্ষণ পরে আবার চালান |

---

## স্বয়ংক্রিয় ডিপ্লয় (GitHub Actions + SSH key)

এটি সেটআপ করলে `main` ব্রাঞ্চে প্রতিটি পুশের পর GitHub নিজেই টেস্ট চালাবে, বিল্ড করবে এবং VPS-এ আপডেট দেবে
(`.github/workflows/deploy.yml`)। আগে উপরের ধাপ ১–৫ ও ৭ একবার সম্পন্ন করুন।

### ক. VPS-এ একটি আলাদা `deploy` ইউজার (root-এর বদলে — বেশি নিরাপদ)
VPS-এ root হিসেবে:
```bash
adduser --disabled-password --gecos "" deploy
chown -R deploy:deploy /var/www/alphadentalmedia
echo 'deploy ALL=(root) NOPASSWD: /usr/bin/systemctl restart alpha-lead, /usr/bin/systemctl reload nginx' > /etc/sudoers.d/deploy
chmod 440 /etc/sudoers.d/deploy && visudo -c
```
`deploy` ইউজার শুধু সাইটের ফোল্ডারে লিখতে পারবে এবং শুধু এই দুটি কমান্ড sudo দিয়ে চালাতে পারবে।

### খ. শুধু ডিপ্লয়ের জন্য নতুন SSH key তৈরি
**নিজের কম্পিউটারে** (Windows-এ PowerShell, Mac/Linux-এ Terminal):
```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f adm_deploy -N ""
```
দুটি ফাইল হবে: `adm_deploy` (**private** — গোপন) ও `adm_deploy.pub` (**public**)।

### গ. Public key VPS-এ বসান
`adm_deploy.pub` ফাইলের লেখাটি কপি করুন, তারপর VPS-এ root হিসেবে:
```bash
mkdir -p /home/deploy/.ssh
nano /home/deploy/.ssh/authorized_keys      # কপি করা public key এক লাইনে পেস্ট করে সেভ করুন
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh && chmod 600 /home/deploy/.ssh/authorized_keys
```
নিজের কম্পিউটার থেকে পরীক্ষা: `ssh -i adm_deploy deploy@YOUR_VPS_IP` — পাসওয়ার্ড ছাড়াই ঢুকতে পারলে ঠিক আছে।

### ঘ. Private key GitHub-এ গোপনে রাখুন
GitHub → রিপো **React-Site-03** → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Name | Value |
|---|---|
| `VPS_HOST` | আপনার VPS IP |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | `adm_deploy` (private) ফাইলের **পুরো** লেখা, `-----BEGIN` থেকে `-----END ... KEY-----` পর্যন্ত |
| `VPS_PORT` | (ঐচ্ছিক) SSH পোর্ট ২২ না হলে |

> ⚠️ Private key কখনো chat, ইমেইল বা কোডে দেবেন না — শুধু GitHub Secrets-এ। সেভ করার পর নিজের কম্পিউটার থেকে `adm_deploy` ফাইলটি মুছে দিতে পারেন।

### ঙ. চালু করুন
GitHub → **Actions** → **Deploy** → **Run workflow**। সবুজ টিক মানে সাইট আপডেট হয়েছে।
এরপর থেকে `main`-এ প্রতিটি পুশে নিজে থেকেই ডিপ্লয় হবে; টেস্ট ফেল করলে ডিপ্লয় হবে না।

**Key বাতিল করতে:** VPS-এ `/home/deploy/.ssh/authorized_keys` থেকে লাইনটি মুছে দিন এবং GitHub Secret ডিলিট করুন।
