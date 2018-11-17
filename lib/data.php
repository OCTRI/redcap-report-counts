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
require_once(dirname(realpath(__FILE__)) . '/DataDictionary.php');
require_once(dirname(realpath(__FILE__)) . '/SummaryUIProcessor.php');

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
    } else if ($_GET['action'] === 'getReportFields') {
        $reportId = intval($_GET['reportId']);
        $report = json_decode(\REDCap::getReport($reportId, 'json'), true);
        if (count($report) > 0) {
            $reportFields = array_keys($report[0]);

            $dictionary = json_decode(\REDCap::getDataDictionary('json'), true);

            $fields = array();
            foreach ($reportFields as $key=>$field) {
                foreach ($dictionary as $dictField) {
                    if ($field === $dictField['field_name']
                            && in_array($dictField['field_type'], array('radio', 'dropdown', 'truefalse', 'yesno'))) {
                        $fields[] = array(
                            'field_name' => $dictField['field_name'],
                            'field_label' => $dictField['field_label']
                        );
                    }
                }
            }

            exit(json_encode($fields));
        } else {
            exit(json_encode(array()));
        }
    }
} else {
    $reportConfigInstance = new ReportConfig($project_id, $module);
    $config = $reportConfigInstance->getReportConfig();

    if (!$config) {
        exit(json_encode(array()));
    }

    $dataDictionary = new DataDictionary(\REDCap::getDataDictionary('array'));

    // Default action, get report config
    $returnArray = array();
    foreach ($config as $summaryConfig) {
        $report = json_decode(\REDCap::getReport($summaryConfig['reportId'], 'json', true /* export labels */), true);
        $reportProcessor = new SummaryUIProcessor($summaryConfig, $report, $dataDictionary);
        $returnArray[] = $reportProcessor->summaryConfig();
    }

    exit(json_encode($returnArray));
}
?>
