import MultiSelect from '../';
import test from 'ava';

test('renders without crashing with valid minimal props', assert => {});
test('propagates the childrens props', assert => {});
test('propagates index, selected and focused properties to children', assert => {});
test('passes _onSelectionChange as onSelect and _onChildBlur as onBlur to children', assert => {});


test(`doesn't change state.focusedIndex when event.key is different from up/down arrow`, assert => {});
test(`doesn't change state.focusedIndex when event.key is upArrow and state.focusedIndex === 0`, assert => {});
test(`decremenets state.focusedIndex when event.key is up arrow and state.focusedIndex > 0`, assert => {});
test(`does't change state.focusedIndex when event.key is down arrow and state.focusedIndex === props.children.length - 1`, assert => {});
test(`increments state.focusedIndex when event.key is down arrow and state.focusedIndex < props.children.length - 1`, assert => {});

test('changes state.focusedIndex to null when an element not from the list is focused', assert => {});
test(`doesn't change state.focusedIndex to null when an element inside the list is focused`, assert => {});

test('returns "multiselect ${props.className}"', assert => {});
