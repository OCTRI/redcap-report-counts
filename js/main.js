import '@babel/polyfill';

import Vue from 'vue';

import ReportCounts from './components/ReportCounts';
import createDataService from './services/data-service';
import '../lib/report-counts.css';

/**
 * Main method that will render report counts.
 */
export function run(urlsJsonString) {
  const urls = JSON.parse(urlsJsonString);
  const dataService = createDataService(urls);

  new Vue({
    el: '.report-counts-container',
    components: { ReportCounts },
    render(createElement) {
      return createElement(ReportCounts, { });
    },
    provide() {
      return {
        urls,
        dataService
      };
    }
  });
}
