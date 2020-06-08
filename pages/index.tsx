import React from 'react';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import matter from 'gray-matter';

import Layout from '../components/layout';
import UserView from '../components/userView';
import NoUserView from '../components/noUserView';
import { useUser } from '../lib/hooks';

export const getStaticProps: GetStaticProps<{
  markdownBody: string;
}> = async () => {
  const { content } = matter((await import('../README.md')).default);
  return {
    props: {
      markdownBody: content,
    },
  };
};

const DashBoard: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = ({
  markdownBody,
}) => {
  const { data: userInfo } = useUser();

  return (
    <Layout>
      {userInfo?.displayName ? (
        <UserView />
      ) : (
        <NoUserView markdownBody={markdownBody} />
      )}
    </Layout>
  );
};

export default DashBoard;
