<?php
/**
 * MODULE: REDCap Report Counts
 * DESCRIPTION: Get security configuration
 * RETURNS: Returns security configuration in JSON format.
 */
namespace Octri\ReportCounts;

header('Content-Type: application/json');

// Call the REDCap Connect file in the main "redcap" directory; enforces permissions.
require_once(dirname(realpath(__FILE__)) . '/../../../redcap_connect.php');
require_once(dirname(realpath(__FILE__)) . '/SecurityUtils.php');

$securityConfig = array(
    'hasReportsRights' => SecurityUtils::hasReportsRights()
);

exit(json_encode($securityConfig));