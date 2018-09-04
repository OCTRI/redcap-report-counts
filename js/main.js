import 'babel-polyfill';

import Vue from 'vue';

import ConsortReport from './components/ConsortReport';
import createDataService from './services/data-service';

/**
 * Main method that will render a consort diagram.
 */
export function run(urlsJsonString) {
  const urls = JSON.parse(urlsJsonString);
  const dataService = createDataService(urls);

  new Vue({
    el: '.consort-report-container',
    components: { ConsortReport },
    render(createElement) {
      return createElement(ConsortReport, {
        props: {
          pid: this.pid
        }
      });
    },
    data: {
      pid
    },
    provide() {
      return {
        urls,
        dataService
      };
    }
  });
}
