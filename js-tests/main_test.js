/* eslint-env jasmine */
import 'jasmine-ajax';
import 'jasmine-jquery';

import $ from 'jquery';
import { exampleResponses } from './example-ajax-responses';
import {
  run,
  reportHeading,
  errorMessage
} from '../js/main';

// The DOM expected by the run method of main.js
const report = `
<div class="consort-report-container">
  <h1>Consort Report</h1>
  <div class="consort-report"></div>
  <div class="consort-report-version"></div>
</div>
`;
const reportContainer = '.consort-report';

const mockDataUrl = 'lib/mock_data.php';
const mockSettingsUrl = 'lib/mock_settings.php';
const urls = {
  data: mockDataUrl,
  settings: mockSettingsUrl
};

describe('Running plugin', function() {

  beforeEach(function() {
    jasmine.Ajax.install();
    $(report).appendTo('body');
    run(JSON.stringify(urls));
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
    $('.consort-report-container').remove();
  });

  describe('Running consort report plugin', function() {
    let settingsRequest, reportRequest1, reportRequest2, reportRequest3;

    describe('Handle success', function() {
      beforeEach(function() {
        settingsRequest = jasmine.Ajax.requests.mostRecent();
        expect(settingsRequest.url).toBe(mockSettingsUrl);
        settingsRequest.respondWith(exampleResponses.settings);

        reportRequest1 = jasmine.Ajax.requests.mostRecent();
        expect(reportRequest1.url).toBe(mockDataUrl);
        reportRequest1.respondWith(exampleResponses.counts.success.report1);

        reportRequest2 = jasmine.Ajax.requests.mostRecent();
        expect(reportRequest2.url).toBe(mockDataUrl);
        reportRequest2.respondWith(exampleResponses.counts.success.report2);

        reportRequest3 = jasmine.Ajax.requests.mostRecent();
        expect(reportRequest3.url).toBe(mockDataUrl);
        reportRequest3.respondWith(exampleResponses.counts.success.report3);
      });

      it('sets the correct counts', function() {
        expect($(reportContainer).text()).toContain("Enrolled\n101");
        expect($(reportContainer).text()).toContain("Discontinued Prior to Randomization\n202");
        expect($(reportContainer).text()).toContain("Randomized\n303");
      });
    });

    describe('Handle errors', function() {
      beforeEach(function() {
        settingsRequest = jasmine.Ajax.requests.mostRecent();
        expect(settingsRequest.url).toBe(mockSettingsUrl);
        settingsRequest.respondWith(exampleResponses.settings);

        reportRequest1 = jasmine.Ajax.requests.mostRecent();
        expect(reportRequest1.url).toBe(mockDataUrl);
        reportRequest1.respondWith(exampleResponses.counts.error.report1);

        reportRequest2 = jasmine.Ajax.requests.mostRecent();
        expect(reportRequest2.url).toBe(mockDataUrl);
        reportRequest2.respondWith(exampleResponses.counts.error.report2);

        reportRequest3 = jasmine.Ajax.requests.mostRecent();
        expect(reportRequest3.url).toBe(mockDataUrl);
        reportRequest3.respondWith(exampleResponses.counts.error.report3);
      });

      it('sets the correct error messages', function() {
        expect($(reportContainer).text()).toContain("Could not retrieve counts for report Enrolled.");
        expect($(reportContainer).text()).toContain("Could not retrieve counts for report Discontinued Prior to Randomization.");
        expect($(reportContainer).text()).toContain("Could not retrieve counts for report Randomized.");
      });
    });
  });

  describe('UI helpers', function() {
    it('renders a report heading', function() {
      const heading = reportHeading("Random Heading", 42);
      expect(heading).toContain("Random Heading");
      expect(heading).toContain(42);
    });

    it('renders an error message', function() {
      expect(errorMessage("Another Report", 42)).toContain("Could not retrieve counts for report Another Report.");
    });
  });
});
