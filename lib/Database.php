<?php
namespace Octri\ReportCounts;

/**
 * A class for interacting with the REDCap database directly.
 */
class Database {

    private $link;

    /**
     * @param Object $connection A MySQL connection.
     */
    public function __construct($link) {
        assert(isset($link), 'A MySQL $link is required.');
        $this->link = $link;
    }

    /**
     * Queries the REDCap database directly to retrieve all the reports for the 
     * current project.
     * @returns Array of associative arrays, each containing the report id and title of a report.
     */
    public function getReports($projectId) {
        $stmt = mysqli_stmt_init($this->link);
        $query = 'select report_id, title from redcap_reports where project_id = ? order by title asc';
        mysqli_stmt_prepare($stmt, $query);
        mysqli_stmt_bind_param($stmt, 'i', $projectId);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_bind_result($stmt, $reportId, $title);
        $returnArray = array();
        while (mysqli_stmt_fetch($stmt)) {
            $returnArray[] = array('reportId' => $reportId, 'title' => $title);
        }
        mysqli_stmt_close($stmt);
        return $returnArray;
    }

    /**
     * Queries the REDCap database directory to retrieve the title for the give report id.
     * @return Array - Array  
     */
    public function getReportTitle($projectId, $reportId) {
        $stmt = mysqli_stmt_init($this->link);
        $query = 'select title from redcap_reports where project_id = ? and report_id = ?';
        mysqli_stmt_prepare($stmt, $query);
        mysqli_stmt_bind_param($stmt, 'ii', $projectId, $reportId);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_bind_result($stmt, $title);
        mysqli_stmt_fetch($stmt);
        return $title;
    }
}