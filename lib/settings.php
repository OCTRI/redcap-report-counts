<?php
/**
 * MODULE: REDCap Consort Report
 * DESCRIPTION: Controller for handling report configuration. Pass
 *              $_GET['action'] or nothing for default.
 * RETURNS: Default returns project settings in JSON format. If
 *          action=saveReportSummary the provided report summary will be
 *          appended to the report configuration.
 */
namespace Octri\ConsortReport;

header('Content-Type: application/json');

// Call the REDCap Connect file in the main "redcap" directory; enforces permissions.
require_once(dirname(realpath(__FILE__)) . '/../../../redcap_connect.php');
require_once(dirname(realpath(__FILE__)) . '/ReportConfig.php');
require_once(dirname(realpath(__FILE__)) . '/ReportConfigProcessor.php');

if (isset($_GET['action'])) {
    if ($_GET['action'] === 'saveReportSummary') {
        $requestBody = trim(file_get_contents('php://input'));

        if (!empty($requestBody)) {
            $data = json_decode($requestBody, true);
            $reportSummary = json_decode($data['reportSummary'], true);

            $reportConfig = new ReportConfig($project_id, $module);
            $reportConfig->saveReportSummary($reportSummary['reportSummary']);

            $report = json_decode(\REDCap::getReport($reportSummary['reportSummary']['reportId'], 'json', 'export', true /* export labels */), true);
            $reportProcessor = new ReportConfigProcessor($report, $reportSummary['reportSummary']);

            exit(json_encode(array($reportProcessor->summaryConfig())));
        }
    }
} else {
    // Default action is to get report configuration.
    $reportConfig = new ReportConfig($project_id, $module);
    $settings = $reportConfig->getReportConfig();

    print($settings);
}
