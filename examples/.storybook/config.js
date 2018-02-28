const { configure } = require('@storybook/react');

const loadStories = function() {
	require('../index.jsx');
};

configure(loadStories, module);
