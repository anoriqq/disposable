import React from 'react';
import Link from 'next/link';

import Layout from 'components/layout';

const TermsPage: React.FC = () => (
  <Layout>
    <div>
      <h2>利用規約</h2>
      <div>
        サービス提供者はサービス利用者のプライバシー情報と個人情報を、プライバシーポリシーに従って適切に取り扱います。
      </div>
      <div>
        サービス利用者は本規約とプライバシーポリシーに同意する必要があります。
      </div>
      <div>
        サービス利用者はご自身の責任において本サービスを利用するものとし、本サービスにおいて行った一切の行為およびその結果について一切の責任を負うものとします。
      </div>
      <div>
        サービス提供者はサービス利用者に対して本サービスを提供する義務を負いません。
      </div>
      <div>
        サービス提供者は本サービスに起因してサービス利用者に生じたあらゆる損害について一切の責任を負いません。
      </div>
      <div>サービス提供者は本規約を更新することがあります。</div>
      <div>本規約は日本語を正文とし、その準拠法は日本法とします。</div>
      <h2>Terms of service</h2>
      <div>
        Service Providers will handle the privacy information and personal
        information of Service Users appropriately in accordance with the
        Privacy Policy.
      </div>
      <div>Service Users must agree to these Terms and the Privacy Policy.</div>
      <div>
        Service Users shall use The Service at their own risk, and shall be
        responsible for any and all actions taken on The Service and the results
        thereof.
      </div>
      <div>
        Service Providers are not obligated to provide the Service to Service
        Users.
      </div>
      <div>
        Service Provider shall not be responsible for any damages caused to
        Service Users due to the Service.
      </div>
      <div>
        Service Provider may update these Terms of Use from time to time.
      </div>
      <div>These Terms and Conditions shall be governed by Japanese law.</div>
    </div>
    <Link href="/">
      <a>HOME</a>
    </Link>
  </Layout>
);

export default TermsPage;
