import React from 'react';
import renderer from 'react-test-renderer';

import NoUserView from '../noUserView';

it('UserView', () => {
  const markdownBody = '# README';
  const tree = renderer
    .create(<NoUserView markdownBody={markdownBody} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
