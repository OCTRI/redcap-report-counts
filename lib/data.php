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

/**
 * Filter the input
 */
function filterInput($str) {
  return filter_var($str, FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES);
}

// Sanitize all post parameters
$reportId = filterInput($_POST['reportId']);

$returnObj = new stdClass();
$report = REDCap::getReport($reportId, 'json');
$returnObj->count = count(json_decode($report));
print json_encode($returnObj);
?>
