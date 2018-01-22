import MultiSelect from './';

describe('MultiSelect.react', () => {
	describe('render()', () => {
		it('renders without crashing with valid minimal props');
		it('propagates the childrens props');
		it('propagates index, selected and focused properties to children');
		it('passes _onSelectionChange as onSelect and _onChildBlur as onBlur to children');
	});

	describe('_onSelectionChange()', () => {

	});

	describe('_onChangeFocusedIndex()', () => {
		it(`doesn't change state.focusedIndex when event.key is different from up/down arrow`);
		it(`doesn't change state.focusedIndex when event.key is upArrow and state.focusedIndex === 0`);
		it(`decremenets state.focusedIndex when event.key is up arrow and state.focusedIndex > 0`);
		it(`does't change state.focusedIndex when event.key is down arrow and state.focusedIndex === props.children.length - 1`);
		it(`increments state.focusedIndex when event.key is down arrow and state.focusedIndex < props.children.length - 1`);
	});

	describe('_onChildBlur()', () => {
		it('changes state.focusedIndex to null when an element not from the list is focused');
		it(`doesn't change state.focusedIndex to null when an element inside the list is focused`);
	});

	describe('get _className()', () => {
		it('returns "multiselect ${props.className}"');
	});
});
