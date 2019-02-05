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

/**
 * Queries the REDCap database directly to retrieve all the reports for the 
 * current project.
 * @returns Array of associative arrays, each containing the report id and title of a report.
 */
function getReports() {
    global $rc_connection, $project_id;
    $stmt = mysqli_stmt_init($rc_connection);
    $query = 'select report_id, title from redcap_reports where project_id = ? order by title asc';
    mysqli_stmt_prepare($stmt, $query);
    mysqli_stmt_bind_param($stmt, 'i', $project_id);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_bind_result($stmt, $report_id, $title);
    $returnArray = array();
    while (mysqli_stmt_fetch($stmt)) {
        $returnArray[] = array('reportId' => $report_id, 'title' => $title);
    }
    mysqli_stmt_close($stmt);
    return $returnArray;
}

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

if (isset($_GET['action'])) {
    if ($_GET['action'] === 'getReports') {
        $returnArray = getReports();
        exit(json_encode($returnArray));
    } else if ($_GET['action'] === 'getReportFields') {
        $reportId = intval($_GET['reportId']);
        $report = json_decode(\REDCap::getReport($reportId, 'json'), true);
        $summaryConfig['reportId'] = $reportId;
        $reportProcessor = new SummaryUIProcessor($summaryConfig, $report, $dataDictionary);

        if (count($report) > 0) {
            $reportFields = $reportProcessor->getReportFields();
            exit(json_encode($reportFields));
        } else {
            exit(json_encode(array()));
        }
    }
} else {
    $reportsArray = getReports();

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
        $reportProcessor = new SummaryUIProcessor($summaryConfig, $report, $dataDictionary);
        $returnArray[] = $reportProcessor->summaryConfig();
    }

    exit(json_encode($returnArray));
}
?>