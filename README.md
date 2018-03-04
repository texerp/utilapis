# texerp - utilapis

## Install

Clone source code from github:

```shell
git clone https://github.com/texerp/utilapis.git
```

Install dependencies:

```shell
cd utilapis
npm install
```

Run service with `20%` failed POSTs `(20% ~ 1/5 * 100)`:

```shell
TEXERP_UTILAPIS_RANDOM_FAILURE=5 node index.js
```

Open another Terminal, make a request with cURL:

```shell
curl --request POST \
  --url http://localhost:7979/utilapis/qrcode/tick \
  --header 'content-type: application/json' \
  --data '{
	"type": "barcode",
	"code": "123456789"
}'
```
