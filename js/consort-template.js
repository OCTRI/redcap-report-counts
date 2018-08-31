/**
 * Template (and partials) for rendering the consort report.
 */

export const reportCount = `
<h3>{{name}}</h3>
<p>{{count}}</p>
`;

export const reportError = `
<div class="alert alert-danger">
  Could not retrieve counts for report {{name}}.
</div>
`;

export const settingsError = `
<div class="alert alert-danger">
  Could not retrieve report configuration.
</div>
`;

export const versionString = `REDCap Consort Report {{version}}`;
