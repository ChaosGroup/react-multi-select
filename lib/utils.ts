import { OSName } from './constants';
export const ensureRange = (min: number, value: number, max: number) => Math.max(min, Math.min(value, max));

export const _getOsNameFromUserAgent = (userAgent: string): OSName => [
	{ name: OSName.MAC, test: (agentString: string) => /mac/i.test(agentString) },
	{ name: OSName.OTHER, test: (agentString: string) => true }
].find(({ test }) => test(userAgent)).name;

const osName = _getOsNameFromUserAgent(window.navigator.userAgent);
export const getOsName = () => osName;
