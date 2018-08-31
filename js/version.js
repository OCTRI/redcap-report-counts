/* global CONSORT_REPORT_VERSION, CONSORT_REPORT_GIT_HASH */

// Constants injected by Webpack build
export const VERSION = CONSORT_REPORT_VERSION;
export const GIT_HASH = CONSORT_REPORT_GIT_HASH;

export const VERSION_STRING = `${VERSION}+${GIT_HASH}`;

export default VERSION_STRING;
