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

$reportConfig = new ReportConfig($project_id, $module);
$settings = $reportConfig->getReportConfig();

print($settings);
