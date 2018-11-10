<?php
/**
 * MODULE: REDCap Consort Report
 * DESCRIPTION: Get project settings.
 * RETURNS: Returns project settings in JSON format.
 */
namespace Octri\ConsortReport;

header('Content-Type: application/json');

// Call the REDCap Connect file in the main "redcap" directory; enforces permissions.
require_once(dirname(realpath(__FILE__)) . '/../../../redcap_connect.php');
require_once(dirname(realpath(__FILE__)) . '/ReportConfig.php');
require_once(dirname(realpath(__FILE__)) . '/ReportConfigProcessor.php');

if (isset($_GET['action'])) {
    $requestBody = trim(file_get_contents('php://input'));

    if (!empty($requestBody)) {
        $data = json_decode($requestBody, true);

        if ($_GET['action'] === 'saveReportSummary') {
            $reportSummary = json_decode($data['reportSummary'], true);

            $reportConfig = new ReportConfig($project_id, $module);
            $result = $reportConfig->saveReportSummary($reportSummary['reportSummary']);

            if ($result === true) {
                $report = json_decode(\REDCap::getReport($reportSummary['reportSummary']['reportId'], 'json', true /* export labels */), true);
                $reportProcessor = new ReportConfigProcessor($report, $reportSummary['reportSummary']);

                exit(json_encode(array($reportProcessor->summaryConfig())));
            }

        } else if ($_GET['action'] === 'saveReportSummaries') {
            $reportSummaries = json_decode($data['reportSummaries'], true);

            $reportConfig = new ReportConfig($project_id, $module);
            $result = $reportConfig->saveReportSummaries($reportSummaries['reportSummaries']);

            if ($result === true) {
                http_response_code(200);
                exit();
            }
        }

        http_response_code(400);
        exit(json_encode($result));
    }
} else {
    // Default action is to get report configuration.
    $reportConfig = new ReportConfig($project_id, $module);
    $settings = $reportConfig->getReportConfig();

    print($settings);
}
