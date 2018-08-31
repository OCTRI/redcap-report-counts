export const exampleResponses = {
  settings: {
    status: 200,
    contentType: 'application/json',
    responseText: '[{"name":"Enrolled","reportId":41},{"name":"Discontinued Prior to Randomization","reportId":42},{"name":"Randomized","reportId":43}]'
  },
  counts: {
    success: {
      report1: {
        status: 200,
        contentType: 'application/json',
        responseText: '{ "count": 101 }'
      },
      report2: {
        status: 200,
        contentType: 'application/json',
        responseText: '{ "count": 202 }'
      },
      report3: {
        status: 200,
        contentType: 'application/json',
        responseText: '{ "count": 303 }'
      }
    },
    error: {
      report1: {
        status: 401,
        contentType: 'application/json',
        responseText: '{ "count": 101 }'
      },
      report2: {
        status: 500,
        contentType: 'application/json',
        responseText: '{ "count": 202 }'
      },
      report3: {
        status: 403,
        contentType: 'application/json',
        responseText: '{ "count": 303 }'
      }
    }
  }
};
