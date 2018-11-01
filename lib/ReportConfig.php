<?php
namespace Octri\ConsortReport;

require_once(dirname(realpath(__FILE__)) . '/constants.php');
require_once(dirname(realpath(__FILE__)) . '/ReportStrategy.php');

/**
 * A class for managing report configuration.
 *
 * Example config:
 *
 * <pre><code>
 * [
 *   {
 *     "reportId": 1,
 *     "title": "Report Title - Only Totaled",
 *     "strategy": "total"
 *   },
 *   {
 *     "reportId": 2,
 *     "title": "Report Title - With Itemized Counts",
 *     "strategy": "itemized",
 *     "bucketBy": "field_to_bucket_on"
 *   }
 * ]
 * </code></pre>
 */
class ReportConfig {

  private $project_id;
  private $module;
  private $reportConfigKey = REPORT_CONFIG_KEY;

  /**
   * @param string $project_id The REDCap project id.
   * @param object $module Instance of external modules.
   */
  public function __construct($project_id, $module) {
    assert(isset($project_id), '$project_id is required.');
    assert(isset($module), 'An instance of external modules is required.');
    $this->project_id = $project_id;
    $this->module = $module;
  }

  /**
   * Get report configuration. If no configuration is present, it will be initialized from
   * sample configuration.
   * @return The report configuration in JSON format.
   */
  public function getReportConfig() {
    $existingReportConfig = $this->module->getProjectSetting($this->reportConfigKey, $this->project_id);
    if (isset($existingReportConfig)) {
      return $existingReportConfig;
    } else {
      return false;
    }
  }

  /**
   * Validate a ReportSummary.
   * @param {Array} reportSummary - configuration for a report summary
   */
  public function validate($reportSummary) {
    $errors = array();

    $requiredFields = array('title', 'reportId', 'strategy');
    foreach ($requiredFields as $requiredField) {
      if (!array_key_exists($requiredField, $reportSummary)) {
        $errors[] = "Missing field {$requiredField}";
      }
    }

    if (array_key_exists('strategy', $reportSummary)) {
      if (!in_array($reportSummary['strategy'], ReportStrategy::strategies())) {
        $errors[] = 'Invalid strategy';
      } else {
        if ($reportSummary['strategy'] === ReportStrategy::ITEMIZED) {
          if (array_key_exists('bucketBy', $reportSummary)) {
            if (strlen(trim($reportSummary['bucketBy'])) === 0) {
              $errors[] = "bucketBy must have a value";
            }
          } else {
            $errors[] = 'Missing bucketBy field when using strategy ' . ReportStrategy::ITEMIZED;
          }
        }
      }
    }

    if (array_key_exists('reportId', $reportSummary)) {
      if (intval($reportSummary['reportId']) === 0) {
        $errors[] = "reportId must be an integer greater than zero";
      }
    }

    if (array_key_exists('title', $reportSummary)) {
      if (strlen(trim($reportSummary['title'])) === 0) {
        $errors[] = "title must have a value";
      }
    }

    return $errors;
  }

  /**
   * Saves a ReportSummary
   * @param {Array} reportSummary - Configuration for a report summary
   * @return true if the report summary was saved, or an array of validation errors
   */ 
  public function saveReportSummary($reportSummary) {
    $errors = $this->validate($reportSummary);

    if (count($errors) > 0) {
      return $errors;
    }

    $config = $this->getReportConfig();
    if (!$config) {
      $this->module->setProjectSetting($this->reportConfigKey, array($reportSummary), $this->project_id);
    } else {
      $config[] = $reportSummary;
      $this->module->setProjectSetting($this->reportConfigKey, $config, $this->project_id);
    }

    return true;
  }

}
