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
require_once(dirname(realpath(__FILE__)) . '/ReportStrategy.php');

$reportConfigInstance = new \Octri\ConsortReport\ReportConfig($project_id, $module);
$reportConfig = json_decode($reportConfigInstance->getReportConfig(), true);

/**
 * Returns a flattened array containing only the values for the <code>bucketBy</code> field.
 * @param String bucketBy The field name to bucket data by.
 * @param Array data The report data.
 */
function mapBucketData($bucketBy, $data) {
    return array_map(function($record, $bucketBy) {
        return $record[$bucketBy];
    }, $data, array_fill(0, count($data), $bucketBy));
}

$returnArray = array();
foreach ($reportConfig as $reportNode) {
    // getReport with array output type does not export labels
    $report = json_decode(REDCap::getReport($reportNode['reportId'], 'json', 'export', true /* export labels */), true);
    $totalRecords = count($report);
    switch ($reportNode['strategy']) {
        case \Octri\ConsortReport\ReportStrategy::TOTAL:
            $reportNode['totalRecords'] = $totalRecords;
            $returnArray[] = $reportNode;
            break;
        case \Octri\ConsortReport\ReportStrategy::ITEMIZED:
            $returnArray[] = array_merge($reportNode, array(
                'totalRecords' => $totalRecords,
                'data' => mapBucketData($reportNode['bucket-by'], $report)
            ));
            break;
        default:
            break;
    }
}

print json_encode($returnArray);
?>
