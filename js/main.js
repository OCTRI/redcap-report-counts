import $ from 'jquery';
import Mustache from 'mustache';
import {
  reportCount,
  reportError,
  versionString,
  settingsError
} from './consort-template';
import VERSION_STRING from './version';

const consortReportContainer = '.consort-report';
const consortReportVersionContainer = '.consort-report-version';

/**
 * Render consort report for defined reports. Because reports are expensive, this function recursively retrieves and
 * renders each report one at a time. Errors are reported but do not prevent the next report from being processed.
 *
 * @param {Object} config - Module configuration
 * @param {String} dataUrl - The external modules URL for `lib/data.php`.
 * @return {Integer} order - A variable for keeping track of survey order based on the config.reports order. Should
 *   be treated as private - only set internally during recursion.
 */
export function buildConsortReport(config, dataUrl, order=0) {
  const total = config.length;
  let next = order + 1;
  if (order === total) {
    return;
  }
  const report = config[order];
  $.ajax({
    url: dataUrl,
    data: {
      "reportId": report.reportId
    },
    method: "POST",
    success: function(response) {
      $(consortReportContainer).append(reportHeading(report.name, response.count));
      buildConsortReport(config, dataUrl, next);
    },
    error: function(response) {
      $(consortReportContainer).append(errorMessage(report.name));
      buildConsortReport(config, dataUrl, next);
    }
  });
}

/**
 * A function to produce HTML for a report heading.
 * @param {String} reportName - Name of report
 * @param {Integer} totalRecords - Total number of records in report.
 * @return {String} HTML for report heading
 */
export function reportHeading(reportName, totalRecords) {
  return Mustache.render(reportCount, { name: reportName, count: totalRecords });
}

/**
 * A function to produce HTML for error messages when report counts can not be retrieved.
 * @param {String} reportName - Name of report
 * @return {String} HTML for report error message.
 */
export function errorMessage(reportName) {
  return Mustache.render(reportError, { name: reportName });
}

/**
 * Main method that will render a consort diagram.
 */
export function run(urlsJsonString) {
  const urls = JSON.parse(urlsJsonString);
  $.ajax({
    url: urls.settings,
    method: "POST",
    success: function(config) {
      buildConsortReport(config, urls.data);
    },
    error: function(response) {
      $(consortReportContainer).append(settingsErrorMessage());
    }
  });
  appendVersion();
}

/**
 * Renders HTML for displaying the application version.
 */
function consortReportVersion() {
  return Mustache.render(versionString, { version: VERSION_STRING });
}

/**
 * Renders HTML error message when having trouble retrieving settings.
 */
function settingsErrorMessage() {
  return Mustache.render(settingsError);
}

/**
 * Sets application version on screen.
 */
function appendVersion() {
  $(consortReportVersionContainer).append(consortReportVersion());
}
