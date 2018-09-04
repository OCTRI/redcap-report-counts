import 'babel-polyfill';

import Vue from 'vue';

import ConsortReport from './components/ConsortReport';

/**
 * Main method that will render a consort diagram.
 */
export function run(urlsJsonString) {
  new Vue({
    el: '.consort-report-container',
    components: { ConsortReport },
    render(createElement) {
      return createElement(ConsortReport, { });
    }
  });
}
