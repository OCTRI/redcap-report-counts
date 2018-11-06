<?php
/**
 * MODULE: REDCap Consort Report
 * DESCRIPTION: Retrieve the data dictionary for the current project.
 * RETURNS: A filtered data dictionary for the current project in JSON format.
 *   Fields returned include 'form_name', 'field_name' and 'field_label', and
 *   must be of type 'text' or 'radio'.
 * EXAMPLE:
 *   [{
 *       "form_name": "screening_id",
 *       "field_name": "screen_id",
 *       "field_label": "Screening ID"
 *   },
 *   {
 *       "form_name": "randomization",
 *       "field_name": "study_id",
 *       "field_label": "Study ID"
 *   }]
 */
namespace Octri\ConsortReport;

header('Content-Type: application/json');

// Call the REDCap Connect file in the main "redcap" directory; enforces permissions.
require_once dirname(realpath(__FILE__)) . '/../../../redcap_connect.php';

$dictionary = json_decode(\REDCap::getDataDictionary('json'), true);

$filtered = array_filter($dictionary, function($item) {
    if (in_array($item['field_type'], array('radio', 'dropdown', 'truefalse', 'yesno'))) {
        return $item;
    }
});

$mapped = array_map(function ($item) {
    return array(
        "form_name" => $item['form_name'],
        "field_name" => $item['field_name'],
        "field_label" => $item['field_label']
    );
}, $filtered);

$values = array_values($mapped);

print(json_encode($values));
