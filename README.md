# ⏩ disposable ･ [![Website](https://img.shields.io/website?down_message=down&label=disposable.anoriqq.com&style=flat-square&up_message=up&url=https%3A%2F%2Fdisposable.anoriqq.com)](https://disposable.anoriqq.com) [![GitHub Workflow Status](https://img.shields.io/github/workflow/status/anoriqq/disposable/CI?label=CI&style=flat-square)](https://github.com/anoriqq/disposable/actions) [![Codecov](https://img.shields.io/codecov/c/github/anoriqq/disposable?logo=a&style=flat-square)](https://codecov.io/gh/anoriqq/disposable) [![CodeFactor Grade](https://img.shields.io/codefactor/grade/github/anoriqq/disposable?style=flat-square)](https://www.codefactor.io/repository/github/anoriqq/disposable)

📎Disposable GCE easily

---

- [English](#About)
- [日本語](#About-1)

## About

This is a web application to use and discard VM instances on the Google Cloud Platform easily.

This is useful when you suddenly need to use a Linux machine on the go.

## Usage

1. Sign in with your Google Account.

   > Note: You need to set up a billing account with GCP in advance.

1. Create a project according to the UI.

   Only one project can be created from this application per account. If the project is awaiting deletion, it will be restored.

1. Create an instance.

   Required fields are `Zone`,`Machine Type`,`Image family` and `Boot disk size`.

1. When you're done, delete only the project or instance.

## FAQ

### I want to change the configuration of my instance.

You can either delete the instance you created and rebuild it, or change it directly in the cloud console.

### Wouldn't you like to be charged?

This service is completely free to use.  
However, you may be charged by GCP.  
You can use it free of charge as long as you are within the scope of [Always Free](https://cloud.google.com/free/docs/gcp-free-tier).

### Is the API ever called incorrectly?

Access tokens will be stored/used in strict confidence.  
In addition, the expiration date of the access token used for the Service expires one hour after authentication.  
We recommend deactivating the token by [revoking access to the account](https://myaccount.google.com/permissions) where appropriate.

### It is hard to use.

We welcome your feedback on [Issue](https://github.com/anoriqq/disposable/issues/new) and [Twitter](https://twitter.com/anoriqq)!

---

## About

Google Cloud Platform 上の VM インスタンスをお手軽に使い捨てる為の Web アプリです。

外出先で急に Linux マシンが使いたくなったときなどに便利です。

## Usage

1. Google アカウントでログインします。

   > Note: 事前に GCP へ課金アカウントの設定をする必要があります。

1. UI に従ってプロジェクトを作成します。

   本アプリから作成するプロジェクトはアカウントごとに 1 つのみとなります。該当プロジェクトが削除待ちになっている場合はリストアされることになります。

1. インスタンスを作成します。

   `Zone`,`Machine Type`,`Image family`,`Boot disk size`は必須項目です。

1. 作業が終わったらプロジェクトまたはインスタンスのみを削除します。

## FAQ

### インスタンスの設定を変更したいです。

作成したインスタンスを削除してから作り直すか、クラウドコンソールで直接変更してください。

### 課金されませんか?

本サービスは完全に無料でご利用できます。  
ただし GCP から請求される場合があります。  
[Always Free](https://cloud.google.com/free/docs/gcp-free-tier)の範囲内での利用であれば無償で利用できます。

### 不正に API がコールされることはありませんか?

アクセストークンは厳重に保管/使用されます。  
また、本サービスが使用するアクセストークンの有効期限は認証より 1 時間で失効します。  
適宜[アカウントへのアクセスを取り消す](https://myaccount.google.com/permissions)ことでトークンの使用を停止することを推奨しています。

### 使いにくいです。

[Issue](https://github.com/anoriqq/disposable/issues/new)や[Twitter](https://twitter.com/anoriqq)へのご意見ご感想を歓迎しています!

---

## References

[Compute Engine: Virtual Machines (VMs)  |  Google Cloud](https://cloud.google.com/compute)

## License

[MIT](https://github.com/anoriqq/disposable/blob/9433a614e97877da98a7141f08fa8c02912d82cb/LICENSE) &copy; [anoriqq](https://github.com/anoriqq)
