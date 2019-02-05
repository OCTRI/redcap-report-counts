<?php
namespace Octri\ReportCounts;

require_once(dirname(realpath(__FILE__)) . '/ReportStrategy.php');

/**
 * A class for processing report configuration to produce data suitable for UI
 * rendering.
 */
class SummaryUIProcessor {

    private $summaryConfig;
    private $report;
    private $dataDictionary;

    /**
     * @param Array summaryConfig An entry in the array of report config
     *   persisted to the database.
     * @param String report The report data as returned by `REDCap::getReport`. Pass `null` to indicate the report does not exist.
     * @param Number dataDictionary An instance of `DataDictionary`.
     */
    public function __construct($summaryConfig, $report, $dataDictionary) {
        assert(isset($summaryConfig), '$summaryConfig is required.');
        assert(isset($dataDictionary), '$dataDictionary is required.');
        $this->summaryConfig = $summaryConfig;
        $this->report = isset($report) ? $report : null;
        $this->dataDictionary = $dataDictionary;
    }

    /**
     * Returns a flattened array containing only the values for the
     * <code>bucketBy</code> field. Used by the UI for grouping itemized counts.
     * @param String bucketBy The field name to bucket data by.
     * @param Array data The report data.
     * @return Array of values for the field bucketBy
     */
    private function mapBucketData() {
        $bucketBy = $this->summaryConfig['bucketBy'];
        return array_map(function($record) use ($bucketBy) {
            return $record[$bucketBy];
        }, $this->report);
    }

    /**
     * Get the total record count for the report.
     * @return int The total number of records in the report.
     */
    private function totalRecords() {
        return count($this->report);
    }

    /**
     * @return Boolean true if the report exists.
     */
    private function reportExists() {
        return $this->report !== null;
    }

    /**
     * @return Boolean true if the summary is itemized.
     */
    private function isItemized() {
        return $this->summaryConfig['strategy'] === ReportStrategy::ITEMIZED;
    }

    /**
     * Adds bucket-by properties to `$this->summaryConfig`. The summary must
     * be itemized otherwise throws an exception.
     * @return void
     */
    private function addItemizedConfig() {
        assert($this->isItemized(), 'The count must be itemized');

        $bucketBy = $this->summaryConfig['bucketBy'];

        if ($this->dataDictionary->fieldExists($bucketBy)) {
            $bucketByLabel = $this->dataDictionary->getFieldLabel($bucketBy);
            $this->summaryConfig['bucketByFieldExists'] = true;
            $this->summaryConfig['bucketByLabel'] = $bucketByLabel;
            $this->summaryConfig['data'] = $this->mapBucketData();
        } else {
            $this->summaryConfig['bucketByFieldExists'] = false;
        }
    }

    /**
     * Get list of raw field names for a report.
     */
    public function getReportFieldNames() {
        assert(is_array($this->report), 'Must provide valid report data.');
        assert(count($this->report) > 0, 'The report is empty - must contain records.');
        return array_keys($this->report[0]);
    }

    /**
     * Get list of field names including the label. If you only need the raw `field_name` 
     * values use `$this->getReportFieldNames`.
     * @return Array A list of associative arrays, each with keys: `field_name` and `field_label`.
     */
    public function getReportFields() {
        if (count($this->report) > 0) {
            $reportFields = $this->getReportFieldNames();

            $fields = array();
            foreach ($reportFields as $key=>$field) {
                foreach ($this->dataDictionary->getDictionary() as $dictField) {
                    if ($field === $dictField['field_name']
                            && in_array($dictField['field_type'], array('radio', 'dropdown', 'truefalse', 'yesno'))) {
                        $fields[] = array(
                            'field_name' => $dictField['field_name'],
                            'field_label' => $dictField['field_label']
                        );
                    }
                }
            }

            return $fields;
        } else {
            return array();
        }
    }

    /**
     * Check if the report has the bucketBy field.
     */
    public function reportHasBucketByField() {
        $reportFields = $this->getReportFieldNames();
        return in_array($this->summaryConfig['bucketBy'], $reportFields);
    }

    /**
     * Gets summary config used by the UI for rendering each report 
     * summary (count). If an itemized count is required, include the field
     * label for the field grouped on as well as data used to render itemized
     * counts. The UI handles grouping the data.
     *
     * @return Array Summary config for rendering in the UI.
     */
    public function summaryConfig() {
        $reportExists = $this->reportExists();
        $this->summaryConfig['reportExists'] = $reportExists;

        if (!$reportExists) {
            return $this->summaryConfig;
        }

        $this->summaryConfig['totalRecords'] = $this->totalRecords();

        if ($this->isItemized()) {
            $this->addItemizedConfig();
            $this->summaryConfig['bucketByExistsOnReport'] = $this->reportHasBucketByField();
        }

        return $this->summaryConfig;
    }

}