<?php
namespace Octri\ConsortReport;

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
     * @param String report The report data as returned by `REDCap::getReport`.
     * @param Number dataDictionary An instance of `DataDictionary`.
     */
    public function __construct($summaryConfig, $report, $dataDictionary) {
        $this->summaryConfig = $summaryConfig;
        $this->report = $report;
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
     * @return The total number of records in the report.
     */
    private function totalRecords() {
        return count($this->report);
    }

    /**
     * Gets summary config used by the UI for rendering each report 
     * summary (count). If an itemized count is required, include the field
     * label for the field grouped on as well as data used to render itemized
     * counts. The UI handles grouping the data.
     * @return Summary config for rendering in the UI.
     */
    public function summaryConfig() {
        $this->summaryConfig['totalRecords'] = $this->totalRecords();
        if ($this->summaryConfig['strategy'] === ReportStrategy::ITEMIZED) {
            $bucketBy = $this->summaryConfig['bucketBy'];
            $bucketByLabel = $this->dataDictionary->getFieldLabel($bucketBy);
            $this->summaryConfig['bucketByLabel'] = $bucketByLabel;
            $this->summaryConfig['data'] = $this->mapBucketData();
        }
        return $this->summaryConfig;
    }

}
