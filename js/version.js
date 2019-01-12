/* global REPORT_COUNTS_VERSION, REPORT_COUNTS_GIT_HASH */

// Constants injected by Webpack build
export const VERSION = REPORT_COUNTS_VERSION;
export const GIT_HASH = REPORT_COUNTS_GIT_HASH;

export const VERSION_STRING = `${VERSION}+${GIT_HASH}`;

export default VERSION_STRING;
