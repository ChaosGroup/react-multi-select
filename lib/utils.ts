import { OSName } from './constants';

export const _getOsNameFromUserAgent = (platform: string): OSName => [
	{ name: OSName.MAC, test: (platformString: string) => /mac/i.test(platformString) },
	{ name: OSName.OTHER, test: (platformString: string) => true }
].find(({ test }) => test(platform)).name;

const osName = _getOsNameFromUserAgent(window.navigator.platform);
export const getOsName = () => osName;
