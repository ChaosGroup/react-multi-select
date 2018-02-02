"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const pickSelectors = (selectionContext) => JSON.stringify([
    'ctrlKey',
    'shiftKey',
    'altKey',
    'key',
    'selectionType'
].reduce((obj, key) => (Object.assign({}, obj, { [key]: selectionContext[key] })), selectionContext));
exports.toMockSelectables = (dataItems) => dataItems.map(data => ({ props: { data } }));
exports.testIsMatching = (strategy, shouldMatch, shouldNotMatch) => {
    for (const selectionContext of shouldMatch) {
        const { selectionType } = selectionContext;
        ava_1.default(`matches for ${pickSelectors(selectionContext)}`, assert => {
            assert.true(strategy.matches[selectionType](selectionContext));
        });
    }
    for (const selectionContext of shouldNotMatch) {
        const { selectionType } = selectionContext;
        ava_1.default(`doesn't match for ${pickSelectors(selectionContext)}`, assert => {
            assert.false(strategy.matches[selectionType](selectionContext));
        });
    }
};
exports.minSelectionContext = {
    selection: new Set([1, 5, 10, 42]),
    data: 8,
    lastAction: 'add',
    lastActionIndex: 2,
    currentActionIndex: 5,
    children: exports.toMockSelectables([1, 2, 5, 6, 10, 7, 42]),
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    selectionType: 'mouse'
};
exports.selectionCtx = (overrides) => {
    return Object.assign({}, exports.minSelectionContext, overrides);
};
