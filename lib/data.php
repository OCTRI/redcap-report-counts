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

if (isset($_GET['action'])) {
    if ($_GET['action'] === 'getReports') {
        $pid = intval($_GET['pid']);

        $stmt = mysqli_stmt_init($rc_connection);
        $query = 'select report_id, title from redcap_reports where project_id = ? order by title asc';
        mysqli_stmt_prepare($stmt, $query);
        mysqli_stmt_bind_param($stmt, 'i', $pid);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_bind_result($stmt, $report_id, $title);
        $returnArray = array();
        while (mysqli_stmt_fetch($stmt)) {
            $returnArray[] = array('reportId' => $report_id, 'title' => $title);
        }
        mysqli_stmt_close($stmt);

        exit(json_encode($returnArray));
    }
} else {
    $reportConfigInstance = new ReportConfig($project_id, $module);
    $config = $reportConfigInstance->getReportConfig();

    if (!$config) {
        exit(json_encode(array()));
    }

    // Default action, get report config
    $returnArray = array();
    foreach ($config as $summaryConfig) {
        $report = json_decode(\REDCap::getReport($summaryConfig['reportId'], 'json', true /* export labels */), true);
        $reportProcessor = new ReportConfigProcessor($report, $summaryConfig);
        $returnArray[] = $reportProcessor->summaryConfig();
    }

    exit(json_encode($returnArray));
}
?>
