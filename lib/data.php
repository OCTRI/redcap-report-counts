<?php
/**
 * MODULE: REDCap Consort Report
 * DESCRIPTION: Returns a report in the requested format.
 * RETURNS: Returns report count in JSON format.
 * Example: { "count": 42 }
 */
namespace Octri\ConsortReport;

header('Content-Type: application/json');

// Call the REDCap Connect file in the main "redcap" directory; enforces permissions.
require_once dirname(realpath(__FILE__)) . '/../../../redcap_connect.php';
require_once(dirname(realpath(__FILE__)) . '/ReportConfig.php');
require_once(dirname(realpath(__FILE__)) . '/ReportConfigProcessor.php');

$reportConfigInstance = new ReportConfig($project_id, $module);
$reportConfig = json_decode($reportConfigInstance->getReportConfig(), true);

$returnArray = array();
foreach ($reportConfig as $summaryConfig) {
    $report = json_decode(\REDCap::getReport($summaryConfig['reportId'], 'json', 'export', true /* export labels */), true);
    $reportProcessor = new ReportConfigProcessor($report, $summaryConfig);
    $returnArray[] = $reportProcessor->summaryConfig();
}

print json_encode($returnArray);
?>
