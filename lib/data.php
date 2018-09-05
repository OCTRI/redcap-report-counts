<?php
/**
 * MODULE: REDCap Consort Report
 * DESCRIPTION: Returns a report in the requested format.
 * RETURNS: Returns report count in JSON format.
 * Example: { "count": 42 }
 */

header('Content-Type: application/json');

// Call the REDCap Connect file in the main "redcap" directory; enforces permissions.
require_once dirname(realpath(__FILE__)) . '/../../../redcap_connect.php';
require_once(dirname(realpath(__FILE__)) . '/ReportConfig.php');

$reportConfigInstance = new \Octri\ConsortReport\ReportConfig($project_id, $module);
$reportConfig = json_decode($reportConfigInstance->getReportConfig(), true);

$returnArray = array();
foreach ($reportConfig as $reportNode) {
    $report = REDCap::getReport($reportNode['reportId'], 'json');
    $returnArray[] = array_merge($reportNode, array(
        'totalRecords' => count(json_decode($report, true)),
        'data' => $report
    ));
}

print json_encode($returnArray);
?>
