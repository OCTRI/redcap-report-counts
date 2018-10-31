# REDCap Consort Report External Module

A REDCap external module for generating consort diagrams.

## Install Dependencies

```
npm install
```

## Run Unit Tests

JavaScript tests,

```
npm run test
```

PHP tests

```
composer run test
```

## Build Application

Compilation is output into the `dist` directory.

```
npm run build
```

## Start Application for Local Development

To continuously build the application as you develop, run,

```
npm run start
```

## Install the module

### Module directory format

External modules live in the `modules` directory under the REDCap root directory. After building the project copy the `dist` directory there and rename it as follows,

```
redcap/modules/consort_report_vx.y.z
```

where `consort_report` is the module prefix, and `x.y.z` is the version.

#### Running under Docker

If you are running REDCap under Docker, you may want to bind mount the `dist` directory. For example,

```
volumes:
  - /path/to/redcap-consort-report/dist:/var/www/html/redcap/modules/consort_report_v0.0.0
```

Now changes are published instantly when running `npm run start`.

### Module URLs

In code, you may generate a page URL using the following syntax where `$module` is provided automatically. This will produce the index URL above.

```
$indexUrl = $module->getUrl('index');
```

The URL will look something like the following,

http://localhost/redcap/external_modules/?prefix=consort_report&id=5&page=index&pid=782

with these parameters: `prefix`, `id`, `page`, and `pid`.

`prefix` is the module prefix as described previously.

`id` is the module id and is appended automatically when using the module functions, such as `getUrl()`.

`page` corresponds to the PHP file. For example, `page=index` will pull up `index.php`. Including the `.php` extension is optional.

`pid` is the project id.

### Enabling the module

Once your module directory is in place we need to tell REDCap about it.

1. Navigate to *Control Center > External Modules*.
2. Click *Enable a module*.
3. You should see consort report with a version drop-down. Select the version you want to enable and click *Enable*.
4. Next go to your project and on the left navigation bar click *External Modules*.
5. Click *Enable a module* and find the consort report module.
6. Click *Enable* to enable for your project.

Now you should see a link under the "External Modules" section on the left navigation bar.
