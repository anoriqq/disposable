import React from 'react';
import Link from 'next/link';

import Layout from 'components/layout';

const TermsPage: React.FC = () => (
  <Layout>
    <div>
      <h2>プライバシーポリシー</h2>
      <div>
        disposable.anoriqq.comが取得/永続化したデータはサービス運営と向上の目的のみに使用します。
      </div>
      <div>個人情報を第三者に提供しません。</div>
      <div>個人情報保護に関する法令を遵守します。</div>
      <h2>Privacy Policy</h2>
      <div>
        The data obtained / persistent by disposable.anoriqq.com will be used
        for service operation and It is used only for the purpose of
        improvement.
      </div>
      <div>We will not provide personal information to any third party.</div>
      <div>
        We will comply with laws and regulations regarding the protection of
        personal information.
      </div>
    </div>
    <Link href="/">
      <a>HOME</a>
    </Link>
  </Layout>
);

export default TermsPage;
