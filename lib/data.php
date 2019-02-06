<?php
/**
 * MODULE: REDCap Report Counts
 * DESCRIPTION: Returns a report in the requested format.
 * RETURNS: Returns report count in JSON format.
 * Example: { "count": 42 }
 */
namespace Octri\ReportCounts;

header('Content-Type: application/json');

// Call the REDCap Connect file in the main "redcap" directory; enforces permissions.
require_once dirname(realpath(__FILE__)) . '/../../../redcap_connect.php';
require_once(dirname(realpath(__FILE__)) . '/ReportConfig.php');
require_once(dirname(realpath(__FILE__)) . '/DataDictionary.php');
require_once(dirname(realpath(__FILE__)) . '/SummaryUIProcessor.php');
require_once(dirname(realpath(__FILE__)) . '/Database.php');

/**
 * Checks if a report exists.
 * @param Integer $reportId - The report id to check.
 * @param Array $reportsArray - Array returned by `getReports()`.
 */
function reportExists($reportId, $reportsArray) {
   foreach ($reportsArray as $report) {
       if ($reportId === $report['reportId']) {
           return true;
       }
   }
   return false;
}

$reportConfigInstance = new ReportConfig($project_id, $module);
$config = $reportConfigInstance->getReportConfig();
$dataDictionary = new DataDictionary(\REDCap::getDataDictionary('array'));
$db = new Database($rc_connection /* $rc_connection is globabl */);

if (isset($_GET['action'])) {
    if ($_GET['action'] === 'getReports') {
        $returnArray = $db->getReports($project_id /* $project_id is gloabl */);
        exit(json_encode($returnArray));
    } else if ($_GET['action'] === 'getReportFields') {
        $reportId = intval($_GET['reportId']);
        $reportTitle = $db->getReportTitle($project_id /* $project_id is global */, $reportId);
        $report = json_decode(\REDCap::getReport($reportId, 'json'), true);
        $summaryConfig['reportId'] = $reportId;
        $reportProcessor = new SummaryUIProcessor($summaryConfig, $reportTitle, $report, $dataDictionary);

        if (count($report) > 0) {
            $reportFields = $reportProcessor->getReportFields();
            exit(json_encode($reportFields));
        } else {
            exit(json_encode(array()));
        }
    }
} else {
    $reportsArray = $db->getReports($project_id /* $project_id is gloabl */);

    if (!$config) {
        exit(json_encode(array()));
    }

    // Default action, get report config
    $returnArray = array();
    foreach ($config as $summaryConfig) {
        $reportId = $summaryConfig['reportId'];
        $report = reportExists($reportId, $reportsArray)
            ? json_decode(\REDCap::getReport($reportId, 'json', true /* export labels */), true)
            : null;
        $reportTitle = $db->getReportTitle($project_id /* $project_id is global */, $reportId);
        $reportProcessor = new SummaryUIProcessor($summaryConfig, $reportTitle, $report, $dataDictionary);
        $returnArray[] = $reportProcessor->summaryConfig();
    }

    exit(json_encode($returnArray));
}
?>