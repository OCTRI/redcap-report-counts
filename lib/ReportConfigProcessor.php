<?php
namespace Octri\ConsortReport;

require_once(dirname(realpath(__FILE__)) . '/ReportStrategy.php');

/**
 * A class for processing report configuration. Handles updating report summary
 * configuration for the defined strategy.
 */
class ReportConfigProcessor {

    private $report;
    private $summaryConfig;

    /**
     * @param Array report The report data.
     * @param Array summaryConfig The configuration for the report data. Used to
     * build the <code>ReportSummary</code>.
     */
    public function __construct($report, $summaryConfig) {
        $this->report = $report;
        $this->summaryConfig = $summaryConfig;
    }

    /**
     * Returns a flattened array containing only the values for the
     * <code>bucketBy</code> field.
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
     * Update the summary configuration. Include data for itemized counts if
     * defined in the configuration as well as the total number of records.
     * @return The updated summary configuration.
     */
    public function summaryConfig() {
        $this->summaryConfig['totalRecords'] = $this->totalRecords();
        if ($this->summaryConfig['strategy'] === ReportStrategy::ITEMIZED) {
            $this->summaryConfig['data'] = $this->mapBucketData();
        }
        return $this->summaryConfig;
    }

}
