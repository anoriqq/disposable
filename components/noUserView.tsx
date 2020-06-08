import React from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown/with-html';

const NoUserView: React.FC<{ markdownBody: string }> = ({ markdownBody }) => (
  <>
    <a href="/user/auth">
      <img src="/btn_google_signin_light_normal_web.png" alt="login" />
    </a>
    <div style={{ margin: '0 10px' }}>
      <span>
        {'By clicking “Sign in", you agree to our '}
        <Link href="/terms">
          <a>Terms of Service</a>
        </Link>
        {' and '}
        <Link href="/privacy">
          <a>Privacy Policy</a>
        </Link>
        .
      </span>
    </div>
    <div>
      <ReactMarkdown source={markdownBody} escapeHtml={false} />
    </div>
  </>
);

export default NoUserView;
