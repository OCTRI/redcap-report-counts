<template>
  <div>
    <p id="about-report-counts-module" v-if="showAboutText">
      <strong>About this module:</strong> Use the Report Counts module to generate a
      summary count for one or more of your project's reports and optionally, itemize
      the count using a categorical field included in the report.
    </p>

    <details>
      <summary class="text-info">Report Counts help</summary>
      <ul>
        <li>All fields are required.</li>
        <li>Report Dependencies
          <ul>
            <li>The <span class="text-uppercase">Select a Report</span> drop-down list
              is made up of all current project reports.</li>
            <li>If after a Report Count is created, the underlying report is deleted,
              the count cannot be generated.</li>
          </ul>
        </li>
        <li>Itemized Counts Dependencies
          <ul>
            <li>The <span class="text-uppercase">Field to Group Results</span>
              drop-down list is made up of all radio button and drop-down fields that
              are included in the report.</li>
            <li>Itemized counts include a missing count, for records that do not have
              a recorded response for the <span class="text-uppercase">group by</span>
              field.</li>
            <li>To return an Itemized count, the report must include at least one radio
              button or drop-down field.</li>
            <li>If after a Report Count is created, the underlying field the itemized
              count is based on is removed from the report, the itemized count cannot
              be generated.</li>
          </ul>
        </li>
        <li>Toolset
          <ul>
            <li>Individual Report Counts can be edited or deleted.</li>
            <li>Individual Report Counts can re-ordered on the page using the
              <i class="fa fa-arrows-alt"></i> to drag and drop the Count into place.</li>
          </ul>
        </li>
        <li>User Permissions
          <ul>
            <li>To view the Report Counts page (with all report counts) an individual user will need one of the following permissions:
              <ul>
                <li>The <em>Add/Edit/Organize Reports</em> User Right.</li>
                <li>User Access to each report that is used as the basis for each report count (on the page) via any of the individual Report User Access options, including selecting individual users, user roles, or DAGs.</li>
                <li>If a user does does not have access to even one report that a report count is based on, the user will receive an error and none of the report counts will load.</li>
              </ul>
            </li>
            <li>For a user to create, edit and delete a report count an individual user will need the <em>Add/Edit/Organize Reports</em> User Right.</li>
          </ul>
        </li>
      </ul>
    </details>
  </div>
</template>

<script>
export default {
  name: 'ReportCountsHelp',

  props: {
    showAboutText: Boolean
  }
}
</script>
