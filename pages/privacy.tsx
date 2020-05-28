import React from 'react';
import Link from 'next/link';

import Layout from 'components/layout';

const TermsPage: React.FC = () => (
  <Layout>
    <div>
      <div>
        disposable.anoriqq.comが取得/永続化したデータはサービス運営/向上の目的のみに使用します。
      </div>
      <div>個人情報を第三者に提供しません。</div>
      <div>個人情報保護に関する法令を遵守します。</div>
    </div>
    <Link href="/">
      <a>HOME</a>
    </Link>
  </Layout>
);

export default TermsPage;
